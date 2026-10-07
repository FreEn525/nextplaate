"""A click on the logo of the panel: is there a newer version of the script on Greasy Fork?"""
import os

import pytest

from fake_site import route_site

DEV = os.environ.get("NEXTPLAATE_SCRIPT") == "nextplaate.dev.user.js"
public_only = pytest.mark.skipif(DEV, reason="the dev build is not compared with the published script")
MODAL = "document.getElementById('pmg-update').shadowRoot"
META = "https://update.greasyfork.org/scripts/598722/NextPlaate.meta.js"
ASKED = []


def meta(version):
    return f"// ==UserScript==\n// @name         NextPlaate\n// @version      {version}\n// ==/UserScript==\n"


@pytest.fixture
def ctx(browser):
    c = browser.new_context()
    route_site(c)
    ASKED.clear()
    yield c
    c.close()


def serve(ctx, version=None, status=200):
    def handler(route):
        ASKED.append(route.request.url)
        route.fulfill(status=status, content_type="text/x-userscript-meta", headers={"access-control-allow-origin": "*"}, body=meta(version or "0"))
    ctx.route(META + "**", handler)


def click_logo(ctx):
    page = ctx.new_page()
    page.goto("https://platesmania.com/fr/gallery.php")
    page.wait_for_selector("#pmg-host")
    page.wait_for_timeout(200)
    return page


def logo(page):
    page.evaluate("() => document.getElementById('pmg-host').shadowRoot.getElementById('logo').click()")


def text(page):
    page.wait_for_function(f"() => document.getElementById('pmg-update') && !{MODAL}.querySelector('.hint').textContent.startsWith('Checking')", timeout=10000)
    return page.evaluate(f"() => {MODAL}.querySelector('.hint').textContent")


@public_only
def test_nothing_is_asked_until_the_logo_is_clicked(ctx):
    serve(ctx, "99.0")
    page = click_logo(ctx)
    page.wait_for_timeout(500)
    assert ASKED == []


@public_only
def test_a_newer_version_offers_the_update(ctx):
    serve(ctx, "99.0")
    page = click_logo(ctx)
    logo(page)
    assert "Version 99.0 is available" in text(page)
    assert page.evaluate(f"() => !{MODAL}.querySelector('.btn:not(.ghost)').hidden")
    assert len(ASKED) == 1


@public_only
def test_the_update_button_opens_the_install_page(ctx):
    serve(ctx, "99.0")
    ctx.route("https://update.greasyfork.org/scripts/598722/NextPlaate.user.js", lambda r: r.fulfill(status=200, content_type="text/html", body="install page"))
    page = click_logo(ctx)
    logo(page)
    text(page)
    with ctx.expect_page() as popup:
        page.evaluate(f"() => {MODAL}.querySelector('.btn:not(.ghost)').click()")
    assert popup.value.url == "https://update.greasyfork.org/scripts/598722/NextPlaate.user.js"


@public_only
def test_the_same_or_an_older_version_says_you_have_the_latest(ctx):
    serve(ctx, "5.9.1")                                                                        # 5.10 is newer than 5.9.1: numbers, not text
    page = click_logo(ctx)
    logo(page)
    assert "You have the latest version" in text(page)
    assert page.evaluate(f"() => {MODAL}.querySelector('.btn:not(.ghost)').hidden")


@public_only
def test_a_failed_check_says_so_and_can_be_repeated(ctx):
    serve(ctx, None, status=503)
    page = click_logo(ctx)
    logo(page)
    assert "Could not check" in text(page)
    ctx.unroute(META)
    serve(ctx, "5.10")
    page.evaluate(f"() => [...{MODAL}.querySelectorAll('button')].find(b => b.textContent === 'Check again').click()")
    page.wait_for_function(f"() => {MODAL}.querySelector('.hint').textContent.includes('latest')", timeout=10000)


@pytest.mark.skipif(not DEV, reason="runs only against the dev build")
def test_the_dev_build_is_not_compared_with_the_published_script(ctx):
    serve(ctx, "99.0")
    page = click_logo(ctx)
    logo(page)
    assert "dev build" in text(page)
    assert ASKED == []


@public_only
def test_a_first_failure_is_tried_again_by_itself_at_a_new_address(ctx):
    """A request that fails once is often a hiccup, and a cache must not hide a version just published: three tries, a new address each."""
    def handler(route):
        ASKED.append(route.request.url)
        if len(ASKED) == 1:
            route.abort()
        else:
            route.fulfill(status=200, content_type="text/x-userscript-meta", headers={"access-control-allow-origin": "*"}, body=meta("99.0"))
    ctx.route(META + "**", handler)
    page = click_logo(ctx)
    logo(page)
    assert "Version 99.0 is available" in text(page)
    assert len(ASKED) == 2 and ASKED[0] != ASKED[1] and all("?t=" in u for u in ASKED)


@public_only
def test_the_update_window_has_one_close_button_not_two(ctx):
    serve(ctx, "99.0")
    page = click_logo(ctx)
    logo(page)
    text(page)
    labels = page.evaluate(f"() => [...{MODAL}.querySelectorAll('button')].map(b => b.textContent).filter(t => t === 'Close' || t === 'Got it')")
    assert labels == ["Close"]
