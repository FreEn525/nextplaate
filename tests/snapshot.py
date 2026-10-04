"""Saves the HTML of a few real PlatesMania pages, so the tests can be checked against the real markup.

Read-only: it only opens the pages listed in reference/snapshot-urls.txt, one by one, with a pause
between them. It never submits a form, never likes, never clicks anything on the site.

Usage (from the project root, once you have listed the pages):
    python tests/snapshot.py

The first run opens a browser window. If PlatesMania shows a Cloudflare check, solve it there, then
press Enter in this terminal. Your session is kept in reference/browser-profile, so you do not log in again.
Files go to reference/snapshots/ (not published on GitHub).
"""
import hashlib
import json
import pathlib
import re
import time
from datetime import datetime
from urllib.parse import urlparse

from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
REF = ROOT / "reference"
URL_LIST = REF / "snapshot-urls.txt"
OUT = REF / "snapshots"
PROFILE = REF / "browser-profile"
PAUSE_SECONDS = 6
CHALLENGE = re.compile(r"just a moment|attention required|checking your browser", re.I)


def read_urls():
    if not URL_LIST.exists():
        raise SystemExit(f"Create {URL_LIST} with one URL per line first.")
    urls = []
    for line in URL_LIST.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if urlparse(line).hostname not in ("platesmania.com", "www.platesmania.com"):
            raise SystemExit(f"Only platesmania.com pages are allowed: {line}")
        urls.append(line)
    return urls


def main():
    urls = read_urls()
    OUT.mkdir(parents=True, exist_ok=True)
    index_path = OUT / "index.json"
    index = json.loads(index_path.read_text(encoding="utf-8")) if index_path.exists() else []

    with sync_playwright() as p:
        ctx = p.chromium.launch_persistent_context(str(PROFILE), headless=False, viewport={"width": 1280, "height": 900})
        page = ctx.pages[0] if ctx.pages else ctx.new_page()
        for url in urls:
            page.goto(url, wait_until="domcontentloaded")
            page.wait_for_timeout(2000)
            if CHALLENGE.search(page.title() or ""):
                input(f"Cloudflare check on {url}: solve it in the browser, then press Enter here...")
                page.wait_for_load_state("domcontentloaded")
            html = page.content()
            name = hashlib.sha1(url.encode()).hexdigest()[:10] + ".html"
            (OUT / name).write_text(html, encoding="utf-8")
            index = [e for e in index if e["url"] != url] + [{
                "url": url, "file": name, "title": page.title(), "saved": datetime.now().isoformat(timespec="seconds"),
            }]
            index_path.write_text(json.dumps(index, indent=2, ensure_ascii=False), encoding="utf-8")
            print(f"saved {url} -> {name} ({len(html)} bytes)")
            time.sleep(PAUSE_SECONDS)
        ctx.close()
    print(f"done: {len(urls)} page(s). Index: {index_path}")


if __name__ == "__main__":
    main()
