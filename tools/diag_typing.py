"""What happens when a plate is typed into one category of a saved upload page: every plate field, whether it is shown,
its value, and what the script reads back. For finding why a rule fails (or why the plate does not fit).

    python tools/diag_typing.py ru Cars "у 007 ут 198"
"""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tests"))
sys.path.insert(0, str(ROOT / "tests" / "offline"))
import check_db as c                    # noqa: E402
from fake_site import route_site        # noqa: E402
from playwright.sync_api import sync_playwright   # noqa: E402

DUMP = r"""() => [...document.querySelectorAll('input, select')]
  .filter(el => /nomer|let|digit|region|^b\d|dip|drop|^dig|trl|letter|^fon|^el$|^tx$|^trz$|^nonr$/i.test(el.id || el.name || ''))
  .map(el => ({ id: el.id || el.name, tag: el.tagName[0], shown: el.offsetParent !== null && !el.disabled,
                value: el.tagName === 'SELECT' ? (el.options[el.selectedIndex] || {}).text : el.value }))"""


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    cc, category, plate = sys.argv[1:4]
    with sync_playwright() as p:
        b = p.chromium.launch()
        ctx = b.new_context()
        route_site(ctx)
        page = ctx.new_page()
        print("harness:", c.open_country(page, cc))
        print("category set:", c.set_category(page, category))
        page.wait_for_timeout(300)
        print("before:", [(f["id"], f["value"]) for f in page.evaluate(DUMP) if f["shown"] or f["value"]])
        fits = page.evaluate("([t, cc, cat]) => window.nextplaateDev.type(t, cc, cat)", [plate, cc, category])
        page.wait_for_timeout(200)
        print("parts:", page.evaluate("() => [\"dop\",\"dop1\",\"digit\",\"ctype\"].map(i => [i, (document.getElementById(i)||{}).value, !!(document.getElementById(i)||{}).offsetParent])"))
        print("fits:", fits, "| the script reads:", repr(page.evaluate("() => window.nextplaateDev.read()")))
        for f in page.evaluate(DUMP):
            print(f"  {'shown ' if f['shown'] else 'hidden'} {f['tag']} {f['id']!r:14} {f['value']!r}")
        b.close()


main()
