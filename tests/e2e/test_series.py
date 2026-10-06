"""Series: your photos of the series of a plate (upload page), and the series pages of the site."""
import pytest

import fake_site
from fake_site import route_site

ADD = "https://platesmania.com/fr/add"
PLATE = "document.getElementById('pmg-plate-card').shadowRoot"
SERIES = "document.getElementById('pmg-series-card').shadowRoot"


@pytest.fixture
def ctx(browser):
    c = browser.new_context()
    route_site(c)
    fake_site.GALLERY_USR.clear()
    fake_site.SEARCHES.clear()
    yield c
    c.close()


def type_plate(ctx, plate):
    page = ctx.new_page()
    page.goto(ADD)
    page.wait_for_selector("#pmg-host")
    page.fill("#nomer", plate)
    page.dispatch_event("#nomer", "blur")
    return page


def test_the_plate_card_counts_your_photos_of_the_series(ctx):
    page = type_plate(ctx, "AB 123 CD")
    page.wait_for_function(f"() => document.getElementById('pmg-plate-card') && {PLATE}.querySelector('.stat a') && {PLATE}.querySelector('.stat a').textContent === '2'", timeout=15000)
    assert page.evaluate(f"() => {PLATE}.querySelector('.stat span').textContent") == "your photos in the series AB-*-CD"
    asked = [q for q in fake_site.GALLERY_USR if "fastsearch" in q]
    assert asked == [{"fastsearch": ["AB * CD"], "usr": ["121559"]}]


def test_the_count_links_to_those_photos_in_a_new_tab(ctx):
    page = type_plate(ctx, "AB 123 CD")
    page.wait_for_function(f"() => document.getElementById('pmg-plate-card') && {PLATE}.querySelector('.stat a')", timeout=15000)
    a = page.evaluate(f"() => {{ const a = {PLATE}.querySelector('.stat a'); return [a.target, a.rel, a.getAttribute('href')]; }}")
    assert a == ["_blank", "noopener noreferrer", "/fr/gallery.php?fastsearch=AB%20*%20CD&usr=121559"]


def test_a_plate_that_is_not_of_that_shape_has_no_series_line(ctx):
    page = type_plate(ctx, "ZZ 99 ZZ")
    page.wait_for_function("() => document.getElementById('pmg-plate-card')", timeout=15000)
    page.wait_for_timeout(500)
    assert page.evaluate(f"() => !{PLATE}.querySelector('.stat')")


def test_the_series_page_gives_the_numbers_on_the_site(ctx):
    page = ctx.new_page()
    page.goto("https://platesmania.com/fr/series-HF-QQ-1")
    page.wait_for_function(f"() => document.getElementById('pmg-series-card') && {SERIES}.querySelector('.stat b')", timeout=10000)
    assert page.evaluate(f"() => {SERIES}.querySelector('.stat b').textContent") == "3 / 999"
    pills = page.evaluate(f"() => [...{SERIES}.querySelectorAll('.pill')].map(a => [a.textContent, a.getAttribute('href')])")
    assert pills == [["009", "/fr/nomer9009"], ["137", "/fr/nomer9137"], ["300", "/fr/nomer9300"]]


def test_the_series_page_counts_your_photos_with_one_request(ctx):
    page = ctx.new_page()
    page.goto("https://platesmania.com/fr/series-HF-QQ-1")
    page.wait_for_function(f"() => document.getElementById('pmg-series-card') && {SERIES}.querySelector('.stats .stat:nth-child(2) a') && {SERIES}.querySelector('.stats .stat:nth-child(2) a').textContent === '2'", timeout=15000)
    assert [q for q in fake_site.GALLERY_USR if "fastsearch" in q] == [{"fastsearch": ["HF * QQ"], "usr": ["121559"]}]


def test_with_the_feature_off_there_is_nothing(ctx):
    page = ctx.new_page()
    page.goto(ADD)
    page.evaluate("() => localStorage.setItem('pmg_set_feature_series', '0')")
    page.reload()
    page.wait_for_selector("#pmg-host")
    page.fill("#nomer", "AB 123 CD")
    page.dispatch_event("#nomer", "blur")
    page.wait_for_function("() => document.getElementById('pmg-plate-card')", timeout=15000)
    page.wait_for_timeout(500)
    assert page.evaluate(f"() => !{PLATE}.querySelector('.stat')")
    page.goto("https://platesmania.com/fr/series-HF-QQ-1")
    page.wait_for_selector("#pmg-host")
    page.wait_for_timeout(500)
    assert page.evaluate("() => !document.getElementById('pmg-series-card')")
