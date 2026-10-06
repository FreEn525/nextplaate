"""Fetches, from Wikidata (CC0), the names of the countries of the world (the label and the other English names of each sovereign state):
reference/real/regions/wikidata/countries.json = [names]. The lists of regions of some countries (Kenya, Algeria...) hold the countries of
their diplomatic plates ("Cuba", "Ivory Coast", "People's Republic of China"): they are no area, tools/measure-regions.py --codes keeps their
normalised names in src/lib/regions-codes.js (REGION_COUNTRY_NAMES) so that the map does not count them as missing.

    python tools/wikidata-countries.py
"""
import json, subprocess, urllib.parse
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / "reference" / "real" / "regions" / "wikidata" / "countries.json"
QUERY = """SELECT ?name WHERE {
  { ?c wdt:P31 wd:Q3624078. ?c rdfs:label ?name. FILTER(LANG(?name) = "en") }
  UNION { ?c wdt:P31 wd:Q3624078. ?c skos:altLabel ?name. FILTER(LANG(?name) = "en") }
  UNION { ?c wdt:P31 wd:Q3624078. ?c wdt:P1448 ?name. }
}"""

if __name__ == "__main__":
    url = "https://query.wikidata.org/sparql?format=json&query=" + urllib.parse.quote(QUERY)
    raw = subprocess.run(["curl", "-s", "-m", "170", "-H", "User-Agent: NextPlaate-tooling/1.0 (userscript research)", "-H", "Accept: application/sparql-results+json", url], capture_output=True, check=True).stdout
    names = sorted({r["name"]["value"] for r in json.loads(raw.decode("utf-8"))["results"]["bindings"]})
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(names, ensure_ascii=False), encoding="utf-8")
    print(len(names), "names of countries")
