"""Developer tools. They exist only in the dev build:
    node scripts/build.mjs --dev
    NEXTPLAATE_SCRIPT=nextplaate.dev.user.js python -m pytest tests/test_dev.py -q
"""
import os

import pytest

from fake_site import route_site

needs_dev = pytest.mark.skipif(os.environ.get("NEXTPLAATE_SCRIPT") != "nextplaate.dev.user.js",
                               reason="runs only against the dev build")


@needs_dev
def test_save_this_page_downloads_its_html(browser):
    c = browser.new_context()
    route_site(c)
    page = c.new_page()
    page.goto("https://platesmania.com/fr/add")
    page.wait_for_selector("#pmg-host")
    page.evaluate("() => document.getElementById('pmg-host').shadowRoot.querySelector('.rbtn[data-drawer=\"dev\"]').click()")
    with page.expect_download() as info:
        page.evaluate("() => document.getElementById('pmg-host').shadowRoot.getElementById('savePage').click()")
    assert info.value.suggested_filename.startswith("platesmania-fr_add")
    c.close()


@needs_dev
def test_developer_drawer_groups_and_status(browser):
    c = browser.new_context()
    route_site(c)
    page = c.new_page()
    page.goto("https://platesmania.com/fr/add")
    page.wait_for_selector("#pmg-host")
    page.evaluate("() => document.getElementById('pmg-host').shadowRoot.querySelector('.rbtn[data-drawer=\"dev\"]').click()")
    titles = page.evaluate("() => [...document.getElementById('pmg-host').shadowRoot.querySelectorAll('.dsec[data-drawer=\"dev\"] .gtitle')].map(e => e.textContent)")
    assert titles == ["Status", "Save the page", "Capture", "Plate test", "Database"]
    # the status box reads the dev store: nothing kept yet on a fresh profile
    page.wait_for_function("() => document.getElementById('pmg-host').shadowRoot.getElementById('devStatus').textContent.includes('Upload pages kept')")
    text = page.evaluate("() => document.getElementById('pmg-host').shadowRoot.getElementById('devStatus').textContent")
    assert "0 / 96" in text
    page.screenshot(path=os.environ.get("DEV_SHOT", "dev-drawer.png")) if os.environ.get("DEV_SHOT") else None
    c.close()


SEED_JS = """async ([key, value]) => {
  const db = await new Promise((res, rej) => { const r = indexedDB.open('nextplaate-dev', 1); r.onupgradeneeded = () => r.result.createObjectStore('kv'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
  await new Promise(res => { const t = db.transaction('kv', 'readwrite'); t.objectStore('kv').put(value, key); t.oncomplete = res; });
}"""
SHADOW = "document.getElementById('pmg-host').shadowRoot"


def _dev_page(browser):
    c = browser.new_context()
    route_site(c)
    page = c.new_page()
    page.goto("https://platesmania.com/fr/add")
    page.wait_for_selector("#pmg-host")
    page.evaluate(f"() => {SHADOW}.querySelector('.rbtn[data-drawer=\"dev\"]').click()")
    return c, page


@needs_dev
def test_load_database_file_adds_only_missing_plates(browser, tmp_path):
    c, page = _dev_page(browser)
    f = tmp_path / "plates-db.json"
    f.write_text('[{"country":"fr","category":"Mopeds","plate":"AB-123-CD","read":"AB-123-CD","count":2,"date":"2026-10-05T00:00:00Z"},'
                 '{"country":"fr","category":"Mopeds","plate":"EF-456-GH","read":"EF-456-GH","count":1,"date":"2026-10-05T00:00:00Z"}]', encoding="utf-8")
    page.locator("#pmg-host #dbFile").set_input_files(f)
    page.wait_for_function(f"() => {SHADOW}.getElementById('dbMsg').textContent.includes('Loaded')")
    assert "2 added, 0 already here" in page.evaluate(f"() => {SHADOW}.getElementById('dbMsg').textContent")
    page.locator("#pmg-host #dbFile").set_input_files(f)                     # the same file again: nothing is added twice
    page.wait_for_function(f"() => {SHADOW}.getElementById('dbMsg').textContent.includes('0 added')")
    c.close()


@needs_dev
def test_collect_takes_the_gallery_plates_of_missing_categories_only(browser):
    c, page = _dev_page(browser)
    search = '<select name="ctype"><option value="1">Cars</option><option value="2">Mopeds</option></select>'
    page.evaluate(SEED_JS, ["search:fr", search])
    page.evaluate(SEED_JS, ["page:fr", '<form id="frm"><select id="ctype"></select></form>'])
    page.evaluate(SEED_JS, ["db:fr|Cars|AA-111-AA", {"country": "fr", "category": "Cars", "plate": "AA-111-AA", "read": "AA-111-AA", "count": 3, "date": "2026-10-05T00:00:00Z"}])
    asked = []

    def gallery(route):
        asked.append(route.request.url)
        route.fulfill(status=200, content_type="text/html",
                      body='<html><body><img src="https://img1.platesmania.com/10/m/1.jpg" alt="XY-777-ZZ, Renault"></body></html>')
    c.route("**/fr/gallery.php?ctype=*", gallery)
    page.evaluate(f"() => {SHADOW}.getElementById('ptCollect').click()")
    page.wait_for_function(f"() => {SHADOW}.getElementById('ptMsg').textContent.startsWith('Finished')", timeout=20000)
    assert len(asked) == 1 and "ctype=2" in asked[0]          # Cars already has a plate: only Mopeds is asked
    page.evaluate(f"() => {SHADOW}.getElementById('dbRefresh') && 0")
    c.close()


@needs_dev
def test_the_status_box_does_not_read_the_saved_pages(browser):
    """The saved pages are 3 MB each: reading them all at every page load made the browser run out of memory."""
    c, page = _dev_page(browser)
    page.evaluate("""async () => {
      const db = await new Promise((res, rej) => { const r = indexedDB.open('nextplaate-dev', 1); r.onupgradeneeded = () => r.result.createObjectStore('kv'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
      for (let i = 0; i < 30; i++) {
        await new Promise(res => { const t = db.transaction('kv', 'readwrite'); t.objectStore('kv').put('x'.repeat(3 * 1024 * 1024) + i, 'page:t' + i); t.oncomplete = res; });
      }
    }""")
    page.reload()                                           # the panel counts what is kept when it loads
    page.wait_for_selector("#pmg-host")
    page.evaluate(f"() => {SHADOW}.querySelector('.rbtn[data-drawer=\"dev\"]').click()")
    page.wait_for_function(f"() => {SHADOW}.getElementById('devStatus').textContent.includes('Upload pages kept')")
    heap_mb = page.evaluate("() => performance.memory ? performance.memory.usedJSHeapSize / 1048576 : 0")
    assert heap_mb < 60, f"the dev panel holds {heap_mb:.0f} MB: it read the saved pages"   # 30 pages of 3 MB would be 90 MB or more
    c.close()
