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


def google_results(ctx, similar=()):
    """A results page: fifteen links, and the "similar searches" chips of Lens (a link with a thumbnail whose address carries q= and kgmid=)."""
    links = "".join(f'<a href="/x{i}">2019 Volkswagen Golf result number {i}</a>' for i in range(15))
    chips = "".join(f'<a href="/search?q={q.replace(" ", "+")}&kgmid=/m/0{i}"><img src="data:image/gif;base64,R0lGODlhAQABAAAAACw="></a>' for i, q in enumerate(similar))
    # a link with a thumbnail but no knowledge-graph id is a picture result, not Google's naming
    chips += '<a href="/search?q=not+a+chip"><img src="data:image/gif;base64,R0lGODlhAQABAAAAACw="></a>'
    ctx.route("https://www.google.com/search**", lambda r: r.fulfill(status=200, content_type="text/html", body=inject(f"<html><body>{chips}{links}</body></html>")))


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
    return page.evaluate(f"() => [...{CARD}.querySelectorAll('.cols .cat, .cols .chip')].map(e => e.textContent)")


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
    page.evaluate(f"() => {CARD}.querySelectorAll('.cols .chip')[2].click()")      # chips: the brand, then Golf, then Polo
    assert page.evaluate("() => [document.querySelector('[name=markaavto]').value, document.getElementById('model').value]") == ["7", "71"]
    assert page.evaluate(f"() => {CARD}.querySelectorAll('.chip.on').length") == 2     # the brand and the model are marked


def test_the_card_fills_the_three_menus_at_once(page, ctx):
    google_fake(ctx)
    open_at(page, ADD)
    choose_photo(page)
    lens_answer(page, ["2019 Volkswagen Golf 8", "Volkswagen Golf Mk8 2020", "Volkswagen Golf 2021"])
    card_choices(page)
    page.evaluate(f"() => {CARD}.querySelector('.cardbox.best .btn').click()")
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
    p.goto("https://www.google.com/search?q=lens&lns_mode=un")
    p.wait_for_function("() => localStorage.getItem('gm_br_lens_res')")
    answer = json.loads(json.loads(p.evaluate("() => localStorage.getItem('gm_br_lens_res')")))
    assert answer["stamp"] == stamp and len(answer["data"]["titles"]) == 15 and answer["data"]["titles"][0].startswith("2019 Volkswagen Golf")
    assert answer["data"]["similar"] == []                                                                # this page has no similar-search chips


def test_the_google_side_leaves_a_search_nobody_asked_for(ctx):
    google_results(ctx)
    p = ctx.new_page()
    p.goto("https://www.google.com/search?q=lens&lns_mode=un")
    p.wait_for_timeout(1200)
    assert p.evaluate("() => localStorage.getItem('gm_br_lens_res')") is None


def test_the_card_sits_right_under_the_photo_and_the_panel_shows_the_answer_too(page, ctx):
    google_fake(ctx)
    open_at(page, ADD)
    choose_photo(page)
    lens_answer(page, ["2019 Volkswagen Golf 8", "Volkswagen Golf Mk8 2020"])
    card_choices(page)
    assert page.evaluate("() => document.getElementById('zoomimgid').nextElementSibling.id") == "pmg-lens-card"
    panel = page.evaluate(f"() => [...{PANEL}.querySelectorAll('.cat, .chip')].map(e => e.textContent)")
    assert panel[:2] == ["Brand", "Volkswagen"]


def test_a_short_model_inside_a_longer_one_is_not_a_second_choice(page, ctx):
    google_fake(ctx)
    open_at(page, ADD)
    choose_photo(page)
    lens_answer(page, ["Volkswagen Golf 2019", "Volkswagen Golf GTI", "Volkswagen Golf Mk8"])
    cands = card_choices(page)
    models = cands[cands.index("Model") + 1:cands.index("Generation")]
    assert models == ["Golf"]                                             # "Gol" is in "Golf": its echo, dropped


