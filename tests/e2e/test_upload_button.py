"""Floating upload button: ours stands at the bottom of the window while the site's Upload button is out of view."""
import pytest

from fake_site import route_site

ADD = "https://platesmania.com/fr/add"
FAB = "document.getElementById('pmg-upload-fab')"


@pytest.fixture
def ctx(browser):
    c = browser.new_context()
    route_site(c)
    yield c
    c.close()


def open_add(ctx):
    page = ctx.new_page()
    page.set_viewport_size({"width": 1280, "height": 700})
    page.goto(ADD)
    page.wait_for_selector("#pmg-host")
    page.wait_for_timeout(300)
    return page


def test_the_button_is_shown_while_the_real_one_is_out_of_view(ctx):
    page = open_add(ctx)
    assert page.evaluate(f"() => !{FAB}.hidden")


def test_a_click_presses_the_sites_own_button(ctx):
    page = open_add(ctx)
    page.evaluate(f"() => {FAB}.shadowRoot.querySelector('.btn').click()")
    assert page.evaluate("() => window.__uploads") == 1                                                  # the site's own button was pressed


def test_it_goes_away_when_the_real_button_comes_into_view(ctx):
    page = open_add(ctx)
    page.evaluate("() => document.querySelector('#frm button[type=submit]').scrollIntoView()")
    page.wait_for_function(f"() => {FAB}.hidden", timeout=3000)
    page.evaluate("() => window.scrollTo(0, 0)")
    page.wait_for_function(f"() => !{FAB}.hidden", timeout=3000)                                          # and comes back when it leaves the screen


def test_it_does_not_cover_the_panel_rail(ctx):
    page = open_add(ctx)
    box = page.evaluate(f"() => {{ const r = {FAB}.getBoundingClientRect(); return [r.right, r.bottom, window.innerWidth, window.innerHeight]; }}")
    assert box[0] < box[2] - 56 and box[1] <= box[3]                                                     # left of the rail, inside the window


def test_with_the_feature_off_there_is_no_floating_button(ctx):
    page = ctx.new_page()
    page.goto(ADD)
    page.wait_for_selector("#pmg-host")
    page.evaluate("() => localStorage.setItem('pmg_set_feature_floatupload', '0')")
    page.reload()
    page.wait_for_selector("#pmg-host")
    assert page.evaluate("() => !document.getElementById('pmg-upload-fab')")
