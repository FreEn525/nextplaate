"""Profile: regions (how many regions of a country a member has a photo from, and which are missing)."""
import pytest

import fake_site
from fake_site import route_site

CARD = "document.getElementById('pmg-regions-card').shadowRoot"


@pytest.fixture
def ctx(browser):
    c = browser.new_context()
    route_site(c)
    fake_site.USERREG.clear()
    yield c
    c.close()


def profile(ctx):
    page = ctx.new_page()
    page.goto("https://platesmania.com/user121559")
    page.wait_for_function("() => document.getElementById('pmg-regions-card')", timeout=10000)
    return page


def start(page):
    page.evaluate(f"() => {CARD}.querySelector('.btn').click()")
    page.wait_for_function(f"() => {CARD}.querySelector('.stat')", timeout=15000)


def stats(page):
    return page.evaluate(f"() => [...{CARD}.querySelectorAll('.stat')].map(s => [s.querySelector('b').textContent, s.querySelector('span').textContent])")


def test_nothing_is_asked_until_the_button_is_clicked(ctx):
    page = profile(ctx)
    page.wait_for_timeout(500)
    assert fake_site.USERREG == []


def test_the_regions_with_photos_out_of_the_regions_to_collect(ctx):
    page = profile(ctx)
    start(page)
    assert fake_site.USERREG == ["fr1"]                                                # the system of the site's own globe link
    assert stats(page) == [["2 / 4", "regions (50%)"], ["9", "photos"]]                # the line without a region counts in the photos only


def test_the_regions_seen_link_to_their_photos_and_the_missing_ones_are_listed(ctx):
    page = profile(ctx)
    start(page)
    pills = page.evaluate(f"() => [...{CARD}.querySelectorAll('.pill')].map(a => [a.textContent, a.getAttribute('href'), a.target])")
    assert pills == [["02 Aisne \u00b7 4", "/fr/gallery.php?region=21001&usr=121559", "_blank"], ["04 Alpes \u00b7 2", "/fr/gallery.php?region=21003&usr=121559", "_blank"]]
    assert page.evaluate(f"() => {CARD}.querySelector('details.missing').textContent") .replace("\n", " ").count("01 Ain") == 1
    assert "03 Allier" in page.evaluate(f"() => {CARD}.querySelector('details.missing').textContent")


def test_the_menu_comes_from_the_page_and_another_country_is_asked_once(ctx):
    page = profile(ctx)
    start(page)
    opts = page.evaluate(f"() => [...{CARD}.querySelectorAll('select option')].map(o => o.textContent)")
    assert opts == ["France (SIV)", "Germany", "Luxembourg"]
    page.evaluate(f"() => {{ const s = {CARD}.querySelector('select'); s.value = 'de'; s.dispatchEvent(new Event('change')); }}")
    page.wait_for_function(f"() => {CARD}.querySelector('.stat b').textContent === '0 / 2'", timeout=15000)
    page.evaluate(f"() => {{ const s = {CARD}.querySelector('select'); s.value = 'fr1'; s.dispatchEvent(new Event('change')); }}")
    page.wait_for_function(f"() => {CARD}.querySelector('.stat b').textContent === '2 / 4'", timeout=15000)
    assert fake_site.USERREG == ["fr1", "de"]                                          # fr1 came back from the memory


def test_a_country_without_regions_says_so(ctx):
    page = profile(ctx)
    start(page)
    page.evaluate(f"() => {{ const s = {CARD}.querySelector('select'); s.value = 'lu'; s.dispatchEvent(new Event('change')); }}")
    page.wait_for_function(f"() => {CARD}.textContent.includes('no regions to collect')", timeout=15000)


def test_with_the_feature_off_there_is_no_card(ctx):
    page = ctx.new_page()
    page.goto("https://platesmania.com/user121559")
    page.evaluate("() => localStorage.setItem('pmg_set_feature_regions', '0')")
    page.reload()
    page.wait_for_selector("#pmg-host")
    page.wait_for_timeout(500)
    assert page.evaluate("() => !document.getElementById('pmg-regions-card')")