def test_a_generation_never_changes_the_model_that_was_picked(page, ctx):
    google_fake(ctx)
    open_at(page, ADD)
    choose_photo(page)
    # Polo is named most, Golf second: the generations of the best model (none) must not stay when Golf is picked
    lens_answer(page, ["Volkswagen Polo 2019", "Volkswagen Polo 2020", "Volkswagen Polo", "Volkswagen Golf 2019 Mk7"])
    cands = card_choices(page)
    assert cands[cands.index("Generation") + 1:] == [] or "Mk7, 2012–2019" not in cands
    page.evaluate(f"() => [...{CARD}.querySelectorAll('.chip')].find(c => c.textContent === 'Golf').click()")
    page.wait_for_function(f"() => [...{CARD}.querySelectorAll('.chip')].some(c => c.textContent.startsWith('Mk7'))")
    page.evaluate(f"() => [...{CARD}.querySelectorAll('.chip')].find(c => c.textContent.startsWith('Mk7')).click()")
    assert page.evaluate("() => [document.querySelector('[name=markaavto]').value, document.getElementById('model').value, document.getElementById('modgen').value]") == ["7", "70", "700"]
    assert page.evaluate("() => document.getElementById('pmg-host').shadowRoot.querySelectorAll('.chip.on').length") == 3     # the drawer follows


LONG = ["2019 Volkswagen Golf 8", "Volkswagen Golf Mk7 2012", "Volkswagen Golf 2013 Mk7 five door hatchback"]


def test_the_card_fits_a_narrow_column(page, ctx):
    google_fake(ctx)
    open_at(page, ADD)
    page.evaluate("() => { document.getElementById('zoomimgid').parentElement.style.width = '260px'; }")
    choose_photo(page)
    lens_answer(page, LONG)
    card_choices(page)
    wide = page.evaluate(f"() => [{CARD}.querySelector('.card').scrollWidth, {CARD}.querySelector('.card').clientWidth, document.getElementById('pmg-lens-card').getBoundingClientRect().width]")
    assert wide[0] <= wide[1] and wide[2] <= 260                             # no sideways overflow, never wider than the column
    cols = page.evaluate(f"() => new Set([...{CARD}.querySelectorAll('.col')].map(c => Math.round(c.getBoundingClientRect().left))).size")
    assert cols == 1                                                          # stacked: one column in 260 px


def test_the_card_uses_three_columns_where_there_is_room(page, ctx):
    google_fake(ctx)
    open_at(page, ADD)
    choose_photo(page)
    lens_answer(page, LONG)
    card_choices(page)
    page.set_viewport_size({"width": 1200, "height": 800})
    assert page.evaluate(f"() => new Set([...{CARD}.querySelectorAll('.col')].map(c => Math.round(c.getBoundingClientRect().left))).size") == 3


def test_the_panel_answer_fits_a_phone_width(page, ctx):
    google_fake(ctx)
    page.set_viewport_size({"width": 360, "height": 740})
    open_at(page, ADD)
    choose_photo(page)
    lens_answer(page, LONG)
    card_choices(page)
    page.evaluate(f"() => {PANEL}.getElementById('lensMsg').scrollIntoView()")
    over = page.evaluate(f"() => {{ const o = {PANEL}.getElementById('lensOut'); return [o.scrollWidth, o.clientWidth]; }}")
    assert over[0] <= over[1]


def test_the_google_tab_is_closed_once_the_answer_is_in(page, ctx):
    google_fake(ctx)
    open_at(page, ADD)
    with page.expect_popup() as popup:
        choose_photo(page)
    popup.value.wait_for_load_state()
    assert not popup.value.is_closed()                           # open while the search runs
    lens_answer(page, ["Volkswagen Golf 2019"])
    popup.value.wait_for_event("close", timeout=5000)
    assert popup.value.is_closed()


def test_the_google_tab_stays_open_when_nothing_comes_back(page, ctx):
    google_fake(ctx)
    open_at(page, ADD)
    with page.expect_popup() as popup:
        choose_photo(page)
    popup.value.wait_for_load_state()
    lens_answer(page, ["Volkswagen Golf 2019"], stamp=1)       # an answer to another request: nothing for this one
    page.wait_for_timeout(1600)
    assert not popup.value.is_closed()


# ---------------------------------------------------------------- what Google itself names

def test_the_google_side_reads_what_google_names_with_the_titles(ctx):
    import time
    google_results(ctx, similar=["Volkswagen Golf Mk8", "Volkswagen Polo"])
    p = ctx.new_page()
    stamp = int(time.time() * 1000)
    ask_google(p, {"stamp": stamp, "payload": {"photo": PIXELS}})
    p.goto("https://www.google.com/search?q=lens&lns_mode=un")
    p.wait_for_function("() => localStorage.getItem('gm_br_lens_res')")
    data = json.loads(json.loads(p.evaluate("() => localStorage.getItem('gm_br_lens_res')")))["data"]
    assert data["similar"] == ["Volkswagen Golf Mk8", "Volkswagen Polo"]                                  # the chips, from the address; the plain picture link is not one
    assert len(data["titles"]) >= 12


