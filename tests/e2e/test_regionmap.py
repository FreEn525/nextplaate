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
    page.wait_for_function(f"() => document.getElementById('pmg-worldmap') && {MODAL}.querySelector('svg')", timeout=20000)
    return page


def choose(page, cc="fr"):
    page.evaluate(f"() => {{ const s = {MODAL}.querySelector('select[aria-label=\"Regions of a country\"]'); s.value = '{cc}'; s.dispatchEvent(new Event('change')); }}")
    page.wait_for_function(f"() => {MODAL}.querySelectorAll('svg path.c').length === 4 || {MODAL}.textContent.includes('Not drawn')", timeout=40000)


def test_the_picker_offers_the_countries_that_have_a_map_and_that_the_member_has_photos_in(ctx):
    page = open_map(ctx)
    options = page.evaluate(f"() => [...{MODAL}.querySelectorAll('select[aria-label=\"Regions of a country\"] option')].map(o => o.textContent)")
    assert options == ["Choose a country…", "France"]                                    # de and lu have photos but no map yet


def test_nothing_is_downloaded_until_a_country_is_chosen(ctx):
    page = open_map(ctx)
    page.wait_for_timeout(500)
    assert ASKED == []


def test_a_country_shows_its_regions_shaded_by_the_photos(ctx):
    page = open_map(ctx)
    choose(page)
    tiers = page.evaluate(f"() => [...{MODAL}.querySelectorAll('svg path.c')].map(p => [...p.classList].find(c => /^t[0-9]$/.test(c)))")
    assert tiers == ["t0", "t2", "t0", "t0"]                                                    # Aisne 4 photos: the 2-9 shade; the others none
    assert "France: 2 of 4 regions, 6 photos" == page.evaluate(f"() => {MODAL}.querySelector('.sum').textContent")


def test_a_region_is_a_link_to_the_members_photos_of_it(ctx):
    page = open_map(ctx)
    choose(page)
    hrefs = page.evaluate(f"() => [...{MODAL}.querySelectorAll('svg a')].map(a => [a.getAttribute('href'), a.querySelector('title').textContent])")
    assert hrefs[0] == ["/fr/gallery.php?region=21001&usr=121559", "02 Aisne: 4 photos"]


def test_the_regions_without_a_shape_are_listed_with_their_photos(ctx):
    page = open_map(ctx)
    choose(page)
    assert page.evaluate(f"() => {MODAL}.querySelector('.extra').textContent") == "Not on the map: Alpes (2)"
    assert "3 of 4 regions are on the map" in page.evaluate(f"() => {MODAL}.querySelector('.hint:not(.wmview .hint:first-child)') && [...{MODAL}.querySelectorAll('.hint')].map(h => h.textContent).join('|')")


def test_the_licence_of_the_shapes_is_shown(ctx):
    page = open_map(ctx)
    choose(page)
    assert "Etalab Open License 2.0, 2022" in page.evaluate(f"() => {MODAL}.textContent")


def test_the_way_back_returns_to_the_map_of_the_world(ctx):
    page = open_map(ctx)
    choose(page)
    page.evaluate(f"() => [...{MODAL}.querySelectorAll('button')].find(b => b.textContent.includes('World map')).click()")
    page.wait_for_function(f"() => {MODAL}.querySelector('svg [data-cc=\"lu\"]')", timeout=10000)


def test_the_region_map_zooms_like_the_world(ctx):
    page = open_map(ctx)
    choose(page)
    before = page.evaluate(f"() => {MODAL}.querySelector('svg').getAttribute('viewBox')")
    page.evaluate(f"() => [...{MODAL}.querySelectorAll('.views button')].find(b => b.textContent === '+').click()")
    assert page.evaluate(f"() => {MODAL}.querySelector('svg').getAttribute('viewBox')") != before


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
