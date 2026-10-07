"""The notice that comes up on joining the site when the script has a newer version (at most every 3 hours, never in the dev build)."""
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


def serve(ctx, version):
    def handler(route):
        ASKED.append(route.request.url)
        route.fulfill(status=200, content_type="text/x-userscript-meta", headers={"access-control-allow-origin": "*"}, body=f"// ==UserScript==\n// @version      {version}\n// ==/UserScript==\n")
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


@public_only
def test_a_newer_version_comes_up_as_a_notice_with_the_install_link(ctx):
    serve(ctx, "99.0")
    page = join(ctx)
    page.wait_for_function(f"() => {TOASTS} && {TOASTS}.querySelector('.t.update')", timeout=15000)
    assert notices(page) == [["NextPlaate 99.0 is available", "https://update.greasyfork.org/scripts/598722/NextPlaate.user.js"]]


@public_only
def test_the_same_version_says_nothing(ctx):
    serve(ctx, VERSION)
    page = join(ctx)
    page.wait_for_timeout(2500)
    assert notices(page) == [] and len(ASKED) == 1                                          # it looked, there is nothing to say


@public_only
def test_it_looks_once_in_three_hours_whatever_the_number_of_pages_and_tabs(ctx):
    serve(ctx, "99.0")
    page = join(ctx)
    page.wait_for_function(f"() => {TOASTS} && {TOASTS}.querySelector('.t.update')", timeout=15000)
    other = join(ctx)
    other.wait_for_timeout(2500)
    assert len(ASKED) == 1 and notices(other) == []


@public_only
def test_the_cross_says_not_again_for_this_version_and_a_later_one_comes_back(ctx):
    serve(ctx, "99.0")
    page = join(ctx)
    page.wait_for_function(f"() => {TOASTS} && {TOASTS}.querySelector('.t.update')", timeout=15000)
    page.evaluate(f"() => {TOASTS}.querySelector('.t.update .x').click()")
    assert page.evaluate("() => localStorage.getItem('pmg_update_dismissed')") == "99.0"
    page.evaluate("() => localStorage.setItem('pmg_update_checked', '0')")                  # three hours later
    page.reload()
    page.wait_for_selector("#pmg-host")
    page.wait_for_timeout(2500)
    assert notices(page) == [] and len(ASKED) == 2                                          # it looked again: same version, not shown again
    ASKED.clear()
    serve_newer = "99.1"
    ctx.unroute(META + "**")
    serve(ctx, serve_newer)
    page.evaluate("() => localStorage.setItem('pmg_update_checked', '0')")
    page.reload()
    page.wait_for_function(f"() => {TOASTS} && {TOASTS}.querySelector('.t.update')", timeout=15000)
    assert notices(page)[0][0] == "NextPlaate 99.1 is available"


@public_only
def test_a_failed_look_is_tried_again_in_half_an_hour_not_in_three_hours(ctx):
    ctx.route(META + "**", lambda r: r.abort())
    page = join(ctx)
    page.wait_for_function("() => { const at = +localStorage.getItem('pmg_update_checked'); return at > 0 && Date.now() - at > 2 * 3600000; }", timeout=20000)
    assert notices(page) == []


@public_only
def test_with_the_switch_off_nothing_is_asked(ctx):
    serve(ctx, "99.0")
    page = join(ctx, "localStorage.setItem('pmg_set_feature_updatenotice', '0')")
    page.wait_for_timeout(2500)
    assert ASKED == [] and notices(page) == []
