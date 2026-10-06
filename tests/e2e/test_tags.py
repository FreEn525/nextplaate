"""Tag picker: the site's 'Add tags' section replaced by a card of buttons; the site's own check boxes stay the truth."""
import json

import pytest

from fake_site import route_site

ADD = "https://platesmania.com/fr/add"
CARD = "document.getElementById('pmg-tags').shadowRoot"


@pytest.fixture
def ctx(browser):
    c = browser.new_context()
    route_site(c)
    yield c
    c.close()


def open_add(ctx):
    page = ctx.new_page()
    page.goto(ADD)
    page.wait_for_selector("#pmg-host")
    page.wait_for_selector("#pmg-tags")
    return page


def click_tag(page, name):
    page.evaluate(f"() => [...{CARD}.querySelectorAll('.taggroups .pill')].find(p => p.textContent === '{name}').click()")


def is_on(page, name):
    return page.evaluate(f"() => [...{CARD}.querySelectorAll('.taggroups .pill')].find(p => p.textContent === '{name}').classList.contains('on')")


def checked(page):
    return page.evaluate("() => [...document.querySelectorAll('#add-tags-picker input:checked')].map(i => i.name)")


def test_the_card_replaces_the_site_section_and_lists_every_tag_by_group(ctx):
    page = open_add(ctx)
    assert page.evaluate("() => document.getElementById('accordion-1').style.display") == "none"           # the site's section is hidden
    groups = page.evaluate(f"() => [...{CARD}.querySelectorAll('.taggroup')].map(g => [g.querySelector('.cat').textContent, [...g.querySelectorAll('.pill')].map(p => p.textContent)])")
    assert groups == [["Vehicle category", ["bus", "truck"]], ["Vehicle purpose", ["police", "taxicab"]]]
    assert page.evaluate("() => document.getElementById('pmg-tags').nextElementSibling.id") == "accordion-1"


def test_a_click_checks_the_real_box_and_the_site_counter_follows(ctx):
    page = open_add(ctx)
    click_tag(page, "police")
    assert checked(page) == ["CheckBox[23]"]
    assert page.evaluate("() => document.getElementById('add-tags-summary').textContent") == "Tags (1)"      # the site's own code saw the change
    assert is_on(page, "police")
    click_tag(page, "police")
    assert checked(page) == []
    assert not is_on(page, "police")


def test_chosen_tags_are_chips_that_remove_themselves(ctx):
    page = open_add(ctx)
    for name in ("bus", "taxicab"):
        click_tag(page, name)
    chips = page.evaluate(f"() => [...{CARD}.querySelectorAll('.tagrow .pill')].map(p => p.textContent.replace(/\\s+/g, ' ').trim())")
    assert chips == ["bus ×", "taxicab ×"]
    page.evaluate(f"() => {CARD}.querySelector('.tagrow .pill').click()")                                   # the chip of "bus"
    assert checked(page) == ["CheckBox[24]"]
    page.evaluate(f"() => {CARD}.querySelector('.tagrow .btn').click()")                                    # Clear
    assert checked(page) == []
    assert "No tag chosen" in page.evaluate(f"() => {CARD}.querySelector('.tagrow').textContent")


def test_the_search_box_filters_and_enter_chooses_the_first_match(ctx):
    page = open_add(ctx)
    page.evaluate(f"() => {{ const i = {CARD}.querySelector('input'); i.value = 'tru'; i.dispatchEvent(new Event('input')); }}")
    shown = page.evaluate(f"() => [...{CARD}.querySelectorAll('.taggroups .pill:not([hidden])')].map(p => p.textContent)")
    assert shown == ["truck"]
    assert page.evaluate(f"() => [...{CARD}.querySelectorAll('.taggroup')].filter(g => !g.hidden).length") == 1      # a group with no match is hidden
    page.evaluate(f"() => {CARD}.querySelector('input').dispatchEvent(new KeyboardEvent('keydown', {{ key: 'Enter', bubbles: true }}))")
    assert checked(page) == ["CheckBox[22]"]


def test_a_change_made_by_the_site_itself_shows_in_the_card(ctx):
    page = open_add(ctx)
    page.evaluate("() => { const i = document.getElementById('CheckBox21'); i.checked = true; i.dispatchEvent(new Event('change', { bubbles: true })); }")
    assert is_on(page, "bus")


def test_the_form_is_sent_with_the_chosen_boxes(ctx):
    page = open_add(ctx)
    click_tag(page, "truck")
    sent = page.evaluate("() => new URLSearchParams(new FormData(document.getElementById('frm'))).toString()")
    assert sent.count("CheckBox%5B22%5D") == 1 and "CheckBox%5B21%5D" not in sent


def submit(page):
    page.evaluate("() => document.getElementById('frm').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))")


def test_the_most_used_and_the_last_upload_are_one_click_away(ctx):
    page = open_add(ctx)
    for name in ("police", "taxicab"):
        click_tag(page, name)
    submit(page)
    page.reload()
    page.wait_for_selector("#pmg-tags")
    quick = page.evaluate(f"() => [...{CARD}.querySelectorAll('.tagquick .cat')].map(c => c.textContent)")
    assert quick == ["Most used", "Last upload"]
    page.evaluate(f"() => [...{CARD}.querySelectorAll('.tagquick .btn')].find(b => b.textContent === 'Use again').click()")
    assert sorted(checked(page)) == ["CheckBox[23]", "CheckBox[24]"]
    assert json.loads(page.evaluate("() => localStorage.getItem('pmg_tags_last')")) == ["23", "24"]


def test_the_first_visit_has_no_quick_rows(ctx):
    page = open_add(ctx)
    assert page.evaluate(f"() => {CARD}.querySelector('.tagquick').hidden")


def test_switching_the_feature_off_brings_the_site_section_back(ctx):
    page = ctx.new_page()
    page.goto(ADD)
    page.wait_for_selector("#pmg-host")
    page.evaluate("() => localStorage.setItem('pmg_set_feature_tags', '0')")
    page.reload()
    page.wait_for_selector("#pmg-host")
    page.wait_for_timeout(300)
    assert page.evaluate("() => !document.getElementById('pmg-tags')")
    assert page.evaluate("() => document.getElementById('accordion-1').style.display") != "none"


def test_the_card_has_no_close_button(ctx):
    page = open_add(ctx)
    assert page.evaluate(f"() => !{CARD}.querySelector('.iconbtn')")                                         # the site's picker is hidden: the card must stay
