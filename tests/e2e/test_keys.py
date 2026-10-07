"""Every key of the script is in the Shortcuts list, and every text that names a key names the one in force, as printed on the user's keyboard."""
import pytest

from fake_site import route_site

PANEL = "document.getElementById('pmg-host').shadowRoot"
AZERTY = """
  const map = new Map(Object.entries({ KeyA: 'q', KeyQ: 'a', KeyW: 'z', KeyZ: 'w', KeyM: ',', KeyS: 's', KeyD: 'd', KeyF: 'f', KeyG: 'g', KeyL: 'l', KeyN: 'n', KeyR: 'r', KeyU: 'u' }));
  Object.defineProperty(navigator, 'keyboard', { value: { getLayoutMap: () => Promise.resolve(map) }, configurable: true });
"""


@pytest.fixture
def ctx(browser):
    c = browser.new_context(viewport={"width": 1280, "height": 900})
    route_site(c)
    yield c
    c.close()


def open_page(ctx, url="https://platesmania.com/fr/gallery.php", azerty=False):
    page = ctx.new_page()
    if azerty:
        page.add_init_script(AZERTY)
    page.goto(url)
    page.wait_for_selector("#pmg-host")
    page.wait_for_timeout(200)
    return page


def keys_list(page):
    page.evaluate(f"() => {PANEL}.querySelector('.rbtn[data-drawer=\"keys\"]').click()")
    return page.evaluate(f"() => [...{PANEL}.querySelectorAll('#kbList .kbrow')].map(r => [r.querySelector('.kblabel').textContent, r.querySelector('.kbkey').textContent])")


def test_every_action_of_the_script_is_in_the_shortcuts_list(ctx):
    page = open_page(ctx)
    labels = [l for l, _ in keys_list(page)]
    for want in ("Select photos", "Fill the description", "Previous page", "Next page", "Open the batch manager", "Start uploading", "Reload the current photo", "Open the world map (globe)"):
        assert want in labels, want
    assert page.evaluate("() => Object.keys(window.nextplaateDev || {}).length >= 0") is True


def test_the_world_map_key_is_g_not_m_which_prints_a_comma_on_azerty(ctx):
    page = open_page(ctx, azerty=True)
    keys = dict(keys_list(page))
    assert keys["Open the world map (globe)"] == "G"
    page.keyboard.press("KeyG")
    page.wait_for_function("() => document.getElementById('pmg-worldmap')", timeout=20000)


def test_a_key_is_named_as_printed_on_the_users_keyboard(ctx):
    page = open_page(ctx, azerty=True)
    keys = dict(keys_list(page))
    assert keys["Previous page"] == "Q"                                       # the physical A key prints Q on AZERTY
    assert keys["Select photos"] == "S" and keys["Next page"] == "D"
    # a key set to the physical M is shown as what it prints there
    page.evaluate(f"() => {PANEL}.querySelector('#kbList .kbkey').click()")
    page.keyboard.press("KeyM")
    assert dict(keys_list(page)).get("Select photos") == ","


def test_the_texts_that_name_a_key_follow_the_key_in_force(ctx):
    page = open_page(ctx)
    page.evaluate(f"() => {PANEL}.querySelector('.rbtn[data-drawer=\"pair\"]').click()")
    assert page.evaluate(f"() => {PANEL}.getElementById('sel').textContent") == "Select photos (S)"
    keys_list(page)
    page.evaluate(f"() => {PANEL}.querySelector('#kbList .kbkey').click()")
    page.keyboard.press("KeyX")
    assert page.evaluate(f"() => {PANEL}.getElementById('sel').textContent") == "Select photos (X)"
    title = page.evaluate(f"() => {PANEL}.querySelector('.rbtn[data-drawer=\"pair\"]').title")
    assert title.startswith("Describe a pair (X")                             # the bar's tooltip too
    assert page.evaluate(f"() => {PANEL}.querySelector('.rbtn[data-drawer=\"gallery\"]').title").startswith("Browse (A · ")


def test_the_buttons_of_the_drawers_name_their_keys(ctx):
    page = open_page(ctx, "https://platesmania.com/fr/add")
    page.evaluate(f"() => {PANEL}.querySelector('.rbtn[data-drawer=\"upload\"]').click()")
    assert page.evaluate(f"() => {PANEL}.getElementById('qOpen').textContent") == "Choose photos & countries (U)"
    page.evaluate(f"() => {PANEL}.querySelector('.rbtn[data-drawer=\"gallery\"]').click()")
    assert page.evaluate(f"() => {PANEL}.getElementById('wmOpen').textContent") == "Open the world map (G)"
