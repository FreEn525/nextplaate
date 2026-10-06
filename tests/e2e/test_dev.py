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
    assert titles == ["Status", "Save the page", "Capture", "Plate test", "Verify the reads", "Database", "Series collection", "Series check", "Regions collection"]
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


@needs_dev
def test_verify_the_reads_asks_the_site_and_searches_the_gallery_text_when_the_read_is_not_found(browser, tmp_path):
    c, page = _dev_page(browser)
    asked = []

    def gallery(route):
        url = route.request.url
        asked.append(url)
        count = 1 if "EL5+57CP" in url else 0        # the site knows the gallery text, not the read
        route.fulfill(status=200, content_type="text/html", body=f'<html><body><div class="breadcrumbs"><h1>License plates found <b>{count}</b></h1></div></body></html>')
    c.route("**/cz/gallery.php?*", gallery)
    f = tmp_path / "reads.json"
    f.write_text('[{"country":"cz","category":"Electric vehicles","plate":"EL5 57CP","read":"EL 557CP"}]', encoding="utf-8")
    page.locator("#pmg-host #vrFile").set_input_files(f)
    page.wait_for_function(f"() => {SHADOW}.getElementById('vrMsg').textContent.startsWith('Finished')", timeout=20000)
    assert any("EL+557CP" in u for u in asked) and any("EL5+57CP" in u for u in asked)   # the read first, then the gallery text
    assert "0 reads found, 1 not found" in page.evaluate(f"() => {SHADOW}.getElementById('vrMsg').textContent")
    c.close()


@needs_dev
def test_series_collection_reads_the_table_a_series_page_and_the_wildcard_with_your_number(browser):
    c, page = _dev_page(browser)
    # every country but France is already collected: the run asks only for France
    for cc in page.evaluate("() => Object.keys(nextplaateDev.seriesLinks)"):
        if cc != "fr":
            page.evaluate(SEED_JS, ["seriesrec:" + cc, {"country": cc, "tables": [], "page": None, "wildcard": None}])
    asked = []
    c.route("**/*", lambda r: (asked.append(r.request.url), r.fallback())[1] if "platesmania.com" in r.request.url else r.fallback())
    page.evaluate(f"() => {SHADOW}.getElementById('seriesGo').click()")
    page.wait_for_function(f"() => {SHADOW}.getElementById('seriesMsg').textContent.startsWith('Finished')", timeout=40000)
    urls = [u.replace("https://platesmania.com", "") for u in asked if "/fr/" in u]
    assert urls[0] == "/fr/series.php"                                                        # the table
    assert urls[1] == "/fr/series-HF-QQ-1"                                                    # a series page it leads to
    assert "usr=121559" in urls[2] and "nomer=AA" in urls[2]                                  # the wildcard search with your number
    page.evaluate(f"() => {SHADOW}.getElementById('seriesCheck').click()")
    page.wait_for_function(f"() => {SHADOW}.getElementById('seriesMsg').textContent.includes('with a series page')", timeout=10000)
    assert "1 with a series page" in page.evaluate(f"() => {SHADOW}.getElementById('seriesMsg').textContent")
    c.close()


@needs_dev
def test_series_collection_does_not_ask_again_for_what_is_collected(browser):
    c, page = _dev_page(browser)
    for cc in page.evaluate("() => Object.keys(nextplaateDev.seriesLinks)"):
        page.evaluate(SEED_JS, ["seriesrec:" + cc, {"country": cc, "tables": [], "page": None, "wildcard": None}])
    page.evaluate(f"() => {SHADOW}.getElementById('seriesGo').click()")
    page.wait_for_function(f"() => {SHADOW}.getElementById('seriesMsg').textContent.includes('Every country is collected')", timeout=10000)
    c.close()


@needs_dev
def test_series_check_summarises_per_country_and_does_not_ask_again(browser):
    c, page = _dev_page(browser)
    samples = page.evaluate("() => nextplaateDev.seriesSamples")
    assert len(samples) > 50 and all(len(v) <= 2 for v in samples.values())
    for cc, plates in samples.items():
        for i, plate in enumerate(plates):
            ok = cc == "fr" or (cc == "it" and i == 0)                 # fr: all found; it: one of two; the others: none
            page.evaluate(SEED_JS, [f"seriescheck:{cc}|{i}", {"country": cc, "plate": plate, "query": "x", "count": 3 if ok else 0, "plates": [], "found": ok, "ok": ok}])
    page.evaluate(f"() => {SHADOW}.getElementById('sckGo').click()")
    page.wait_for_function(f"() => {SHADOW}.getElementById('sckMsg').textContent.includes('Every sample is checked')", timeout=10000)
    page.evaluate(f"() => {SHADOW}.getElementById('sckCheck').click()")
    page.wait_for_function(f"() => {SHADOW}.getElementById('sckMsg').textContent.includes('Safe')", timeout=10000)
    text = page.evaluate(f"() => {SHADOW}.getElementById('sckMsg').textContent")
    assert "Safe: 1 (fr)" in text and "Mixed: it" in text
    c.close()


