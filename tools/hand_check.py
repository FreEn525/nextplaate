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
    ("ru", "Cars", "у 007 ут 198"), ("gr", "Taxi", "TAE-1009"), ("jp", "Private owners", "山梨 336 な 718"),
    ("pl", "Diplomatic", "W 016600"), ("ua", "Military (2004)", "1133 Ф4"), ("th", "Taxi", "ทห 7776"),
    ("ir", "Taxi", "۵۱ت۱۶۵ ۲۲"), ("kr", "Commercial vehicles", "경기50바 4521"), ("la", "Military", "ກທ 5868"),
    ("mn", "Special machinery", "7073 УН"), ("sg", "Buses", "PC 9090 A"), ("mx", "Cars (AAA-000-A)", "MBG-133-A"),
    ("hr", "Dealer", "OS PP-178"), ("uz", "Foreign citizens", "01 H 010229"), ("lv", "Dealer", "B 1122-6"),
    ("sa", "Cars", "3273 JRS"), ("eg", "Cars (2008)", "٣٦٢١ جىر"), ("vn", "Government and public administrations", "80A-039.27"),
]
DUMP = r"""() => [...document.querySelectorAll('#frm input, #frm select')].filter((el, i, all) => all.indexOf(el) < all.indexOf(document.querySelector('#frm input[type=file]')) && el.offsetParent !== null && el.type !== 'file' && el.type !== 'hidden' && !/^(ctype|drop_2|fon\d*|font|r\d+)$/.test(el.id))
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
