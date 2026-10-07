"""The counter of the awards beside the trophy of a profile: the site leaves it empty when there are awards; the script counts them."""
from pathlib import Path

import pytest

from fake_site import inject, route_site

FIXTURES = Path(__file__).resolve().parents[1] / "fixtures"          # the awards tables of two real members (the pages of the site, reduced to their tables)
BADGES = ('<ul class="badge-lists"><li><a href="/userbestphoto.php?user=1"><i class="fa fa-camera-retro"></i></a><span class="badge">1</span></li>'
          '<li><a href="/userawards.php?user=1" data-original-title="Awards"><i class="fa fa-trophy"></i></a>{badge}</li></ul>')
PAGE = '<html><body><div class="container content profile"><div class="row"><div class="col-md-3">' + BADGES + '</div><div class="col-md-9"><h1>x</h1></div></div></div></body></html>'


def serve(browser, member, badge, awards_html):
    c = browser.new_context()
    route_site(c)
    asked = []
    c.route(f"https://platesmania.com/user{member}", lambda r: r.fulfill(status=200, content_type="text/html", body=inject(PAGE.format(badge=badge))))

    def awards(r):
        asked.append(r.request.url)
        r.fulfill(status=200, content_type="text/html; charset=utf-8", body=awards_html)
    c.route("https://platesmania.com/userawards.php**", awards)
    page = c.new_page()
    page.goto(f"https://platesmania.com/user{member}")
    page.wait_for_selector("#pmg-host")
    return c, page, asked


def badge(page):
    return page.evaluate("() => { const b = document.querySelector('a[href*=\"userawards\"]').parentElement.querySelector('.badge'); return b && b.textContent; }")


def test_a_member_with_awards_gets_a_figure_where_the_site_shows_none(browser):
    c, page, asked = serve(browser, 121546, "", (FIXTURES / "userawards_121546.html").read_text(encoding="utf-8"))
    page.wait_for_function("() => document.querySelector('a[href*=\"userawards\"]').parentElement.querySelector('.badge')", timeout=30000)
    assert badge(page) == "1"
    c.close()


def test_the_figure_is_the_number_of_awards_all_the_tables_together_and_the_hover_gives_the_detail(browser):
    c, page, asked = serve(browser, 101605, "", (FIXTURES / "userawards_101605.html").read_text(encoding="utf-8"))
    page.wait_for_function("() => document.querySelector('a[href*=\"userawards\"]').parentElement.querySelector('.badge')", timeout=30000)
    assert badge(page) == "46"                                                             # 1 State + 35 regions + 2 formats + 1 brand + 7 models
    detail = page.evaluate("() => document.querySelector('a[href*=\"userawards\"]').getAttribute('data-original-title')")
    assert detail == "Awards: 1 State, 35 region, 2 License plate format, 1 Vehicle brand, 7 Model"
    c.close()


def test_a_figure_the_site_gives_is_kept_and_nothing_is_asked(browser):
    c, page, asked = serve(browser, 121546, '<span class="badge">7</span>', "<html></html>")
    page.wait_for_timeout(800)
    assert badge(page) == "7" and asked == []
    c.close()


def test_no_awards_stays_as_the_site_shows_it_and_the_count_is_kept_for_an_hour(browser):
    c, page, asked = serve(browser, 121559, '<span class="badge">-</span>', "<html><body><div class='panel panel-blue'><h3 class='panel-title'>Awards (State)</h3><table><tbody><tr><td class='dataTables_empty'>none</td></tr></tbody></table></div></body></html>")
    page.wait_for_function("() => true")
    page.wait_for_timeout(1500)
    assert badge(page) == "-"                                                                # nothing counted: the site's dash stays
    c.close()
