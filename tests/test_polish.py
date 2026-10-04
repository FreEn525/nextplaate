"""Panel and window details: keys while the panel has the focus, Ctrl+A, the in-window confirmation,
rebinding a key, and the layout on a small screen.

Run from the project root:  python -m pytest tests -q
"""
import pytest

from fake_site import PNG, route_site

GALLERY = "https://platesmania.com/fr/gallery.php"
PHOTO_101 = "https://platesmania.com/fr/nomer101"


@pytest.fixture
def page(browser):
    c = browser.new_context(viewport={"width": 1280, "height": 800})
    route_site(c)
    p = c.new_page()
    p.errors = []
    p.on("pageerror", lambda e: p.errors.append(str(e)))
    p.dialogs = []
    p.on("dialog", lambda d: (p.dialogs.append(d.message), d.dismiss()))
    yield p
    c.close()


def open_at(page, url):
    page.goto(url)
    page.wait_for_selector("#pmg-host")


def click_in_panel(page, element_id):
    page.evaluate(
        """(id) => document.getElementById('pmg-host').shadowRoot.getElementById(id).click()""", element_id
    )


def click_icon(page, drawer_id):
    page.evaluate(
        """(id) => [...document.getElementById('pmg-host').shadowRoot.querySelectorAll('.rbtn')]
            .find(b => b.dataset.drawer === id).click()""",
        drawer_id,
    )


def pair_selected(page):
    return page.evaluate("() => document.getElementById('pmg-host').shadowRoot.getElementById('sel').textContent")


def manager_cards(page):
    return page.evaluate("() => document.getElementById('pmg-batch').shadowRoot.querySelectorAll('.card').length")


def manager_selected(page):
    return page.evaluate(
        "() => document.getElementById('pmg-batch').shadowRoot.querySelectorAll('.card.sel').length"
    )


def add_two_photos(page, tmp_path):
    names = ["a.png", "b.png"]
    files = []
    for n in names:
        f = tmp_path / n
        f.write_bytes(PNG)
        files.append(f)
    page.locator("#pmg-batch #fMulti").set_input_files(files)
    page.wait_for_function(
        "() => document.getElementById('pmg-batch').shadowRoot.querySelectorAll('.card').length === 2", timeout=15000
    )


def test_ctrl_a_selects_all_after_clicking_a_checkbox(page, tmp_path):
    open_at(page, GALLERY)
    page.keyboard.press("KeyU")
    add_two_photos(page, tmp_path)
    # focus a checkbox first: it must not block the shortcut
    page.evaluate("() => document.getElementById('pmg-batch').shadowRoot.getElementById('mSub').focus()")
    page.keyboard.press("Control+KeyA")
    assert manager_selected(page) == 2


def test_s_works_when_the_panel_has_the_focus(page):
    open_at(page, GALLERY)
    click_icon(page, "gallery")
    page.evaluate("() => document.getElementById('pmg-host').shadowRoot.getElementById('prevPage').focus()")
    page.keyboard.press("KeyS")
    assert "Cancel" in pair_selected(page)


def test_clear_asks_inside_the_window_not_with_the_browser(page, tmp_path):
    open_at(page, GALLERY)
    page.keyboard.press("KeyU")
    add_two_photos(page, tmp_path)
    page.evaluate("() => document.getElementById('pmg-batch').shadowRoot.getElementById('mClear').click()")
    page.wait_for_function("() => !document.getElementById('pmg-batch').shadowRoot.getElementById('cfm').hidden")
    assert page.dialogs == []
    page.evaluate("() => document.getElementById('pmg-batch').shadowRoot.getElementById('cfmNo').click()")
    assert manager_cards(page) == 2
    page.evaluate("() => document.getElementById('pmg-batch').shadowRoot.getElementById('mClear').click()")
    page.evaluate("() => document.getElementById('pmg-batch').shadowRoot.getElementById('cfmYes').click()")
    page.wait_for_function("() => document.getElementById('pmg-batch').shadowRoot.querySelectorAll('.card').length === 0")


