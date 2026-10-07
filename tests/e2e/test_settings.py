"""Settings: a feature can be switched off, and the panel still works on every kind of page."""
import pytest

from fake_site import route_site

GALLERY = "https://platesmania.com/fr/gallery.php"
PHOTO = "https://platesmania.com/fr/nomer101"
EDIT = "https://platesmania.com/fr/edit_dopol.php?id=101"
ADD = "https://platesmania.com/fr/add"
FEATURES = ["selection", "details", "description", "pages", "plate", "shortcuts", "lens", "flags", "preview", "tags", "extra", "members", "floatupload", "lookup", "profile", "mine", "regions", "series", "registry", "worldmap", "profilestyle", "notify", "laststrip", "upload"]
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
    assert sorted(i for i, _ in listed) == sorted("set_feature_" + f for f in FEATURES)               # all of them, whatever the family they are under
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
    page.evaluate(f"() => {SHADOW}.getElementById('set_feature_pages').click()")
    assert page.evaluate("() => localStorage.getItem('pmg_set_feature_pages')") == "0"
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


def test_the_features_are_in_five_folded_families_with_their_count(browser):
    c, page, errors = new_page(browser)
    page.goto(GALLERY)
    page.wait_for_selector("#pmg-host")
    got = page.evaluate(f"() => [...{SHADOW}.querySelectorAll('#setList details.sgroup')].map(d => [d.querySelector('summary span').textContent, d.querySelector('.scount').textContent, d.open])")
    assert got == [["Send and describe photos", "8 of 8 on", False], ["Check a plate", "7 of 7 on", False], ["Browse", "3 of 3 on", False],
                   ["Profiles and the site", "5 of 5 on", False], ["The panel", "1 of 1 on", False]]
    assert page.evaluate(f"() => {SHADOW}.getElementById('setList').textContent.includes('null')") is False
    c.close()


def test_a_family_opens_stays_open_and_its_count_follows_a_switch(browser):
    c, page, errors = new_page(browser)
    page.goto(GALLERY)
    page.wait_for_selector("#pmg-host")
    page.evaluate(f"() => {SHADOW}.querySelector('#setList details.sgroup summary').click()")
    page.evaluate(f"() => {SHADOW}.getElementById('set_feature_tags').click()")                          # switched off: the list is drawn again
    got = page.evaluate(f"() => {{ const d = {SHADOW}.querySelector('#setList details.sgroup'); return [d.open, d.querySelector('.scount').textContent]; }}")
    assert got == [True, "7 of 8 on"]                                                                    # still open, one less
    page.reload()
    page.wait_for_selector("#pmg-host")
    assert page.evaluate(f"() => {SHADOW}.querySelector('#setList details.sgroup').open") is True       # remembered
    c.close()


def test_the_long_boxes_are_folded_by_their_title_and_it_is_remembered(browser):
    c, page, errors = new_page(browser)
    page.goto(GALLERY)
    page.wait_for_selector("#pmg-host")
    page.evaluate(f"() => {SHADOW}.querySelector('.rbtn[data-drawer=\"settings\"]').click()")
    box = f"[...{SHADOW}.querySelectorAll('section[data-drawer=\"settings\"] .group')].find(g => g.querySelector('.gtitle').textContent.startsWith('Country flags'))"
    assert page.evaluate(f"() => {{ const g = {box}; return [g.classList.contains('closed'), g.querySelector('.gbody').getClientRects().length]; }}") == [True, 0]       # folded by default
    page.evaluate(f"() => {box}.querySelector('.gtitle').click()")
    assert page.evaluate(f"() => {box}.classList.contains('closed')") is False
    page.reload()
    page.wait_for_selector("#pmg-host")
    page.evaluate(f"() => {SHADOW}.querySelector('.rbtn[data-drawer=\"settings\"]').click()")
    assert page.evaluate(f"() => {box}.classList.contains('closed')") is False                            # remembered
    c.close()


def test_the_boxes_of_settings_are_in_the_order_of_use_and_the_drawer_is_short(browser):
    c, page, errors = new_page(browser)
    page.goto(GALLERY)
    page.wait_for_selector("#pmg-host")
    page.evaluate(f"() => {SHADOW}.querySelector('.rbtn[data-drawer=\"settings\"]').click()")
    titles = page.evaluate(f"() => [...{SHADOW}.querySelectorAll('section[data-drawer=\"settings\"] .gtitle')].map(t => t.textContent)")
    assert titles == ["Features", "Notifications", "Lookup sites", "Official register", "Country flags: the side bar", "About"]
    assert page.evaluate(f"() => {SHADOW}.querySelector('.dbody').scrollHeight") < 1800                       # it was 4400 px
    c.close()