@needs_dev
def test_regions_collection_reads_the_menu_then_one_page_per_country(browser):
    c, page = _dev_page(browser)
    asked = []
    c.route("**/*", lambda r: (asked.append(r.request.url), r.fallback())[1] if "userreg.php" in r.request.url else r.fallback())
    page.evaluate(f"() => {SHADOW}.getElementById('rcGo').click()")
    page.wait_for_function(f"() => {SHADOW}.getElementById('rcMsg').textContent.startsWith('Finished')", timeout=60000)
    systems = [u.split("gallery=")[1].split("-")[0] for u in asked]
    assert systems[0] == "fr1" and sorted(set(systems[1:])) == ["de", "fr1", "lu", "rs"]                # the menu page, then one page per system
    page.evaluate(f"() => {SHADOW}.getElementById('rcCheck').click()")
    page.wait_for_function(f"() => {SHADOW}.getElementById('rcMsg').textContent.includes('4 of 4 systems collected')", timeout=10000)
    c.close()


MATCH_JS = """([regions, shapes, cc]) => {
  const r = nextplaateDev.regionMatch(regions.map((x, i) => ({ id: String(i), code: '', ...x })), shapes.map(n => ({ name: n, iso: '' })), cc);
  return { placed: [...r.placed].map(([id, v]) => [regions[+id].name, v.map(i => shapes[i])]), missing: r.missing.map(x => x.name), special: r.special.map(x => x.name) };
}"""


def match(page, regions, shapes, cc="xx"):
    return page.evaluate(MATCH_JS, [[{"name": r} if isinstance(r, str) else r for r in regions], shapes, cc])


@needs_dev
def test_the_matcher_places_by_name_then_by_near_name_then_by_prefix(browser):
    c, page = _dev_page(browser)
    r = match(page, ["Ain", "Mangistau Province", "Chuvash Republic", "Aachen Urban District"], ["Ain", "Mangystau Region", "Chuvashia", "Aachen, Staedteregion"])
    assert [p[1] for p in r["placed"]] == [["Ain"], ["Mangystau Region"], ["Chuvashia"], ["Aachen, Staedteregion"]]
    c.close()


@needs_dev
def test_the_matcher_reads_several_names_and_puts_the_bracketed_ones_last(browser):
    c, page = _dev_page(browser)
    r = match(page, ["Augsburg City, Augsburg Dist", "Saale District (Querfurt)", "Munich and Rosenheim Districts (Bad Aibling)"], ["Augsburg, Kreisfreie Stadt", "Augsburg, Landkreis", "Halle (Saale), Kreisfreie Stadt", "Saalekreis", "Rosenheim"])
    placed = dict((a, b) for a, b in r["placed"])
    assert placed["Augsburg City, Augsburg Dist"] == ["Augsburg, Kreisfreie Stadt", "Augsburg, Landkreis"]        # both names, both shapes
    assert placed["Saale District (Querfurt)"] == ["Saalekreis"]                                                  # not Halle (Saale): a bracket is read last
    assert placed["Munich and Rosenheim Districts (Bad Aibling)"] == ["Rosenheim"]
    c.close()


@needs_dev
def test_the_matcher_puts_a_city_on_all_its_districts_and_reads_letters_that_have_no_accent_form(browser):
    c, page = _dev_page(browser)
    r = match(page, ["Bratislava City", "Ørsta", "Łódź City"], ["District of Bratislava I", "District of Bratislava II", "Orsta nor", "Lodz"])
    placed = dict((a, b) for a, b in r["placed"])
    assert placed["Bratislava City"] == ["District of Bratislava I", "District of Bratislava II"]
    assert placed["Ørsta"] == ["Orsta nor"] and placed["Łódź City"] == ["Lodz"]
    c.close()


@needs_dev
def test_the_matcher_sets_apart_what_is_not_an_area_and_never_guesses_from_a_code_outside_the_iso_countries(browser):
    c, page = _dev_page(browser)
    r = match(page, ["Mopeds", "Historic vehicles", "Germany", "Ministry of Defence", {"name": "Bishkek City", "code": "B"}], ["Batken"], "kg")
    assert r["special"] == ["Mopeds", "Historic vehicles", "Germany", "Ministry of Defence"]
    assert r["missing"] == ["Bishkek City"] and r["placed"] == []                                                # B is Batken in ISO, not the plate code of Bishkek
    c.close()


@needs_dev
def test_the_matcher_uses_the_alias_table_of_the_country(browser):
    c, page = _dev_page(browser)
    r = match(page, ["Chechen Republic", "Primorye (Maritime) Krai"], ["Chechnya", "Primorsky Krai"], "ru")
    assert [p[1] for p in r["placed"]] == [["Chechnya"], ["Primorsky Krai"]]
    c.close()


@needs_dev
def test_the_matcher_puts_a_town_on_the_unit_wikidata_says_it_lies_in(browser):
    c, page = _dev_page(browser)
    r = match(page, ["Narita", "Caernarfon"], ["Chiba Prefecture", "Gwynedd"], "jp")
    assert [p[1] for p in r["placed"]] == [["Chiba Prefecture"]] and r["missing"] == ["Caernarfon"]          # the table is per country: Caernarfon is a British town
    r = match(page, ["Caernarfon"], ["Gwynedd"], "uk")
    assert [p[1] for p in r["placed"]] == [["Gwynedd"]]
    c.close()
