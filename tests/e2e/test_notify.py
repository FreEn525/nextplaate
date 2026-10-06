"""Notification pop-ups: what is new on the site comes up as a notice, on any page, once."""
import pytest

from fake_site import route_site

TOASTS = "document.getElementById('pmg-toasts') && document.getElementById('pmg-toasts').shadowRoot"
ITEMS = []                                                                    # the list the site answers with, newest first
CARDS = []


def like(user, plate, minute):
    return (f'<li><div><i class="fa fa-heart"></i> <strong><a href="/user1{minute}">{user}</a></strong> <i class="fa fa-hand-o-right"></i> '
            f'<a href="/de/nomer{minute}">{plate}</a><p><small><time datetime="2026-10-05T01:{minute:02d}:00+03:00">x</time></small></p></div></li>')


@pytest.fixture
def page(browser):
    ITEMS.clear()
    CARDS.clear()
    c = browser.new_context(viewport={"width": 1280, "height": 900})
    route_site(c)
    c.route("https://platesmania.com/action2.php**", lambda r: r.fulfill(status=200, content_type="text/html", body="".join(ITEMS)))

    def profile(r):
        body = '<html><body><div class="container content profile"><div class="profile-notification-panel">' + "".join(CARDS) + "</div></div></body></html>"
        r.fulfill(status=200, content_type="text/html", body=body)

    c.route("https://platesmania.com/user121559", profile)
    p = c.new_page()
    p.goto("https://platesmania.com/fr/gallery.php")
    p.wait_for_selector("#pmg-host")
    yield p
    c.close()


def poll(page):
    page.evaluate("() => window.dispatchEvent(new Event('pmg-notify-poll'))")


def titles(page):
    return page.evaluate(f"() => {{ const r = {TOASTS}; return r ? [...r.querySelectorAll('.t .ti')].map(t => t.textContent) : []; }}")


def baseline(page):
    poll(page)
    page.wait_for_function("() => localStorage.getItem('pmg_notify_seen')", timeout=30000)


def test_what_is_there_at_the_first_look_is_not_announced(page):
    ITEMS[:] = [like("Aurel", "MZ HG 950", 9)]
    baseline(page)
    page.wait_for_timeout(500)
    assert titles(page) == []


def test_a_new_like_comes_up_as_a_notice_once(page):
    ITEMS[:] = [like("Aurel", "MZ HG 950", 9)]
    baseline(page)
    ITEMS.insert(0, like("Xenoore4", "VW 8372", 11))
    poll(page)
    page.wait_for_function(f"() => {TOASTS} && {TOASTS}.querySelector('.t.like')", timeout=30000)
    assert titles(page) == ["Xenoore4 liked VW 8372"]
    assert page.evaluate(f"() => {TOASTS}.querySelector('.t a.ti').getAttribute('href')") == "/de/nomer11"
    poll(page)
    page.wait_for_timeout(8000)
    assert titles(page) == ["Xenoore4 liked VW 8372"]                        # not shown again


def test_a_kind_you_switched_off_stays_quiet(page):
    ITEMS[:] = [like("Aurel", "MZ HG 950", 9)]
    baseline(page)
    page.evaluate("() => localStorage.setItem('pmg_set_notify_like', '0')")
    ITEMS.insert(0, like("Xenoore4", "VW 8372", 11))
    poll(page)
    page.wait_for_timeout(9000)
    assert titles(page) == []


def test_many_at_once_become_two_notices_and_a_count(page):
    ITEMS[:] = [like("Aurel", "MZ HG 950", 9)]
    baseline(page)
    for i in range(10, 15):
        ITEMS.insert(0, like(f"U{i}", f"AB {i}", i))
    poll(page)
    page.wait_for_function(f"() => {TOASTS} && {TOASTS}.querySelectorAll('.t').length === 3", timeout=30000)
    assert titles(page)[-1] == "3 more new notifications"


def test_a_new_private_message_comes_up(page):
    baseline(page)
    CARDS.append('<div class="profile-notification-card" data-notification-category="changes" data-notification-delete-id="77" data-notification-time="1791126970000">'
                 '<div class="profile-notification-card-title"><a href="/de/nomer5">TR AG 990</a></div><span class="profile-notification-card-type">Plate number change</span>'
                 '<div class="profile-notification-card-meta"><a href="/user67996">Corrosive</a></div></div>')
    poll(page)
    page.wait_for_function(f"() => {TOASTS} && {TOASTS}.querySelector('.t.message')", timeout=30000)
    assert titles(page) == ["Plate number change: TR AG 990"]


def test_the_cross_closes_a_notice(page):
    page.evaluate("() => { const b = document.getElementById('pmg-host').shadowRoot.getElementById('notifyTest'); b.click(); }")
    page.wait_for_function(f"() => {TOASTS} && {TOASTS}.querySelector('.t')")
    page.evaluate(f"() => {TOASTS}.querySelector('.t .x').click()")
    assert titles(page) == []
