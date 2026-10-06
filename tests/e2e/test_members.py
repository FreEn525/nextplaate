"""Member shortcuts: picture and name of members you go to, one click to their page; you first; a list you can reorder;
in the panel and on a profile. In the simulated site the logged-in member is 121559 (the top bar says so)."""
import json

import pytest

from fake_site import PNG, route_site

PANEL = "document.getElementById('pmg-host').shadowRoot"
BAR = "document.getElementById('pmg-members').shadowRoot"
ME = "https://platesmania.com/user121559"
OTHER = "https://platesmania.com/user121546"
GALLERY = "https://platesmania.com/fr/gallery.php"


@pytest.fixture
def ctx(browser):
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


def ids(page, root=BAR):
    return page.evaluate(f"() => [...{root}.querySelectorAll('.mrow')].map(r => r.dataset.id)")


def member(i, name=None, avatar=""):
    return {"id": str(i), "name": name or f"member{i}", "avatar": avatar}


SAMPLE = [{"id": "121546", "name": "dudujdfm", "avatar": "https://forum.platesmania.com/data/avatars/l/121/121546.jpg"}, member(67996, "someone")]
THREE = [member(101), member(102), member(103)]


# ---------------------------------------------------------------- the shortcuts

def test_add_this_member_keeps_the_picture_the_name_and_the_number(ctx):
    page = open_page(ctx, OTHER)
    page.evaluate(f"() => {BAR}.querySelector('.box > .btn').click()")
    assert stored(page) == [{"id": "121546", "name": "member121546", "avatar": "https://forum.platesmania.com/data/avatars/l/121/121546.jpg"}]
    assert page.evaluate(f"() => {BAR}.querySelector('.box > .btn').textContent") == "Remove this member"


def test_a_shortcut_is_the_picture_and_the_name_and_leads_to_the_member_page(ctx):
    page = open_page(ctx, ME, members=SAMPLE)
    links = page.evaluate(f"() => [...{BAR}.querySelectorAll('.mrow:not(.pinned) a.member')].map(a => [a.getAttribute('href'), a.querySelector('.mname').textContent, !!a.querySelector('img')])")
    assert links == [["/user121546", "dudujdfm", True], ["/user67996", "someone", False]]            # no picture saved: the initial instead
    page.evaluate(f"() => {BAR}.querySelector('.mrow:not(.pinned) a.member').click()")
    page.wait_for_url(OTHER)


def test_the_member_of_the_page_is_marked(ctx):
    page = open_page(ctx, OTHER, members=SAMPLE)
    assert page.evaluate(f"() => [...{BAR}.querySelectorAll('a.member.on')].map(a => a.getAttribute('href'))") == ["/user121546"]


def test_a_shortcut_can_be_removed_and_the_list_keeps_you(ctx):
    page = open_page(ctx, OTHER, members=SAMPLE)
    page.evaluate(f"() => {BAR}.querySelector('.mrow:not(.pinned) .iconbtn').click()")
    assert [m["id"] for m in stored(page)] == ["67996"]
    page.evaluate(f"() => {BAR}.querySelector('.mrow:not(.pinned) .iconbtn').click()")
    assert stored(page) == []
    assert ids(page) == ["121559"]                                                                   # only you are left


def test_adding_the_same_member_twice_keeps_one(ctx):
    page = open_page(ctx, OTHER)
    for _ in range(3):
        page.evaluate(f"() => {BAR}.querySelector('.box > .btn').click()")                          # add, remove, add
    assert len(stored(page)) == 1


# ---------------------------------------------------------------- you, first

def test_you_are_the_first_line_and_cannot_be_moved_or_removed(ctx):
    page = open_page(ctx, OTHER, members=SAMPLE)
    assert ids(page) == ["121559", "121546", "67996"]
    first = page.evaluate(f"() => {{ const r = {BAR}.querySelector('.mrow'); return [r.classList.contains('pinned'), r.getAttribute('draggable'), !!r.querySelector('.iconbtn'), !!r.querySelector('button.grip'), r.querySelector('.mtag').textContent, r.querySelector('.mname').textContent]; }}")
    assert first == [True, None, False, False, "You", "freen525"]


def test_you_are_first_in_the_panel_too_and_not_listed_twice(ctx):
    page = open_page(ctx, GALLERY, members=[member(101), member(121559, "freen525"), member(102)])
    assert ids(page, PANEL) == ["121559", "101", "102"]


def test_the_add_button_is_not_offered_on_your_own_page(ctx):
    page = open_page(ctx, ME)
    assert page.evaluate(f"() => !{BAR}.querySelector('.box > .btn')")
    page = open_page(ctx, OTHER)
    assert page.evaluate(f"() => !!{BAR}.querySelector('.box > .btn')")                             # another member: offered


def test_your_picture_is_kept_from_your_own_page(ctx):
    page = open_page(ctx, ME)
    me = json.loads(page.evaluate("() => localStorage.getItem('pmg_members_me')"))
    assert me == {"id": "121559", "name": "freen525", "avatar": "https://forum.platesmania.com/data/avatars/l/121/121559.jpg"}


def test_your_picture_is_read_once_from_your_page_when_it_is_not_known(ctx):
    page = open_page(ctx, GALLERY)                                                                    # not your page: the top bar gives only your name
    page.wait_for_function("() => (JSON.parse(localStorage.getItem('pmg_members_me') || '{}')).avatar", timeout=8000)
    assert "121559.jpg" in json.loads(page.evaluate("() => localStorage.getItem('pmg_members_me')"))["avatar"]


