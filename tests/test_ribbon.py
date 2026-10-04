"""The panel (ribbon): docking, tabs, collapsing, key hints and page-dependent controls.

Run from the project root:  python -m pytest tests -q
"""
import pytest

from fake_site import route_site

GALLERY = "https://platesmania.com/fr/gallery.php"
EDIT_101 = "https://platesmania.com/fr/edit_dopol.php?id=101"




@pytest.fixture
def page(browser):
    c = browser.new_context(viewport={"width": 1280, "height": 800})
    route_site(c)
    p = c.new_page()
    errors = []
    p.on("pageerror", lambda e: errors.append(str(e)))
    p.errors = errors
    yield p
    c.close()


def open_at(page, url):
    page.goto(url)
    page.wait_for_selector("#pmg-host")


def rect(page):
    return page.evaluate(
        "() => { const r = document.getElementById('pmg-host').getBoundingClientRect();"
        " return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height,"
        " vw: innerWidth, vh: innerHeight }; }"
    )


def tab_names(page):
    return page.evaluate(
        "() => [...document.getElementById('pmg-host').shadowRoot.querySelectorAll('.tab')].map(t => t.textContent)"
    )


def shadow_text(page, sel):
    return page.evaluate(
        "(s) => document.getElementById('pmg-host').shadowRoot.querySelector(s).textContent", sel
    )


def shadow_disabled(page, element_id):
    return page.evaluate(
        "(id) => document.getElementById('pmg-host').shadowRoot.getElementById(id).disabled", element_id
    )


def test_panel_is_docked_on_the_right_edge(page):
    open_at(page, GALLERY)
    r = rect(page)
    assert r["right"] == pytest.approx(r["vw"], abs=1)
    assert r["top"] == 0
    assert r["height"] == pytest.approx(r["vh"], abs=1)


def test_tabs_are_in_order(page):
    open_at(page, GALLERY)
    assert tab_names(page) == ["Pair", "Post", "Likes", "Upload"]


def test_clicking_a_tab_shows_its_groups(page):
    open_at(page, GALLERY)
    page.evaluate(
        "() => document.getElementById('pmg-host').shadowRoot.querySelector('.tab:nth-child(2)').click()"
    )
    visible = page.evaluate(
        "() => [...document.getElementById('pmg-host').shadowRoot.querySelectorAll('.tabpage')]"
        ".filter(p => !p.hidden).map(p => p.dataset.tab)"
    )
    assert visible == ["Post"]
    assert page.evaluate("() => document.getElementById('pmg-host').shadowRoot.getElementById('tag') !== null")


def test_collapse_keeps_only_the_header(page):
    open_at(page, GALLERY)
    page.evaluate("() => document.getElementById('pmg-host').shadowRoot.getElementById('min').click()")
    assert page.evaluate("() => document.getElementById('pmg-host').shadowRoot.getElementById('rb').classList.contains('min')")
    assert rect(page)["height"] < 120
    # and it is remembered
    page.reload()
    page.wait_for_selector("#pmg-host")
    assert page.evaluate("() => document.getElementById('pmg-host').shadowRoot.getElementById('rb').classList.contains('min')")


def test_hint_lists_the_keys(page):
    open_at(page, GALLERY)
    hint = shadow_text(page, "#hint")
    assert hint.startswith("Keys: S · F · L · U · N · R ")
    assert hint.endswith(" ◀ ▶ D · Esc")


def test_fill_button_is_only_enabled_on_the_edit_page(page):
    open_at(page, GALLERY)
    assert shadow_disabled(page, "fillBtn") is True
    open_at(page, EDIT_101)
    assert shadow_disabled(page, "fillBtn") is False


def test_no_script_errors_on_any_page(page):
    for url in (GALLERY, EDIT_101):
        open_at(page, url)
    assert page.errors == []


def click_in_panel(page, element_id):
    page.evaluate(
        "(id) => document.getElementById('pmg-host').shadowRoot.getElementById(id).click()", element_id
    )


def test_page_buttons_move_between_pages(page):
    open_at(page, GALLERY)
    click_in_panel(page, "nextPage")
    page.wait_for_url("https://platesmania.com/fr/gallery.php?start=10")
    open_at(page, "https://platesmania.com/fr/gallery.php?start=10")
    click_in_panel(page, "prevPage")
    page.wait_for_url(GALLERY)


def test_choose_photos_button_opens_the_manager(page):
    open_at(page, GALLERY)
    click_in_panel(page, "qOpen")
    assert page.evaluate("() => document.getElementById('pmg-batch').style.display") == "block"
    assert page.evaluate("() => document.getElementById('pmg-host').style.display") == "none"