def test_a_key_can_be_rebound_from_the_shortcuts_drawer(page):
    open_at(page, GALLERY)
    click_icon(page, "keys")
    page.evaluate(
        """() => [...document.getElementById('pmg-host').shadowRoot.querySelectorAll('.kbrow')]
            .find(r => r.textContent.includes('Select photos')).querySelector('.kbkey').click()"""
    )
    page.keyboard.press("KeyJ")
    page.keyboard.press("KeyS")                     # the old key does nothing now
    assert "Cancel" not in pair_selected(page)
    page.keyboard.press("KeyJ")                     # the new one selects
    assert "Cancel" in pair_selected(page)
    assert page.evaluate("() => localStorage.getItem('pmg_kb_select')") == "KeyJ"


def test_panel_fits_a_small_screen(browser):
    c = browser.new_context(viewport={"width": 390, "height": 740})
    route_site(c)
    p = c.new_page()
    open_at(p, GALLERY)
    click_icon(p, "pair")
    box = p.evaluate(
        """() => { const d = document.getElementById('pmg-host').shadowRoot.getElementById('drawer').getBoundingClientRect();
                   return { left: d.left, right: d.right, width: d.width }; }"""
    )
    assert box["left"] >= 0 and box["right"] <= 390
    c.close()


def test_ctrl_a_still_works_when_the_site_swallows_keys(page, tmp_path):
    open_at(page, GALLERY)
    # a site script that stops every key before it reaches the bubble phase
    page.evaluate("() => document.addEventListener('keydown', e => e.stopPropagation())")
    page.keyboard.press("KeyU")
    add_two_photos(page, tmp_path)
    page.locator("#pmg-batch .card").first.click()
    page.keyboard.press("Control+KeyA")
    assert manager_selected(page) == 2


def test_shortcut_list_shows_the_real_keys(page):
    open_at(page, GALLERY)
    click_icon(page, "keys")
    keys = page.evaluate(
        "() => [...document.getElementById('pmg-host').shadowRoot.querySelectorAll('.kbkey:not(.static)')].map(b => b.textContent)"
    )
    assert "?" not in keys and "S" in keys and "U" in keys


def test_drawer_stays_open_while_selecting_and_lets_clicks_through(page):
    open_at(page, GALLERY)
    click_icon(page, "pair")
    page.keyboard.press("KeyS")
    assert not page.evaluate("() => document.getElementById('pmg-host').shadowRoot.getElementById('drawer').hidden")
    page.locator('img[src*="/s/101.jpg"]').click()
    stored = page.evaluate("() => localStorage.getItem('pmg_front')")
    assert stored and "101" in stored



def test_panel_status_stays_on_screen_on_a_phone(browser):
    c = browser.new_context(viewport={"width": 390, "height": 740})
    route_site(c)
    p = c.new_page()
    open_at(p, GALLERY)
    p.keyboard.press("KeyS")
    box = p.evaluate("() => { const r = document.getElementById('pmg-host').shadowRoot.getElementById('status').getBoundingClientRect(); return [r.left, r.right, innerWidth]; }")
    assert box[0] >= 0 and box[1] <= box[2]
    c.close()


def test_spamming_s_on_an_icon_leaves_no_focus_ring(page):
    open_at(page, GALLERY)
    click_icon(page, "pair")                        # the icon now has the focus
    for _ in range(4):
        page.keyboard.press("KeyS")
    focused = page.evaluate("() => document.getElementById('pmg-host').shadowRoot.activeElement")
    assert focused is None


def test_drawer_stays_open_after_reload(page):
    open_at(page, GALLERY)
    click_icon(page, "gallery")
    page.reload()
    page.wait_for_selector("#pmg-host")
    assert page.evaluate("() => !document.getElementById('pmg-host').shadowRoot.getElementById('drawer').hidden")
    assert page.evaluate("() => document.getElementById('pmg-host').shadowRoot.querySelector('.dsec:not([hidden])').dataset.drawer") == "gallery"


def test_page_text_cannot_be_highlighted_while_the_window_is_open(page, tmp_path):
    open_at(page, GALLERY)
    page.keyboard.press("KeyU")
    page.keyboard.press("Control+KeyA")
    assert page.evaluate("() => String(window.getSelection())") == ""


