"""Fetches, from Wikidata (CC0, an open public API), the licence plate codes (property P395) of the places of a country with their names
in several languages: reference/real/regions/wikidata/<cc>.json = { code: [labels] }. They are the names a plate code can answer to
(the code AE is the Vogtlandkreis, whose Wikidata item carries the label "Vogtlandkreis"), tried by tools/measure-regions.py when a
region found no shape by its own name.

    python tools/wikidata-codes.py de pl cz sk gr
"""
import json, subprocess, sys, urllib.parse
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / "reference" / "real" / "regions" / "wikidata"
COUNTRIES = {"de": ("Q183", "de,en"), "pl": ("Q36", "pl,en"), "cz": ("Q213", "cs,en"), "sk": ("Q214", "sk,en"), "gr": ("Q41", "el,en"),
             "es": ("Q29", "es,en"), "jp": ("Q17", "ja,en"), "hr": ("Q224", "hr,en"), "ie": ("Q27", "ga,en"), "ma": ("Q1028", "fr,ar,en")}


def fetch(cc):
    qid, langs = COUNTRIES[cc]
    query = f'SELECT ?code ?label WHERE {{ ?item wdt:P395 ?code; wdt:P17 wd:{qid}. ?item rdfs:label ?label. FILTER(LANG(?label) IN ({", ".join(chr(34) + l + chr(34) for l in langs.split(","))})) }}'
    url = "https://query.wikidata.org/sparql?format=json&query=" + urllib.parse.quote(query)
    # curl: the certificate store of Python on some machines does not know the authority of query.wikidata.org
    raw = subprocess.run(["curl", "-s", "-m", "170", "-H", "User-Agent: NextPlaate-tooling/1.0 (userscript research)", "-H", "Accept: application/sparql-results+json", url], capture_output=True, check=True).stdout
    rows = json.loads(raw.decode("utf-8"))["results"]["bindings"]
    table = {}
    for r in rows:
        labels = table.setdefault(r["code"]["value"], [])
        if r["label"]["value"] not in labels:
            labels.append(r["label"]["value"])
    return table


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    for cc in sys.argv[1:] or ["de", "pl", "cz", "sk", "gr"]:
        table = fetch(cc)
        (OUT / f"{cc}.json").write_text(json.dumps(table, ensure_ascii=False), encoding="utf-8")
        print(cc, len(table), "codes,", sum(len(v) for v in table.values()), "labels", flush=True)
