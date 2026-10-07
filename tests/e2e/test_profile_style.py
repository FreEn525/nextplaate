"""The profile page in the look of the script: the site's own elements restyled, and a switch to get the site's look back."""
import pytest

from fake_site import PNG, inject, route_site

URL = "https://platesmania.com/user121559"


@pytest.fixture
def ctx(browser):
    c = browser.new_context(viewport={"width": 1280, "height": 900})
    route_site(c)
    yield c
    c.close()


def test_the_profile_gets_the_look_of_the_script(ctx):
    page = ctx.new_page()
    page.goto(URL)
    page.wait_for_selector("#pmg-host")
    assert page.evaluate("() => !!document.getElementById('pmg-profile-style')")
    assert page.evaluate("() => !!document.querySelector('.pm-tiles .pm-tile')")                                  # the uploads, as a tile


def test_the_site_keeps_its_look_when_the_feature_is_off(ctx):
    page = ctx.new_page()
    page.goto(URL)
    page.evaluate("() => localStorage.setItem('pmg_set_feature_profilestyle', '0')")
    page.reload()
    page.wait_for_selector("#pmg-host")
    assert not page.evaluate("() => !!document.getElementById('pmg-profile-style')")


def test_a_page_that_is_not_a_profile_is_left_alone(ctx):
    page = ctx.new_page()
    page.goto("https://platesmania.com/fr/gallery.php")
    page.wait_for_selector("#pmg-host")
    assert not page.evaluate("() => !!document.getElementById('pmg-profile-style')")


PROFILE = """<html><body><div class="container content profile"><div class="row">
<div class="col-md-3 text-center"><img class="profile-img" src="x.png"><ul class="badge-lists"><li><a href="/best"><i class="fa fa-camera"></i></a><span class="badge">1</span></li><li><a href="/aktivuserall?start=43"><i class="fa fa-bar-chart-o"></i></a><span class="badge">2069 <font>(+104)</font></span></li></ul></div>
<div class="col-md-9"><h1><a href="/user121559">freen525</a></h1>
<div class="service-block-v3"><span class="service-heading">Uploaded</span><span class="counter"><a href="/gallery.php?usr=121559">361 </a></span></div>
<div class="row tag-box tag-box-v7"><div class="service-in"><h4 class="counter">received: <b>1 183</b></h4><h4 class="counter">posted: <b>-</b></h4></div>
<div class="service-in"><h4 class="counter">received: <b><a href="/c">10</a></b> <span class="badge">+7</span></h4><h4 class="counter">posted: <b><a href="/d">27</a></b></h4></div></div></div></div>
<div class="row"><div class="col-md-6"><div class="panel"><ul class="mCustomScrollbar"><div id="content"><li><div><i class="fa fa-heart"></i> <strong><a href="/user1">Aurel</a></strong> <a href="/de/nomer1">MZ HG 950</a><p class="pull-right"><small><time datetime="2026-10-05T01:09:38+03:00"><span>x</span></time></small></p></div></li></div></ul><button id="load">Load more</button></div></div></div>
<div class="row"><div class="col-md-7"><div class="panel panel-blue"><div class="table-responsive"><table id="example"><thead><tr><th></th><th>a</th><th>b</th><th>c</th></tr></thead><tbody>
<tr><td><b><a href="/usercountry-lu-121559">Luxembourg:</a></b></td><td><a href="/x">223</a></td><td>727</td><td>-</td></tr>
<tr><td><b><a href="/usercountry-de-121559">Germany:</a></b></td><td><a href="/x">53</a></td><td>118</td><td>-</td></tr>
<tr><td><b><a href="/be">Belgium:</a></b></td><td>-</td><td>-</td><td>-</td></tr></tbody></table></div></div></div><div class="col-md-5"><h3>last:</h3><ul class="portfolio-box-v1"><li><img class="img-responsive" src="x.png"><div class="portfolio-box-v1-in"><h3>RI 7030-D</h3><p>Croatia, <small>26-10-03</small></p><a class="btn-u" href="/hr/nomer7"><i class="fa fa-arrow"></i></a></div></li></ul></div></div>
</div></body></html>"""
INF = "https://img03.platesmania.com/261003/inf/abc.png"
FLAG = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="14"><rect width="20" height="14" fill="#c00"/></svg>'


