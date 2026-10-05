"""Types each plate the user checked by hand on the real site (tests/known_plates.json) into the saved
upload page, and checks that the script reads it back. Uses the dev build (nextplaate.dev.user.js)."""
import json
import re
import sys

from playwright.sync_api import sync_playwright
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from fake_site import ROOT, route_site

REF = ROOT / "reference" / "real" / "countries"
DEV = (ROOT / "nextplaate.dev.user.js").read_text(encoding="utf-8")
KNOWN = json.loads((ROOT / "tests" / "offline" / "known_plates.json").read_text(encoding="utf-8"))


def norm(s):
    return re.sub(r"[\s-]+", "", s or "").upper()


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    bad = 0
    with sync_playwright() as p:
        b = p.chromium.launch()
        cases = [(code, plate) for code, v in KNOWN.items() for plate in (v if isinstance(v, list) else [v])]   # one plate or a list per country
        for code, plate in cases:
            html = (REF / f"{code}.html").read_text(encoding="utf-8", errors="ignore")
            ctx = b.new_context()
            route_site(ctx)
            page = ctx.new_page()
            page.route(f"https://platesmania.com/{code}/add", lambda r, q, h=html: r.fulfill(
                status=200, content_type="text/html; charset=utf-8",
                body=h.replace("</body>", "<script>" + DEV + "</script></body>")))
            page.goto(f"https://platesmania.com/{code}/add", wait_until="domcontentloaded")
            page.wait_for_timeout(600)
            res = page.evaluate("([t, o]) => window.nextplaateDev.testText(t, o)", [plate, {"country": code, "settle": 350}])
            ok = res["fits"] and norm(res["read"]) == norm(plate)
            bad += 0 if ok else 1
            print(f"{code:4} {'OK  ' if ok else 'FAIL'} plate: {plate:14} fits: {res['fits']!s:5} reads: {res['read']}")
            ctx.close()
        b.close()
    print(f"\nfailed: {bad} / {len(KNOWN)}")


if __name__ == "__main__":
    main()
