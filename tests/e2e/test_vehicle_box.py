"""The site's "brand and model" text box: same autocomplete, restyled, with a real clear button and a hint."""
import pytest

from fake_site import route_site


@pytest.fixture
def page(browser):
    c = browser.new_context(viewport={"width": 900, "height": 700})
    route_site(c)
    p = c.new_page()
    p.goto("https://platesmania.com/fr/add")
    p.wait_for_selector("#pmg-host")
    yield p
    c.close()


def test_the_box_has_a_short_label_a_placeholder_and_a_hint(page):
    assert page.evaluate("() => document.querySelector('label[for=markamodtype]').textContent") == "Brand and model"
    assert "brand or a model" in page.evaluate("() => document.getElementById('markamodtype').placeholder")
    assert "fills the brand and model menus" in page.evaluate("() => document.querySelector('.pmg-vbox .pmg-hint').textContent")


def test_the_field_is_full_width_and_as_high_as_our_controls(page):
    box = page.evaluate("() => { const i = document.getElementById('markamodtype'); const r = i.getBoundingClientRect(); return [Math.round(r.height), Math.round(r.width), Math.round(i.parentElement.getBoundingClientRect().width)]; }")
    assert box[0] == 38 and box[1] == box[2]                                                 # 38 px like the controls, the width of its column


def test_the_site_x_is_replaced_by_a_clear_button_inside_the_field(page):
    assert page.evaluate("() => getComputedStyle(document.querySelector('.pmg-vbox .ui-widget > span')).display") == "none"
    page.fill("#markamodtype", "golf")
    page.evaluate("() => document.querySelector('.pmg-clear').click()")
    assert page.evaluate("() => document.getElementById('markamodtype').value") == ""
    assert page.evaluate("() => document.activeElement.id") == "markamodtype"                  # ready to type again
    inside = page.evaluate("() => { const b = document.querySelector('.pmg-clear').getBoundingClientRect(), i = document.getElementById('markamodtype').getBoundingClientRect(); return b.right <= i.right + 1 && b.left >= i.left; }")
    assert inside


def test_the_suggestions_list_of_the_site_is_styled_like_the_rest(page):
    page.evaluate("""() => { const ul = document.createElement('ul'); ul.className = 'ui-autocomplete ui-menu'; ul.id = 'sug';
      const li = document.createElement('li'); li.className = 'ui-menu-item'; const d = document.createElement('div'); d.className = 'ui-menu-item-wrapper ui-state-active'; d.textContent = 'Volkswagen Golf';
      li.appendChild(d); ul.appendChild(li); document.body.appendChild(ul); }""")
    st = page.evaluate("() => { const ul = getComputedStyle(document.getElementById('sug')), d = getComputedStyle(document.querySelector('#sug .ui-menu-item-wrapper')); return [ul.borderRadius, ul.maxHeight, d.paddingLeft, d.fontWeight]; }")
    assert st == ["0px", "320px", "12px", "600"]


def test_no_horizontal_overflow_on_a_narrow_screen(page):
    page.set_viewport_size({"width": 320, "height": 700})
    page.wait_for_timeout(200)
    assert page.evaluate("() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1")