def flags(context):
    context.route("https://platesmania.com/assets/img/profile-flags/*.svg", lambda r: r.fulfill(status=200, content_type="image/svg+xml", body=FLAG))


@pytest.fixture
def prof(browser):
    c = browser.new_context(viewport={"width": 1280, "height": 900})
    route_site(c)
    asked = []

    def action(r):
        asked.append(r.request.url)
        num = int(r.request.url.split("num=")[1].split("&")[0])
        body = '<li><div><i class="fa fa-heart"></i> <strong><a href="/user2">Xenoore4</a></strong> <a href="/de/nomer2">VW 8372</a></div></li>' if num == 1 else "0"
        r.fulfill(status=200, content_type="text/html", body=body)

    flags(c)
    c.route("https://img03.platesmania.com/**", lambda r: r.fulfill(status=200, content_type="image/png", body=PNG))             # a real (1 x 1) picture
    c.route("https://platesmania.com/user121559", lambda r: r.fulfill(status=200, content_type="text/html", body=inject(PROFILE)))
    c.route("https://platesmania.com/action2.php**", action)
    c.route("https://platesmania.com/*/nomer*", lambda r: r.fulfill(status=200, content_type="text/html", body=f'<html><body><img src="{INF}"></body></html>'))
    p = c.new_page()
    p.goto(URL)
    p.wait_for_selector("#pmg-host")
    p.asked = asked
    yield p
    c.close()


def test_the_figures_become_four_tiles_and_the_site_ones_are_hidden(prof):
    prof.wait_for_selector('.pm-tile')
    tiles = prof.evaluate("() => [...document.querySelectorAll('.pm-tile')].map(t => [...t.children].map(c => c.textContent.trim()).join(' | '))")
    assert tiles == ["Plates | 361 | uploaded", "Likes | 1 183 | received \u00b7 posted -", "Comments | 10+7 | received \u00b7 posted 27", "Rating | #2069(+104) | place among members"]
    assert prof.evaluate("() => getComputedStyle(document.querySelector('.service-block-v3')).display") == "none"


def test_the_countries_without_a_photo_are_hidden_until_asked(prof):
    prof.wait_for_selector('.pm-bar')
    rows = lambda: prof.evaluate("() => [...document.querySelectorAll('#example tbody tr')].filter(r => r.getClientRects().length).length")
    assert rows() == 2 and "2 with photos" in prof.evaluate("() => document.querySelector('.pm-title').textContent")
    prof.evaluate("() => document.querySelector('.pm-chk input').click()")
    assert rows() == 3


def test_a_plate_is_shown_as_its_picture_and_the_list_loads_as_it_is_scrolled(prof):
    prof.wait_for_function("() => document.querySelector('img.pm-plate')", timeout=30000)
    assert prof.evaluate("() => { const i = document.querySelector('img.pm-plate'); return [i.getAttribute('src'), i.alt]; }") == [INF, "MZ HG 950"]
    prof.wait_for_function("() => document.querySelectorAll('ul.mCustomScrollbar li').length === 2 && document.querySelector('.pm-end').textContent === 'That is all.'", timeout=30000)
    assert prof.evaluate("() => document.getElementById('load').style.display") == "none"            # the site's button is out of the way


def test_each_country_of_the_table_has_its_flag(prof):
    prof.wait_for_selector(".pm-bar")
    assert prof.evaluate("() => [...document.querySelectorAll('#example tbody tr .pm-flag')].map(i => i.getAttribute('src'))") == ["/assets/img/profile-flags/lu.svg", "/assets/img/profile-flags/de.svg"]


