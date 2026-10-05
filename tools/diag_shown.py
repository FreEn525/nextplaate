"""Every field the form shows for one category (disabled ones too: the site writes fixed letters there), with its value.
    python tools/diag_shown.py ie Oldtimers"""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tests"))
sys.path.insert(0, str(ROOT / "tests" / "offline"))
import check_db as c                    # noqa: E402
from fake_site import route_site        # noqa: E402
from playwright.sync_api import sync_playwright   # noqa: E402

JS = r"""() => [...document.querySelectorAll('#frm input, #frm select')].filter((el, i, all) => all.indexOf(el) < all.indexOf(document.querySelector('#frm input[type=file]')) && el.offsetParent !== null && el.type !== 'file' && el.type !== 'hidden' && el.id !== 'ctype')
  .map(el => ({ id: el.id || el.name, tag: el.tagName[0], disabled: el.disabled, max: el.maxLength > 0 ? el.maxLength : null,
                value: el.tagName === 'SELECT' ? (el.options[el.selectedIndex] || {}).text : el.value,
                n: el.tagName === 'SELECT' ? el.options.length : null,
                sample: el.tagName === 'SELECT' ? [...el.options].slice(0, 6).map(o => o.text) : null }))"""

sys.stdout.reconfigure(encoding="utf-8")
cc, category = sys.argv[1:3]
with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context()
    route_site(ctx)
    page = ctx.new_page()
    c.open_country(page, cc)
    c.set_category(page, category)
    page.wait_for_timeout(300)
    for f in page.evaluate(JS):
        print(f"  {f['id']!r:14} {f['tag']} {'DISABLED ' if f['disabled'] else ''}max={f['max']} value={f['value']!r}" + (f" ({f['n']} options {f['sample']})" if f['n'] else ""))
    b.close()
