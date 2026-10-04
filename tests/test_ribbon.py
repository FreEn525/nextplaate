"""The panel (ribbon): docking, icon bar, drawers, key hints and page-dependent controls.

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


def click_icon(page, drawer_id):
    page.evaluate(
        """(id) => {
            const buttons = [...document.getElementById('pmg-host').shadowRoot.querySelectorAll('.rbtn')];
            buttons.find(b => b.dataset.drawer === id).click();
        }""",
        drawer_id,
    )


def icon_drawers(page):
    return page.evaluate(
        "() => [...document.getElementById('pmg-host').shadowRoot.querySelectorAll('.rbtn')].map(b => b.dataset.drawer)"
    )


def drawer_open(page):
    return page.evaluate("() => !document.getElementById('pmg-host').shadowRoot.getElementById('drawer').hidden")


def visible_section(page):
    return page.evaluate(
        "() => { const s = [...document.getElementById('pmg-host').shadowRoot.querySelectorAll('.dsec')].find(x => !x.hidden);"
        " return s ? s.dataset.drawer : null; }"
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


def test_bar_has_one_icon_per_drawer_in_order(page):
    open_at(page, GALLERY)
    assert icon_drawers(page) == ["pair", "gallery", "upload", "keys"]


def test_icon_opens_its_drawer_and_a_second_click_closes_it(page):
    open_at(page, GALLERY)
    click_icon(page, "pair")
    assert drawer_open(page) and visible_section(page) == "pair"
    assert page.evaluate("() => document.getElementById('pmg-host').shadowRoot.getElementById('tag') !== null")
    click_icon(page, "pair")
    assert drawer_open(page)                       # a second click on the same icon keeps it open
    page.evaluate("() => document.getElementById('pmg-host').shadowRoot.getElementById('dclose').click()")
    assert not drawer_open(page)                   # only the X closes it


def test_escape_does_not_close_the_drawer(page):
    open_at(page, GALLERY)
    click_icon(page, "gallery")
    page.keyboard.press("Escape")
    assert drawer_open(page)






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


def test_a_page_bound_group_says_where_it_works_and_keeps_its_settings(page):
    open_at(page, GALLERY)
    open_at(page, "https://platesmania.com/fr/nomer101")
    click_icon(page, "gallery")
    note = page.evaluate("() => document.getElementById('pmg-host').shadowRoot.querySelector('.dsec[data-drawer="gallery"] .pnote').textContent")
    assert "gallery" in note
    assert page.evaluate("() => document.getElementById('pmg-host').shadowRoot.getElementById('delay') !== null")