def test_a_last_photo_is_a_card_with_the_flag_on_the_photo_the_plate_then_the_country_and_the_day(prof):
    prof.wait_for_selector(".pm-card")
    prof.evaluate("() => document.querySelector('.pm-card').scrollIntoView()")                       # the plate is read when the card comes in view
    assert prof.evaluate("() => document.querySelector('.pm-badge .pm-flag').getAttribute('src')") == "/assets/img/profile-flags/hr.svg"
    assert prof.evaluate("() => document.querySelector('.pm-plate-text').textContent") == "RI 7030-D"                 # the text, until the picture comes
    prof.wait_for_function("() => document.querySelector('.pm-plate-well img')", timeout=30000)
    assert prof.evaluate("() => document.querySelector('.pm-plate-well img').getAttribute('src')") == "https://img03.platesmania.com/261003/inf/abc.png"
    assert prof.evaluate("() => [document.querySelector('.pm-meta b').textContent, document.querySelector('.pm-meta span').textContent.length > 4]") == ["Croatia", True]
    assert prof.evaluate("() => getComputedStyle(document.querySelector('.portfolio-box-v1-in')).display") == "none"       # the site's own caption is out of the way


def test_the_line_of_the_latest_plates_becomes_a_strip_of_chips_with_flags(browser):
    c = browser.new_context(viewport={"width": 1280, "height": 900})
    route_site(c)
    flags(c)
    page_html = ('<html><body><div class="wrapper"><small><span class="text-highlights">last</span> | <a href="/it/nomer1">V0 P CATVR</a> | <a href="/fr/nomer2">HM-137-WT</a></small>'
                 '<div class="container content">x</div></div></body></html>')
    c.route("https://platesmania.com/fr/gallery.php", lambda r: r.fulfill(status=200, content_type="text/html", body=inject(page_html)))
    p = c.new_page()
    p.goto("https://platesmania.com/fr/gallery.php")
    p.wait_for_selector(".pm-last")
    assert p.evaluate("() => [...document.querySelectorAll('.pm-chip')].map(a => [a.textContent, a.getAttribute('href'), a.querySelector('.pm-flag').getAttribute('src')])") == [
        ["V0 P CATVR", "/it/nomer1", "/assets/img/profile-flags/it.svg"], ["HM-137-WT", "/fr/nomer2", "/assets/img/profile-flags/fr.svg"]]
    assert p.evaluate("() => getComputedStyle(document.querySelector('.wrapper > small')).display") == "none"
    c.close()


def test_the_strip_keeps_every_plate_on_one_line_without_a_scrollbar(browser):
    c = browser.new_context(viewport={"width": 700, "height": 900})
    route_site(c)
    flags(c)
    links = " | ".join(f'<a href="/de/nomer{i}">HH AB {i} 9999</a>' for i in range(10))
    c.route("https://platesmania.com/fr/gallery.php", lambda r: r.fulfill(status=200, content_type="text/html", body=inject(f'<html><body><div class="wrapper"><small><span class="text-highlights">last</span> | {links}</small><div class="container content">x</div></div></body></html>')))
    p = c.new_page()
    p.goto("https://platesmania.com/fr/gallery.php")
    p.wait_for_selector(".pm-last")
    got = p.evaluate("() => { const l = document.querySelector('.pm-last-list'); return [l.querySelectorAll('.pm-chip').length, l.scrollWidth <= l.clientWidth, getComputedStyle(l).overflowX, l.getBoundingClientRect().height > 40]; }")
    assert got == [10, True, "visible", False]                                  # all ten, on ONE line (the chips shrink, a long plate is cut), nothing to scroll
    assert p.evaluate("() => getComputedStyle(document.querySelector('.pm-flag')).objectFit") == "contain"
    c.close()


def test_a_plate_picture_keeps_its_proportions_however_narrow_its_card(prof):
    """A fixed height with a capped width stretched the plates: both limits must give way together (the test picture is square)."""
    prof.wait_for_selector(".pm-card")
    prof.evaluate("() => document.querySelector('.pm-card').scrollIntoView()")
    prof.wait_for_function("() => document.querySelector('.pm-plate-well img') && document.querySelector('.pm-plate-well img').naturalWidth > 0", timeout=30000)
    prof.evaluate("() => { const w = document.querySelector('.pm-plate-well'); w.style.width = '24px'; w.style.padding = '0'; w.style.boxSizing = 'border-box'; }")
    w, h = prof.evaluate("() => { const r = document.querySelector('.pm-plate-well img').getBoundingClientRect(); return [r.width, r.height]; }")
    assert 0 < w <= 24.5 and abs(w - h) < 1                                            # narrower than the card allows: smaller, not squeezed
