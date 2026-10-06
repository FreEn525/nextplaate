"""User flows of NextPlaate, run against the simulated site in fake_site.py.

Run from the project root:  python -m pytest tests -q
Each test starts from a clean browser profile.
"""
import base64
import json
import re

import pytest

from fake_site import PNG, route_site

GALLERY = "https://platesmania.com/fr/gallery.php"
GALLERY_P2 = "https://platesmania.com/fr/gallery.php?start=10"
PHOTO_101 = "https://platesmania.com/fr/nomer101"
PHOTO_102 = "https://platesmania.com/fr/nomer102"
EDIT_101 = "https://platesmania.com/fr/edit_dopol.php?id=101"
ADD = "https://platesmania.com/fr/add"




@pytest.fixture
def ctx(browser):
    c = browser.new_context()
    route_site(c)
    yield c
    c.close()


@pytest.fixture
def page(ctx):
    p = ctx.new_page()
    yield p


@pytest.fixture
def errors(page):
    found = []
    page.on("pageerror", lambda e: found.append(str(e)))
    return found


def set_storage(page, values):
    """Sets pmg_* values on the PlatesMania origin (the page must be on it)."""
    page.evaluate(
        """(vals) => Object.entries(vals).forEach(([k, v]) => localStorage.setItem('pmg_' + k, v))""",
        values,
    )


def get_storage(page, key):
    return page.evaluate(f"localStorage.getItem('pmg_{key}')")


def pair_values():
    front = {"srv": "img1", "folder": "10", "id": "101", "lang": "fr", "alt": "AB 121", "thumb": ""}
    rear = {"srv": "img1", "folder": "10", "id": "102", "lang": "fr", "alt": "AB 122", "thumb": ""}
    return {"front": json.dumps(front), "rear": json.dumps(rear)}


def ui_text(page, element_id):
    return page.evaluate(
        "(id) => document.getElementById('pmg-host').shadowRoot.getElementById(id).textContent", element_id
    )


def open_at(page, url):
    page.goto(url)
    page.wait_for_selector("#pmg-host")


# ---------------------------------------------------------------- loading


def test_script_loads_on_every_page(page, errors):
    for url in (GALLERY, PHOTO_101, EDIT_101, ADD):
        open_at(page, url)
        assert page.locator("#pmg-host").count() == 1, url
    assert errors == []


# ---------------------------------------------------------------- selection


def test_select_a_pair_by_clicking_photos(page, errors):
    open_at(page, GALLERY)
    page.keyboard.press("KeyS")
    page.locator('img[src*="/s/101.jpg"]').click()
    page.locator('img[src*="/s/102.jpg"]').click()
    assert json.loads(get_storage(page, "front"))["id"] == "101"
    assert json.loads(get_storage(page, "rear"))["id"] == "102"
    assert errors == []


def test_escape_cancels_selection(page):
    open_at(page, GALLERY)
    page.keyboard.press("KeyS")
    assert "Cancel" in ui_text(page, "sel")
    page.keyboard.press("Escape")
    assert "Cancel" not in ui_text(page, "sel")


# ---------------------------------------------------------------- edit page


def test_fill_description_on_edit_page(page, errors):
    open_at(page, GALLERY)
    set_storage(page, pair_values())
    open_at(page, EDIT_101)
    page.keyboard.press("KeyF")
    value = page.locator('textarea[name="dop"]').input_value()
    assert "R E A R   V I E W" in value
    assert "nomer102" in value
    assert "AB 123 rear" in value
    assert json.loads(get_storage(page, "filled")) == ["101"]
    assert errors == []


def test_auto_edit_opens_edit_page(page):
    open_at(page, GALLERY)
    set_storage(page, {**pair_values(), "autoEdit": "1"})
    open_at(page, PHOTO_101)
    page.wait_for_url(re.compile(r"edit_dopol\.php\?id=101"))


def test_back_to_gallery_when_pair_is_done(page):
    open_at(page, GALLERY)
    set_storage(
        page,
        {
            **pair_values(),
            "filled": '["101","102"]',
            "returnPending": "1",
            "lastGallery": GALLERY,
        },
    )
    open_at(page, PHOTO_102)
    page.wait_for_url(GALLERY)


# ---------------------------------------------------------------- likes and pages


def test_like_all_hearts_on_page(page, errors):
    open_at(page, GALLERY)
    page.keyboard.press("KeyL")
    page.wait_for_function("() => document.querySelectorAll('i.rating.fa-heart-o').length === 0")
    assert errors == []


def test_pagination_keys_move_between_pages(page):
    open_at(page, GALLERY)
    page.keyboard.press("KeyD")
    page.wait_for_url(GALLERY_P2)
    page.keyboard.press("KeyA")
    page.wait_for_url(GALLERY)


def test_like_several_pages_in_a_row(page, errors):
    open_at(page, GALLERY)
    set_storage(page, {"pages": "2"})
    page.reload()  # the panel reads its settings when it loads
    page.wait_for_selector("#pmg-host")
    page.keyboard.press("KeyL")
    page.wait_for_url(GALLERY_P2)
    page.wait_for_function("() => document.querySelectorAll('i.rating.fa-heart-o').length === 0", timeout=15000)
    page.wait_for_function("() => localStorage.getItem('pmg_likeRun') === 'null'", timeout=15000)
    assert errors == []


