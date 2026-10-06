"""Measures, for every country of the site that has regions, how many of them fall on the shapes of geoBoundaries (per level), and writes
src/lib/regions-levels.js with the countries where at least THRESHOLD of the regions are placed.

    python tools/measure-regions.py            # downloads the shapes once into a cache folder (reference/real/regions/shapes/)
    python tools/measure-regions.py --table    # only prints the table
    python tools/measure-regions.py ru kz --why   # only these countries, and the regions that found no shape
    python tools/measure-regions.py de uk --pairs # a sample of what was placed where, to check by eye
    python tools/measure-regions.py ru --suggest  # for what found no shape, the nearest shape names (to write an alias)
    python tools/measure-regions.py --codes       # also writes src/lib/regions-codes.js from the plate codes of Wikidata (tools/wikidata-codes.py)

Input: the region pages of the site, written by the developer tool "Regions collection" into reference/real/regions/ (one per system).
The matching is done by node tools/match-regions.mjs, which runs src/lib/regions-match.js itself (names, aliases, codes, near names).
"""
import glob, json, os, re, subprocess, sys, urllib.request
from pathlib import Path

from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
PAGES = ROOT / "reference" / "real" / "regions"
CACHE = PAGES / "shapes"
THRESHOLD = 0.70
LEVELS = ("ADM1", "ADM2", "ADM3")
MAX_SHAPES = 600                                  # a map with more shapes than this is too heavy to draw: not offered


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


def main():
    iso3 = json.loads((Path(__file__).with_name("iso3.json")).read_text())
    by_country = {}
    for f in sorted(glob.glob(str(PAGES / "regions-*.html"))):
        system = os.path.basename(f)[8:-5]
        by_country.setdefault(re.sub(r"\d$", "", system), []).extend(rows(Path(f)))
    only = [a for a in sys.argv[1:] if not a.startswith("--")]
    data = {}
    for cc, regions in sorted(by_country.items()):
        if only and cc not in only:
            continue
        levels = {}
        for level in (LEVELS if iso3.get(cc) else ()):
            try:
                props = shapes(iso3[cc], level)
            except Exception:
                continue
            if len(props) <= MAX_SHAPES:
                levels[level] = [{"name": p.get("shapeName") or "", "iso": p.get("shapeISO") or ""} for p in props]
        data[cc] = {"regions": regions, "levels": levels}
    tmp = CACHE / "measure-input.json"
    tmp.write_text(json.dumps(data), encoding="utf-8")
    env = dict(os.environ, **({**({"PAIRS": "1"} if "--pairs" in sys.argv else {}), **({"SUGGEST": "1"} if "--suggest" in sys.argv else {})}))
    result = json.loads(subprocess.run(["node", str(ROOT / "tools" / "match-regions.mjs"), str(tmp)], capture_output=True, text=True, check=True, encoding="utf-8", env=env).stdout)
    table, chosen = [], {}
    for cc, res in result.items():
        n = len(by_country[cc])
        # a region that is not an area (mopeds, historic vehicles...) is not counted: it has no place on a map
        best = max(((v["placed"], lv, v) for lv, v in res.items()), default=None, key=lambda x: x[0])
        area = max(1, n - (best[2]["special"] if best else 0))
        table.append((cc, n, best, area))
        if best and best[0] / area >= THRESHOLD:
            chosen[cc] = (iso3[cc], best[1])
    for cc, n, best, area in sorted(table, key=lambda x: -((x[2][0] / x[3]) if x[2] else -1)):
        if best:
            print(f"{cc:3} regions {n:4} (areas {area:4})  {best[1]} shapes {best[2]['shapes']:4} placed {best[0]:4} ({100 * best[0] // area}%)")
            if "--why" in sys.argv and best[0] / area < 1:
                print("      not placed:", best[2]["missing"])
            if "--suggest" in sys.argv:
                for line in best[2].get("suggest", [])[:30]:
                    print("      ?", line)
            if "--pairs" in sys.argv:
                import random
                random.seed(1)
                for pair in random.sample(best[2]["pairs"], min(14, len(best[2]["pairs"]))):
                    print("      ", pair)
        else:
            print(f"{cc:3} regions {n:4}  no shapes")
    if "--codes" in sys.argv:
        write_code_names(by_country, result, iso3)
    if "--table" not in sys.argv and not only:
        body = ", ".join(f"{cc}: ['{iso}', '{lv}']" for cc, (iso, lv) in sorted(chosen.items()))
        (ROOT / "src" / "lib" / "regions-levels.js").write_text(HEADER.format(n=len(chosen), body=body), encoding="utf-8")
        print(f"\nsrc/lib/regions-levels.js: {len(chosen)} countries")


def write_code_names(by_country, result, iso3):
    """Names of plate codes from Wikidata (tools/wikidata-codes.py), kept when they find a shape: src/lib/regions-codes.js."""
    wd = ROOT / "reference" / "real" / "regions" / "wikidata"
    data = {}
    for cc, res in result.items():
        f = wd / f"{cc}.json"
        best = max(((v["placed"], lv) for lv, v in res.items()), default=None)
        if f.exists() and best:
            props = shapes(iso3[cc], best[1])
            data[cc] = {"regions": by_country[cc], "shapes": [{"name": p.get("shapeName") or "", "iso": p.get("shapeISO") or ""} for p in props], "labels": json.loads(f.read_text(encoding="utf-8"))}
    tmp = CACHE / "code-names-input.json"
    tmp.write_text(json.dumps(data), encoding="utf-8")
    out = json.loads(subprocess.run(["node", str(ROOT / "tools" / "code-names.mjs"), str(tmp)], capture_output=True, text=True, check=True, encoding="utf-8").stdout)
    out = {cc: table for cc, table in out.items() if table}
    body = ("," + chr(10) + "    ").join(f"{cc}: {json.dumps(table)}" for cc, table in sorted(out.items()))
    (ROOT / "src" / "lib" / "regions-codes.js").write_text(CODES_HEADER.format(body=body), encoding="utf-8")
    print(chr(10) + "src/lib/regions-codes.js:", {cc: len(t) for cc, t in out.items()})


CODES_HEADER = """  /* =====================================================================
   *  REGION CODE NAMES  (written by tools/measure-regions.py --codes: do not edit by hand)
   *    For some countries the regions of the site are plate codes (Germany: AE, AL, AIB...) whose own name finds no shape. Wikidata (CC0)
   *    knows the places that carry each code, with their names; the first name of a code that finds a shape on the map is kept here:
   *    country -> plate code -> name.
   * ===================================================================== */
  const REGION_CODE_NAMES = {{
    {body}
  }};
"""


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
