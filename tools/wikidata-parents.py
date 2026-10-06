"""Fetches, from Wikidata (CC0, an open public API), for the places named by the regions of the site: the administrative units they lie in
(property P131, "located in", up the chain) and their coordinates (P625):
    reference/real/regions/wikidata/parents-<cc>.json = { place name: [parent names] }
    reference/real/regions/wikidata/coords-<cc>.json  = { place name: [longitude, latitude] }
For the countries whose plates name towns, offices or old provinces (United Kingdom, Ireland, Japan, Algeria...), the shape of a county or a
prefecture is found by the town that lies in it, or by the shape that holds the point of the place; tools/measure-regions.py --codes keeps
what finds a shape.

    python tools/wikidata-parents.py uk ie jp hr is
"""
import glob, json, re, subprocess, sys, time, urllib.parse
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PAGES = ROOT / "reference" / "real" / "regions"
OUT = PAGES / "wikidata"
ISO3 = json.loads((Path(__file__).with_name("iso3.json")).read_text())
LANGS = {"is": ["en", "is"], "ie": ["en", "ga"], "hr": ["en", "hr"], "uk": ["en", "cy", "gd"], "gr": ["en", "el"], "jp": ["en"], "ma": ["en", "fr"], "dz": ["en", "fr"],
         "ru": ["en", "ru"], "ua": ["en", "uk"], "kz": ["en", "ru"], "kg": ["en", "ru"], "by": ["en", "ru"], "mn": ["en"], "tr": ["en", "tr"], "es": ["en", "es"]}


GENERIC = re.compile(r"\b(city|town|district|districts|region|province|prefecture|governorate|county|municipality|state|oblast|republic|division|department|autonomous|okrug|krai|capital)\b", re.I)


def names_of(cc):
    """The names the regions of the country hold: each part of a text (split on , ; / and 'and'), as written and without the generic words."""
    from bs4 import BeautifulSoup
    found = set()
    for f in glob.glob(str(PAGES / f"regions-{cc}*.html")):
        for tr in BeautifulSoup(Path(f).read_text(encoding="utf-8", errors="ignore"), "html.parser").select("#example tbody tr"):
            td = tr.find_all("td")
            if len(td) < 6:
                continue
            text = td[3 if len(td) >= 7 else 2].get_text(" ", strip=True)
            for part in re.split(r"[,;/]|\band\b|\bor\b", re.sub(r"[(][^)]*[)]", " ", text)):
                for variant in (part, GENERIC.sub(" ", part)):
                    variant = re.sub(r"\s+", " ", variant).strip(" -")
                    if len(variant) > 2:
                        found.add(variant)
    return sorted(found)


def ask(query):
    url = "https://query.wikidata.org/sparql?format=json&query=" + urllib.parse.quote(query)
    raw = subprocess.run(["curl", "-s", "-m", "170", "-H", "User-Agent: NextPlaate-tooling/1.0 (userscript research)", "-H", "Accept: application/sparql-results+json", url], capture_output=True, check=True).stdout
    return json.loads(raw.decode("utf-8"))["results"]["bindings"]


def fetch(cc):
    parents, coords = {}, {}
    names = names_of(cc)
    langs = LANGS.get(cc, ["en"])
    for i in range(0, len(names), 8):
        chunk = names[i:i + 8]
        values = " ".join(json.dumps(n, ensure_ascii=False) + "@" + lang for n in chunk for lang in langs)
        # light on purpose: the chain of parents (P131+) made the query time out; parents come from a second, separate query when asked (--parents)
        query = ("SELECT ?name ?item ?sl ?coord WHERE { VALUES ?name { " + values + " } ?item rdfs:label ?name; wdt:P17 ?c; wikibase:sitelinks ?sl; wdt:P625 ?coord. "
                 "?c wdt:P298 \"" + ISO3[cc] + "\". }")
        rows = None
        for attempt in range(3):
            try:
                rows = ask(query)
                break
            except Exception as e:
                print("   chunk", i, "attempt", attempt + 1, "failed:", e, flush=True)
                time.sleep(5)
        if rows is None:
            continue
        best = {}                                                       # per name: the item with most sitelinks (the well-known one among homonyms)
        for r in rows:
            n, it, sl = r["name"]["value"], r["item"]["value"], int(r["sl"]["value"])
            if n not in best or sl > best[n][1]:
                best[n] = (it, sl)
        for r in rows:
            n = r["name"]["value"]
            if best[n][0] != r["item"]["value"]:
                continue
            if "parentLabel" in r:
                lst = parents.setdefault(n, [])
                if r["parentLabel"]["value"] not in lst:
                    lst.append(r["parentLabel"]["value"])
            if "coord" in r and n not in coords:
                m = re.match(r"Point[(]([-0-9.eE]+) ([-0-9.eE]+)[)]", r["coord"]["value"])
                if m:
                    coords[n] = [float(m.group(1)), float(m.group(2))]
        time.sleep(1)
    return parents, coords


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    for cc in sys.argv[1:]:
        parents, coords = fetch(cc)
        if parents:                                    # this query no longer asks for them: keep the file of the earlier run
            (OUT / f"parents-{cc}.json").write_text(json.dumps(parents, ensure_ascii=False), encoding="utf-8")
        (OUT / f"coords-{cc}.json").write_text(json.dumps(coords), encoding="utf-8")
        print(cc, len(parents), "places with parents,", len(coords), "with a point", flush=True)
