"""Country flags: a link to the upload page of every country, in the panel and on the upload pages (/add and /xx/add)."""
import pytest

from fake_site import route_site

PANEL = "document.getElementById('pmg-host').shadowRoot"
BAR = "document.getElementById('pmg-flags').shadowRoot"
PANEL_WIDTH = 56 + 340                     # the rail and the open drawer


@pytest.fixture
def ctx(browser):
    c = browser.new_context()
    route_site(c)
    yield c
    c.close()


def open_page(ctx, url, width=1280):
    page = ctx.new_page()
    page.set_viewport_size({"width": width, "height": 900})
    page.goto(url)
    page.wait_for_selector("#pmg-host")
    page.wait_for_timeout(200)
    return page


def box(page):
    return page.evaluate("() => { const r = document.getElementById('pmg-flags').getBoundingClientRect(); return { left: r.left, right: r.right, top: r.top + scrollY, width: r.width }; }")


def test_every_country_has_a_flag_that_leads_to_its_upload_page(ctx):
    page = open_page(ctx, "https://platesmania.com/fr/add")
    links = page.evaluate(f"() => [...{BAR}.querySelectorAll('a.flag')].map(a => [a.getAttribute('href'), a.title])")
    assert len(links) >= 90
    assert ["/de/add", "Germany"] in links and ["/fr/add", "France"] in links
    assert all(h.endswith("/add") for h, _ in links)


def test_the_country_of_the_page_is_marked(ctx):
    page = open_page(ctx, "https://platesmania.com/fr/add")
    assert page.evaluate(f"() => [...{BAR}.querySelectorAll('a.flag.on')].map(a => a.getAttribute('href'))") == ["/fr/add"]


def test_a_flag_opens_the_upload_page_of_that_country(ctx):
    page = open_page(ctx, "https://platesmania.com/fr/add")
    page.evaluate(f"() => {BAR}.querySelector('a.flag[href=\"/de/add\"]').click()")
    page.wait_for_url("https://platesmania.com/de/add")


def test_on_a_wide_screen_the_bar_stands_beside_the_content_and_never_under_the_open_panel(ctx):
    width = 2560
    page = open_page(ctx, "https://platesmania.com/fr/add", width)
    b = box(page)
    content_right = page.evaluate("() => document.querySelector('.container').getBoundingClientRect().right")
    assert b["left"] >= content_right + 10                            # beside the content, with some space
    assert b["right"] <= width - PANEL_WIDTH                          # still clear of the rail and the drawer, even open
    assert 150 <= b["width"] <= 320


def test_on_a_narrow_screen_the_bar_moves_under_the_photo_and_the_page_is_not_widened(ctx):
    page = open_page(ctx, "https://platesmania.com/fr/add", 1280)
    in_the_page = page.evaluate("() => document.getElementById('pmg-flags').parentNode !== document.body || getComputedStyle(document.getElementById('pmg-flags')).position === 'static'")
    assert in_the_page
    assert page.evaluate("() => document.documentElement.scrollWidth <= window.innerWidth + 1")


def test_the_bar_follows_a_resize(ctx):
    page = open_page(ctx, "https://platesmania.com/fr/add", 2560)
    assert page.evaluate("() => getComputedStyle(document.getElementById('pmg-flags')).position") == "absolute"
    page.set_viewport_size({"width": 1100, "height": 900})
    page.wait_for_timeout(300)
    assert page.evaluate("() => getComputedStyle(document.getElementById('pmg-flags')).position") == "static"


def test_the_panel_lists_the_flags_too(ctx):
    page = open_page(ctx, "https://platesmania.com/fr/gallery.php")
    assert page.evaluate("() => !document.getElementById('pmg-flags')")                 # no bar on a gallery page
    page.evaluate(f"() => {PANEL}.querySelector('.rbtn[data-drawer=\"upload\"]').click()")                          # the list is built when its drawer is first opened
    assert page.evaluate(f"() => {PANEL}.querySelectorAll('a.flag').length") >= 90
    assert page.evaluate(f"() => [...{PANEL}.querySelectorAll('a.flag')].some(a => a.getAttribute('href') === '/it/add')")


def test_switching_the_feature_off_removes_the_bar_and_the_panel_group(ctx):
    page = ctx.new_page()
    page.goto("https://platesmania.com/fr/add")
    page.wait_for_selector("#pmg-host")
    page.evaluate("() => localStorage.setItem('pmg_set_feature_flags', '0')")
    page.reload()
    page.wait_for_selector("#pmg-host")
    page.wait_for_timeout(200)
    assert page.evaluate("() => !document.getElementById('pmg-flags')")
    assert page.evaluate(f"() => {PANEL}.querySelectorAll('a.flag').length") == 0


