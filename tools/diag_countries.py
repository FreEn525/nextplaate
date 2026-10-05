"""Diagnostic (not a test): loads every captured country page in the browser, fills its plate fields
with recognisable values, and prints the plate the script builds from them.

    python tools/diag_countries.py
"""
import pathlib
import sys
import re

from playwright.sync_api import sync_playwright
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'tests'))
from fake_site import ROOT, SCRIPT, route_site

PAGES = ROOT / "reference" / "real" / "countries"
PLATE_IDS = re.compile(r"nomer|let|digit|region|^b\d|dip|drop|^dig|trl|letter|ctype", re.I)


def run():
    sys.stdout.reconfigure(encoding="utf-8")
    with sync_playwright() as p:
        b = p.chromium.launch()
        for f in sorted(PAGES.glob("*.html")):
            code = f.stem
            html = f.read_text(encoding="utf-8", errors="ignore")
            ctx = b.new_context()
            route_site(ctx)
            page = ctx.new_page()
            errors = []
            page.on("pageerror", lambda e: errors.append(str(e)[:120]))
            # serve the captured page as the real upload page of this country
            body = html.replace("</body>", "<script>" + SCRIPT + "</script></body>")
            page.route(f"https://platesmania.com/{code}/add", lambda route, request: route.fulfill(
                status=200, content_type="text/html", body=body))
            page.goto(f"https://platesmania.com/{code}/add", wait_until="domcontentloaded")
            page.wait_for_timeout(800)
            filled = page.evaluate("""(re) => {
                const rx = new RegExp(re, 'i'), out = [];
                const vis = el => el.offsetParent !== null;
                for (const el of document.querySelectorAll('input, select')) {
                    const key = el.id || el.name || '';
                    if (!rx.test(key) || key === 'ctype' || el.disabled || !vis(el)) continue;
                    if (el.tagName === 'SELECT') {
                        const opt = [...el.options].find(o => o.value);
                        if (opt) { el.value = opt.value; el.dispatchEvent(new Event('change', {bubbles: true})); out.push(key + '=' + opt.text.trim()); }
                    } else if (el.type === 'text' || !el.type) {
                        el.value = key.toUpperCase().slice(0, 6); out.push(key + '=' + el.value);
                    }
                }
                return out;
            }""", PLATE_IDS.pattern)
            if not page.evaluate("() => !!document.getElementById('pmg-host')"):
                print(f"{code:4} PANEL NOT MOUNTED  errors: {errors[:2]}")
                ctx.close()
                continue
            try:
                page.evaluate("() => document.getElementById('pmg-host').shadowRoot.getElementById('plateCheck').click()")
                page.wait_for_timeout(300)
                plate = page.evaluate("() => document.getElementById('pmg-host').shadowRoot.getElementById('plateNow').textContent")
            except Exception as e:
                print(f"{code:4} CHECK FAILED: {str(e)[:100]}")
                ctx.close()
                continue
            print(f"{code:4} plate: {plate:30} fields: {' '.join(filled)[:160]}  errors: {errors[:1]}")
            ctx.close()
        b.close()


if __name__ == "__main__":
    run()
