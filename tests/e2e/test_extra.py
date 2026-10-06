"""Extra information: a tall card in the look of the panel in place of the site's small box, with a space above the tags card."""
import pytest

from fake_site import route_site

ADD = "https://platesmania.com/fr/add"
CARD = "document.getElementById('pmg-extra').shadowRoot"


@pytest.fixture
def ctx(browser):
    c = browser.new_context()
    route_site(c)
    yield c
    c.close()


def open_add(ctx, setup=None):
    page = ctx.new_page()
    page.goto(ADD)
    page.wait_for_selector("#pmg-host")
    if setup:
        page.evaluate(setup)
        page.reload()
        page.wait_for_selector("#pmg-host")
    page.wait_for_selector("#pmg-extra")
    return page


def type_in_card(page, text):
    page.evaluate(f"(t) => {{ const m = {CARD}.querySelector('textarea'); m.value = t; m.dispatchEvent(new Event('input', {{ bubbles: true }})); }}", text)


def test_the_card_replaces_the_site_box_and_is_tall_from_the_start(ctx):
    page = open_add(ctx)
    assert page.evaluate("() => document.querySelector('textarea[name=dop]').closest('.row').style.display") == "none"
    assert page.evaluate(f"() => {CARD}.querySelector('textarea').getBoundingClientRect().height") >= 175
    assert page.evaluate(f"() => {CARD}.querySelector('.hint').textContent") == "Specify the place of the spot"
    texts = page.evaluate(f"() => [{CARD}.querySelector('.hint').textContent, {CARD}.querySelector('textarea').placeholder, {CARD}.querySelector('.msg').textContent].filter(Boolean)")
    assert len(texts) == len(set(texts))                                                                    # no sentence shown twice


def test_what_is_typed_goes_into_the_site_box_and_the_form(ctx):
    page = open_add(ctx)
    seen = page.evaluate("() => { window.__input = 0; document.querySelector('textarea[name=dop]').addEventListener('input', () => window.__input++); return 1; }")
    type_in_card(page, "Mainz, near the station")
    assert page.evaluate("() => document.querySelector('textarea[name=dop]').value") == "Mainz, near the station"
    assert page.evaluate("() => window.__input") == 1                                                     # the site's own input event fired
    sent = page.evaluate("() => new URLSearchParams(new FormData(document.getElementById('frm'))).get('dop')")
    assert sent == "Mainz, near the station"


def test_what_the_site_writes_shows_in_the_card(ctx):
    page = open_add(ctx)
    page.evaluate("() => { const r = document.querySelector('textarea[name=dop]'); r.value = 'written by the site'; r.dispatchEvent(new Event('input', { bubbles: true })); }")
    assert page.evaluate(f"() => {CARD}.querySelector('textarea').value") == "written by the site"


def test_the_box_grows_with_the_text_and_counts_the_characters(ctx):
    page = open_add(ctx)
    before = page.evaluate(f"() => {CARD}.querySelector('textarea').getBoundingClientRect().height")
    type_in_card(page, "line\n" * 30)
    after = page.evaluate(f"() => {CARD}.querySelector('textarea').getBoundingClientRect().height")
    assert after > before
    assert page.evaluate(f"() => {CARD}.querySelector('.count').textContent") == "150 characters"


def test_the_saved_location_is_one_click_away(ctx):
    page = open_add(ctx, "() => localStorage.setItem('pmg_place', 'Mainz - Germany')")
    assert page.evaluate(f"() => {CARD}.querySelector('.cardrow .btn').textContent") == "Use my location: Mainz - Germany"
    type_in_card(page, "At the station")
    page.evaluate(f"() => {CARD}.querySelector('.cardrow .btn').click()")
    assert page.evaluate("() => document.querySelector('textarea[name=dop]').value") == "At the station\nMainz - Germany"