def test_ctrl_a_selects_photos_even_if_a_site_field_had_the_focus(page, tmp_path):
    open_at(page, GALLERY)
    page.evaluate("() => { const i = document.createElement('input'); i.id = 'siteSearch'; document.body.prepend(i); i.focus(); }")
    page.evaluate("() => document.getElementById('pmg-host').shadowRoot.getElementById('qOpen').click()")
    add_two_photos(page, tmp_path)
    page.keyboard.press("Control+KeyA")
    assert manager_selected(page) == 2


def test_ctrl_a_works_on_azerty_where_the_letter_a_has_the_code_keyq(page, tmp_path):
    open_at(page, GALLERY)
    page.keyboard.press("KeyU")
    add_two_photos(page, tmp_path)
    # what an AZERTY keyboard sends for Ctrl+A: the letter is a, the physical key is KeyQ
    page.evaluate("""() => document.body.dispatchEvent(new KeyboardEvent('keydown',
        { key: 'a', code: 'KeyQ', ctrlKey: true, bubbles: true, cancelable: true }))""")
    assert manager_selected(page) == 2


def test_back_to_my_gallery_button_works_without_automation(page):
    open_at(page, GALLERY)
    open_at(page, PHOTO_101)                       # remembers the gallery visited before
    page.evaluate("() => document.getElementById('pmg-host').shadowRoot.getElementById('backGallery').click()")
    page.wait_for_url(GALLERY)


def test_plate_check_counts_photos_already_on_the_site(page):
    open_at(page, "https://platesmania.com/fr/add")
    page.locator("#nomer").fill("AB123CD")
    page.wait_for_function(
        "() => /already on the site/.test(document.getElementById('pmg-host').shadowRoot.getElementById('plateResult').textContent)",
        timeout=10000)
    text = page.evaluate("() => document.getElementById('pmg-host').shadowRoot.getElementById('plateResult').textContent")
    assert text.startswith("2 photos")


def test_a_plate_checked_in_a_batch_tab_shows_on_its_card(page, tmp_path):
    open_at(page, GALLERY)
    page.keyboard.press("KeyU")
    add_two_photos(page, tmp_path)
    page.locator("#pmg-batch .card").first.click()
    page.keyboard.press("Digit3")                 # FR
    page.keyboard.press("Escape")
    page.keyboard.press("Escape")
    photo_id = page.evaluate("""() => new Promise(res => {
        const r = indexedDB.open('pmg-batch', 1);
        r.onsuccess = () => { const q = r.result.transaction('q').objectStore('q').getAll();
            q.onsuccess = () => res(q.result.find(x => x.country === "fr").id); };
    })""")
    # this tab is the one loading that photo: the batch knows it is current
    page.evaluate("(id) => sessionStorage.setItem('pmg_batch', JSON.stringify({ active: true, current: id, pendingSubmit: null, ts: Date.now() }))", photo_id)
    open_at(page, "https://platesmania.com/fr/add")
    page.locator("#nomer").fill("AB123CD")
    page.wait_for_function(
        "() => /already on the site/.test(document.getElementById('pmg-host').shadowRoot.getElementById('plateResult').textContent)",
        timeout=10000)
    page.wait_for_timeout(500)  # the result is saved in the queue
    page.evaluate("() => document.activeElement && document.activeElement.blur()")  # U typed in the form would not open the window
    page.keyboard.press("KeyU")
    page.wait_for_function("() => document.getElementById('pmg-batch').shadowRoot.querySelector('.dupbadge') !== null", timeout=10000)
    assert "2 already" in page.evaluate("() => document.getElementById('pmg-batch').shadowRoot.querySelector('.dupbadge').textContent")


def test_plate_is_written_in_the_search_format(page):
    open_at(page, "https://platesmania.com/fr/add")
    requests = []
    page.on("request", lambda r: requests.append(r.url) if "gallery.php" in r.url else None)
    page.locator("#nomer").fill("ab-123-cd")
    page.wait_for_function(
        "() => /already on the site/.test(document.getElementById('pmg-host').shadowRoot.getElementById('plateResult').textContent)",
        timeout=10000)
    assert any("nomer=AB-123-CD" in u for u in requests), requests