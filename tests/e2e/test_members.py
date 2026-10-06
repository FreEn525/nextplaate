"""Member shortcuts: profile picture and name of members you go to, one click to their page; in the panel and on a profile."""
import json

import pytest

from fake_site import route_site

PANEL = "document.getElementById('pmg-host').shadowRoot"
BAR = "document.getElementById('pmg-members').shadowRoot"
ME = "https://platesmania.com/user121559"
OTHER = "https://platesmania.com/user121546"


@pytest.fixture
def ctx(browser):
    from fake_site import PNG
    c = browser.new_context()
    route_site(c)
    c.route("https://forum.platesmania.com/**", lambda r: r.fulfill(status=200, content_type="image/png", body=PNG))      # the members' pictures
    yield c
    c.close()


def open_page(ctx, url, width=1280, members=None):
    page = ctx.new_page()
    page.set_viewport_size({"width": width, "height": 900})
    page.goto(url)
    page.wait_for_selector("#pmg-host")
    if members is not None:
        page.evaluate("(v) => localStorage.setItem('pmg_members', v)", json.dumps(members))
        page.reload()
        page.wait_for_selector("#pmg-host")
    page.wait_for_timeout(200)
    return page


def stored(page):
    return json.loads(page.evaluate("() => localStorage.getItem('pmg_members') || '[]'"))


SAMPLE = [{"id": "121546", "name": "dudujdfm", "avatar": "https://forum.platesmania.com/data/avatars/l/121/121546.jpg"},
          {"id": "67996", "name": "someone", "avatar": ""}]


def test_add_this_member_keeps_the_picture_the_name_and_the_number(ctx):
    page = open_page(ctx, OTHER)
    page.evaluate(f"() => {BAR}.querySelector('.box > .btn').click()")
    assert stored(page) == [{"id": "121546", "name": "member121546", "avatar": "https://forum.platesmania.com/data/avatars/l/121/121546.jpg"}]
    assert page.evaluate(f"() => {BAR}.querySelector('.box > .btn').textContent") == "Remove this member"


def test_a_shortcut_is_the_picture_and_the_name_and_leads_to_the_member_page(ctx):
    page = open_page(ctx, ME, members=SAMPLE)
    links = page.evaluate(f"() => [...{BAR}.querySelectorAll('a.member')].map(a => [a.getAttribute('href'), a.querySelector('.mname').textContent, !!a.querySelector('img')])")
    assert links == [["/user121546", "dudujdfm", True], ["/user67996", "someone", False]]            # no picture saved: the initial instead
    page.evaluate(f"() => {BAR}.querySelector('a.member').click()")
    page.wait_for_url(OTHER)


def test_the_member_of_the_page_is_marked(ctx):
    page = open_page(ctx, OTHER, members=SAMPLE)
    assert page.evaluate(f"() => [...{BAR}.querySelectorAll('a.member.on')].map(a => a.getAttribute('href'))") == ["/user121546"]


def test_a_shortcut_can_be_removed_and_the_list_says_so_when_empty(ctx):
    page = open_page(ctx, ME, members=SAMPLE)
    page.evaluate(f"() => {BAR}.querySelector('.mrow .iconbtn').click()")
    assert [m["id"] for m in stored(page)] == ["67996"]
    page.evaluate(f"() => {BAR}.querySelector('.mrow .iconbtn').click()")
    assert stored(page) == []
    assert "No shortcut yet" in page.evaluate(f"() => {BAR}.textContent")


def test_adding_the_same_member_twice_keeps_one(ctx):
    page = open_page(ctx, OTHER)
    page.evaluate(f"() => {BAR}.querySelector('.box > .btn').click()")
    page.evaluate(f"() => {BAR}.querySelector('.box > .btn').click()")          # now it removes
    page.evaluate(f"() => {BAR}.querySelector('.box > .btn').click()")
    assert len(stored(page)) == 1


def test_the_panel_lists_the_same_shortcuts_on_any_page(ctx):
    page = open_page(ctx, "https://platesmania.com/fr/gallery.php", members=SAMPLE)
    assert page.evaluate("() => !document.getElementById('pmg-members')")                      # the bar is only on a profile
    names = page.evaluate(f"() => [...{PANEL}.querySelectorAll('#membersPanel a.member .mname')].map(e => e.textContent)")
    assert names == ["dudujdfm", "someone"]


