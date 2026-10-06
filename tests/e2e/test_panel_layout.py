"""The order of the boxes in the drawers, and the controls that wait for their page."""
import pytest

from fake_site import route_site

PANEL = "document.getElementById('pmg-host').shadowRoot"


@pytest.fixture
def page(browser):
    c = browser.new_context(viewport={"width": 1280, "height": 900})
    route_site(c)
    p = c.new_page()
    p.goto("https://platesmania.com/fr/gallery.php")
    p.wait_for_selector("#pmg-host")
    yield p
    c.close()


def titles(page, drawer):
    return page.evaluate(f"() => [...{PANEL}.querySelectorAll('section[data-drawer=\"{drawer}\"] .gtitle')].map(t => t.textContent)")


def test_the_world_map_is_the_first_box_of_browse(page):
    assert titles(page, "gallery")[0] == "World map"


def test_settings_open_on_the_features_and_end_on_about(page):
    t = titles(page, "settings")
    assert t[0] == "Features" and t[-1] == "About" and t.index("Country flags: the side bar") > t.index("Features")


def test_what_does_nothing_off_its_page_is_hidden_and_what_works_stays(page):
    shown = lambda sel: page.evaluate(f"() => {{ const e = {PANEL}.querySelector('{sel}'); return !!e && e.getClientRects().length > 0; }}")
    page.evaluate(f"() => {PANEL}.querySelector('.rbtn[data-drawer=\"search\"]').click()")
    assert not shown("#plateCheck") and not shown("#autoCheck")                                  # the plate check works on the upload page
    assert shown("#plateOpen")                                                                    # opening the search works anywhere
