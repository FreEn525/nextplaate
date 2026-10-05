"""The plate fields of one country from data/countries/<cc>/form.json, in page order: id, tag, size, example, first options.
    python tools/fields.py al            all fields
    python tools/fields.py al let1 digit only these"""
import json
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
ROOT = Path(__file__).resolve().parents[1]
cc, want = sys.argv[1], sys.argv[2:]
form = json.loads((ROOT / "data" / "countries" / cc / "form.json").read_text(encoding="utf-8"))
print(cc, "menu", form["typeMenu"], "| types:", "; ".join(f"{t['id']}={t['label']}" for t in form["types"])[:600])
for f in form["plateFields"]:
    key = f["id"] or f["name"]
    if want and key not in want:
        continue
    opts = f.get("options")
    if isinstance(opts, dict):
        o = f"{opts['count']} options, first {[x['label'] for x in opts['first']]}"
    elif opts:
        o = f"{len(opts)} options {[x['label'] for x in opts[:10]]}"
    else:
        o = ""
    print(f"  {key!r:16} {f['tag']:6} {f.get('type', ''):6} max={f.get('maxlength', '-')!s:4} ex={f.get('example', '')!r:10} {'digits ' if f.get('digitsOnly') else ''}{'hidden ' if f.get('hiddenAtLoad') else ''}{o}")
