"""Fetches, from Wikidata (CC0, an open public API), in which administrative units the places named by the regions of the site lie
(property P131, "located in", followed up the chain): reference/real/regions/wikidata/parents-<cc>.json = { place name: [parent names] }.
For the countries whose plates name towns or offices (United Kingdom, Ireland, Japan, Croatia, Iceland...), the shape of a county or a
prefecture is found by the town that lies in it; tools/measure-regions.py --codes keeps the parents that find a shape.

    python tools/wikidata-parents.py uk ie jp hr is
"""
import glob, json, os, re, subprocess, sys, time, urllib.parse
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PAGES = ROOT / "reference" / "real" / "regions"
OUT = PAGES / "wikidata"
COUNTRY = {"uk": "Q145", "ie": "Q27", "jp": "Q17", "hr": "Q224", "is": "Q189", "gr": "Q41", "ma": "Q1028", "my": "Q833", "ps": "Q219060",
           "dz": "Q262", "no": "Q20", "pl": "Q36", "sk": "Q214", "ke": "Q114", "kz": "Q232", "kg": "Q813", "md": "Q217", "at": "Q40", "id": "Q252", "it": "Q38"}
LANG = {"jp": "en", "gr": "en"}


def names_of(cc):
    from bs4 import BeautifulSoup
    found = set()
    for f in glob.glob(str(PAGES / f"regions-{cc}*.html")):
        for tr in BeautifulSoup(Path(f).read_text(encoding="utf-8", errors="ignore"), "html.parser").select("#example tbody tr"):
            td = tr.find_all("td")
            if len(td) < 6:
                continue
            text = td[3 if len(td) >= 7 else 2].get_text(" ", strip=True)
            for part in re.split(r"[,;/]", re.sub(r"[(][^)]*[)]", " ", text)):
                part = part.strip()
                if len(part) > 2:
                    found.add(part)
    return sorted(found)


def ask(query):
    url = "https://query.wikidata.org/sparql?format=json&query=" + urllib.parse.quote(query)
    raw = subprocess.run(["curl", "-s", "-m", "170", "-H", "User-Agent: NextPlaate-tooling/1.0 (userscript research)", "-H", "Accept: application/sparql-results+json", url], capture_output=True, check=True).stdout
    return json.loads(raw.decode("utf-8"))["results"]["bindings"]


LANGS = {"is": ["en", "is"], "ie": ["en", "ga"], "hr": ["en", "hr"], "uk": ["en", "cy", "gd"], "gr": ["en", "el"], "jp": ["en"], "ma": ["en", "fr"], "dz": ["en", "fr"]}


def fetch(cc):
    table = {}
    names = names_of(cc)
    langs = LANGS.get(cc, ["en"])
    for i in range(0, len(names), 30):
        chunk = names[i:i + 30]
        values = " ".join(json.dumps(n, ensure_ascii=False) + "@" + lang for n in chunk for lang in langs)
        query = ("SELECT ?name ?item ?sl ?parentLabel WHERE { VALUES ?name { " + values + " } ?item rdfs:label ?name; wdt:P17 wd:" + COUNTRY[cc] + "; wikibase:sitelinks ?sl; wdt:P131+ ?parent. "
                 "SERVICE wikibase:label { bd:serviceParam wikibase:language 'en'. } }")
        try:
            rows = ask(query)
        except Exception as e:
            print("   chunk", i, "failed:", e, flush=True)
            continue
        best = {}                                                       # per name: the item with most sitelinks (the well-known one among homonyms)
        for r in rows:
            n, it, sl = r["name"]["value"], r["item"]["value"], int(r["sl"]["value"])
            if n not in best or sl > best[n][1]:
                best[n] = (it, sl)
        for r in rows:
            n = r["name"]["value"]
            if best[n][0] == r["item"]["value"]:
                parents = table.setdefault(n, [])
                if r["parentLabel"]["value"] not in parents:
                    parents.append(r["parentLabel"]["value"])
        time.sleep(1)
    return table


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    for cc in sys.argv[1:]:
        table = fetch(cc)
        (OUT / f"parents-{cc}.json").write_text(json.dumps(table, ensure_ascii=False), encoding="utf-8")
        print(cc, len(table), "places with parents", flush=True)
