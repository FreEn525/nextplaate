"""For one country: every failing category of the last full check, with the fields the form shows for it and
what the script read for each failing plate. Run `python tests/offline/check_db.py` first (it writes data/check.json).

    python tools/diag_rules.py ru
    python tools/diag_rules.py ru --all        # the categories that pass too
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    cc = args[0]
    show_all = "--all" in sys.argv
    check = json.loads((ROOT / "data" / "check.json").read_text(encoding="utf-8")).get(cc, {})
    form = json.loads((ROOT / "data" / "countries" / cc / "form.json").read_text(encoding="utf-8"))
    types = {t["label"]: t for t in form["types"]}
    fields = {f["id"] or f["name"]: f for f in form["plateFields"]}
    print(f"{cc}: menu {form['typeMenu']}, visible from {form['visibleFrom']}, hooks {form['hooks']}")
    for label, res in sorted(check.items()):
        if not res["failed"] and not show_all:
            continue
        t = next((v for k, v in types.items() if k.lower() == label.lower() or k.lower().startswith(label.lower() + " (")), None)
        print(f"\n== {label}  ({res['ok']}/{res['total']})  type id {t['id'] if t else '?'}")
        if t:
            print("   visible:", ", ".join(
                f"{i}" + (f"[{fields[i]['tag'][0]}{'' if 'options' not in fields[i] else ''}{fields[i].get('maxlength', '')}]" if i in fields else "")
                for i in (t["visible"] or [])))
        for f in res["failed"]:
            print(f"   {f['status']:8} plate {f['plate']!r:22} read {f['read']!r}")


main()
