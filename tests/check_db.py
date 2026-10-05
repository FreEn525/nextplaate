"""Offline regression test on the plate database (reference/real/countries/plates-db.json).

For every plate the site has already answered for (count > 0, saved by the plate test), the saved upload
page of its country is opened, the form is set to the plate's category, the plate is typed the same way
the plate check reads it, and the result must be the plate itself. Nothing is sent to the site.

    python tests/check_db.py                  # every country in the database
    python tests/check_db.py --country by     # one country
    python tests/check_db.py --report out.json

Uses the dev build (nextplaate.dev.user.js). Exit code 1 when a plate fails, so it can run before a release.
"""
import argparse
import json
import re
import sys
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor

from playwright.sync_api import sync_playwright
from fake_site import ROOT, route_site

REF = ROOT / "reference" / "real" / "countries"
DB = REF / "plates-db.json"
DEV = (ROOT / "nextplaate.dev.user.js").read_text(encoding="utf-8")


def norm(s):
    return re.sub(r"[\s-]+", "", s or "").upper()


def load_cases(country=None):
    """One case per (country, category, plate) that the site confirmed (count > 0)."""
    rows = json.loads(DB.read_text(encoding="utf-8"))
    seen, cases = set(), []
    for r in rows:
        if r.get("count", 0) <= 0:
            continue
        if country and r["country"] != country:
            continue
        key = (r["country"], r["category"], norm(r["plate"]))
        if key in seen:
            continue
        seen.add(key)
        cases.append(r)
    return cases


def set_category(page, label):
    """Selects the form type whose label is the category (same rule as the plate test). False if none."""
    return page.evaluate("""(label) => {
        const sel = document.getElementById('ctype');
        if (!sel) return false;
        const want = label.toLowerCase();
        const text = o => o.text.trim().toLowerCase();
        // exact label first; then "2001 year system (AA11AAA)" for the search label "2001 year system"
        const opt = [...sel.options].find(o => o.value && text(o) === want)
          || [...sel.options].find(o => o.value && text(o).startsWith(want + ' ('));
        if (!opt) return false;
        sel.value = opt.value;
        sel.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
    }""", label)


def open_country(page, code):
    """Loads the saved upload page of one country in the shared page. False if the dev script did not start."""
    html = (REF / f"{code}.html").read_text(encoding="utf-8", errors="ignore")
    # a page saved while the dev script ran already holds its containers: the script would stop, seeing them
    html = re.sub(r'<div id="pmg-(host|batch)"[^>]*>\s*</div>', '', html)
    page.unroute(f"https://platesmania.com/{code}/add")
    page.route(f"https://platesmania.com/{code}/add", lambda r, q: r.fulfill(
        status=200, content_type="text/html; charset=utf-8",
        body=html.replace("</body>", "<script>" + DEV + "</script></body>")))
    page.goto(f"https://platesmania.com/{code}/add", wait_until="domcontentloaded")
    try:
        page.wait_for_function("() => !!(window.nextplaateDev && window.nextplaateDev.testText)", timeout=8000)
        return True
    except Exception:
        return False


def check_country(page, code, cases):
    """Tests every case of one country on its saved upload page."""
    results = []
    if not open_country(page, code):
        return [{**c, "status": "no-harness"} for c in cases]          # the dev script did not start on this page
    for c in cases:
        if not set_category(page, c["category"]):
            results.append({**c, "status": "no-type"})
            continue
        res = page.evaluate("(t) => window.nextplaateDev.testText(t)", c["plate"])
        ok = bool(res["fits"]) and norm(res["read"]) == norm(c["plate"])
        results.append({**c, "status": "ok" if ok else ("not-fit" if not res["fits"] else "wrong"),
                        "read": res["read"], "fits": res["fits"]})
    return results


def run_group(codes, by_country):
    """One browser for a group of countries (one Playwright per thread)."""
    out = []
    with sync_playwright() as p:
        browser = p.chromium.launch()
        ctx = browser.new_context()
        route_site(ctx)
        page = ctx.new_page()
        for code in codes:
            if not (REF / f"{code}.html").exists():
                print(f"{code}: no saved upload page, skipped")
                continue
            out += check_country(page, code, by_country[code])
        browser.close()
    return out


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    ap = argparse.ArgumentParser()
    ap.add_argument("--country")
    ap.add_argument("--report")
    ap.add_argument("--workers", type=int, default=4)
    args = ap.parse_args()

    cases = load_cases(args.country)
    by_country = defaultdict(list)
    for c in cases:
        by_country[c["country"]].append(c)

    # the countries are split in groups, one browser per group, run side by side (everything is local)
    groups = [list(by_country)[i::args.workers] for i in range(args.workers)]
    all_results = []
    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        for res in pool.map(lambda g: run_group(g, by_country), groups):
            all_results += res

    # summary per country and category
    cats = defaultdict(lambda: defaultdict(lambda: {"ok": 0, "total": 0}))
    for r in all_results:
        cell = cats[r["country"]][r["category"]]
        cell["total"] += 1
        cell["ok"] += r["status"] == "ok"
    for code in sorted(cats):
        for cat, cell in sorted(cats[code].items()):
            flag = "OK  " if cell["ok"] == cell["total"] else "FAIL"
            print(f"{code:4} {flag} {cell['ok']:>2}/{cell['total']:<2} {cat}")
    fails = [r for r in all_results if r["status"] != "ok"]
    if any(r["status"] == "no-harness" for r in all_results):
        print("countries where the dev script did not start:", sorted({r["country"] for r in all_results if r["status"] == "no-harness"}))
    print("\nFailures:")
    for r in fails:
        print(f"  {r['country']:4} {r['category'][:26]:26} {r['plate']:16} -> {r.get('read', '')!r:20} {r['status']}")
    total_ok = len(all_results) - len(fails)
    print(f"\nplates: {total_ok} / {len(all_results)} ok")

    if args.report:
        with open(args.report, "w", encoding="utf-8") as f:
            json.dump(all_results, f, ensure_ascii=False, indent=2)
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()
