"""Settings: a feature can be switched off, and the panel still works on every kind of page."""
import pytest

from fake_site import route_site

GALLERY = "https://platesmania.com/fr/gallery.php"
PHOTO = "https://platesmania.com/fr/nomer101"
EDIT = "https://platesmania.com/fr/edit_dopol.php?id=101"
ADD = "https://platesmania.com/fr/add"
FEATURES = ["selection", "details", "description", "likes", "pages", "plate", "shortcuts", "lens", "flags", "preview", "tags", "upload"]
SHADOW = "document.getElementById('pmg-host').shadowRoot"


def new_page(browser, off=()):
    c = browser.new_context()
    route_site(c)
    if off:
        c.add_init_script("".join(f"localStorage.setItem('pmg_set_feature_{f}', '0');" for f in off))
    page = c.new_page()
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    return c, page, errors


def titles(page):
    return page.evaluate(f"() => [...{SHADOW}.querySelectorAll('.gtitle')].map(e => e.textContent)")


def test_every_feature_is_listed_and_on_by_default(browser):
    c, page, errors = new_page(browser)
    page.goto(GALLERY)
    page.wait_for_selector("#pmg-host")
    listed = page.evaluate(f"() => [...{SHADOW}.querySelectorAll('#setList input')].map(i => [i.id, i.checked])")
    assert [i for i, _ in listed] == ["set_feature_" + f for f in FEATURES]
    assert all(on for _, on in listed)
    assert errors == []
    c.close()


def test_switching_a_feature_off_removes_its_group(browser):
    c, page, errors = new_page(browser, off=["lens"])
    page.goto(ADD)
    page.wait_for_selector("#pmg-host")
    assert "Google Lens" not in titles(page)
    assert "Plate check" in titles(page)
    c.close()


def test_a_feature_goes_off_with_what_it_needs(browser):
    c, page, errors = new_page(browser, off=["details"])
    page.goto(EDIT)
    page.wait_for_selector("#pmg-host")
    assert "Details" not in titles(page) and "Description" not in titles(page)
    text = page.evaluate(f"() => {SHADOW}.getElementById('setList').textContent")
    assert "off: it needs Location and hashtags" in text
    assert errors == []
    c.close()


def test_the_checkbox_keeps_the_choice_and_offers_to_reload(browser):
    c, page, errors = new_page(browser)
    page.goto(GALLERY)
    page.wait_for_selector("#pmg-host")
    page.evaluate(f"() => {SHADOW}.getElementById('set_feature_likes').click()")
    assert page.evaluate("() => localStorage.getItem('pmg_set_feature_likes')") == "0"
    assert page.evaluate(f"() => !{SHADOW}.getElementById('setApply').hidden")
    c.close()


@pytest.mark.parametrize("feature", FEATURES)
@pytest.mark.parametrize("url", [GALLERY, PHOTO, EDIT, ADD], ids=["gallery", "photo", "edit", "add"])
def test_nothing_breaks_with_one_feature_off(browser, feature, url):
    c, page, errors = new_page(browser, off=[feature])
    page.goto(url)
    page.wait_for_selector("#pmg-host")
    for key in ["KeyS", "KeyF", "KeyL", "KeyU", "Escape", "KeyD"]:     # every key of the script, with the feature off
        page.keyboard.press(key)
    page.keyboard.press("Escape")
    assert errors == []
    c.close()