def test_without_a_saved_location_there_is_no_such_button(ctx):
    page = open_add(ctx)
    assert page.evaluate(f"() => {CARD}.querySelector('.cardrow .btn').hidden")                          # the default of Details is not a location of the user


def test_there_is_a_clear_space_between_this_card_and_the_tags_card(ctx):
    page = open_add(ctx)
    page.wait_for_selector("#pmg-tags")
    gap = page.evaluate("""() => {
      const a = document.getElementById('pmg-extra').getBoundingClientRect(), b = document.getElementById('pmg-tags').getBoundingClientRect();
      return b.top - a.bottom;
    }""")
    assert gap >= 16
    order = page.evaluate("() => document.getElementById('pmg-extra').compareDocumentPosition(document.getElementById('pmg-tags')) & Node.DOCUMENT_POSITION_FOLLOWING")
    assert order                                                                                            # extra information first, tags after


def test_switching_the_feature_off_brings_the_site_box_back(ctx):
    page = ctx.new_page()
    page.goto(ADD)
    page.wait_for_selector("#pmg-host")
    page.evaluate("() => localStorage.setItem('pmg_set_feature_extra', '0')")
    page.reload()
    page.wait_for_selector("#pmg-host")
    page.wait_for_timeout(300)
    assert page.evaluate("() => !document.getElementById('pmg-extra')")
    assert page.evaluate("() => document.querySelector('textarea[name=dop]').closest('.row').style.display") != "none"


# ---------------------------------------------------------------- the date of the photo

def show_exif(page, *dates):
    spans = "".join(f"<span onclick=\"appdop('{d}')\">{d}</span> " for d in dates)
    page.evaluate("(h) => { document.getElementById('fotodiv').innerHTML = h; }", spans)


def date_buttons(page):
    return page.evaluate(f"() => [...{CARD}.querySelectorAll('.cardrow .btn:not([hidden])')].map(b => b.textContent)")


def test_the_dates_of_the_photo_are_offered_once_it_has_some(ctx):
    page = open_add(ctx)
    assert date_buttons(page) == []                                                                       # no photo data: no date buttons
    show_exif(page, "2026.10.04 14:03:11", "2026.10.06 09:00:00")
    page.wait_for_function(f"() => [...{CARD}.querySelectorAll('.cardrow .btn:not([hidden])')].length >= 1", timeout=3000)
    assert date_buttons(page) == ["Date: October 2026", "4 October 2026"]                                # the earliest date: the shot


def test_a_date_button_adds_the_date_on_a_line_of_its_own(ctx):
    page = open_add(ctx)
    type_in_card(page, "At the station")
    show_exif(page, "2026.10.04 14:03:11")
    page.wait_for_function(f"() => {CARD}.querySelectorAll('.cardrow .btn:not([hidden])').length === 2", timeout=3000)
    page.evaluate(f"() => {CARD}.querySelectorAll('.cardrow .btn:not([hidden])')[0].click()")
    assert page.evaluate("() => document.querySelector('textarea[name=dop]').value") == "At the station\nOctober 2026"
    page.evaluate(f"() => {CARD}.querySelectorAll('.cardrow .btn:not([hidden])')[1].click()")
    assert page.evaluate("() => document.querySelector('textarea[name=dop]').value") == "At the station\nOctober 2026\n4 October 2026"


def test_a_date_with_colons_is_read_too_and_the_buttons_go_when_the_photo_changes(ctx):
    page = open_add(ctx)
    show_exif(page, "2025:12:31 23:59:59")
    page.wait_for_function(f"() => {CARD}.querySelectorAll('.cardrow .btn:not([hidden])').length === 2", timeout=3000)
    assert date_buttons(page) == ["Date: December 2025", "31 December 2025"]
    page.evaluate("() => { document.getElementById('fotodiv').innerHTML = ''; }")
    page.wait_for_function(f"() => {CARD}.querySelectorAll('.cardrow .btn:not([hidden])').length === 0", timeout=3000)
