"""Your photos of this vehicle: the count of your gallery for the brand, model and generation in the menus."""
import pytest

import fake_site
from fake_site import route_site

ADD = "https://platesmania.com/fr/add"
CARD = "document.getElementById('pmg-mine-card').shadowRoot"


@pytest.fixture
def ctx(browser):
    c = browser.new_context()
    route_site(c)
    fake_site.GALLERY_USR.clear()
    yield c
    c.close()


def choose(page, brand=None, model=None, gen=None):
    if brand:
        page.select_option("select[name=markaavto]", brand)
    if model:
        page.select_option("#model", model)
    if gen:
        page.select_option("#modgen", gen)


def numbers(page):
    return page.evaluate(f"() => [...{CARD}.querySelectorAll('.mine-item')].map(s => [s.querySelector('a').textContent, s.firstChild.textContent + s.querySelector('b').textContent])")


def open_add(ctx):
    page = ctx.new_page()
    page.goto(ADD)
    page.wait_for_selector("#pmg-host")
    return page


def test_no_card_until_a_brand_is_chosen(ctx):
    page = open_add(ctx)
    page.wait_for_timeout(800)
    assert page.evaluate("() => document.getElementById('pmg-mine-card').hidden")


def test_a_brand_gives_its_count(ctx):
    page = open_add(ctx)
    choose(page, brand="7")
    page.wait_for_function(f"() => document.getElementById('pmg-mine-card') && !document.getElementById('pmg-mine-card').hidden && {CARD}.querySelector('.mine-item a').textContent === '5'", timeout=10000)
    assert numbers(page) == [["5", "Brand Volkswagen"]]


def test_brand_model_and_generation_each_have_a_count_most_precise_first(ctx):
    page = open_add(ctx)
    choose(page, brand="7")
    page.wait_for_function("() => document.querySelector('#model').options.length > 1")
    choose(page, model=page.eval_on_selector_all("#model option", "o => o.map(x => x.value).filter(v => +v > 0)[0]"))
    page.wait_for_function("() => document.querySelector('#modgen').options.length > 1")
    choose(page, gen=page.eval_on_selector_all("#modgen option", "o => o.map(x => x.value).filter(v => +v > 0)[0]"))
    page.wait_for_function(f"() => {CARD}.querySelectorAll('.mine-item a').length === 3 && [...{CARD}.querySelectorAll('.mine-item a')].every(a => a.textContent !== '…')", timeout=20000)
    assert [n for n, _ in numbers(page)] == ["5", "3", "1"]                                      # brand, model, generation
    assert [t.split(" ")[0] for _, t in numbers(page)] == ["Brand", "Model", "Generation"]


def test_each_number_links_to_those_photos_in_a_new_tab(ctx):
    page = open_add(ctx)
    choose(page, brand="7")
    page.wait_for_function(f"() => document.getElementById('pmg-mine-card') && {CARD}.querySelector('.mine-item a') && {CARD}.querySelector('.mine-item a').textContent === '5'", timeout=10000)
    a = page.evaluate(f"() => {{ const a = {CARD}.querySelector('.mine-item a'); return [a.target, a.rel, a.getAttribute('href')]; }}")
    assert a == ["_blank", "noopener noreferrer", "/gallery.php?usr=121559&markaavto=7"]


def test_the_same_vehicle_again_asks_nothing(ctx):
    page = open_add(ctx)
    choose(page, brand="7")
    page.wait_for_function(f"() => document.getElementById('pmg-mine-card') && {CARD}.querySelector('.mine-item a') && {CARD}.querySelector('.mine-item a').textContent === '5'", timeout=10000)
    choose(page, brand="8")
    page.wait_for_function(f"() => {CARD}.querySelector('.mine-item b').textContent.includes('Audi')", timeout=10000)
    asked = len(fake_site.GALLERY_USR)
    choose(page, brand="7")
    page.wait_for_function(f"() => {CARD}.querySelector('.mine-item b').textContent.includes('Volkswagen') && {CARD}.querySelector('.mine-item a').textContent === '5'", timeout=10000)
    assert len(fake_site.GALLERY_USR) == asked


def test_back_to_no_brand_hides_the_card(ctx):
    page = open_add(ctx)
    choose(page, brand="7")
    page.wait_for_function("() => document.getElementById('pmg-mine-card') && !document.getElementById('pmg-mine-card').hidden", timeout=10000)
    choose(page, brand="200")
    page.wait_for_function("() => document.getElementById('pmg-mine-card').hidden", timeout=5000)


def test_with_the_feature_off_there_is_no_card(ctx):
    page = ctx.new_page()
    page.goto(ADD)
    page.evaluate("() => localStorage.setItem('pmg_set_feature_mine', '0')")
    page.reload()
    page.wait_for_selector("#pmg-host")
    page.wait_for_timeout(500)
    assert page.evaluate("() => !document.getElementById('pmg-mine-card')")
