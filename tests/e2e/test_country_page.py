"""The page /add: the site's drop-down of countries becomes a card of large flags with a search box."""
import pytest

from fake_site import route_site, settled

ADD = "https://platesmania.com/add"
CARD = "document.getElementById('pmg-country-card').shadowRoot"


@pytest.fixture
def ctx(browser):
    c = browser.new_context()
    route_site(c)
    yield c
    c.close()


def open_add(ctx, width=1280):
    page = ctx.new_page()
    page.set_viewport_size({"width": width, "height": 900})
    page.goto(ADD)
    page.wait_for_selector("#pmg-host")
    page.wait_for_function("() => document.getElementById('pmg-country-card')")
    return page


def names(page):
    return page.evaluate(f"() => [...{CARD}.querySelectorAll('.cgroup:last-child .ctile:not([hidden])')].map(a => a.querySelector('.cname').textContent)")


def test_the_card_replaces_the_sites_box_with_the_countries_of_its_menu(ctx):
    page = open_add(ctx)
    assert page.evaluate("() => document.getElementById('sky-form').hidden || getComputedStyle(document.getElementById('sky-form')).display === 'none'")
    assert page.evaluate(f"() => {CARD}.querySelector('.top b').textContent") == "Select a country"
    assert names(page)[:3] == ["Albania", "Belgium", "France"]
    assert len(names(page)) == 9                                                              # exactly the menu of the page


def test_each_tile_is_a_link_to_the_upload_page_with_a_large_flag(ctx):
    ctx.route("**/assets/img/profile-flags/*.svg", lambda r: r.fulfill(status=200, content_type="image/svg+xml", body='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2"><rect width="3" height="2" fill="#c00"/></svg>'))
    page = open_add(ctx)
    tile = page.evaluate(f"() => {{ const a = [...{CARD}.querySelectorAll('.ctile')].find(x => x.querySelector('.cname').textContent === 'France'); const i = a.querySelector('img').getBoundingClientRect(); return [a.getAttribute('href'), a.querySelector('img').getAttribute('src'), Math.round(i.width), Math.round(i.height)]; }}")
    assert tile == ["/fr/add", "/assets/img/profile-flags/fr.svg", 40, 27]                      # larger than the 22 x 15 of the bar


def test_the_search_filters_by_name_and_by_code(ctx):
    page = open_add(ctx)
    page.evaluate(f"() => {{ const i = {CARD}.querySelector('input'); i.value = 'ger'; i.dispatchEvent(new Event('input')); }}")
    assert names(page) == ["Germany"]
    page.evaluate(f"() => {{ const i = {CARD}.querySelector('input'); i.value = 'nl'; i.dispatchEvent(new Event('input')); }}")
    assert names(page) == ["Netherlands"]
    page.evaluate(f"() => {{ const i = {CARD}.querySelector('input'); i.value = 'zzz'; i.dispatchEvent(new Event('input')); }}")
    assert names(page) == [] and page.evaluate(f"() => !{CARD}.querySelector('.hint').hidden")


def test_enter_opens_the_first_match(ctx):
    page = open_add(ctx)
    page.evaluate(f"() => {CARD}.querySelector('input').focus()")
    page.keyboard.type("ital")
    page.keyboard.press("Enter")
    page.wait_for_url("https://platesmania.com/it/add")


def test_typing_u_in_the_search_does_not_open_the_batch_drawer(ctx):
    page = open_add(ctx)
    page.evaluate(f"() => {CARD}.querySelector('input').focus()")
    page.keyboard.type("u")
    assert page.evaluate(f"() => {CARD}.querySelector('input').value") == "u"
    assert page.evaluate("() => document.getElementById('pmg-host').shadowRoot.querySelector('.dsec[data-drawer=\"upload\"]:not([hidden])') === null")


def test_the_countries_opened_last_come_first(ctx):
    page = open_add(ctx)
    assert page.evaluate(f"() => !{CARD}.querySelector('.cgroup .cat') || ![...{CARD}.querySelectorAll('.cat')].some(c => c.textContent === 'Opened last')")
    page.evaluate(f"() => [...{CARD}.querySelectorAll('.ctile')].find(x => x.querySelector('.cname').textContent === 'Germany').addEventListener('click', e => e.preventDefault(), true)")
    page.evaluate(f"() => [...{CARD}.querySelectorAll('.ctile')].find(x => x.querySelector('.cname').textContent === 'Germany').click()")
    page.reload()
    page.wait_for_function("() => document.getElementById('pmg-country-card')")
    last = page.evaluate(f"() => [...{CARD}.querySelectorAll('.cgroup')][0].textContent")
    assert last.startswith("Opened last") and "Germany" in last


def test_other_upload_pages_keep_the_side_bar_and_this_page_has_none(ctx):
    page = open_add(ctx)
    assert page.evaluate("() => !document.getElementById('pmg-flags')")
    other = ctx.new_page()
    other.goto("https://platesmania.com/fr/add")
    other.wait_for_selector("#pmg-host")
    settled(other)
    assert other.evaluate("() => !!document.getElementById('pmg-flags') && !document.getElementById('pmg-country-card')")


@pytest.mark.parametrize("width", [320, 768, 1280])
def test_no_horizontal_overflow(ctx, width):
    page = open_add(ctx, width)
    page.wait_for_timeout(300)
    assert page.evaluate("() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1")


def test_with_the_feature_off_the_site_keeps_its_box(ctx):
    page = ctx.new_page()
    page.goto(ADD)
    page.evaluate("() => localStorage.setItem('pmg_set_feature_flags', '0')")
    page.reload()
    page.wait_for_selector("#pmg-host")
    page.wait_for_timeout(300)
    assert page.evaluate("() => !document.getElementById('pmg-country-card') && getComputedStyle(document.getElementById('sky-form')).display !== 'none'")
