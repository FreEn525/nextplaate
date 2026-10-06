"""The world map: the countries a member has photos from, shaded by how many, for you or for any member."""
import json

import pytest

from fake_site import route_site

PANEL = "document.getElementById('pmg-host').shadowRoot"
MODAL = "document.getElementById('pmg-worldmap').shadowRoot"
GALLERY = "https://platesmania.com/fr/gallery.php"


@pytest.fixture
def ctx(browser):
    c = browser.new_context(viewport={"width": 1280, "height": 900})
    route_site(c)
    yield c
    c.close()


def open_page(ctx, url=GALLERY, members=None):
    page = ctx.new_page()
    page.goto(url)
    if members is not None:
        page.evaluate("(m) => localStorage.setItem('pmg_members', m)", json.dumps(members))
        page.reload()
    page.wait_for_selector("#pmg-host")
    return page


def open_map(page):
    page.evaluate(f"() => {PANEL}.querySelector('.rbtn[data-drawer=\"gallery\"]').click()")
    page.evaluate(f"() => {PANEL}.getElementById('wmOpen').click()")
    page.wait_for_function(f"() => document.getElementById('pmg-worldmap') && {MODAL}.querySelector('svg')", timeout=20000)


def show(page, text):
    page.evaluate(f"() => {{ {MODAL}.querySelector('input').value = {json.dumps(text)}; [...{MODAL}.querySelectorAll('button')].find(b => b.textContent === 'Show').click(); }}")


def tier(page, cc):
    return page.evaluate(f"() => [...{MODAL}.querySelector('[data-cc=\"{cc}\"]').classList].find(c => /^t[0-9]$/.test(c)) || ''")


def test_the_browse_drawer_opens_my_map(ctx):
    page = open_page(ctx)
    open_map(page)
    assert page.evaluate(f"() => {MODAL}.querySelector('h2').textContent") == "World map"
    assert page.evaluate(f"() => {MODAL}.querySelector('.sub').textContent") == "member121559 · ID 121559"              # you: the member of the top bar
    assert page.evaluate(f"() => {MODAL}.querySelector('.sum').textContent") == "5 countries of 6, 495 photos"


def test_countries_are_shaded_by_how_many_photos(ctx):
    page = open_page(ctx)
    open_map(page)
    assert [tier(page, c) for c in ("lu", "de", "fr", "mc", "be")] == ["t5", "t4", "t4", "t2", "t0"]                              # 233, 166, 80, 4 (a dot), none


def test_a_country_is_a_link_to_the_members_photos_with_its_figures_as_hover_text(ctx):
    page = open_page(ctx)
    open_map(page)
    a = page.evaluate(f"() => {{ const a = {MODAL}.querySelector('[data-cc=\"lu\"]').parentNode; return [a.getAttribute('href'), a.getAttribute('target'), a.querySelector('title').textContent]; }}")
    assert a == ["/lu/gallery.php?usr=121559", "_blank", "Luxembourg: 233 photos, 699 likes"]


def test_a_country_without_a_shape_or_a_dot_is_listed_under_the_map(ctx):
    page = open_page(ctx)
    open_map(page)
    assert page.evaluate(f"() => {MODAL}.querySelector('.extra').textContent") == "Not on the map: USSR (12)"
    assert page.evaluate(f"() => !!{MODAL}.querySelector('circle[data-cc=\"mc\"]')")                                            # a small country is a dot


def test_the_list_of_all_the_countries_is_there_for_the_keyboard(ctx):
    page = open_page(ctx)
    open_map(page)
    rows = page.evaluate(f"() => [...{MODAL}.querySelectorAll('details.fold tr')].slice(1).map(r => [...r.querySelectorAll('td')].map(t => t.textContent))")
    assert rows[0] == ["Luxembourg", "233", "699"] and len(rows) == 5


def test_another_member_is_a_number_or_the_link_of_a_profile(ctx):
    page = open_page(ctx)
    open_map(page)
    show(page, "https://platesmania.com/user121546")
    page.wait_for_function(f"() => {MODAL}.querySelector('.sub').textContent.includes('121546') && {MODAL}.querySelector('svg')", timeout=20000)
    assert page.evaluate(f"() => {MODAL}.querySelector('[data-cc=\"lu\"]').parentNode.getAttribute('href')") == "/lu/gallery.php?usr=121546"


def test_the_members_you_saved_are_one_click(ctx):
    page = open_page(ctx, members=[{"id": "101605", "name": "Aurel", "avatar": ""}])
    open_map(page)
    chips = page.evaluate(f"() => [...{MODAL}.querySelectorAll('.who .pill')].map(b => b.textContent)")
    assert chips[0].startswith("Me (") and chips[-1] == "Aurel"
    page.evaluate(f"() => [...{MODAL}.querySelectorAll('.who .pill')].find(b => b.textContent === 'Aurel').click()")
    page.wait_for_function(f"() => {MODAL}.querySelector('.sub').textContent.includes('101605')", timeout=20000)


