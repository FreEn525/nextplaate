"""Plate lookup links: the plate typed, one click from public lookup pages (plain links: nothing is sent before a click)."""
import pytest

import fake_site
from fake_site import route_site

ADD = "https://platesmania.com/fr/add"
CARD = "document.getElementById('pmg-plate-card').shadowRoot"
PANEL = "document.getElementById('pmg-host').shadowRoot"


@pytest.fixture
def ctx(browser):
    c = browser.new_context()
    route_site(c)
    fake_site.SEARCHES.clear()
    yield c
    c.close()


def open_add(ctx, plate="AB 123 CD", setup=None):
    page = ctx.new_page()
    page.goto(ADD)
    page.wait_for_selector("#pmg-host")
    if setup:
        page.evaluate(setup)
        page.reload()
        page.wait_for_selector("#pmg-host")
    if plate:
        page.fill("#nomer", plate)
        page.dispatch_event("#nomer", "blur")
        page.wait_for_function(f"() => document.getElementById('pmg-plate-card') && {CARD}.querySelector('.lookups') && !{CARD}.querySelector('.msg').textContent.includes('Checking')", timeout=8000)
    return page


def links(page, root=CARD):
    return page.evaluate(f"() => [...{root}.querySelectorAll('.lookups a.pill')].map(a => [a.textContent, a.getAttribute('href')])")


def test_the_plate_card_has_the_lookup_links_of_the_country_and_of_every_country(ctx):
    page = open_add(ctx)
    names = [n for n, _ in links(page)]
    assert names == ["immatriculation-auto.info", "Carter-Cash", "Google Images", "Flickr", "Autogespot"]


def test_each_link_writes_the_plate_the_way_that_site_wants_it(ctx):
    page = open_add(ctx)
    by = dict(links(page))
    assert by["immatriculation-auto.info"] == "https://immatriculation-auto.info/vehicle/AB123CD"          # letters and digits
    assert by["Carter-Cash"] == "https://www.carter-cash.com/pieces-auto/?plate=AB-123-CD"                  # hyphens
    assert by["Google Images"] == 'https://www.google.com/search?tbm=isch&q="AB-123-CD"'                  # as the form reads it (the French plate is written with hyphens)
    assert by["Autogespot"] == "https://www.autogespot.com/spots?licenseplate=AB123CD"


def test_the_links_open_a_new_tab_without_giving_the_page_away(ctx):
    page = open_add(ctx)
    attrs = page.evaluate(f"() => [...{CARD}.querySelectorAll('.lookups a.pill')].map(a => [a.target, a.rel])")
    assert all(a == ["_blank", "noopener noreferrer"] for a in attrs)


def test_nothing_is_fetched_from_the_sites(ctx):
    page = open_add(ctx)
    assert fake_site.SEARCHES == ["AB123CD"]                                                             # only PlatesMania's own search was asked


def test_the_drawer_has_the_same_links_and_follows_the_plate(ctx):
    page = open_add(ctx)
    assert [n for n, _ in links(page, PANEL + ".getElementById('lookupBox')")] == ["immatriculation-auto.info", "Carter-Cash", "Google Images", "Flickr", "Autogespot"]
    page.fill("#nomer", "")
    page.dispatch_event("#nomer", "blur")
    page.wait_for_function(f"() => {PANEL}.getElementById('lookupBox').textContent.includes('Type the plate')", timeout=5000)


def test_a_site_can_be_hidden_in_settings_and_stays_hidden(ctx):
    page = open_add(ctx)
    page.evaluate(f"() => {{ const b = [...{PANEL}.querySelectorAll('.pickrows label')].find(l => l.textContent.startsWith('Flickr')).querySelector('input'); b.click(); }}")
    page.wait_for_function(f"() => ![...{CARD}.querySelectorAll('.lookups a.pill')].some(a => a.textContent === 'Flickr')", timeout=5000)
    assert "Flickr" not in [n for n, _ in links(page, PANEL + ".getElementById('lookupBox')")]
    page.reload()
    page.wait_for_selector("#pmg-host")
    page.fill("#nomer", "AB 123 CD")
    page.dispatch_event("#nomer", "blur")
    page.wait_for_function(f"() => document.getElementById('pmg-plate-card') && {CARD}.querySelector('.lookups')", timeout=8000)
    assert "Flickr" not in [n for n, _ in links(page)]                                                   # kept after a reload
    assert fake_site.SEARCHES.count("AB123CD") <= 3                                                      # redrawing is from the cache, not a new search each time


def test_with_the_feature_off_there_are_no_lookup_links(ctx):
    page = open_add(ctx, plate=None, setup="() => localStorage.setItem('pmg_set_feature_lookup', '0')")
    page.fill("#nomer", "AB 123 CD")
    page.dispatch_event("#nomer", "blur")
    page.wait_for_function("() => document.getElementById('pmg-plate-card')", timeout=8000)
    page.wait_for_timeout(300)
    assert page.evaluate(f"() => !{CARD}.querySelector('.lookups')")