def test_a_flag_that_does_not_load_shows_its_code(ctx):
    page = open_page(ctx, "https://platesmania.com/fr/add")
    page.wait_for_function(f"() => {BAR}.querySelector('.flagcode')", timeout=5000)      # the simulated site has no flag images
    assert page.evaluate(f"() => {BAR}.querySelector('.flagcode').textContent.length") == 2


def test_each_flag_shows_the_name_of_its_country(ctx):
    page = open_page(ctx, "https://platesmania.com/fr/add")
    names = page.evaluate(f"() => [...{BAR}.querySelectorAll('a.flag .fname')].map(e => e.textContent)")
    assert "Germany" in names and "France" in names and "Bosnia and Herzegovina" in names
    assert len(names) == page.evaluate(f"() => {BAR}.querySelectorAll('a.flag').length")


def test_the_find_box_keeps_the_countries_that_match(ctx):
    page = open_page(ctx, "https://platesmania.com/fr/add")
    page.evaluate(f"() => {{ const i = {BAR}.querySelector('input'); i.value = 'ger'; i.dispatchEvent(new Event('input')); }}")
    shown = page.evaluate(f"() => [...{BAR}.querySelectorAll('a.flag:not([hidden]) .fname')].map(e => e.textContent)")
    assert "Germany" in shown and "France" not in shown and len(shown) < 8
    page.evaluate(f"() => {{ const i = {BAR}.querySelector('input'); i.value = 'it'; i.dispatchEvent(new Event('input')); }}")   # a code, or part of a name
    assert "Italy" in page.evaluate(f"() => [...{BAR}.querySelectorAll('a.flag:not([hidden]) .fname')].map(e => e.textContent)")
    page.evaluate(f"() => {{ const i = {BAR}.querySelector('input'); i.value = ''; i.dispatchEvent(new Event('input')); }}")
    assert page.evaluate(f"() => {BAR}.querySelectorAll('a.flag[hidden]').length") == 0


def test_the_names_do_not_widen_the_bar_or_the_panel(ctx):
    page = open_page(ctx, "https://platesmania.com/fr/add", 2560)
    over = page.evaluate(f"() => {{ const b = {BAR}.querySelector('.box'); return [b.scrollWidth, b.clientWidth]; }}")
    assert over[0] <= over[1]


def choose_countries(ctx, codes, url="https://platesmania.com/fr/add", width=1280):
    page = ctx.new_page()
    page.set_viewport_size({"width": width, "height": 900})
    page.goto(url)
    page.wait_for_selector("#pmg-host")
    page.evaluate("(v) => localStorage.setItem('pmg_set_flags_chosen', v)", codes)
    page.reload()
    page.wait_for_selector("#pmg-host")
    page.wait_for_timeout(200)
    return page


def bar_names(page):
    return page.evaluate(f"() => [...{BAR}.querySelectorAll('a.flag .fname')].map(e => e.textContent)")


def test_the_side_bar_shows_only_the_chosen_countries_and_the_panel_all_of_them(ctx):
    page = choose_countries(ctx, "fr,de,it")
    assert bar_names(page) == ["France", "Germany", "Italy"]
    page.evaluate(f"() => {PANEL}.querySelector('.rbtn[data-drawer=\"upload\"]').click()")
    assert page.evaluate(f"() => {PANEL}.querySelectorAll('.flagblock a.flag').length") >= 90     # the panel keeps the full list
    assert page.evaluate(f"() => {BAR}.querySelector('input').hidden")                       # three countries: no find box


def test_no_country_chosen_says_so(ctx):
    page = choose_countries(ctx, "")
    assert bar_names(page) == []
    assert "No country chosen" in page.evaluate(f"() => {BAR}.textContent")


def open_settings(page):
    page.evaluate(f"() => {{ const b = [...{PANEL}.querySelectorAll('.rbtn')].find(x => /settings/i.test(x.title || '')); b.click(); }}")
    page.wait_for_timeout(200)


