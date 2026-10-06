"""Official register (open data of NL and IL): asked on a click, the plate goes nowhere before."""
import json

import pytest

import fake_site
from fake_site import route_site

CARD = "document.getElementById('pmg-plate-card').shadowRoot"
ASKED = []


@pytest.fixture
def ctx(browser):
    c = browser.new_context()
    route_site(c)
    fake_site.SEARCHES.clear()
    ASKED.clear()
    c.add_init_script("localStorage.setItem('pmg_set_registry_auto', '0')")                # the tests of the button: asking by itself is off

    def rdw(route):
        ASKED.append(route.request.url)
        rows = [{"kenteken": "GT123B", "merk": "VOLKSWAGEN", "handelsbenaming": "GOLF", "datum_eerste_toelating": "20190210", "eerste_kleur": "WIT", "vervaldatum_apk": "20270310"}] if "GT123B" in route.request.url else []
        route.fulfill(status=200, content_type="application/json", headers={"access-control-allow-origin": "*"}, body=json.dumps(rows))

    def gov_il(route):
        ASKED.append(route.request.url)
        rec = {"mispar_rechev": 7255585, "tozeret_nm": "\u05e7\u05d9\u05d4", "kinuy_mishari": "PICANTO", "shnat_yitzur": 2017, "tzeva_rechev": "\u05db\u05e1\u05e3", "tokef_dt": "2027-07-03"}
        route.fulfill(status=200, content_type="application/json", headers={"access-control-allow-origin": "*"}, body=json.dumps({"success": True, "result": {"records": [rec]}}))

    c.route("https://opendata.rdw.nl/**", rdw)
    c.route("https://data.gov.il/**", gov_il)
    yield c
    c.close()


def plate_page(ctx, cc, plate):
    page = ctx.new_page()
    page.goto(f"https://platesmania.com/{cc}/add")
    page.wait_for_selector("#pmg-host")
    page.fill("#nomer", plate)
    page.dispatch_event("#nomer", "blur")
    page.wait_for_function(f"() => document.getElementById('pmg-plate-card') && {CARD}.querySelector('.lookups')", timeout=15000)
    return page


def click_ask(page):
    page.evaluate(f"() => [...{CARD}.querySelectorAll('button')].find(b => b.textContent.startsWith('Ask')).click()")


def test_nothing_is_sent_before_the_click(ctx):
    page = plate_page(ctx, "nl", "GT-123-B")
    page.wait_for_timeout(500)
    assert ASKED == []
    assert page.evaluate(f"() => [...{CARD}.querySelectorAll('button')].some(b => b.textContent === 'Ask RDW open data')")


def test_the_dutch_register_answers_with_the_vehicle(ctx):
    page = plate_page(ctx, "nl", "GT-123-B")
    click_ask(page)
    page.wait_for_function(f"() => {CARD}.textContent.includes('VOLKSWAGEN')", timeout=10000)
    assert ASKED == ["https://opendata.rdw.nl/resource/m9d7-ebf2.json?kenteken=GT123B"]                 # the plate squashed, capitals
    text = page.evaluate(f"() => {CARD}.textContent")
    assert "GOLF" in text and "2019" in text and "WIT" in text and "inspection until 2027-03-10" in text


def test_the_dutch_answer_can_fill_the_menus(ctx):
    page = plate_page(ctx, "nl", "GT-123-B")
    click_ask(page)
    page.wait_for_function(f"() => [...{CARD}.querySelectorAll('button')].some(b => b.textContent === 'Fill the menus')", timeout=10000)
    page.evaluate(f"() => [...{CARD}.querySelectorAll('button')].find(b => b.textContent === 'Fill the menus').click()")
    assert page.evaluate("() => document.querySelector('select[name=markaavto]').selectedOptions[0].textContent") == "Volkswagen"


def test_a_plate_the_register_does_not_have_says_so(ctx):
    page = plate_page(ctx, "nl", "XX-999-X")
    click_ask(page)
    page.wait_for_function(f"() => {CARD}.textContent.includes('No such plate')", timeout=10000)


def test_the_answer_is_kept_for_the_visit(ctx):
    page = plate_page(ctx, "nl", "GT-123-B")
    click_ask(page)
    page.wait_for_function(f"() => {CARD}.textContent.includes('VOLKSWAGEN')", timeout=10000)
    page.fill("#nomer", "GT-123-B ")
    page.dispatch_event("#nomer", "blur")
    page.wait_for_timeout(600)
    click_ask(page)
    page.wait_for_function(f"() => {CARD}.textContent.includes('VOLKSWAGEN')", timeout=10000)
    assert len(ASKED) == 1


def test_the_israeli_register_is_asked_by_the_number(ctx):
    page = ctx.new_page()
    page.goto("https://platesmania.com/il/add")
    page.wait_for_selector("#pmg-host")
    page.fill("#nomer", "72-555-85")
    page.dispatch_event("#nomer", "blur")
    page.wait_for_function(f"() => document.getElementById('pmg-plate-card') && [...{CARD}.querySelectorAll('button')].some(b => b.textContent.startsWith('Ask'))", timeout=15000)
    click_ask(page)
    page.wait_for_function(f"() => {CARD}.textContent.includes('PICANTO')", timeout=10000)
    assert "%22mispar_rechev%22%3A7255585%7D" in ASKED[0]