def add_by(page, text):
    page.evaluate(f"(t) => {{ const i = {PANEL}.querySelector('.membersadd input'); i.value = t; {PANEL}.querySelector('.membersadd .btn').click(); }}", text)


def test_a_member_is_added_by_number_or_by_link_from_any_page(ctx):
    page = open_page(ctx, "https://platesmania.com/fr/gallery.php")
    add_by(page, "121546")
    page.wait_for_function("() => (JSON.parse(localStorage.getItem('pmg_members') || '[]')).length === 1", timeout=8000)
    assert stored(page)[0]["name"] == "member121546"
    add_by(page, "https://platesmania.com/user121559")
    page.wait_for_function("() => (JSON.parse(localStorage.getItem('pmg_members') || '[]')).length === 2", timeout=10000)
    assert [m["id"] for m in stored(page)] == ["121546", "121559"]
    assert page.evaluate(f"() => {PANEL}.querySelectorAll('#membersPanel a.member').length") == 2


def test_a_wrong_number_or_a_page_that_is_not_a_member_says_so(ctx):
    page = open_page(ctx, "https://platesmania.com/fr/gallery.php")
    add_by(page, "not a number")
    assert "Type the number" in page.evaluate(f"() => {PANEL}.querySelector('.membersadd .presult').textContent")
    add_by(page, "99999999")
    page.wait_for_function(f"() => {PANEL}.querySelector('.membersadd .presult').textContent.includes('No member')", timeout=8000)
    assert stored(page) == []


def test_a_member_already_in_the_list_is_not_added_again(ctx):
    page = open_page(ctx, "https://platesmania.com/fr/gallery.php", members=SAMPLE)
    add_by(page, "user121546")
    assert "already" in page.evaluate(f"() => {PANEL}.querySelector('.membersadd .presult').textContent")
    assert len(stored(page)) == 2


def test_the_picture_and_name_are_refreshed_when_the_member_page_is_visited(ctx):
    page = open_page(ctx, OTHER, members=[{"id": "121546", "name": "old name", "avatar": ""}])
    assert stored(page)[0]["name"] == "member121546"


def box(page):
    return page.evaluate("() => { const r = document.getElementById('pmg-members').getBoundingClientRect(); return { left: r.left, right: r.right, top: r.top + scrollY }; }")


def test_on_a_wide_screen_the_list_is_to_the_left_of_the_content_level_with_the_picture(ctx):
    page = open_page(ctx, ME, width=2560, members=SAMPLE)
    b = box(page)
    content = page.evaluate("() => { const r = document.querySelector('.container.content').getBoundingClientRect(); return { left: r.left, top: r.top + scrollY }; }")
    assert b["right"] <= content["left"] - 10 and b["left"] >= 0                                  # to the left, with some space
    assert abs(b["top"] - content["top"]) < 2                                                      # level with the top of the profile


def test_on_a_narrow_screen_the_list_goes_under_the_picture_in_the_left_column(ctx):
    page = open_page(ctx, ME, width=1280, members=SAMPLE)
    assert page.evaluate("() => document.getElementById('pmg-members').parentNode.classList.contains('col-md-3')")
    assert page.evaluate("() => document.documentElement.scrollWidth <= window.innerWidth + 1")


def test_the_members_are_on_the_left_and_the_flags_on_the_right(ctx):
    page = open_page(ctx, ME, width=2560, members=SAMPLE)
    assert page.evaluate("() => document.getElementById('pmg-members').getBoundingClientRect().right < document.querySelector('.container.content').getBoundingClientRect().left")
    assert page.evaluate("() => document.getElementById('pmg-flags').getBoundingClientRect().left > document.querySelector('.container.content').getBoundingClientRect().right")


def test_switching_the_feature_off_removes_the_bar_and_the_panel_group(ctx):
    page = ctx.new_page()
    page.goto(ME)
    page.wait_for_selector("#pmg-host")
    page.evaluate("() => localStorage.setItem('pmg_set_feature_members', '0')")
    page.reload()
    page.wait_for_selector("#pmg-host")
    page.wait_for_timeout(200)
    assert page.evaluate("() => !document.getElementById('pmg-members')")
    assert page.evaluate(f"() => !{PANEL}.getElementById('membersPanel')")
