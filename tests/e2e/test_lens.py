"""Google Lens: the search of a photo (bridge to Google), the answer (vehicle guess) and the card above the vehicle menus.

Google is simulated: a page with the box and the button of search by image, and a results page with links. The two tabs share
their memory through GM_setValue / GM_getValue, which the test shims keep in localStorage (key gm_<name>, the value as JSON).
"""
import json

import pytest

from fake_site import inject, route_site

ADD = "https://platesmania.com/fr/add"
GOOGLE_HOME = "https://www.google.com/?olud&src=pm"
PIXELS = ("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFElEQVR4nGP8z8Dwn4EIwESMolGF"
          "9VAAAIw5BAYy2I+HAAAAAElFTkSuQmCC")
PANEL = "document.getElementById('pmg-host').shadowRoot"
CARD = "document.getElementById('pmg-lens-card').shadowRoot"


@pytest.fixture
def ctx(browser):
    c = browser.new_context()
    route_site(c)
    yield c
    c.close()


@pytest.fixture
def page(ctx):
    return ctx.new_page()


def open_at(page, url):
    page.goto(url)
    page.wait_for_selector("#pmg-host")


# ---------------------------------------------------------------- the shared memory (GM_*), as the shims keep it

def gm_get(page, key):
    raw = page.evaluate("(k) => localStorage.getItem('gm_' + k)", key)
    return None if raw is None else json.loads(raw)


def gm_set(page, key, value):
    page.evaluate("([k, v]) => localStorage.setItem('gm_' + k, JSON.stringify(v))", [key, value])


def lens_request(page):
    page.wait_for_function("() => localStorage.getItem('gm_br_lens_req')")
    return json.loads(gm_get(page, "br_lens_req"))


def lens_answer(page, titles, stamp=None):
    """Plays the Google side: answers the pending request of the panel with these titles."""
    request = lens_request(page)
    gm_set(page, "br_lens_res", json.dumps({"stamp": stamp or request["stamp"], "data": titles}))


def choose_photo(page, src=PIXELS):
    page.evaluate("(src) => { document.getElementById('zoomimg').src = src; }", src)


# ---------------------------------------------------------------- Google, simulated

def google_fake(ctx):
    html = ('<html><body><input type="text" jsname="W7hAGe" id="box">'
            '<div role="button" jsname="ZtOxCb" id="go" onclick="window.__go = 1"></div></body></html>')
    ctx.route("https://www.google.com/?**", lambda r: r.fulfill(status=200, content_type="text/html", body=inject(html)))


def google_results(ctx):
    links = "".join(f'<a href="/x{i}">2019 Volkswagen Golf result number {i}</a>' for i in range(15))
    ctx.route("https://www.google.com/search**", lambda r: r.fulfill(status=200, content_type="text/html", body=inject(f"<html><body>{links}</body></html>")))


def ask_google(page, request):
    """Leaves a request in the memory of a Google page, before the script starts there."""
    page.add_init_script(f"localStorage.setItem('gm_br_lens_req', JSON.stringify({json.dumps(json.dumps(request))}))")


# ---------------------------------------------------------------- the panel side

def test_the_button_opens_google_with_the_photo_in_the_request(page, ctx):
    google_fake(ctx)
    open_at(page, ADD)
    choose_photo(page)
    page.wait_for_timeout(600)       # the photo is searched by itself once: this test is about the button
    with page.expect_popup() as popup:
        page.evaluate(f"() => {PANEL}.getElementById('lensSearch').click()")
    popup.value.wait_for_load_state()
    assert popup.value.url == GOOGLE_HOME
    assert lens_request(page)["payload"] == {"photo": PIXELS}


def test_a_photo_chosen_on_the_upload_page_is_searched_by_itself(page, ctx):
    google_fake(ctx)
    open_at(page, ADD)
    with page.expect_popup() as popup:
        choose_photo(page)
    assert popup.value
    assert lens_request(page)["payload"] == {"photo": PIXELS}


def test_a_photo_is_not_searched_by_itself_when_the_option_is_off(page, ctx):
    google_fake(ctx)
    open_at(page, ADD)
    page.evaluate("() => localStorage.setItem('pmg_set_lens_auto', '0')")
    page.reload()
    page.wait_for_selector("#pmg-host")
    opened = []
    ctx.on("page", lambda p: opened.append(p))
    choose_photo(page)
    page.wait_for_timeout(900)
    assert opened == []


def test_the_button_says_when_there_is_no_photo(page):
    open_at(page, ADD)
    page.evaluate(f"() => {PANEL}.getElementById('lensSearch').click()")
    assert "No photo on this page yet" in page.evaluate(f"() => {PANEL}.textContent")


# ---------------------------------------------------------------- the answer, in the card above the menus

def card_choices(page):
    page.wait_for_function(f"() => document.getElementById('pmg-lens-card') && {CARD}.querySelector('.chip')")
    return page.evaluate(f"() => [...{CARD}.querySelectorAll('.cat, .chip')].map(e => e.textContent)")