def answer_with(page, similar, titles):
    page.evaluate("(src) => { document.getElementById('zoomimg').src = src; }", PIXELS)
    request = lens_request(page)
    gm_set(page, "br_lens_res", json.dumps({"stamp": request["stamp"], "data": {"similar": similar, "titles": titles}}))


def test_what_google_names_outweighs_the_titles(page, ctx):
    google_fake(ctx)
    open_at(page, ADD)
    answer_with(page, ["Volkswagen Golf"], ["Volkswagen Polo 2019", "Volkswagen Polo", "Volkswagen Polo 2020", "Volkswagen Polo GTI"])
    cands = card_choices(page)
    assert cands[cands.index("Model") + 1] == "Golf"                                                      # one naming by Google beats four titles that say Polo


def test_without_a_naming_the_titles_decide_as_before(page, ctx):
    google_fake(ctx)
    open_at(page, ADD)
    answer_with(page, [], ["Volkswagen Polo 2019", "Volkswagen Polo", "Volkswagen Polo 2020", "Volkswagen Golf"])
    cands = card_choices(page)
    assert cands[cands.index("Model") + 1] == "Polo"


def test_an_old_answer_that_is_only_the_titles_still_works(page, ctx):
    google_fake(ctx)
    open_at(page, ADD)
    choose_photo(page)
    lens_answer(page, ["Volkswagen Golf 2019", "Volkswagen Golf"])
    assert card_choices(page)[:2] == ["Brand", "Volkswagen"]


def test_google_says_shows_the_names_and_a_click_uses_the_sites_own_box(page, ctx):
    google_fake(ctx)
    open_at(page, ADD)
    answer_with(page, ["Volkswagen Golf Mk8", "Audi A3 Sportback"], ["Volkswagen Golf 2019"])
    card_choices(page)
    says = page.evaluate(f"() => [...{CARD}.querySelectorAll('.says .pill')].map(p => p.textContent)")
    assert says == ["Volkswagen Golf Mk8", "Audi A3 Sportback"]
    page.evaluate(f"() => {CARD}.querySelectorAll('.says .pill')[1].click()")
    assert page.evaluate("() => document.getElementById('markamodtype').value") == "Audi A3 Sportback"
    assert page.evaluate(f"() => [...{PANEL}.querySelectorAll('#lensOut .pill')].map(p => p.textContent)") == ["Volkswagen Golf Mk8", "Audi A3 Sportback"]   # the drawer too


def test_a_name_google_gives_that_the_menus_do_not_know_is_still_usable(page, ctx):
    google_fake(ctx)
    open_at(page, ADD)
    answer_with(page, ["Rolls-Royce Phantom"], [])
    page.wait_for_function(f"() => document.getElementById('pmg-lens-card') && {CARD}.querySelector('.says .pill')")
    assert page.evaluate(f"() => {CARD}.querySelector('.says .pill').textContent") == "Rolls-Royce Phantom"


def test_a_google_search_that_is_not_a_lens_search_is_left_alone(ctx):
    google_results(ctx)
    ctx.route("https://www.google.com/search?q=cars", lambda r: r.fulfill(status=200, content_type="text/html", body=inject('<html><body>' + ''.join(f'<a href="/x{i}">2019 Volkswagen Golf {i}</a>' for i in range(15)) + '</body></html>')))
    import time
    p = ctx.new_page()
    ask_google(p, {"stamp": int(time.time() * 1000), "payload": {"photo": PIXELS}})                      # a request is waiting
    p.goto("https://www.google.com/search?q=cars")                                                       # but this is an images search the user opened
    p.wait_for_timeout(1500)
    assert p.evaluate("() => localStorage.getItem('gm_br_lens_res')") is None


def test_the_card_leads_with_the_best_match_then_what_google_calls_it_then_the_other_choices(page, ctx):
    google_fake(ctx)
    open_at(page, ADD)
    choose_photo(page)
    lens_answer(page, {"similar": ["Volkswagen Golf Mk8"], "titles": ["2019 Volkswagen Golf 8", "Volkswagen Golf Mk8 2020", "Volkswagen Golf 2021"]})
    page.wait_for_function(f"() => {CARD}.querySelector('.cols .chip')", timeout=10000)
    heads = page.evaluate(f"() => [...{CARD}.querySelectorAll('.cbody > .cardbox .cat, .cbody > .colshead')].map(e => e.textContent)")
    assert heads == ["Best match", "Google calls it", "Not right? Pick another"]
    assert page.evaluate(f"() => {CARD}.querySelector('.cardbox.best .vehline').textContent") == "Volkswagen › Golf › Mk8, 2019–"