# ---------------------------------------------------------------- batch upload


def _png_files(tmp_path, names):
    paths = []
    for name in names:
        p = tmp_path / name
        p.write_bytes(PNG)
        paths.append(p)
    return paths


def test_batch_upload_opens_one_tab_per_photo(page, ctx, tmp_path, errors):
    page.clock.install()   # fake timers: the delay between two tabs passes at once
    open_at(page, GALLERY)
    set_storage(page, {"qDelay": "5"})
    page.keyboard.press("KeyU")
    manager = page.locator("#pmg-batch #fMulti")
    manager.set_input_files(_png_files(tmp_path, ["a.png", "b.png"]))
    page.wait_for_function(
        "() => document.getElementById('pmg-batch').shadowRoot.querySelectorAll('.card').length === 2",
        timeout=15000,
    )
    cards = page.locator("#pmg-batch .card")
    cards.nth(0).click()
    page.keyboard.press("Digit3")  # FR
    cards.nth(1).click()
    page.keyboard.press("Digit2")  # DE
    page.keyboard.press("Escape")  # closes the manager (the selection is empty)

    opened = []
    ctx.on("page", lambda p: opened.append(p.url))
    page.keyboard.press("KeyN")
    # the second tab opens after the delay (5 s here, with jitter): move the clock past it
    page.clock.run_for(12000)
    page.wait_for_function("() => true")
    for _ in range(50):
        if len(opened) >= 2:
            break
        page.wait_for_timeout(50)
    urls = " ".join(opened)
    assert "/fr/add#pmg=" in urls
    assert "/de/add#pmg=" in urls
    assert errors == []


PIXELS = ("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFElEQVR4nGP8z8Dwn4EIwESMolGF"
          "9VAAAIw5BAYy2I+HAAAAAElFTkSuQmCC")


def lens_click(page):
    page.evaluate("() => document.getElementById('pmg-host').shadowRoot.getElementById('lensSearch').click()")


def lens_status(page):
    return page.evaluate("() => document.getElementById('pmg-host').shadowRoot.textContent")


GOOGLE_HOME = "https://www.google.com/?olud&src=pm"
BLANK_GIF = "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=="


def google_fake(ctx):
    """A Google page with the box and the button of search by image; the test reads what the script did to them."""
    from fake_site import inject
    html = ('<html><body><input type="text" jsname="W7hAGe" id="box">'
            '<div role="button" jsname="ZtOxCb" id="go" onclick="window.__go = 1"></div></body></html>')
    ctx.route("https://www.google.com/**", lambda r: r.fulfill(status=200, content_type="text/html", body=inject(html)))


def test_google_lens_button_opens_google_with_the_photo(page, ctx):
    google_fake(ctx)
    open_at(page, ADD)
    page.evaluate("(src) => { document.getElementById('zoomimg').src = src; }", PIXELS)
    page.wait_for_timeout(600)       # the photo is searched by itself once: this test is about the button
    with page.expect_popup() as popup:
        lens_click(page)
    popup.value.wait_for_load_state()
    assert popup.value.url == GOOGLE_HOME
    assert json.loads(page.evaluate("() => localStorage.getItem('gm_lens_image')")) == PIXELS


def test_a_photo_chosen_on_the_upload_page_is_searched_by_itself(page, ctx):
    google_fake(ctx)
    open_at(page, ADD)
    with page.expect_popup() as popup:
        page.evaluate("(src) => { document.getElementById('zoomimg').src = src; }", PIXELS)
    assert popup.value
    assert json.loads(page.evaluate("() => localStorage.getItem('gm_lens_image')")) == PIXELS


def test_a_photo_is_not_searched_by_itself_when_the_option_is_off(page, ctx):
    google_fake(ctx)
    open_at(page, ADD)
    set_storage(page, {"set_lens_auto": "0"})
    page.reload()
    page.wait_for_selector("#pmg-host")
    opened = []
    ctx.on("page", lambda p: opened.append(p))
    page.evaluate("(src) => { document.getElementById('zoomimg').src = src; }", PIXELS)
    page.wait_for_timeout(900)
    assert opened == []


def test_google_lens_button_says_when_there_is_no_photo(page):
    open_at(page, ADD)
    lens_click(page)
    assert "No photo on this page yet" in lens_status(page)


def test_the_lens_prompt_is_not_shown_in_the_panel(page):
    open_at(page, ADD)
    assert "You are a car expert" not in lens_status(page)


def test_the_google_side_puts_the_photo_in_the_box_and_starts_the_search(ctx):
    google_fake(ctx)
    p = ctx.new_page()
    p.add_init_script(f"localStorage.setItem('gm_lens_image', JSON.stringify({PIXELS!r}))")
    p.goto(GOOGLE_HOME)
    p.wait_for_function("() => window.__go === 1")
    assert p.evaluate("() => document.getElementById('box').value") == PIXELS
    assert p.evaluate("() => !!document.getElementById('pmg-host')") is False      # no panel on a Google page


def test_a_google_page_without_the_marker_is_left_alone(ctx):
    google_fake(ctx)
    p = ctx.new_page()
    p.add_init_script(f"localStorage.setItem('gm_lens_image', JSON.stringify({PIXELS!r}))")
    p.goto("https://www.google.com/")
    p.wait_for_timeout(600)
    assert p.evaluate("() => document.getElementById('box').value") == ""
