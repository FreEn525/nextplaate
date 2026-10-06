"""The profile page in the look of the script: the site's own elements restyled, and a switch to get the site's look back."""
import pytest

from fake_site import route_site

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
    assert page.evaluate("() => getComputedStyle(document.querySelector('.service-block-v3')).display") == "flex"      # the uploads, as a tile


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
