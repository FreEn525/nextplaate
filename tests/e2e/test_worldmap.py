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
    page.wait_for_function(f"() => document.getElementById('pmg-worldmap') && {MODAL}.querySelector('svg[role=img]')", timeout=20000)


def show(page, text):
    page.evaluate(f"() => {{ {MODAL}.querySelector('input').value = {json.dumps(text)}; [...{MODAL}.querySelectorAll('button')].find(b => b.textContent === 'Show').click(); }}")


def tier(page, cc):
    return page.evaluate(f"() => [...{MODAL}.querySelector('[data-cc=\"{cc}\"]').classList].find(c => /^t[0-9]$/.test(c)) || ''")


def test_the_browse_drawer_opens_my_map(ctx):
    page = open_page(ctx)
    open_map(page)
    assert page.evaluate(f"() => {MODAL}.querySelector('h2').textContent") == "World map"
    assert page.evaluate(f"() => {MODAL}.querySelector('.sub').textContent") == "member121559 · ID 121559"              # you: the member of the top bar
    assert page.evaluate(f"() => [...{MODAL}.querySelector('.sum').children].map(c => c.textContent).join(' ')") == "5 countries of 6 · 495 photos"


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
    assert page.evaluate(f"() => {MODAL}.querySelector('.foot p').textContent") == "Not on the map: USSR (12)"
    assert page.evaluate(f"() => !!{MODAL}.querySelector('circle[data-cc=\"mc\"]')")                                            # a small country is a dot


def test_the_ranked_list_of_the_countries_is_beside_the_map(ctx):
    page = open_page(ctx)
    open_map(page)
    rows = page.evaluate(f"() => [...{MODAL}.querySelectorAll('.rows .row')].map(r => [r.querySelector('a').textContent, r.querySelector('.n').textContent])")
    assert rows[0] == ["Luxembourg", "233"] and len(rows) == 5


def test_another_member_is_a_number_or_the_link_of_a_profile(ctx):
    page = open_page(ctx)
    open_map(page)
    show(page, "https://platesmania.com/user121546")
    page.wait_for_function(f"() => {MODAL}.querySelector('.sub').textContent.includes('121546') && {MODAL}.querySelector('svg[role=img]')", timeout=20000)
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
    assert "member number" in page.evaluate(f"() => {MODAL}.querySelector('.view').textContent")


def test_the_key_g_opens_it_but_not_while_typing(ctx):
    page = open_page(ctx)
    page.keyboard.press("KeyG")
    page.wait_for_function("() => document.getElementById('pmg-worldmap')", timeout=20000)
    page.keyboard.press("Escape")
    assert page.evaluate("() => !document.getElementById('pmg-worldmap')")
    page.evaluate("() => { const i = document.createElement('input'); i.type = 'text'; i.id = 'zz'; document.body.appendChild(i); i.focus(); }")
    page.keyboard.type("g")
    page.wait_for_timeout(300)
    assert page.evaluate("() => !document.getElementById('pmg-worldmap') && document.getElementById('zz').value === 'g'")


def test_a_profile_has_a_button_and_its_own_page_is_not_read_again(ctx):
    page = ctx.new_page()
    asked = []
    page.on("request", lambda r: asked.append(r.url) if r.url.endswith("/user121546") else None)
    page.goto("https://platesmania.com/user121546")
    page.wait_for_function("() => document.getElementById('pmg-profile-card') && document.getElementById('pmg-profile-card').shadowRoot.querySelector('.btn')", timeout=20000)
    page.evaluate("() => [...document.getElementById('pmg-profile-card').shadowRoot.querySelectorAll('button')].find(b => b.textContent === 'World map of this member').click()")
    page.wait_for_function(f"() => document.getElementById('pmg-worldmap') && {MODAL}.querySelector('svg[role=img]')", timeout=20000)
    assert page.evaluate(f"() => {MODAL}.querySelector('.sub').textContent").endswith("ID 121546")
    assert len(asked) == 1                                                                   # the page itself, nothing fetched for the map


def test_with_the_feature_off_there_is_no_group_and_no_key(ctx):
    page = ctx.new_page()
    page.goto(GALLERY)
    page.evaluate("() => localStorage.setItem('pmg_set_feature_worldmap', '0')")
    page.reload()
    page.wait_for_selector("#pmg-host")
    page.keyboard.press("KeyG")
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


def view(page):
    return page.evaluate(f"() => {MODAL}.querySelector('svg[role=img]').getAttribute('viewBox').split(' ').map(Number)")


def button(page, text):
    return f"() => [...{MODAL}.querySelectorAll('.tools button')].find(b => b.textContent === {json.dumps(text)}).click()"


def test_the_buttons_zoom_and_go_to_europe_or_back_to_the_world(ctx):
    page = open_page(ctx)
    open_map(page)
    full = view(page)
    assert full[:3] == [0, 0, 1000]
    page.evaluate(button(page, "+"))
    zoomed = view(page)
    assert zoomed[2] < full[2] and abs(zoomed[2] - 1000 / 1.5) < 1
    page.evaluate(button(page, "−"))
    assert abs(view(page)[2] - 1000) < 1
    page.evaluate(button(page, "Europe"))
    assert view(page)[2] < 300
    page.evaluate(button(page, "Fit"))
    assert view(page) == full