def test_a_country_without_a_register_has_no_button(ctx):
    page = plate_page(ctx, "fr", "AB 123 CD")
    assert not page.evaluate(f"() => [...{CARD}.querySelectorAll('button')].some(b => b.textContent.startsWith('Ask'))")


def test_with_the_feature_off_there_is_no_button(ctx):
    page = ctx.new_page()
    page.goto("https://platesmania.com/nl/add")
    page.evaluate("() => localStorage.setItem('pmg_set_feature_registry', '0')")
    page.reload()
    page.wait_for_selector("#pmg-host")
    page.fill("#nomer", "GT-123-B")
    page.dispatch_event("#nomer", "blur")
    page.wait_for_function(f"() => document.getElementById('pmg-plate-card') && {CARD}.querySelector('.lookups')", timeout=15000)
    assert not page.evaluate(f"() => [...{CARD}.querySelectorAll('button')].some(b => b.textContent.startsWith('Ask'))")


@pytest.fixture
def auto(browser):
    """The default: the register is asked by itself, and the empty menus are filled."""
    c = browser.new_context()
    route_site(c)
    ASKED.clear()
    c.route("https://opendata.rdw.nl/**", lambda route: (ASKED.append(route.request.url), route.fulfill(status=200, content_type="application/json", headers={"access-control-allow-origin": "*"},
            body=json.dumps([{"kenteken": "GT123B", "merk": "VOLKSWAGEN", "handelsbenaming": "GOLF", "datum_eerste_toelating": "20190210", "eerste_kleur": "WIT", "vervaldatum_apk": "20270310"}] if "GT123B" in route.request.url else [])))[1])
    yield c
    c.close()


def typed(ctx, plate, before=None):
    page = ctx.new_page()
    page.goto("https://platesmania.com/nl/add")
    page.wait_for_selector("#pmg-host")
    if before:
        page.evaluate(before)
    page.fill("#nomer", plate)
    page.dispatch_event("#nomer", "blur")
    return page


def brand(page):
    return page.evaluate("() => document.querySelector('select[name=markaavto]').selectedOptions[0].textContent")


def test_by_default_the_register_is_asked_without_a_click_and_the_empty_menus_are_filled(auto):
    page = typed(auto, "GT-123-B")
    page.wait_for_function(f"() => document.getElementById('pmg-plate-card') && {CARD}.textContent.includes('Menus filled from the register')", timeout=15000)
    assert ASKED == ["https://opendata.rdw.nl/resource/m9d7-ebf2.json?kenteken=GT123B"]
    assert brand(page) == "Volkswagen"
    assert page.evaluate(f"() => ![...{CARD}.querySelectorAll('button')].some(b => b.textContent.startsWith('Ask') && !b.hidden)")      # no button to press


def test_a_menu_you_chose_is_never_overwritten(auto):
    page = typed(auto, "GT-123-B", "() => { const s = document.querySelector('select[name=markaavto]'); s.value = '8'; s.dispatchEvent(new Event('change')); }")
    page.wait_for_function(f"() => document.getElementById('pmg-plate-card') && {CARD}.textContent.includes('VOLKSWAGEN')", timeout=15000)
    assert brand(page) == "Audi"                                                                  # still your choice
    assert "Menus filled" not in page.evaluate(f"() => {CARD}.textContent")


def test_the_menus_are_filled_once_per_plate(auto):
    page = typed(auto, "GT-123-B")
    page.wait_for_function(f"() => {CARD}.textContent.includes('Menus filled')", timeout=15000)
    page.evaluate("() => { const s = document.querySelector('select[name=markaavto]'); s.value = '8'; s.dispatchEvent(new Event('change')); }")
    page.fill("#nomer", "GT-123-B ")
    page.dispatch_event("#nomer", "blur")
    page.wait_for_timeout(1200)
    assert brand(page) == "Audi"                                                                  # not filled again behind your back
    assert len(ASKED) == 1


def test_with_the_switch_off_nothing_is_sent_until_the_click(auto):
    page = typed(auto, "GT-123-B", "() => localStorage.setItem('pmg_set_registry_auto', '0')")
    page.reload()
    page.wait_for_selector("#pmg-host")
    page.fill("#nomer", "GT-123-B")
    page.dispatch_event("#nomer", "blur")
    page.wait_for_function(f"() => document.getElementById('pmg-plate-card') && {CARD}.querySelector('.lookups')", timeout=15000)
    page.wait_for_timeout(500)
    assert ASKED == []


def test_the_fill_switch_off_asks_but_does_not_fill(auto):
    page = typed(auto, "GT-123-B", "() => localStorage.setItem('pmg_set_registry_fill', '0')")
    page.reload()
    page.wait_for_selector("#pmg-host")
    page.fill("#nomer", "GT-123-B")
    page.dispatch_event("#nomer", "blur")
    page.wait_for_function(f"() => document.getElementById('pmg-plate-card') && {CARD}.textContent.includes('VOLKSWAGEN')", timeout=15000)
    assert brand(page) != "Volkswagen"
