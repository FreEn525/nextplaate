"""How the site is doing: a dot on the logo, from what the script's own requests (and the page) say."""
import time

import pytest

from fake_site import route_site

PANEL = "document.getElementById('pmg-host').shadowRoot"


@pytest.fixture
def ctx(browser):
    c = browser.new_context()
    route_site(c)
    yield c
    c.close()


def level(page):
    return page.evaluate(f"() => {PANEL}.getElementById('sdot').dataset.level")


def title(page):
    return page.evaluate(f"() => {PANEL}.getElementById('logo').title")


def check(page, times):
    page.evaluate(f"() => {PANEL}.querySelector('.rbtn[data-drawer=\"settings\"]').click()")
    for _ in range(times):
        page.evaluate(f"() => {PANEL}.getElementById('siteCheck').click()")                        # the line says "Asking" at once, then the answer
        page.wait_for_function(f"() => !/Asking/.test({PANEL}.getElementById('siteSaid').textContent)", timeout=15000)


def open_page(ctx):
    page = ctx.new_page()
    page.goto("https://platesmania.com/fr/gallery.php")
    page.wait_for_selector("#pmg-host")
    return page


def test_answers_that_come_make_the_dot_green_and_say_how_long(ctx):
    def robots(route):
        time.sleep(0.05)
        route.fulfill(status=200, content_type="text/plain", body="User-agent: *")
    ctx.route("https://platesmania.com/robots.txt", robots)
    page = open_page(ctx)
    check(page, 2)
    assert level(page) == "ok"
    assert "is answering" in title(page) and "your last requests" in title(page)


def test_server_errors_one_after_the_other_make_the_dot_red(ctx):
    ctx.route("https://platesmania.com/robots.txt", lambda r: r.fulfill(status=503, content_type="text/plain", body="down"))
    page = open_page(ctx)
    check(page, 2)
    assert level(page) == "bad"
    assert "not answering well" in title(page) and "error" in title(page)
    assert "did not answer" in page.evaluate(f"() => {PANEL}.getElementById('siteSaid').textContent")


def test_a_pause_asked_by_the_site_makes_it_grey_with_the_time_it_ends(ctx):
    page = open_page(ctx)
    page.evaluate("() => localStorage.setItem('pmg_siteBlock', String(Date.now()))")
    page.reload()
    page.wait_for_selector("#pmg-host")
    assert level(page) == "paused" and "Paused until" in title(page)


def test_a_missing_page_is_still_an_answer(ctx):
    ctx.route("https://platesmania.com/robots.txt", lambda r: r.fulfill(status=404, content_type="text/plain", body="no"))
    page = open_page(ctx)
    check(page, 2)
    assert level(page) in ("ok", "unknown")                                             # never red: the site answered


def test_a_block_pauses_for_three_minutes_and_a_second_one_within_the_hour_for_ten(ctx):
    ctx.route("https://platesmania.com/robots.txt", lambda r: r.fulfill(status=429, content_type="text/plain", body="slow down"))
    page = open_page(ctx)
    check(page, 1)
    n, at = page.evaluate("() => [localStorage.getItem('pmg_siteBlockN'), +localStorage.getItem('pmg_siteBlock')]")
    assert n == "1" and abs(page.evaluate("() => Date.now()") - at) < 20000
    assert "Paused until" in title(page)
    # the pause of 3 minutes is over; the site blocks again within the hour: the next pause is longer
    page.evaluate("() => { localStorage.setItem('pmg_siteBlock', String(Date.now() - 4 * 60000)); }")
    page.reload()
    page.wait_for_selector("#pmg-host")
    check(page, 1)
    assert page.evaluate("() => localStorage.getItem('pmg_siteBlockN')") == "2"
