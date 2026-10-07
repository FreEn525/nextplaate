"""Helpers for the screenshots of the Greasy Fork page: the saved real pages of the site (the author's own account), with the script added
like Tampermonkey does, and the site's own style and pictures loaded live. Nothing is written to the site."""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tests"))
import fake_site  # noqa: E402

REAL = ROOT / "reference" / "real"
OUT = ROOT / "shots"


def clean(html):
    """The saved pages carry remnants of the script that was running when they were saved: strip them, so the script starts from scratch."""
    html = re.sub(r"<[^>]*id=[\"']pmg-[^>]*>.*?</[a-z]+>", "", html, flags=re.S)
    return html


def serve(context, pages, fetches=None):
    """Under the faked site of the tests (its answers to the script's fetches: a plate search, a series, the regions...), the saved real pages:
    pages: {'/fr/add': 'platesmania-fr_add.html'} a document request is answered with the saved page, the script added;
    fetches: {'/user121559': 'platesmania-user121559.html'} a fetch is answered with a saved page (the author's own, real);
    the style, the fonts and the pictures of the site are loaded live. Nothing is ever written to the real site."""
    fake_site.route_site(context)

    def handler(route):
        req = route.request
        u = req.url.split("#")[0]
        path = re.sub(r"^https://platesmania\.com", "", u)
        if req.resource_type == "document" and path in pages:
            html = (REAL / pages[path]).read_text(encoding="utf-8")
            return route.fulfill(status=200, content_type="text/html; charset=utf-8", body=fake_site.inject(clean(html)))
        if fetches and req.resource_type in ("xhr", "fetch"):
            key = path if path in fetches else path.split("?")[0]
            if key in fetches:
                return route.fulfill(status=200, content_type="text/html; charset=utf-8", body=(REAL / fetches[key]).read_text(encoding="utf-8"))
        if req.method == "GET" and req.resource_type in ("stylesheet", "image", "font", "script", "media"):
            return route.continue_()
        return route.fallback()
    context.route(re.compile(r"https://([a-z0-9]+\.)?platesmania\.com/.*"), handler)
    context.route(re.compile(r"https://(?!([a-z0-9]+\.)?platesmania\.com).*"), lambda r: r.continue_())      # the shapes of the maps come from their own sources