def test_the_settings_choice_updates_the_bar_at_once_and_is_kept(ctx):
    page = open_page(ctx, "https://platesmania.com/fr/add")
    open_settings(page)
    assert page.evaluate(f"() => {PANEL}.querySelectorAll('.flagpick .pickrows input[type=checkbox]').length") >= 90
    page.evaluate(f"() => {PANEL}.querySelector('.flagpick .btnrow button:last-child').click()")       # None
    assert bar_names(page) == []
    for code in ("be", "nl"):
        page.evaluate(f"(c) => {PANEL}.getElementById('flag_' + c).click()", code)
    assert bar_names(page) == ["Belgium", "Netherlands"]
    assert page.evaluate("() => localStorage.getItem('pmg_set_flags_chosen')") == "be,nl"
    page.reload()
    page.wait_for_selector("#pmg-host")
    page.wait_for_timeout(200)
    assert bar_names(page) == ["Belgium", "Netherlands"]                                                # kept after a reload


def test_choosing_all_again_goes_back_to_the_default(ctx):
    page = choose_countries(ctx, "fr")
    open_settings(page)
    page.evaluate(f"() => {PANEL}.querySelector('.flagpick .btnrow button:first-child').click()")      # All
    assert page.evaluate("() => localStorage.getItem('pmg_set_flags_chosen')") == "all"
    assert len(bar_names(page)) >= 90


def test_the_settings_list_can_be_filtered(ctx):
    page = open_page(ctx, "https://platesmania.com/fr/add")
    open_settings(page)
    page.evaluate(f"() => {{ const i = {PANEL}.querySelector('.flagpick input[type=text]'); i.value = 'swe'; i.dispatchEvent(new Event('input')); }}")
    shown = page.evaluate(f"() => [...{PANEL}.querySelectorAll('.flagpick .pickrows label:not([hidden])')].map(l => l.textContent.trim())")
    assert shown == ["Sweden"]


def test_a_member_profile_has_the_bar_beside_the_content_on_a_wide_screen(ctx):
    width = 2560
    page = open_page(ctx, "https://platesmania.com/user121559", width)
    assert page.evaluate("() => !!document.getElementById('pmg-flags')")
    b = box(page)
    content_right = page.evaluate("() => document.querySelector('.container.content').getBoundingClientRect().right")
    assert b["left"] >= content_right + 10 and b["right"] <= width - PANEL_WIDTH
    content_top = page.evaluate("() => document.querySelector('.container.content').getBoundingClientRect().top + scrollY")
    assert abs(b["top"] - content_top) < 2                              # level with the top of the profile


def test_a_member_profile_on_a_narrow_screen_has_the_bar_under_the_avatar(ctx):
    page = open_page(ctx, "https://platesmania.com/user121559", 1280)
    assert page.evaluate("() => document.getElementById('pmg-flags').parentNode.classList.contains('col-md-3')")
    assert page.evaluate("() => document.documentElement.scrollWidth <= window.innerWidth + 1")
    assert page.evaluate(f"() => {BAR}.querySelectorAll('a.flag').length") >= 90


def test_the_bar_is_not_on_the_other_pages(ctx):
    page = open_page(ctx, "https://platesmania.com/fr/gallery.php")
    assert page.evaluate("() => !document.getElementById('pmg-flags')")


def test_typing_in_the_country_search_of_the_flag_bar_does_not_trigger_the_keys(ctx):
    page = open_page(ctx, "https://platesmania.com/fr/add")
    find = page.evaluate_handle(f"() => {BAR}.querySelector('input[type=text]')")
    if find.as_element() is None or not page.evaluate(f"() => !{BAR}.querySelector('input[type=text]').hidden"):
        pytest.skip("the bar has few countries: no search field")
    page.evaluate(f"() => {BAR}.querySelector('input[type=text]').focus()")
    page.keyboard.type("uU")
    assert page.evaluate(f"() => {BAR}.querySelector('input[type=text]').value") == "uU"        # written in the field
    assert page.evaluate(f"() => !{PANEL}.querySelector('.dsec[data-drawer=\"upload\"]:not([hidden])') || {PANEL}.querySelector('.dsec[data-drawer=\"upload\"]').hidden")


def test_the_panel_lists_are_built_when_their_drawer_is_opened_not_at_load(ctx):
    page = open_page(ctx, "https://platesmania.com/fr/gallery.php")
    assert page.evaluate(f"() => {PANEL}.querySelectorAll('.flagblock').length") == 0               # nothing built yet: no cost at page load
    page.evaluate(f"() => {PANEL}.querySelector('.rbtn[data-drawer=\"upload\"]').click()")
    assert page.evaluate(f"() => {PANEL}.querySelectorAll('.flagblock').length") == 1
    page.evaluate(f"() => {PANEL}.querySelector('.rbtn[data-drawer=\"settings\"]').click()")
    assert page.evaluate(f"() => {PANEL}.querySelectorAll('.flagpick .pickrows label').length") >= 90
