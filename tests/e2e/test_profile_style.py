"""The profile page in the look of the script: the site's own elements restyled, and a switch to get the site's look back."""
import pytest

from fake_site import inject, route_site

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
<tr><td><b><a href="/lu">Luxembourg:</a></b></td><td><a href="/x">223</a></td><td>727</td><td>-</td></tr>
<tr><td><b><a href="/de">Germany:</a></b></td><td><a href="/x">53</a></td><td>118</td><td>-</td></tr>
<tr><td><b><a href="/be">Belgium:</a></b></td><td>-</td><td>-</td><td>-</td></tr></tbody></table></div></div></div></div>
</div></body></html>"""
INF = "https://img03.platesmania.com/261003/inf/abc.png"


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

    c.route("https://platesmania.com/user121559", lambda r: r.fulfill(status=200, content_type="text/html", body=inject(PROFILE)))
    c.route("https://platesmania.com/action2.php**", action)
    c.route("https://platesmania.com/de/nomer**", lambda r: r.fulfill(status=200, content_type="text/html", body=f'<html><body><img src="{INF}"></body></html>'))
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
