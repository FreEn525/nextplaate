"""The regions of a country on a map, inside the window of the world map: the site's lists, the member's photos, the shapes of geoBoundaries."""
import json

import pytest

from fake_site import route_site

PANEL = "document.getElementById('pmg-host').shadowRoot"
MODAL = "document.getElementById('pmg-worldmap').shadowRoot"
META = "https://www.geoboundaries.org/api/current/gbOpen/FRA/ADM2/"
GITHUB = "https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/FRA/ADM2/geoBoundaries-FRA-ADM2_simplified.geojson"
GEOJSON = "https://media.githubusercontent.com/media/wmgeolab/geoBoundaries/9469f09/releaseData/gbOpen/FRA/ADM2/geoBoundaries-FRA-ADM2_simplified.geojson"
ASKED = []


def square(x, y):
    return {"type": "Polygon", "coordinates": [[[x, y], [x + 1, y], [x + 1, y + 1], [x, y + 1], [x, y]]]}


SHAPES = {"type": "FeatureCollection", "features": [
    {"type": "Feature", "properties": {"shapeName": n, "shapeISO": ""}, "geometry": square(i * 1.5, 0)}
    for i, n in enumerate(["Ain", "Aisne", "Allier", "Paris"])]}


@pytest.fixture
def ctx(browser):
    c = browser.new_context(viewport={"width": 1280, "height": 900})
    route_site(c)
    ASKED.clear()

    def meta(route):
        ASKED.append(route.request.url)
        route.fulfill(status=200, content_type="application/json", headers={"access-control-allow-origin": "*"},
                      body=json.dumps({"simplifiedGeometryGeoJSON": GITHUB, "boundaryLicense": "Etalab Open License 2.0", "boundaryYearRepresented": "2022"}))

    def geo(route):
        ASKED.append(route.request.url)
        route.fulfill(status=200, content_type="application/json", headers={"access-control-allow-origin": "*"}, body=json.dumps(SHAPES))

    c.route(META, meta)
    c.route(GEOJSON, geo)
    c.route(GITHUB, lambda r: r.abort())                      # the real github.com address answers with a redirect a page cannot follow (no CORS header)
    yield c
    c.close()


def open_map(ctx):
    page = ctx.new_page()
    page.goto("https://platesmania.com/fr/gallery.php")
    page.wait_for_selector("#pmg-host")
    page.keyboard.press("KeyG")
    page.wait_for_function(f"() => document.getElementById('pmg-worldmap') && {MODAL}.querySelector('svg[role=img]')", timeout=20000)
    return page


def choose(page, cc="fr"):
    page.evaluate(f"() => {{ const s = {MODAL}.querySelector('select[aria-label=\"Map to show\"]'); s.value = '{cc}'; s.dispatchEvent(new Event('change')); }}")
    page.wait_for_function(f"() => {MODAL}.querySelectorAll('svg[role=img] path.c').length === 4 || {MODAL}.textContent.includes('Not drawn')", timeout=40000)


def test_the_picker_offers_the_countries_that_have_a_map_and_that_the_member_has_photos_in(ctx):
    page = open_map(ctx)
    options = page.evaluate(f"() => [...{MODAL}.querySelectorAll('select[aria-label=\"Map to show\"] option')].map(o => o.textContent)")
    assert options == ["World", "Germany (regions)", "France (regions)"]                  # by photos; Luxembourg has photos but no regions to map


def test_nothing_is_downloaded_until_a_country_is_chosen(ctx):
    page = open_map(ctx)
    page.wait_for_timeout(500)
    assert ASKED == []


def test_a_country_shows_its_regions_shaded_by_the_photos(ctx):
    page = open_map(ctx)
    choose(page)
    tiers = page.evaluate(f"() => [...{MODAL}.querySelectorAll('svg[role=img] path.c')].map(p => [...p.classList].find(c => /^t[0-9]$/.test(c)))")
    assert tiers == ["t0", "t2", "t0", "t0"]                                                    # Aisne 4 photos: the 2-9 shade; the others none
    assert "2 of 4 regions France · 6 photos" == page.evaluate(f"() => [...{MODAL}.querySelector('.sum').children].map(c => c.textContent).join(' ')")


def test_a_region_is_a_link_to_the_members_photos_of_it(ctx):
    page = open_map(ctx)
    choose(page)
    hrefs = page.evaluate(f"() => [...{MODAL}.querySelectorAll('svg a')].map(a => [a.getAttribute('href'), a.querySelector('title').textContent])")
    assert hrefs[0] == ["/fr/gallery.php?region=21001&usr=121559", "02 Aisne: 4 photos"]


def test_the_regions_without_a_shape_are_listed_with_their_photos(ctx):
    page = open_map(ctx)
    choose(page)
    assert page.evaluate(f"() => {MODAL}.querySelector('.foot p').textContent") == "Not on the map: Alpes (2)"
    assert "3 of 4 regions are on the map" in page.evaluate(f"() => {MODAL}.querySelector('.foot').textContent")


def test_the_licence_of_the_shapes_is_shown(ctx):
    page = open_map(ctx)
    choose(page)
    assert "Etalab Open License 2.0, 2022" in page.evaluate(f"() => {MODAL}.textContent")


def test_the_way_back_returns_to_the_map_of_the_world(ctx):
    page = open_map(ctx)
    choose(page)
    page.evaluate(f"() => {{ const s = {MODAL}.querySelector('select[aria-label=\"Map to show\"]'); s.value = ''; s.dispatchEvent(new Event('change')); }}")
    page.wait_for_function(f"() => {MODAL}.querySelector('svg [data-cc=\"lu\"]')", timeout=10000)


def test_the_region_map_zooms_like_the_world(ctx):
    page = open_map(ctx)
    choose(page)
    before = page.evaluate(f"() => {MODAL}.querySelector('svg[role=img]').getAttribute('viewBox')")
    page.evaluate(f"() => [...{MODAL}.querySelectorAll('.tools button')].find(b => b.textContent === '+').click()")
    assert page.evaluate(f"() => {MODAL}.querySelector('svg[role=img]').getAttribute('viewBox')") != before


def test_a_failure_of_the_shapes_says_so(ctx):
    ctx.route(META, lambda r: r.fulfill(status=500, content_type="text/plain", headers={"access-control-allow-origin": "*"}, body="no"))
    page = open_map(ctx)
    choose(page)
    text = page.evaluate(f"() => {MODAL}.textContent")
    assert "Not drawn" in text and "geoBoundaries (the list of shapes): answered 500" in text            # and the step that failed is named


def test_the_shapes_are_fetched_from_the_media_server_not_from_the_github_redirect(ctx):
    page = open_map(ctx)
    choose(page)
    assert GEOJSON in ASKED and GITHUB not in ASKED


def test_the_map_matches_with_the_country_and_the_region_pages_get_time_to_answer():
    """Without the country the aliases, the names of Wikidata and the towns on their county are never used; a long table needs more than 15 s."""
    from pathlib import Path
    root = Path(__file__).resolve().parents[2] / "src"
    assert "regionMatch(regions, geo.shapes, cc)" in (root / "features" / "83-regionmap.js").read_text(encoding="utf-8")
    assert "/userreg.php?gallery=${system}-${id}`, 60000)" in (root / "features" / "78-regions.js").read_text(encoding="utf-8")