def test_a_page_that_is_not_a_profile_says_so_and_a_wrong_input_too(ctx):
    page = open_page(ctx)
    open_map(page)
    show(page, "99999999")
    page.wait_for_function(f"() => {MODAL}.textContent.includes('Not read')", timeout=20000)
    show(page, "hello")
    assert "member number" in page.evaluate(f"() => {MODAL}.querySelector('.wmview').textContent")


def test_the_key_m_opens_it_but_not_while_typing(ctx):
    page = open_page(ctx)
    page.keyboard.press("KeyM")
    page.wait_for_function("() => document.getElementById('pmg-worldmap')", timeout=20000)
    page.keyboard.press("Escape")
    assert page.evaluate("() => !document.getElementById('pmg-worldmap')")
    page.evaluate("() => { const i = document.createElement('input'); i.type = 'text'; i.id = 'zz'; document.body.appendChild(i); i.focus(); }")
    page.keyboard.type("m")
    page.wait_for_timeout(300)
    assert page.evaluate("() => !document.getElementById('pmg-worldmap') && document.getElementById('zz').value === 'm'")


def test_a_profile_has_a_button_and_its_own_page_is_not_read_again(ctx):
    page = ctx.new_page()
    asked = []
    page.on("request", lambda r: asked.append(r.url) if r.url.endswith("/user121546") else None)
    page.goto("https://platesmania.com/user121546")
    page.wait_for_function("() => document.getElementById('pmg-profile-card') && document.getElementById('pmg-profile-card').shadowRoot.querySelector('.btn')", timeout=20000)
    page.evaluate("() => [...document.getElementById('pmg-profile-card').shadowRoot.querySelectorAll('button')].find(b => b.textContent === 'World map of this member').click()")
    page.wait_for_function(f"() => document.getElementById('pmg-worldmap') && {MODAL}.querySelector('svg')", timeout=20000)
    assert page.evaluate(f"() => {MODAL}.querySelector('.sub').textContent").endswith("ID 121546")
    assert len(asked) == 1                                                                   # the page itself, nothing fetched for the map


def test_with_the_feature_off_there_is_no_group_and_no_key(ctx):
    page = ctx.new_page()
    page.goto(GALLERY)
    page.evaluate("() => localStorage.setItem('pmg_set_feature_worldmap', '0')")
    page.reload()
    page.wait_for_selector("#pmg-host")
    page.keyboard.press("KeyM")
    page.wait_for_timeout(300)
    assert page.evaluate(f"() => !document.getElementById('pmg-worldmap') && !{PANEL}.getElementById('wmOpen')")


@pytest.mark.parametrize("width", [320, 768])
def test_no_horizontal_overflow(ctx, width):
    page = open_page(ctx)
    page.set_viewport_size({"width": width, "height": 800})
    open_map(page)
    page.wait_for_timeout(200)
    over = page.evaluate(f"() => {{ const m = {MODAL}; const r = m.querySelector('.dlg').getBoundingClientRect(); return [...m.querySelectorAll('.dlg *')].filter(e => e.getBoundingClientRect().right > r.right + 1 && e.getBoundingClientRect().width > 0).map(e => e.tagName).slice(0, 5); }}")
    assert over == []


def test_the_europe_view_zooms_the_same_map_and_keeps_the_dots_the_same_size_on_screen(ctx):
    page = open_page(ctx)
    open_map(page)
    full = page.evaluate(f"() => {MODAL}.querySelector('svg').getAttribute('viewBox')")
    r_full = page.evaluate(f"() => +{MODAL}.querySelector('circle').getAttribute('r')")
    page.evaluate(f"() => [...{MODAL}.querySelectorAll('.views button')].find(b => b.textContent === 'Europe').click()")
    close = page.evaluate(f"() => {MODAL}.querySelector('svg').getAttribute('viewBox')")
    r_close = page.evaluate(f"() => +{MODAL}.querySelector('circle').getAttribute('r')")
    assert full.startswith("0 0 1000") and close != full
    assert r_close < r_full / 3                                                              # a dot is smaller in the map's units where the map is bigger
    page.evaluate(f"() => [...{MODAL}.querySelectorAll('.views button')].find(b => b.textContent === 'World').click()")
    assert page.evaluate(f"() => {MODAL}.querySelector('svg').getAttribute('viewBox')") == full


def test_the_map_has_a_shape_for_most_countries_and_a_dot_for_the_small_ones(ctx):
    page = open_page(ctx)
    open_map(page)
    n = page.evaluate(f"() => [{MODAL}.querySelectorAll('path[data-cc]').length, {MODAL}.querySelectorAll('circle[data-cc]').length]")
    assert n[0] >= 70 and n[1] >= 12                                                         # shapes, and dots (Monaco, Malta, Singapore...)
