"""The auto-like add-on (addons/nextplaate-autolike.user.js): a separate script that joins the NextPlaate panel."""
from pathlib import Path

import pytest

from fake_site import route_site

ROOT = Path(__file__).resolve().parents[2]
ADDON = (ROOT / "addons" / "nextplaate-autolike.user.js").read_text(encoding="utf-8")
GALLERY = "https://platesmania.com/fr/gallery.php"
GALLERY_P2 = "https://platesmania.com/fr/gallery.php?start=10"
PANEL = "document.getElementById('pmg-host').shadowRoot"


def hearts(page):
    return page.evaluate("() => document.querySelectorAll('i.rating.fa-heart-o').length")


@pytest.fixture
def ctx(browser):
    c = browser.new_context()
    route_site(c)
    # what Tampermonkey does for a second script: it runs on every page, once the page has been read
    c.add_init_script("document.addEventListener('DOMContentLoaded', () => {" + ADDON + "\n});")
    yield c
    c.close()


@pytest.fixture
def page(ctx):
    p = ctx.new_page()
    p.goto(GALLERY)
    p.wait_for_selector("#pmg-host")
    p.wait_for_function(f"() => {PANEL}.getElementById('alBox')")
    return p


def test_the_addon_adds_its_box_to_the_browse_drawer_of_the_panel(page):
    assert page.evaluate(f"() => [...{PANEL}.querySelectorAll('section[data-drawer=\"gallery\"] .gtitle')].map(t => t.textContent).slice(-1)[0]") == "Auto-like"
    assert page.evaluate(f"() => {PANEL}.querySelector('#alBox .btn').textContent") == "Like 3 photos on this page (L)"


def test_the_key_l_likes_every_empty_heart_once(page):
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.keyboard.press("KeyL")
    page.wait_for_function("() => document.querySelectorAll('i.rating.fa-heart-o').length === 0")
    assert errors == []
    page.wait_for_function(f"() => /Liked 3 photos/.test({PANEL}.querySelector('#alBox .presult').textContent)")


def test_several_pages_in_a_row_resume_after_each_page_and_finish(page):
    page.evaluate("() => localStorage.setItem('pmgx_autolike_pages', '2')")
    page.reload()
    page.wait_for_function(f"() => {PANEL} && {PANEL}.getElementById('alBox')")
    page.keyboard.press("KeyL")
    page.wait_for_url(GALLERY_P2)
    page.wait_for_function("() => document.querySelectorAll('i.rating.fa-heart-o').length === 0", timeout=15000)
    page.wait_for_function("() => localStorage.getItem('pmgx_autolike_run') === 'null'", timeout=15000)


def test_while_it_runs_the_page_keys_of_the_panel_keep_still_and_escape_stops_it(page):
    page.evaluate("() => localStorage.setItem('pmgx_autolike_delay', '5000')")
    page.reload()
    page.wait_for_function(f"() => {PANEL} && {PANEL}.getElementById('alBox')")
    page.keyboard.press("KeyL")
    page.wait_for_function("() => document.documentElement.getAttribute('data-pmg-busy') === 'Auto-like'")
    page.keyboard.press("KeyD")                                                              # next page: the panel refuses
    page.wait_for_function(f"() => /Auto-like is running/.test({PANEL}.getElementById('status') ? {PANEL}.getElementById('status').textContent : '')", timeout=5000)
    assert page.url == GALLERY
    page.keyboard.press("Escape")
    page.wait_for_function("() => !document.documentElement.hasAttribute('data-pmg-busy')", timeout=8000)


def test_typing_an_l_in_a_box_does_not_start_it(page):
    page.evaluate(f"() => {PANEL}.querySelector('.rbtn[data-drawer=\"gallery\"]').click()")                      # the box is in view
    page.evaluate(f"() => {PANEL}.getElementById('alPages').focus()")
    assert page.evaluate(f"() => {PANEL}.activeElement && {PANEL}.activeElement.id") == "alPages"
    page.keyboard.press("KeyL")
    page.wait_for_timeout(500)
    assert hearts(page) == 3
