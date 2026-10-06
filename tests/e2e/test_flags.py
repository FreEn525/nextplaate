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


def test_the_generic_add_page_has_the_bar_too(ctx):
    page = open_page(ctx, "https://platesmania.com/add", 2560)
    assert page.evaluate("() => !!document.getElementById('pmg-flags')")
    assert page.evaluate(f"() => {BAR}.querySelectorAll('a.flag').length") >= 90
    assert page.evaluate(f"() => {BAR}.querySelectorAll('a.flag.on').length") == 0      # no country on that page


def test_the_panel_lists_the_flags_too(ctx):
    page = open_page(ctx, "https://platesmania.com/fr/gallery.php")
    assert page.evaluate("() => !document.getElementById('pmg-flags')")                 # no bar on a gallery page
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
