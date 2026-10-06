"""The panel in the order of use, each group with its sentence, and Settings telling what each feature does and where it works."""
import pytest

from fake_site import route_site

PANEL = "document.getElementById('pmg-host').shadowRoot"
GALLERY = "https://platesmania.com/fr/gallery.php"
EDIT_101 = "https://platesmania.com/fr/edit_dopol.php?id=101"


@pytest.fixture
def ctx(browser):
    c = browser.new_context()
    route_site(c)
    yield c
    c.close()


def open_at(ctx, url):
    page = ctx.new_page()
    page.goto(url)
    page.wait_for_selector("#pmg-host")
    return page


def test_the_bar_is_in_the_order_of_use_and_named_for_what_you_do(ctx):
    page = open_at(ctx, "https://platesmania.com/fr/add")
    drawers = page.evaluate(f"() => [...{PANEL}.querySelectorAll('.rbtn')].map(b => [b.dataset.drawer, b.title])")
    assert [d for d, _ in drawers][:6] == ["search", "upload", "pair", "gallery", "keys", "settings"]
    assert [t.split(" (")[0] for _, t in drawers][:4] == ["Check a plate", "Send photos", "Describe a pair", "Browse"]


def test_the_steps_of_describing_a_pair_are_numbered(ctx):
    page = open_at(ctx, GALLERY)
    page.evaluate(f"() => {PANEL}.querySelector('.rbtn[data-drawer=\"pair\"]').click()")
    steps = page.evaluate(f"() => [...{PANEL}.querySelectorAll('.dsec[data-drawer=\"pair\"] .gabout')].map(p => p.textContent.split('.')[0])")
    assert steps == ["Step 1", "Step 2", "Step 3", "Step 4, optional"]


def test_every_group_of_the_working_drawers_says_what_it_is_for(ctx):
    page = open_at(ctx, "https://platesmania.com/fr/add")
    missing = page.evaluate(f"() => [...{PANEL}.querySelectorAll('.dsec:not([data-drawer=\"dev\"]):not([data-drawer=\"settings\"]) .group')].filter(g => !g.querySelector('.gabout')).map(g => g.querySelector('.gtitle').textContent)")
    assert missing == []


def test_settings_tells_what_each_feature_does_and_where_it_works(ctx):
    page = open_at(ctx, GALLERY)
    page.evaluate(f"() => {PANEL}.querySelector('.rbtn[data-drawer=\"settings\"]').click()")
    rows = page.evaluate(f"() => [...{PANEL}.querySelectorAll('#setList .chk')].map(l => [l.querySelector('b').textContent, !!l.querySelector('.fabout'), !!l.querySelector('.fscope')])")
    assert len(rows) >= 20 and all(a and s for _, a, s in rows), [r for r in rows if not (r[1] and r[2])]
    plate = [l for l in page.evaluate(f"() => [...{PANEL}.querySelectorAll('#setList .chk .fscope')].map(e => e.textContent)") if "96 countries" in l]
    assert plate and "795 checked exactly" in plate[0]
    series = page.evaluate(f"() => [...{PANEL}.querySelectorAll('#setList .chk')].find(l => l.querySelector('b').textContent === 'Series counter').querySelector('.fscope').textContent")
    assert "84 countries" in series


def test_the_description_without_a_pair_writes_your_details_only(ctx):
    page = open_at(ctx, EDIT_101)
    page.fill("textarea[name=dop]", "")
    page.evaluate("() => document.activeElement.blur()")                                     # the key is not for a text field
    page.keyboard.press("KeyF")
    value = page.locator('textarea[name="dop"]').input_value()
    assert "Mainz - Germany" in value and "#oldtimer" in value and "R E A R" not in value


def test_the_description_without_a_pair_never_overwrites_a_text(ctx):
    page = open_at(ctx, EDIT_101)
    page.fill("textarea[name=dop]", "my own words")
    page.evaluate("() => document.activeElement.blur()")
    page.keyboard.press("KeyF")
    assert page.locator('textarea[name="dop"]').input_value() == "my own words"
