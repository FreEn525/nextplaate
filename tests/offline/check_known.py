"""Types each plate that was checked by hand on the real site (tests/offline/known_plates.json) into the saved upload page and
checks that the script reads it back. Uses the dev build (nextplaate.dev.user.js).

Each country has a plate, or a list of them. A plate is a text, or { "plate": ..., "category": ... } when it belongs to a category
other than the first one of the form. Keep this at "failed: 0": these plates were found on the real site, which no other
offline test proves (see docs/REGLES.md).
"""
import json
import re
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
sys.path.insert(0, str(Path(__file__).resolve().parent))
from fake_site import ROOT, route_site          # noqa: E402
import check_db                                  # noqa: E402

KNOWN = json.loads((ROOT / "tests" / "offline" / "known_plates.json").read_text(encoding="utf-8"))


def norm(s):
    return re.sub(r"[\s|-]+", "", s or "").upper().translate(check_db.CYR)   # the characters: these plates were found on the real site whatever their spaces


def cases():
    for code, v in KNOWN.items():
        for item in (v if isinstance(v, list) else [v]):
            yield code, (item["plate"] if isinstance(item, dict) else item), (item.get("category") if isinstance(item, dict) else None)


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    bad, total = 0, 0
    with sync_playwright() as p:
        b = p.chromium.launch()
        ctx = b.new_context()
        route_site(ctx)
        page = ctx.new_page()
        for code, plate, category in cases():
            total += 1
            if not check_db.open_country(page, code):
                bad += 1
                print(f"{code:4} FAIL the dev script did not start on the page")
                continue
            if category and page.evaluate(check_db.HAS_MENU_JS) and not check_db.set_category(page, category):   # a form without a type menu takes the plate as it is
                bad += 1
                print(f"{code:4} FAIL category not in the form: {category}")
                continue
            res = page.evaluate("([t, o]) => window.nextplaateDev.testText(t, o)",
                                [plate, {"country": code, "category": category, "settle": 300}])
            ok = res["fits"] and norm(res["read"]) == norm(plate)
            bad += 0 if ok else 1
            print(f"{code:4} {'OK  ' if ok else 'FAIL'} plate: {plate:14} fits: {res['fits']!s:5} reads: {res['read']}")
        b.close()
    print(f"\nfailed: {bad} / {total}")
    sys.exit(1 if bad else 0)


main()
