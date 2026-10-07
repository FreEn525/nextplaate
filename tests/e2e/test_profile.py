"""Profile: the real uploads (the gallery of the member, whole and for the day)."""
import pytest

import fake_site
from fake_site import route_site

CARD = "document.getElementById('pmg-profile-card').shadowRoot"


@pytest.fixture
def ctx(browser):
    c = browser.new_context()
    route_site(c)
    fake_site.GALLERY_USR.clear()
    yield c
    c.close()


def open_profile(ctx):
    page = ctx.new_page()
    page.goto("https://platesmania.com/user121559")
    page.wait_for_function(f"() => document.getElementById('pmg-profile-card') && {CARD}.querySelector('.stat b:not(.blank)')", timeout=15000)
    return page


def test_the_card_shows_the_real_total_and_the_day(ctx):
    page = open_profile(ctx)
    stats = page.evaluate(f"() => [...{CARD}.querySelectorAll('.stat b')].map(b => b.textContent)")
    assert stats == ["731", "+2"]


def test_it_says_how_far_the_profile_figure_is(ctx):
    page = open_profile(ctx)
    text = page.evaluate(f"() => {CARD}.querySelector('.hint').textContent")
    assert "715" in text and "16 more" in text


def test_the_day_starts_at_half_past_three_local_time(ctx):
    open_profile(ctx)
    day = [q for q in fake_site.GALLERY_USR if "date1" in q][0]
    assert day["usr"] == ["121559"] and "tz_offset" in day
    d1, d2 = day["date1"][0], day["date2"][0]
    assert d1.endswith("03:30:00") and d2.endswith("03:30:00") and d1 != d2


def test_two_requests_only(ctx):
    open_profile(ctx)
    assert len(fake_site.GALLERY_USR) == 2


def test_the_link_to_the_days_photos_opens_a_new_tab(ctx):
    page = open_profile(ctx)
    a = page.evaluate(f"() => {{ const a = {CARD}.querySelector('a.btn'); return [a.target, a.rel, a.getAttribute('href')]; }}")
    assert a[0] == "_blank" and "noopener" in a[1] and a[2].startswith("/gallery.php?usr=121559&tz_offset=")


def test_with_the_feature_off_there_is_no_card(ctx):
    page = ctx.new_page()
    page.goto("https://platesmania.com/user121559")
    page.evaluate("() => localStorage.setItem('pmg_set_feature_profile', '0')")
    page.reload()
    page.wait_for_selector("#pmg-host")
    page.wait_for_timeout(500)
    assert page.evaluate("() => !document.getElementById('pmg-profile-card')")


def test_a_gallery_with_thousands_written_with_a_dot_is_counted(ctx):
    """The site writes 38.723 for a big gallery: the card must read it as 38723, not fail (member 101605)."""
    page = ctx.new_page()
    page.goto("https://platesmania.com/user101605")
    page.wait_for_function(f"() => document.getElementById('pmg-profile-card') && {CARD}.querySelector('.stat b:not(.blank)')", timeout=15000)
    assert page.evaluate(f"() => {CARD}.querySelector('.stat b').textContent") == "38 723"
    assert "38 723" in page.evaluate(f"() => {CARD}.querySelector('.hint').textContent") or "up to date" in page.evaluate(f"() => {CARD}.querySelector('.hint').textContent")
    assert "Not counted" not in page.evaluate(f"() => {CARD}.textContent")


def counting(page):
    asked = []
    page.on("request", lambda r: asked.append(r.url) if "/gallery.php?usr=" in r.url else None)
    return asked


def test_a_count_made_a_moment_ago_is_not_asked_again(ctx):
    page = ctx.new_page()
    page.goto("https://platesmania.com/user121559")
    page.wait_for_selector("#pmg-host")
    page.evaluate("() => localStorage.setItem('pmg_profile_counts_121559', JSON.stringify({ total: 700, today: 3, at: Date.now() - 60000 }))")
    asked = counting(page)
    page.reload()
    page.wait_for_function(f"() => document.getElementById('pmg-profile-card') && {CARD}.querySelector('.stat b:not(.blank)')", timeout=15000)
    assert page.evaluate(f"() => [...{CARD}.querySelectorAll('.stat b')].map(b => b.textContent)") == ["700", "+3"]
    page.wait_for_timeout(500)
    assert asked == []


def test_while_the_site_asks_to_wait_the_last_count_stays_and_try_now_asks_again(ctx):
    page = ctx.new_page()
    page.goto("https://platesmania.com/user121559")
    page.wait_for_selector("#pmg-host")
    page.evaluate("() => { localStorage.setItem('pmg_profile_counts_121559', JSON.stringify({ total: 700, today: 3, at: Date.now() - 3600000 })); localStorage.setItem('pmg_siteBlock', String(Date.now())); localStorage.setItem('pmg_siteBlockN', '1'); }")
    page.reload()
    page.wait_for_function(f"() => document.getElementById('pmg-profile-card') && /asked to wait/.test({CARD}.querySelector('.hint').textContent)", timeout=15000)
    assert page.evaluate(f"() => [...{CARD}.querySelectorAll('.stat b')].map(b => [b.textContent, b.classList.contains('stale')])") == [["700", True], ["+3", True]]
    hint = page.evaluate(f"() => {CARD}.querySelector('.hint').textContent")
    assert "Counted at" in hint and "tries again by itself at" in hint
    assert page.evaluate(f"() => [...{CARD}.querySelectorAll('.btn')].find(b => b.textContent === 'Try now') && true")
    page.evaluate(f"() => [...{CARD}.querySelectorAll('.btn')].find(b => b.textContent === 'Try now').click()")
    page.wait_for_function(f"() => {CARD}.querySelector('.stat b').textContent === '731'", timeout=20000)
    assert page.evaluate(f"() => {CARD}.querySelector('.stat b').classList.contains('stale')") is False
