"""Offline check of the plate format of every country, against the example the site shows in its
search box (the placeholder). Each example is typed into the saved upload page, and the script must
read it back the same way. Uses the dev build (nextplaate.dev.user.js).

    python tests/offline/check_formats.py
"""
import re
import sys

from playwright.sync_api import sync_playwright
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from fake_site import ROOT, route_site

REF = ROOT / "reference" / "real" / "countries"
DEV = (ROOT / "nextplaate.dev.user.js").read_text(encoding="utf-8")


def example(code):
    """The second placeholder of the search page is the plate example (the first one is generic)."""
    f = REF / f"search-{code}.html"
    if not f.exists():
        return None
    found = [p for p in re.findall(r'<input[^>]*placeholder="([^"]*)"', f.read_text(encoding="utf-8", errors="ignore"))
             if re.search(r"\d|[A-Z]{2}", p) and p != "ABC 123"]
    return found[0] if found else None


def norm(s):
    return re.sub(r"[\s-]+", "", s or "").upper()


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    report = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        for f in sorted(REF.glob("*.html")):
            if f.stem.startswith("search-"):
                continue
            code = f.stem
            ex = example(code)
            if not ex:
                report.append((code, "NO EXAMPLE", "", ""))
                continue
            html = f.read_text(encoding="utf-8", errors="ignore")
            ctx = b.new_context()
            route_site(ctx)
            page = ctx.new_page()
            page.route(f"https://platesmania.com/{code}/add", lambda r, q, h=html: r.fulfill(
                status=200, content_type="text/html; charset=utf-8",
                body=h.replace("</body>", "<script>" + DEV + "</script></body>")))
            try:
                page.goto(f"https://platesmania.com/{code}/add", wait_until="domcontentloaded")
                page.wait_for_timeout(600)
                res = page.evaluate("(t) => window.nextplaateDev ? window.nextplaateDev.testText(t) : {fits: null, read: 'NO TEST FUNCTION'}", ex)
                ok = norm(res["read"]) == norm(ex)
                report.append((code, "OK" if ok else "DIFF", ex, res["read"]))
            except Exception as e:
                report.append((code, "ERROR", ex, str(e)[:80]))
            ctx.close()
        b.close()
    for code, status, ex, read in report:
        print(f"{code:4} {status:8} site example: {ex!s:24} script reads: {read}")
    print("\nOK:", sum(1 for r in report if r[1] == "OK"), "/", len(report))


if __name__ == "__main__":
    main()
