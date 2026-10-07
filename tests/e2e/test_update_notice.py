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


INSTALL = "https://update.greasyfork.org/scripts/598722/NextPlaate.user.js"


@public_only
def test_a_page_still_on_the_old_version_offers_to_reload_when_another_tab_runs_a_newer_one(ctx):
    serve(ctx, VERSION)
    old = join(ctx)
    old.evaluate("() => { window.__same_page = 1; }")
    newer = join(ctx)                                                                        # a page opened after the update runs the new version and says so
    newer.evaluate("() => localStorage.setItem('pmg_running_version', '99.0')")
    toast_shown(old)
    assert notices(old)[0][0] == "NextPlaate 99.0 is installed"
    old.evaluate(f"() => {TOASTS}.querySelector('.t.update .ti').click()")
    old.wait_for_function("() => window.__same_page === undefined", timeout=15000)           # it reloaded: the page is a new one
    old.wait_for_selector("#pmg-host")


@public_only
def test_every_page_writes_the_version_it_runs_and_never_lowers_it(ctx):
    serve(ctx, VERSION)
    page = join(ctx)
    assert page.evaluate("() => localStorage.getItem('pmg_running_version')") == VERSION
    page.evaluate("() => localStorage.setItem('pmg_running_version', '99.0')")
    page.reload()
    page.wait_for_selector("#pmg-host")
    assert page.evaluate("() => localStorage.getItem('pmg_running_version')") == "99.0"


@public_only
def test_after_the_install_link_the_page_offers_to_reload_when_it_comes_back_into_view(ctx):
    serve(ctx, "99.0")
    ctx.route(INSTALL, lambda r: r.fulfill(status=200, content_type="text/plain", body=""))
    page = join(ctx)
    toast_shown(page)
    page.evaluate(f"() => {TOASTS}.querySelector('.t.update .ti').click()")                  # the install page opens in a new tab
    page.evaluate("() => document.dispatchEvent(new Event('visibilitychange'))")             # the person comes back to this one
    page.wait_for_function(f"() => [...{TOASTS}.querySelectorAll('.t.update .ti')].some(t => t.textContent === 'Updated NextPlaate?')", timeout=15000)


@public_only
def test_the_cross_does_not_count_as_an_install(ctx):
    serve(ctx, "99.0")
    page = join(ctx)
    toast_shown(page)
    page.evaluate(f"() => {TOASTS}.querySelector('.t.update .x').click()")
    page.evaluate("() => document.dispatchEvent(new Event('visibilitychange'))")
    page.wait_for_timeout(1500)
    assert notices(page) == []


def open_update_window(page):
    page.evaluate("() => document.getElementById('pmg-host').shadowRoot.getElementById('logo').click()")
    page.wait_for_function("() => document.getElementById('pmg-update') && !document.getElementById('pmg-update').shadowRoot.querySelector('.hint').textContent.startsWith('Checking')", timeout=10000)


def close_toast_with_the_cross(page):
    page.evaluate(f"() => {TOASTS}.querySelector('.t.update .x').click()")


@public_only
def test_seeing_the_newer_version_in_the_update_window_is_remembered_and_shared_with_the_notice(ctx):
    serve(ctx, "99.0")
    page = join(ctx, "localStorage.setItem('pmg_set_feature_updatenotice', '0')")
    open_update_window(page)
    assert page.evaluate("() => localStorage.getItem('pmg_update_pending')") == "99.0"
    wait = page.evaluate("() => +localStorage.getItem('pmg_update_due') - Date.now()")
    assert 15 * 60000 <= wait <= 20 * 60000 + 2000                                           # the window looked: the notice does not ask again at once


@public_only
def test_the_update_button_clears_the_reminder(ctx):
    serve(ctx, "99.0")
    ctx.route(INSTALL, lambda r: r.fulfill(status=200, content_type="text/plain", body=""))
    page = join(ctx, "localStorage.setItem('pmg_set_feature_updatenotice', '0')")
    open_update_window(page)
    page.evaluate("() => document.getElementById('pmg-update').shadowRoot.querySelector('.btn:not(.ghost)').click()")
    assert page.evaluate("() => localStorage.getItem('pmg_update_pending')") == ""


@public_only
def test_a_person_who_saw_the_update_and_did_not_install_is_reminded_after_six_hours_even_after_the_cross(ctx):
    serve(ctx, "99.0")
    page = join(ctx, "localStorage.setItem('pmg_update_pending', '99.0')")
    toast_shown(page)
    close_toast_with_the_cross(page)
    wait = page.evaluate("() => +localStorage.getItem('pmg_update_remind_at') - Date.now()")
    assert 5.9 * 3600000 <= wait <= 6 * 3600000 + 2000
    page.evaluate("() => localStorage.setItem('pmg_update_due', '0')")
    page.reload()
    page.wait_for_selector("#pmg-host")
    page.wait_for_timeout(2500)
    assert notices(page) == []                                                               # six hours have not passed
    page.evaluate("() => { localStorage.setItem('pmg_update_due', '0'); localStorage.setItem('pmg_update_remind_at', '1'); }")
    page.reload()
    toast_shown(page)
    assert notices(page)[0][0] == "NextPlaate 99.0 is available"


@public_only
def test_without_the_update_window_the_cross_stays_for_good(ctx):
    serve(ctx, "99.0")
    page = join(ctx)
    toast_shown(page)
    close_toast_with_the_cross(page)
    assert page.evaluate("() => localStorage.getItem('pmg_update_remind_at')") is None
    page.evaluate("() => { localStorage.setItem('pmg_update_due', '0'); localStorage.setItem('pmg_update_remind_at', '1'); }")
    page.reload()
    page.wait_for_selector("#pmg-host")
    page.wait_for_timeout(2500)
    assert notices(page) == []
