"""Developer tools. They exist only in the dev build:
    node scripts/build.mjs --dev
    NEXTPLAATE_SCRIPT=nextplaate.dev.user.js python -m pytest tests/test_dev.py -q
"""
import os

import pytest

from fake_site import route_site

needs_dev = pytest.mark.skipif(os.environ.get("NEXTPLAATE_SCRIPT") != "nextplaate.dev.user.js",
                               reason="runs only against the dev build")


@needs_dev
def test_save_this_page_downloads_its_html(browser):
    c = browser.new_context()
    route_site(c)
    page = c.new_page()
    page.goto("https://platesmania.com/fr/add")
    page.wait_for_selector("#pmg-host")
    page.evaluate("() => document.getElementById('pmg-host').shadowRoot.querySelector('.rbtn[data-drawer=\"dev\"]').click()")
    with page.expect_download() as info:
        page.evaluate("() => document.getElementById('pmg-host').shadowRoot.getElementById('savePage').click()")
    assert info.value.suggested_filename.startswith("platesmania-fr_add")
    c.close()
