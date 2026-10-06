"""Plate preview as you type: the site's "Generate preview" button is pressed for the user once the typing stops."""
import pytest

from fake_site import route_site

ADD = "https://platesmania.com/fr/add"


@pytest.fixture
def ctx(browser):
    c = browser.new_context()
    route_site(c)
    yield c
    c.close()


def open_add(ctx, off=False):
    page = ctx.new_page()
    page.goto(ADD)
    page.wait_for_selector("#pmg-host")
    if off:
        page.evaluate("() => localStorage.setItem('pmg_set_feature_preview', '0')")
        page.reload()
        page.wait_for_selector("#pmg-host")
    return page


def previews(page):
    return page.evaluate("() => window.__previews || []")


def test_the_preview_is_asked_for_once_the_typing_stops(ctx):
    page = open_add(ctx)
    page.click("#nomer")
    page.keyboard.type("AB 123", delay=60)
    assert previews(page) == []                                   # still typing: nothing yet
    page.wait_for_function("() => (window.__previews || []).length === 1", timeout=5000)
    assert previews(page) == ["AB 123"]                           # one preview, of the whole plate
    assert page.evaluate("() => document.getElementById('informer-preview-result').textContent") == "preview AB 123"


def test_changing_the_plate_gives_a_new_preview(ctx):
    page = open_add(ctx)
    page.fill("#nomer", "AB 123")
    page.wait_for_function("() => (window.__previews || []).length === 1", timeout=5000)
    page.fill("#nomer", "CD 456")
    page.wait_for_function("() => (window.__previews || []).length === 2", timeout=8000)
    assert previews(page) == ["AB 123", "CD 456"]


def test_an_empty_plate_asks_for_nothing(ctx):
    page = open_add(ctx)
    page.select_option("#ctype", "2")                             # a change, but no plate
    page.wait_for_timeout(1500)
    assert previews(page) == []


def test_a_change_after_the_photo_field_does_not_ask_for_a_preview(ctx):
    page = open_add(ctx)
    page.fill("#nomer", "AB 123")
    page.wait_for_function("() => (window.__previews || []).length === 1", timeout=5000)
    page.select_option("[name=markaavto]", "7")                   # the vehicle menus come after the photo
    page.wait_for_timeout(1500)
    assert previews(page) == ["AB 123"]
    assert page.evaluate("() => document.getElementById('informer-preview-result').style.display") == "block"   # the preview stays


def test_a_preview_already_up_to_date_is_not_asked_again(ctx):
    page = open_add(ctx)
    page.fill("#nomer", "AB 123")
    page.wait_for_function("() => (window.__previews || []).length === 1", timeout=5000)
    page.dispatch_event("#nomer", "change")                       # same value
    page.wait_for_timeout(1500)
    assert previews(page) == ["AB 123"]


def test_two_previews_are_never_less_than_two_seconds_apart(ctx):
    page = open_add(ctx)
    page.fill("#nomer", "AB 123")
    page.wait_for_function("() => (window.__previews || []).length === 1", timeout=5000)
    start = page.evaluate("() => Date.now()")
    page.fill("#nomer", "CD 456")
    page.wait_for_function("() => (window.__previews || []).length === 2", timeout=8000)
    assert page.evaluate("(s) => Date.now() - s", start) >= 1500   # the gap, minus the time the first one already took


def test_the_feature_can_be_switched_off(ctx):
    page = open_add(ctx, off=True)
    page.fill("#nomer", "AB 123")
    page.wait_for_timeout(1600)
    assert previews(page) == []
    assert page.evaluate("() => document.getElementById('informer-preview-btn').style.display") != "none"      # the button is still there to press