def test_titles_become_brand_model_and_generation(page, ctx):
    google_fake(ctx)
    open_at(page, ADD)
    choose_photo(page)
    lens_answer(page, ["2019 Volkswagen Golf 8 - Wikipedia", "Volkswagen Golf Mk8 2020 review", "Golf GTI 2021", "Volkswagen Polo", "Audi RS 6 Avant"])
    cands = card_choices(page)
    assert cands[:2] == ["Brand", "Volkswagen"]
    assert cands[cands.index("Model") + 1] == "Golf"
    assert cands[cands.index("Generation") + 1] == "Mk8, 2019–"      # 2019, 2020, 2021 are Mk8 years; 2019 is also Mk7's last


def test_a_weak_guess_is_not_shown_as_a_second_brand(page, ctx):
    google_fake(ctx)
    open_at(page, ADD)
    choose_photo(page)
    lens_answer(page, ["Volkswagen Golf %d" % i for i in range(10)] + ["Audi A3"])
    assert card_choices(page)[:3] == ["Brand", "Volkswagen", "Model"]       # no second brand: the next heading follows


def test_an_answer_to_an_older_request_is_ignored(page, ctx):
    google_fake(ctx)
    open_at(page, ADD)
    choose_photo(page)
    lens_answer(page, ["Volkswagen Golf"], stamp=1)
    page.wait_for_timeout(1500)
    assert page.evaluate(f"() => !{CARD}.querySelector('.chip')") is True


def test_a_choice_of_the_card_fills_the_menus_of_the_page(page, ctx):
    google_fake(ctx)
    open_at(page, ADD)
    choose_photo(page)
    lens_answer(page, ["2019 Volkswagen Golf 8", "Volkswagen Golf Mk8 2020", "Volkswagen Polo"])
    card_choices(page)
    page.evaluate(f"() => {CARD}.querySelectorAll('.chip')[2].click()")      # chips: the brand, then Golf, then Polo
    assert page.evaluate("() => [document.querySelector('[name=markaavto]').value, document.getElementById('model').value]") == ["7", "71"]
    assert page.evaluate(f"() => {CARD}.querySelectorAll('.chip.on').length") == 2     # the brand and the model are marked


def test_the_card_fills_the_three_menus_at_once(page, ctx):
    google_fake(ctx)
    open_at(page, ADD)
    choose_photo(page)
    lens_answer(page, ["2019 Volkswagen Golf 8", "Volkswagen Golf Mk8 2020", "Volkswagen Golf 2021"])
    card_choices(page)
    page.evaluate(f"() => {CARD}.querySelector('.bar .btn').click()")
    assert page.evaluate("() => [document.querySelector('[name=markaavto]').value, document.getElementById('model').value, document.getElementById('modgen').value]") == ["7", "70", "701"]


def test_the_menus_stay_untouched_until_a_choice_is_clicked(page, ctx):
    google_fake(ctx)
    open_at(page, ADD)
    choose_photo(page)
    lens_answer(page, ["2019 Volkswagen Golf 8", "Volkswagen Golf Mk8 2020"])
    card_choices(page)
    assert page.evaluate("() => document.querySelector('[name=markaavto]').value") == "200"


# ---------------------------------------------------------------- the Google side

def test_the_google_side_puts_the_photo_in_the_box_and_starts_the_search(ctx):
    google_fake(ctx)
    p = ctx.new_page()
    ask_google(p, {"stamp": 4102444800000, "payload": {"photo": PIXELS}})
    p.goto(GOOGLE_HOME)
    p.wait_for_function("() => window.__go === 1")
    assert p.evaluate("() => document.getElementById('box').value") == PIXELS
    assert p.evaluate("() => !!document.getElementById('pmg-host')") is False      # no panel on a Google page


def test_a_google_page_without_the_marker_is_left_alone(ctx):
    google_fake(ctx)
    ctx.route("https://www.google.com/", lambda r: r.fulfill(status=200, content_type="text/html", body=inject('<html><body><input type="text" id="box"></body></html>')))
    p = ctx.new_page()
    ask_google(p, {"stamp": 4102444800000, "payload": {"photo": PIXELS}})
    p.goto("https://www.google.com/")
    p.wait_for_timeout(600)
    assert p.evaluate("() => document.getElementById('box').value") == ""


def test_the_google_side_answers_with_the_titles_of_the_results(ctx):
    import time
    google_results(ctx)
    p = ctx.new_page()
    stamp = int(time.time() * 1000)
    ask_google(p, {"stamp": stamp, "payload": {"photo": PIXELS}})
    p.goto("https://www.google.com/search?q=lens")
    p.wait_for_function("() => localStorage.getItem('gm_br_lens_res')")
    answer = json.loads(json.loads(p.evaluate("() => localStorage.getItem('gm_br_lens_res')")))
    assert answer["stamp"] == stamp and len(answer["data"]) == 15 and answer["data"][0].startswith("2019 Volkswagen Golf")


def test_the_google_side_leaves_a_search_nobody_asked_for(ctx):
    google_results(ctx)
    p = ctx.new_page()
    p.goto("https://www.google.com/search?q=lens")
    p.wait_for_timeout(1200)
    assert p.evaluate("() => localStorage.getItem('gm_br_lens_res')") is None
