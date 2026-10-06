"""Plate check: the vehicle of the photos already on the site is offered, to fill the menus with one click."""
import pytest

import fake_site
from fake_site import route_site

ADD = "https://platesmania.com/fr/add"
CARD = "document.getElementById('pmg-plate-card').shadowRoot"


@pytest.fixture
def ctx(browser):
    c = browser.new_context()
    route_site(c)
    fake_site.SEARCHES.clear()
    yield c
    c.close()


def open_add(ctx, plate=None):
    page = ctx.new_page()
    page.goto(ADD)
    page.wait_for_selector("#pmg-host")
    if plate:
        page.fill("#nomer", plate)
        page.dispatch_event("#nomer", "blur")
    return page


def card_text(page):
    page.wait_for_function(f"() => document.getElementById('pmg-plate-card') && !document.getElementById('pmg-plate-card').hidden && !{CARD}.querySelector('.msg').textContent.includes('Checking')", timeout=8000)
    return page.evaluate(f"() => {CARD}.textContent.replace(/\\s+/g, ' ')")


def menus(page):
    return page.evaluate("() => [document.querySelector('[name=markaavto]').value, document.getElementById('model').value, document.getElementById('modgen').value]")


def test_the_vehicle_of_the_photos_already_there_is_offered_above_the_menus(ctx):
    page = open_add(ctx, "AB 123 CD")
    text = card_text(page)
    assert "2 photos of this plate already on the site" in text
    assert "Volkswagen" in text and "Golf" in text and "Mk8, 2019" in text                              # the names of the page's own menus
    assert "2 of 3 photos" in text                                                                       # the most common vehicle of the three
    assert page.evaluate("() => document.getElementById('pmg-plate-card').nextElementSibling.classList.contains('pm-vehicle-fields-row')")


def test_the_menus_are_filled_by_the_click_and_not_before(ctx):
    page = open_add(ctx, "AB 123 CD")
    card_text(page)
    assert menus(page) == ["200", "", ""] or menus(page)[0] == "200"                                    # untouched
    page.evaluate(f"() => [...{CARD}.querySelectorAll('button')].find(b => b.textContent === 'Fill the menus').click()")
    assert menus(page) == ["7", "70", "701"]


def test_no_request_is_made_for_the_vehicle(ctx):
    page = open_add(ctx, "AB 123 CD")
    card_text(page)
    assert fake_site.SEARCHES == ["AB123CD"]                                                             # the page that counts also names the vehicle


def test_a_vehicle_the_menus_do_not_know_is_not_offered(ctx):
    page = open_add(ctx, "ZZ 999 ZZ")
    text = card_text(page)
    assert "1 photo of this plate already on the site" in text
    assert "Fill the menus" not in text


def test_a_plate_that_is_not_there_has_a_message_and_no_vehicle(ctx):
    page = open_add(ctx, "XX 000 XX")
    text = card_text(page)
    assert "Not on the site yet." in text and "Fill the menus" not in text


def test_the_card_goes_when_the_plate_is_cleared(ctx):
    page = open_add(ctx, "AB 123 CD")
    card_text(page)
    page.fill("#nomer", "")
    page.dispatch_event("#nomer", "blur")
    page.wait_for_function("() => document.getElementById('pmg-plate-card').hidden", timeout=5000)


def test_with_the_plate_check_off_there_is_no_card(ctx):
    page = ctx.new_page()
    page.goto(ADD)
    page.wait_for_selector("#pmg-host")
    page.evaluate("() => localStorage.setItem('pmg_set_feature_plate', '0')")
    page.reload()
    page.wait_for_selector("#pmg-host")
    page.fill("#nomer", "AB 123 CD")
    page.dispatch_event("#nomer", "blur")
    page.wait_for_timeout(1200)
    assert page.evaluate("() => !document.getElementById('pmg-plate-card')")
