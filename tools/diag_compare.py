"""Diagnostic: on every captured country page, fills the plate fields, then reads the plate built by
our script and by the other "Notification Doubles Plaques" script (MIT). Countries where they differ
are the only ones that need a real check on the site.

    python tools/diag_compare.py
"""
import re
import sys

from playwright.sync_api import sync_playwright
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'tests'))
from fake_site import ROOT, SCRIPT, route_site

PAGES = ROOT / "reference" / "real" / "countries"
OTHER = (ROOT / "reference" / "platesmania-scripts" / "591680.user.js").read_text(encoding="utf-8")
PLATE_IDS = r"nomer|let|digit|region|^b\d|dip|drop|^dig|trl|letter|ctype"
FILL = """(re) => {
    const rx = new RegExp(re, 'i');
    const vis = el => el.offsetParent !== null;
    for (const el of document.querySelectorAll('input, select')) {
        const key = el.id || el.name || '';
        if (!rx.test(key) || key === 'ctype' || el.disabled || !vis(el)) continue;
        if (el.tagName === 'SELECT') {
            const opt = [...el.options].find(o => o.value);
            if (opt) { el.value = opt.value; el.dispatchEvent(new Event('change', {bubbles: true})); }
        } else if (el.type === 'text' || !el.type) {
            el.value = key.toUpperCase().slice(0, 6);
        }
    }
}"""


def read_plates(b, code, html):
    results = {}
    for name, script in (("ours", SCRIPT), ("other", OTHER)):
        ctx = b.new_context()
        route_site(ctx)
        page = ctx.new_page()
        body = html.replace("</body>", "<script>" + script + "</script></body>")
        page.route(f"https://platesmania.com/{code}/add", lambda r, q: r.fulfill(
            status=200, content_type="text/html; charset=utf-8", body=body))
        page.goto(f"https://platesmania.com/{code}/add", wait_until="domcontentloaded")
        page.wait_for_timeout(600)
        page.evaluate(FILL, PLATE_IDS)
        page.wait_for_timeout(2500)                                  # both scripts refresh on their own
        try:
            if name == "ours":
                value = page.evaluate("() => { const h = document.getElementById('pmg-host'); return h ? h.shadowRoot.getElementById('plateNow').textContent : '' }")
            else:
                value = page.evaluate("() => { const e = document.getElementById('pm-plate'); return e ? e.textContent : '' }")
        except Exception:
            value = "(page error)"
        results[name] = (value or "").strip()
        ctx.close()
    return results


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    same, differ = [], []
    with sync_playwright() as p:
        b = p.chromium.launch()
        for f in sorted(PAGES.glob("*.html")):
            code = f.stem
            r = read_plates(b, code, f.read_text(encoding="utf-8", errors="ignore"))
            ours, other = r["ours"], r["other"]
            if ours == other and ours not in ("", "—", "(vide)"):
                same.append(code)
            else:
                differ.append(code)
                print(f"{code:4} ours={ascii(ours)[:40]:42} other={ascii(other)[:40]}")
        b.close()
    print(f"\nSAME ({len(same)}): {' '.join(same)}")
    print(f"TO CHECK ON THE SITE ({len(differ)}): {' '.join(differ)}")


if __name__ == "__main__":
    main()
