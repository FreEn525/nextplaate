"""Measures, for every country of the site that has regions, how many of them fall on the shapes of geoBoundaries (per level), and writes
src/lib/regions-levels.js with the countries where at least THRESHOLD of the regions are placed.

    python tools/measure-regions.py            # downloads the shapes once into a cache folder (reference/real/regions/shapes/)
    python tools/measure-regions.py --table    # only prints the table

Input: the region pages of the site, written by the developer tool "Regions collection" into reference/real/regions/ (one per system).
The matching rule is the one of src/lib/regions-match.js (normalised names, then ISO 3166-2 codes).
"""
import glob, json, os, re, sys, unicodedata, urllib.request
from pathlib import Path

from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
PAGES = ROOT / "reference" / "real" / "regions"
CACHE = PAGES / "shapes"
THRESHOLD = 0.70
LEVELS = ("ADM1", "ADM2", "ADM3")
MAX_SHAPES = 600                                  # a map with more shapes than this is too heavy to draw: not offered
WORDS = re.compile(r"\b(city|town|district|dist|region|oblast|republic|krai|kray|autonomous|okrug|municipality|county|kreis|landkreis|stadt|of|the|and|rural|urban|prefecture|province|department|departement|canton|commune)\b")


def norm(text):
    text = unicodedata.normalize("NFKD", text or "").encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", " ", WORDS.sub(" ", text)).strip()


def rows(path):
    """The regions of a page of the site: two layouts, with a code column (7 cells) and without (6)."""
    out = []
    for tr in BeautifulSoup(path.read_text(encoding="utf-8", errors="ignore"), "html.parser").select("#example tbody tr"):
        td = tr.find_all("td")
        if len(td) < 6:
            continue
        coded = len(td) >= 7
        code, name = (td[2].get_text(strip=True), td[3].get_text(" ", strip=True)) if coded else ("", td[2].get_text(" ", strip=True))
        if coded and not code:
            continue                                   # the line of the photos with no region
        out.append({"code": code, "name": name})
    return out


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    return urllib.request.urlopen(req, timeout=120).read()


def shapes(iso, level):
    CACHE.mkdir(parents=True, exist_ok=True)
    f = CACHE / f"{iso}-{level}.geojson"
    if not f.exists():
        meta = json.loads(fetch(f"https://www.geoboundaries.org/api/current/gbOpen/{iso}/{level}/"))
        f.write_bytes(fetch(meta["simplifiedGeometryGeoJSON"]))
    return [x["properties"] for x in json.loads(f.read_text(encoding="utf-8"))["features"]]


def placed(regions, props):
    names, codes = {}, {}
    for i, p in enumerate(props):
        names.setdefault(norm(p.get("shapeName")), []).append(i)
        if "-" in (p.get("shapeISO") or ""):
            codes.setdefault(p["shapeISO"].split("-")[-1].lower(), []).append(i)
    n = 0
    for r in regions:
        parts = [norm(x) for x in re.split(r"[,;/]|\bor\b", r["name"])] + [norm(r["name"])]
        if any(p in names for p in parts if p) or (r["code"] and r["code"].lower() in codes):
            n += 1
    return n


def main():
    iso3 = json.loads((Path(__file__).with_name("iso3.json")).read_text())
    by_country = {}
    for f in sorted(glob.glob(str(PAGES / "regions-*.html"))):
        system = os.path.basename(f)[8:-5]
        by_country.setdefault(re.sub(r"\d$", "", system), []).extend(rows(Path(f)))
    table, chosen = [], {}
    for cc, regions in sorted(by_country.items()):
        iso = iso3.get(cc)
        best = None
        for level in (LEVELS if iso else ()):
            try:
                props = shapes(iso, level)
            except Exception:
                continue
            n = placed(regions, props)
            if len(props) <= MAX_SHAPES and (not best or n > best[1]):
                best = (level, n, len(props))
        table.append((cc, len(regions), best))
        if best and regions and best[1] / len(regions) >= THRESHOLD:
            chosen[cc] = (iso, best[0])
    for cc, n, best in sorted(table, key=lambda x: -((x[2][1] / x[1]) if x[2] and x[1] else -1)):
        print(f"{cc:3} regions {n:4}  " + (f"{best[0]} shapes {best[2]:4} placed {best[1]:4} ({100 * best[1] // max(n, 1)}%)" if best else "no shapes"))
    if "--table" not in sys.argv:
        body = ", ".join(f"{cc}: ['{iso}', '{lv}']" for cc, (iso, lv) in sorted(chosen.items()))
        (ROOT / "src" / "lib" / "regions-levels.js").write_text(HEADER.format(n=len(chosen), body=body), encoding="utf-8")
        print(f"\nsrc/lib/regions-levels.js: {len(chosen)} countries")


HEADER = """  /* =====================================================================
   *  REGION MAPS: WHICH COUNTRIES, AT WHICH LEVEL  (written by tools/measure-regions.py: do not edit by hand)
   *    For each country of the site that has regions: its ISO 3166 alpha-3 code and the geoBoundaries level whose shapes the site's regions
   *    fall on best. A country is listed only when at least seven regions in ten are placed on the shapes; the others show the table of
   *    their regions, without a map, until their matching is worked out. {n} countries.
   * ===================================================================== */
  const REGION_MAPS = {{
    {body}
  }};
"""

if __name__ == "__main__":
    main()
