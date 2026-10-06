"""The panel fits every screen: no drawer is wider than the room it has, from a 320 px phone to a desktop."""
import pytest

from fake_site import route_site

ADD = "https://platesmania.com/fr/add"
ROOT = "document.getElementById('pmg-host').shadowRoot"

# elements wider than their own box (and not scrolling by design) = something pushes the layout
OVERFLOW = """() => {
  const out = [];
  for (const el of document.getElementById('pmg-host').shadowRoot.querySelectorAll('.drawer *')) {
    const cs = getComputedStyle(el);
    if (el.offsetParent === null || el.clientWidth === 0 || cs.overflowX !== 'visible') continue;
    if (el.scrollWidth > el.clientWidth + 1) out.push(el.tagName.toLowerCase() + '.' + el.className + ' ' + el.scrollWidth + '>' + el.clientWidth);
  }
  return out;
}"""


@pytest.fixture
def ctx(browser):
    c = browser.new_context()
    route_site(c)
    yield c
    c.close()


@pytest.mark.parametrize("width", [320, 360, 768, 1280])
def test_no_drawer_overflows(ctx, width):
    page = ctx.new_page()
    page.set_viewport_size({"width": width, "height": 800})
    page.goto(ADD)
    page.wait_for_selector("#pmg-host")
    buttons = page.evaluate(f"() => {ROOT}.querySelectorAll('.rbtn').length")
    assert buttons >= 5
    for i in range(buttons):
        page.evaluate(f"(i) => {{ const b = [...{ROOT}.querySelectorAll('.rbtn')][i]; if (b.getAttribute('aria-pressed') !== 'true') b.click(); }}", i)
        page.wait_for_timeout(150)
        assert page.evaluate(OVERFLOW) == [], f"drawer {i} at {width}px"
        assert page.evaluate("() => document.documentElement.scrollWidth <= window.innerWidth + 1")
