"""For a list of (country, category, plate): how to enter the plate by hand in the upload form, from what the offline check does
(which menu gets which value, which field gets which text). Writes docs/A-VERIFIER.md.
    python tools/hand_check.py
"""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tests"))
sys.path.insert(0, str(ROOT / "tests" / "offline"))
import check_db as c                    # noqa: E402
from fake_site import route_site        # noqa: E402
from playwright.sync_api import sync_playwright   # noqa: E402

# one plate per country whose rule changed; the plate is one of those the site shows in that category's gallery
PICKS = [
    ("il", "Sportcars", "S-100 294"), ("il", "Military", "172539-צ"), ("it", "Dealer", "00 P 1FLYG"), ("kg", "Diplomatic", "D 09 003"),
    ("kz", "Foreigners (2012)", "C 463 02"), ("pt", "National Republican Guard", "GNR T-399"), ("ge", "Test license plates (TEST)", "TEST-050"),
    ("de", "Plates for oldtimers (type \"H\")", "HEI Z 924 H"), ("ch", "Vehicles w/o paid duty (with \"Z\")", "ZH 1257 Z"),
    ("gi", "Regular car plates (G 1234 A)", "G 1267 G"), ("ax", "Vanity Plates", "BOMAN2"), ("dk", "Vanity Plates", "USANO1"),
    ("mc", "Provisional", "1517 WW MC"), ("mn", "Motorcycles", "БӨЗ 3510"), ("si", "Trailers", "H4-86 KP"),
    ("ru", "Diplomatic", "032 D 345 77"), ("cz", "Electric vehicles", "EL5 57CP"), ("ma", "Regular plates", "3385|د|40"),
]
DUMP = r"""() => [...document.querySelectorAll('#frm input, #frm select')].filter((el, i, all) => all.indexOf(el) < all.indexOf(document.querySelector('#frm input[type=file]')) && el.offsetParent !== null && el.type !== 'file' && el.type !== 'hidden' && !/^(ctype|drop_2|fon\d*|font|r\d+|shortplate|noseals|oldfont|largeletter\w*|dip_month|dip_year|format1_input|kg2016\w*)$|_r\d+$/.test(el.id))
  .map(el => ({ id: el.id || el.name, disabled: el.disabled, sel: el.tagName === 'SELECT', value: el.tagName === 'SELECT' ? (el.options[el.selectedIndex] || {}).text : el.value }))"""


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    lines = ["# Plaques à vérifier à la main sur le site", "",
             "Généré par `python tools/hand_check.py`. Pour chaque ligne : ouvrir `platesmania.com/<pays>/add`, choisir la catégorie dans le menu de type, remplir les champs comme indiqué, ouvrir le tiroir **Search** (loupe) : la vérification de plaque doit dire que la plaque est déjà sur le site (1 photo ou plus). Un champ « écrit par le site » est grisé : on n'y touche pas.", "",
             "| Pays | Catégorie | Plaque | Comment la saisir |", "|---|---|---|---|"]
    with sync_playwright() as p:
        b = p.chromium.launch()
        ctx = b.new_context()
        route_site(ctx)
        page = ctx.new_page()
        for cc, cat, plate in PICKS:
            c.open_country(page, cc)
            c.set_category(page, cat)
            page.wait_for_timeout(200)
            res = page.evaluate("([t, o]) => window.nextplaateDev.testText(t, o)", [plate, {"country": cc, "category": cat, "settle": 300, "keep": True}])
            ok, read = res["fits"], res["read"]
            steps = []
            for f in page.evaluate(DUMP):
                if f["disabled"]:
                    steps.append(f"`{f['id']}` = {f['value']} (écrit par le site)")
                elif f["value"] and f["value"] not in ("-", "•"):
                    steps.append(f"`{f['id']}` {'menu' if f['sel'] else 'champ'} : {f['value']}")
            lines.append(f"| {cc} | {cat} | `{plate}` | {' ; '.join(steps)} → la vérification lit `{read}` |" + ("" if ok else " (la saisie de test n'entre pas)"))
        b.close()
    (ROOT / "docs" / "A-VERIFIER.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print("\n".join(lines[6:]))


main()
