"""The notice that comes up when the script has a newer version, on joining the site and while a page stays open (about every 20 minutes, never in the dev build)."""
import os
import re
from pathlib import Path

import pytest

from fake_site import route_site

DEV = os.environ.get("NEXTPLAATE_SCRIPT") == "nextplaate.dev.user.js"
public_only = pytest.mark.skipif(DEV, reason="the dev build is not compared with the published script")
META = "https://update.greasyfork.org/scripts/598722/NextPlaate.meta.js"
TOASTS = "document.getElementById('pmg-toasts') && document.getElementById('pmg-toasts').shadowRoot"
ASKED = []
VERSION = re.search(r"@version\s+(\S+)", (Path(__file__).resolve().parents[2] / "src" / "meta" / "00-header.txt").read_text(encoding="utf-8")).group(1)


@pytest.fixture
def ctx(browser):
    c = browser.new_context()
    route_site(c)
    ASKED.clear()
    yield c
    c.close()


def header_of(version):
    return "// ==UserScript==" + chr(10) + f"// @version      {version}" + chr(10) + "// ==/UserScript==" + chr(10)


def serve(ctx, version):
    def handler(route):
        ASKED.append(route.request.url)
        route.fulfill(status=200, content_type="text/x-userscript-meta", headers={"access-control-allow-origin": "*"}, body=header_of(version))
    ctx.route(META + "**", handler)


def join(ctx, setup=""):
    page = ctx.new_page()
    if setup:
        page.add_init_script(setup)
    page.goto("https://platesmania.com/fr/gallery.php")
    page.wait_for_selector("#pmg-host")
    return page


def notices(page):
    return page.evaluate(f"() => {{ const r = {TOASTS}; return r ? [...r.querySelectorAll('.t.update .ti')].map(t => [t.textContent, t.getAttribute('href')]) : []; }}")


def toast_shown(page):
    page.wait_for_function(f"() => {TOASTS} && {TOASTS}.querySelector('.t.update')", timeout=15000)


@public_only
def test_a_newer_version_comes_up_as_a_notice_with_the_install_link(ctx):
    serve(ctx, "99.0")
    page = join(ctx)
    toast_shown(page)
    assert notices(page) == [["NextPlaate 99.0 is available", "https://update.greasyfork.org/scripts/598722/NextPlaate.user.js"]]


@public_only
def test_the_same_version_says_nothing(ctx):
    serve(ctx, VERSION)
    page = join(ctx)
    page.wait_for_timeout(2500)
    assert notices(page) == [] and len(ASKED) == 1                                          # it looked, there is nothing to say


@public_only
def test_it_looks_once_in_twenty_minutes_whatever_the_number_of_pages_and_tabs(ctx):
    serve(ctx, "99.0")
    page = join(ctx)
    toast_shown(page)
    other = join(ctx)
    other.wait_for_timeout(2500)
    assert len(ASKED) == 1 and notices(other) == []


@public_only
def test_the_cross_says_not_again_for_this_version_and_a_later_one_comes_back(ctx):
    serve(ctx, "99.0")
    page = join(ctx)
    toast_shown(page)
    page.evaluate(f"() => {TOASTS}.querySelector('.t.update .x').click()")
    assert page.evaluate("() => localStorage.getItem('pmg_update_dismissed')") == "99.0"
    page.evaluate("() => localStorage.setItem('pmg_update_due', '0')")                      # twenty minutes later
    page.reload()
    page.wait_for_selector("#pmg-host")
    page.wait_for_timeout(2500)
    assert notices(page) == [] and len(ASKED) == 2                                          # it looked again: same version, not shown again
    ctx.unroute(META + "**")
    serve(ctx, "99.1")
    page.evaluate("() => localStorage.setItem('pmg_update_due', '0')")
    page.reload()
    toast_shown(page)
    assert notices(page)[0][0] == "NextPlaate 99.1 is available"


@public_only
def test_a_failed_look_is_tried_again_in_ten_minutes(ctx):
    ctx.route(META + "**", lambda r: r.abort())
    page = join(ctx)
    page.wait_for_function("() => { const due = +localStorage.getItem('pmg_update_due') - Date.now(); return due > 8 * 60000 && due <= 10 * 60000 + 2000; }", timeout=20000)
    assert notices(page) == []


@public_only
def test_the_next_look_is_in_twenty_minutes_give_or_take_a_quarter_so_that_the_users_do_not_ask_together(ctx):
    serve(ctx, VERSION)
    page = join(ctx)
    page.wait_for_function("() => +localStorage.getItem('pmg_update_due') > Date.now()", timeout=15000)
    wait = page.evaluate("() => +localStorage.getItem('pmg_update_due') - Date.now()")
    assert 14 * 60000 <= wait <= 25 * 60000 + 2000


@public_only
def test_a_page_that_stays_open_looks_again_by_itself_and_announces_a_version_published_meanwhile(ctx):
    served = {"version": VERSION}

    def handler(route):
        ASKED.append(route.request.url)
        route.fulfill(status=200, content_type="text/x-userscript-meta", headers={"access-control-allow-origin": "*"}, body=header_of(served["version"]))
    ctx.route(META + "**", handler)
    page = join(ctx, "localStorage.setItem('pmg_gapScale', '0.004')")                        # the timer of five minutes runs every second or so under the test
    page.wait_for_function("() => +localStorage.getItem('pmg_update_due') > 0", timeout=15000)
    assert notices(page) == []
    served["version"] = "99.0"                                                                # a version is published while the page stays open
    page.evaluate("() => localStorage.setItem('pmg_update_due', '0')")                        # and the time of the next look has come
    toast_shown(page)
    assert notices(page)[0][0] == "NextPlaate 99.0 is available"


@public_only
def test_with_the_switch_off_nothing_is_asked(ctx):
    serve(ctx, "99.0")
    page = join(ctx, "localStorage.setItem('pmg_set_feature_updatenotice', '0')")
    page.wait_for_timeout(2500)
    assert ASKED == [] and notices(page) == []