# ---------------------------------------------------------------- the order

def drag(page, source_id, target_id, where="bottom", root="#pmg-members"):
    src = page.locator(f"{root} .mrow[data-id='{source_id}'] .grip")
    dst = page.locator(f"{root} .mrow[data-id='{target_id}']")
    box = dst.bounding_box()
    y = box["height"] - 3 if where == "bottom" else 3
    src.drag_to(dst, target_position={"x": box["width"] / 2, "y": y})


def test_a_line_is_dragged_to_a_new_place(ctx):
    page = open_page(ctx, OTHER, members=THREE)
    drag(page, "103", "101", "top")
    assert [m["id"] for m in stored(page)] == ["103", "101", "102"]
    assert ids(page) == ["121559", "103", "101", "102"]
    drag(page, "103", "102", "bottom")
    assert [m["id"] for m in stored(page)] == ["101", "102", "103"]


def test_nothing_can_be_dropped_above_you(ctx):
    page = open_page(ctx, OTHER, members=THREE)
    drag(page, "103", "121559", "top")                                                                # onto the upper half of your line
    assert ids(page) == ["121559", "103", "101", "102"]                                              # the first place of the others, still after you


def test_the_order_is_kept_for_the_next_visit(ctx):
    page = open_page(ctx, OTHER, members=THREE)
    drag(page, "102", "101", "top")
    page.reload()
    page.wait_for_selector("#pmg-members")
    assert ids(page) == ["121559", "102", "101", "103"]


def test_the_panel_list_can_be_dragged_too(ctx):
    page = open_page(ctx, GALLERY, members=THREE)
    page.evaluate(f"() => {{ [...{PANEL}.querySelectorAll('.rbtn')].find(b => /gallery/i.test(b.title || '')).click(); }}")      # open the drawer
    page.wait_for_timeout(250)
    drag(page, "103", "101", "top", root="#pmg-host")
    assert [m["id"] for m in stored(page)] == ["103", "101", "102"]


def test_the_grip_moves_a_line_with_the_arrow_keys_and_keeps_the_focus(ctx):
    page = open_page(ctx, OTHER, members=THREE)
    page.evaluate(f"() => {BAR}.querySelector('.mrow[data-id=\"103\"] .grip').focus()")
    page.keyboard.press("ArrowUp")
    assert [m["id"] for m in stored(page)] == ["101", "103", "102"]
    assert page.evaluate(f"() => {BAR}.activeElement.closest('.mrow').dataset.id") == "103"          # still on that line's grip
    page.keyboard.press("ArrowUp")
    page.keyboard.press("ArrowUp")                                                                    # already first: it stays first
    assert [m["id"] for m in stored(page)] == ["103", "101", "102"]
    page.keyboard.press("ArrowDown")
    assert [m["id"] for m in stored(page)] == ["101", "103", "102"]


# ---------------------------------------------------------------- the panel and the add box

def test_the_panel_lists_the_same_shortcuts_on_any_page(ctx):
    page = open_page(ctx, GALLERY, members=SAMPLE)
    assert page.evaluate("() => !document.getElementById('pmg-members')")                      # the bar is only on a profile
    names = page.evaluate(f"() => [...{PANEL}.querySelectorAll('#membersPanel a.member .mname')].map(e => e.textContent)")
    assert names == ["freen525", "dudujdfm", "someone"]


def add_by(page, text):
    page.evaluate(f"(t) => {{ const i = {PANEL}.querySelector('.membersadd input'); i.value = t; {PANEL}.querySelector('.membersadd .btn').click(); }}", text)


def test_a_member_is_added_by_number_or_by_link_from_any_page(ctx):
    page = open_page(ctx, GALLERY)
    add_by(page, "121546")
    page.wait_for_function("() => (JSON.parse(localStorage.getItem('pmg_members') || '[]')).length === 1", timeout=8000)
    assert stored(page)[0]["name"] == "member121546"
    add_by(page, "https://platesmania.com/user67996")
    page.wait_for_function("() => (JSON.parse(localStorage.getItem('pmg_members') || '[]')).length === 2", timeout=10000)
    assert [m["id"] for m in stored(page)] == ["121546", "67996"]
    assert page.evaluate(f"() => {PANEL}.querySelectorAll('#membersPanel a.member').length") == 3      # you and the two


def test_a_wrong_number_or_a_page_that_is_not_a_member_says_so(ctx):
    page = open_page(ctx, GALLERY)
    add_by(page, "not a number")
    assert "Type the number" in page.evaluate(f"() => {PANEL}.querySelector('.membersadd .presult').textContent")
    add_by(page, "99999999")
    page.wait_for_function(f"() => {PANEL}.querySelector('.membersadd .presult').textContent.includes('No member')", timeout=8000)
    assert stored(page) == []


def test_a_member_already_in_the_list_or_yourself_is_not_added_again(ctx):
    page = open_page(ctx, GALLERY, members=SAMPLE)
    add_by(page, "user121546")
    assert "already" in page.evaluate(f"() => {PANEL}.querySelector('.membersadd .presult').textContent")
    add_by(page, "121559")                                                                            # you are always there
    assert "already" in page.evaluate(f"() => {PANEL}.querySelector('.membersadd .presult').textContent")
    assert len(stored(page)) == 2


def test_the_picture_and_name_are_refreshed_when_the_member_page_is_visited(ctx):
    page = open_page(ctx, OTHER, members=[{"id": "121546", "name": "old name", "avatar": ""}])
    assert stored(page)[0]["name"] == "member121546"


# ---------------------------------------------------------------- the place on a profile

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
