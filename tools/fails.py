"""One line per failing category of the last full check (data/check.json): country | category | type id | ok/total | visible fields | first failing plate -> read, status.
    python tools/fails.py            all countries
    python tools/fails.py de ru      some countries"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.stdout.reconfigure(encoding="utf-8")
check = json.loads((ROOT / "data" / "check.json").read_text(encoding="utf-8"))
for cc in sorted(sys.argv[1:] or check):
    form = json.loads((ROOT / "data" / "countries" / cc / "form.json").read_text(encoding="utf-8"))
    types = {t["label"].lower(): t for t in form["types"]}
    for cat, x in sorted(check.get(cc, {}).items()):
        if not x["failed"]:
            continue
        t = types.get(cat.lower()) or next((v for k, v in types.items() if k.startswith(cat.lower() + " (")), None)
        vis = ",".join(t["visible"]) if t and t["visible"] else "?"
        f = x["failed"][0]
        print(f"{cc}|{cat}|{t['id'] if t else '?'}|{x['ok']}/{x['total']}|{vis}|{f['plate']} -> {f['read']!r} {f['status']}")
