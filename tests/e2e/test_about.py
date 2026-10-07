"""About: the signature in Settings, and the "What's new" window after an update."""
import pytest

from fake_site import route_site

PANEL = "document.getElementById('pmg-host').shadowRoot"
MODAL = "document.getElementById('pmg-whatsnew')"


@pytest.fixture
def ctx(browser):
    c = browser.new_context()
    route_site(c)
    yield c
    c.close()


def open_page(ctx, seen=None):
    page = ctx.new_page()
    page.goto("https://platesmania.com/fr/gallery.php")
    if seen is not None:
        page.evaluate("(v) => localStorage.setItem('pmg_seen_version', v)", seen)
        page.reload()
    page.wait_for_selector("#pmg-host")
    page.wait_for_timeout(300)
    return page


def test_a_first_install_shows_nothing_and_remembers_the_version(ctx):
    page = open_page(ctx)
    assert page.evaluate(f"() => !{MODAL}")
    assert page.evaluate("() => localStorage.getItem('pmg_seen_version')") == "5.11.10"


def test_after_an_update_the_window_opens_once(ctx):
    page = open_page(ctx, seen="5.8")
    assert page.evaluate(f"() => !!{MODAL}")
    title = page.evaluate(f"() => {MODAL}.shadowRoot.querySelector('h2').textContent")
    assert title == "What’s new in 5.11"
    sections = page.evaluate(f"() => [...{MODAL}.shadowRoot.querySelectorAll('.wn-section .cat')].map(e => e.textContent)")
    assert sections == ["New", "The panel", "Clearer pages", "On the upload page", "On profiles and series", "Good to know"]          # 5.11, 5.10, then 5.9 (seen 5.8)
    assert page.evaluate("() => localStorage.getItem('pmg_seen_version')") == "5.11.10"
    page.reload()
    page.wait_for_selector("#pmg-host")
    page.wait_for_timeout(300)
    assert page.evaluate(f"() => !{MODAL}")                                                 # not again


def test_the_window_closes_with_the_button_and_with_escape(ctx):
    page = open_page(ctx, seen="5.8")
    page.evaluate(f"() => [...{MODAL}.shadowRoot.querySelectorAll('button')].find(b => b.textContent === 'Close').click()")
    assert page.evaluate(f"() => !{MODAL}")
    page = open_page(ctx, seen="5.8")
    page.keyboard.press("Escape")
    assert page.evaluate(f"() => !{MODAL}")


def test_settings_has_the_signature_with_the_profile_link(ctx):
    page = open_page(ctx)
    page.evaluate(f"() => {PANEL}.querySelector('.rbtn[data-drawer=\"settings\"]').click()")
    text = page.evaluate(f"() => {PANEL}.querySelector('.dsec[data-drawer=\"settings\"]').textContent")
    assert "NextPlaate 5.11" in text and "© 2026 NextEnzzo" in text
    a = page.evaluate(f"() => {{ const a = [...{PANEL}.querySelectorAll('.dsec[data-drawer=\"settings\"] a')].find(x => x.textContent === 'NextEnzzo'); return [a.href, a.target, a.rel]; }}")
    assert a == ["https://platesmania.com/user121559", "_blank", "noopener noreferrer"]


def test_the_settings_button_opens_the_window_any_time(ctx):
    page = open_page(ctx)
    page.evaluate(f"() => {PANEL}.querySelector('.rbtn[data-drawer=\"settings\"]').click()")
    page.evaluate(f"() => {PANEL}.getElementById('aboutNew').click()")
    assert page.evaluate(f"() => !!{MODAL}")


def test_every_version_has_its_whats_new_entry():
    """Bumping @version without writing what is new would show an update window with nothing in it (or none at all)."""
    import re
    from pathlib import Path
    root = Path(__file__).resolve().parents[2]
    version = re.search(r"@version\s+(\S+)", (root / "src/meta/00-header.txt").read_text(encoding="utf-8")).group(1)
    first = re.search(r"WHATS_NEW = \[\{\s*version: '([^']+)'", (root / "src/lib/whatsnew.js").read_text(encoding="utf-8")).group(1)
    assert first == ".".join(version.split(".")[:2]), f"@version is {version} but the newest entry of src/lib/whatsnew.js is {first}"


def test_only_what_is_newer_than_the_version_seen_is_shown(ctx):
    page = open_page(ctx, seen="5.10.1")                                                       # a fix of 5.10: 5.11 is the news
    sections = page.evaluate(f"() => [...{MODAL}.shadowRoot.querySelectorAll('.wn-section .cat')].map(e => e.textContent)")
    assert sections == ["New"]


def test_a_fix_version_does_not_open_the_window(ctx):
    page = open_page(ctx, seen="5.11.1")                                                       # same minor version: a fix
    assert page.evaluate(f"() => !{MODAL}")
    assert page.evaluate("() => localStorage.getItem('pmg_seen_version')") == "5.11.10"