def test_the_wheel_zooms_at_the_pointer_and_a_drag_moves_the_map(ctx):
    page = open_page(ctx)
    open_map(page)
    box = page.evaluate(f"() => {{ const r = {MODAL}.querySelector('svg[role=img]').getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; }}")
    cx, cy = box[0] + box[2] * 0.52, box[1] + box[3] * 0.3                                   # over Europe
    page.mouse.move(cx, cy)
    for _ in range(4):
        page.mouse.wheel(0, -100)
        page.wait_for_timeout(40)
    z = view(page)
    assert z[2] < 500 and "×" in page.evaluate(f"() => {MODAL}.querySelector('.zl').textContent")
    page.mouse.down()
    page.mouse.move(cx + 80, cy + 20, steps=6)
    page.mouse.up()
    moved = view(page)
    assert moved[2] == z[2] and moved[0] < z[0]                                              # dragged right: the window went left on the map
    page.mouse.wheel(0, 100)
    page.wait_for_timeout(40)
    assert view(page)[2] > z[2]                                                              # the wheel the other way zooms out


def test_a_drag_does_not_open_the_country_under_the_pointer(ctx):
    page = open_page(ctx)
    open_map(page)
    page.evaluate(button(page, "Europe"))
    box = page.evaluate(f"() => {{ const r = {MODAL}.querySelector('[data-cc=\"de\"]').getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }}")
    pages = len(ctx.pages)
    page.mouse.move(box[0], box[1])
    page.mouse.down()
    page.mouse.move(box[0] + 60, box[1] + 10, steps=5)
    page.mouse.up()
    page.wait_for_timeout(300)
    assert len(ctx.pages) == pages                                                          # no tab opened by the end of the drag


def test_the_dots_keep_their_size_on_screen_when_zooming(ctx):
    page = open_page(ctx)
    open_map(page)
    r0 = page.evaluate(f"() => +{MODAL}.querySelector('circle.dot').getAttribute('r')")
    page.evaluate(button(page, "Europe"))
    assert page.evaluate(f"() => +{MODAL}.querySelector('circle.dot').getAttribute('r')") < r0 / 3


def test_the_map_has_a_legend_with_no_photo_and_the_five_shades(ctx):
    page = open_page(ctx)
    open_map(page)
    assert page.evaluate(f"() => [...{MODAL}.querySelectorAll('.legend span')].map(s => s.textContent)") == ["Photos", "no photo", "1", "2–9", "10–49", "50–199", "200 +"]


def test_the_map_has_a_shape_for_most_countries_and_a_dot_for_the_small_ones(ctx):
    page = open_page(ctx)
    open_map(page)
    n = page.evaluate(f"() => [{MODAL}.querySelectorAll('path[data-cc]').length, {MODAL}.querySelectorAll('circle[data-cc]').length]")
    assert n[0] >= 70 and n[1] >= 12                                                         # shapes, and dots (Monaco, Malta, Singapore...)


def chips_and_more(page):
    return page.evaluate(f"() => [[...{MODAL}.querySelectorAll('.who .pill')].map(b => b.textContent), [...{MODAL}.querySelectorAll('.who select option')].map(o => o.textContent)]")


def test_the_favourites_of_the_map_follow_a_new_favourite_while_it_is_open(ctx):
    page = open_page(ctx)
    open_map(page)
    assert chips_and_more(page) == [["Me (freen525)"], []]
    page.evaluate("() => { localStorage.setItem('pmg_members', JSON.stringify([{ id: '101605', name: 'Aurel', avatar: '' }])); window.dispatchEvent(new Event('pmg-members')); }")
    assert chips_and_more(page) == [["Me (freen525)", "Aurel"], []]


def test_many_favourites_are_four_buttons_and_a_menu_for_the_rest(ctx):
    page = open_page(ctx)
    open_map(page)
    page.evaluate("() => { localStorage.setItem('pmg_members', JSON.stringify(Array.from({ length: 9 }, (_, i) => ({ id: String(200000 + i), name: 'Member' + i, avatar: '' })))); window.dispatchEvent(new Event('pmg-members')); }")
    chips, more = chips_and_more(page)
    assert chips == ["Me (freen525)", "Member0", "Member1", "Member2", "Member3"]
    assert more == ["5 more\u2026", "Member4", "Member5", "Member6", "Member7", "Member8"]


def test_a_click_outside_the_window_does_not_close_it_but_close_and_escape_do(ctx):
    """The same rule as the batch window and every other window of the script: a stray click must never lose what is open."""
    page = open_page(ctx)
    open_map(page)
    page.evaluate(f"() => {MODAL}.querySelector('.ov').dispatchEvent(new MouseEvent('click', {{ bubbles: true }}))")
    assert page.evaluate("() => !!document.getElementById('pmg-worldmap')")
    page.keyboard.press("Escape")
    assert page.evaluate("() => !document.getElementById('pmg-worldmap')")
    open_map(page)
    page.evaluate(f"() => [...{MODAL}.querySelectorAll('.mh .btn')].find(b => b.textContent === 'Close').click()")
    assert page.evaluate("() => !document.getElementById('pmg-worldmap')")
