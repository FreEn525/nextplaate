"""The screenshots of the Greasy Fork page:  python tools/screenshots.py [name ...]   ->  shots/NN-name.png
The saved real pages of the author's own account, the script added like Tampermonkey does, the site's style loaded live, the answers of the faked
site for the script's fetches (a demonstration plate, AB-123-CD). Each shot is 1440 px wide; the montages put two or three states side by side."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from shots_lib import OUT, REAL, serve  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402

# the site's banners show other members' photos and names: hidden in every shot
HIDE = ("#owl-demo img, .col-md-3{visibility:hidden !important}"
        "a[href^=\"/user1\"]:not([href=\"/user121559\"]), img[src*=\"avatars\"], img[src*=\"/user\"]{filter:blur(6px) !important}")
SCENES = {}


def scene(n, name):
    def deco(fn):
        SCENES[name] = (n, fn)
        return fn
    return deco


def open_page(b, path, file, size=(1440, 900), fetches=None):
    ctx = b.new_context(viewport={"width": size[0], "height": size[1]})
    serve(ctx, {path: file}, fetches=fetches)
    page = ctx.new_page()
    page.goto("https://platesmania.com" + path, wait_until="networkidle", timeout=60000)
    page.wait_for_selector("#pmg-host", timeout=20000)
    page.add_style_tag(content=HIDE)
    return page


def save(page, name, n, clip=None):
    page.screenshot(path=str(OUT / f"{n:02d}-{name}.png"), clip=clip)


@scene(1, "upload-page")
def upload_page(b):
    page = open_page(b, "/fr/add", "platesmania-fr_add.html", size=(1440, 1500))
    page.fill("#nomer1", "AB-123-CD")
    page.wait_for_timeout(2500)
    page.locator("#pmg-plate-card summary").click()
    for t in ("police", "test drive", "spyspot"):
        page.locator("#pmg-tags").get_by_text(t, exact=True).first.click()
    page.locator("#pmg-extra textarea").fill("Paris, 8th arrondissement")
    page.keyboard.press("Escape")
    page.evaluate("() => { document.activeElement.blur(); window.scrollTo(0, 600); }")
    page.mouse.move(1200, 700)
    page.wait_for_timeout(600)
    save(page, "upload-page", 1, clip={"x": 0, "y": 0, "width": 1440, "height": 1000})


PANEL = "document.getElementById('pmg-host').shadowRoot"
MODAL = "document.getElementById('pmg-worldmap').shadowRoot"
TOASTS = "document.getElementById('pmg-toasts') && document.getElementById('pmg-toasts').shadowRoot"
GALLERY = ("/fr/gallery.php?usr=121559", "platesmania-fr_gallery_php_usr_121559.html")
PROFILE = ("/user121559", "platesmania-user121559.html")
REAL_FETCHES = {"/user121559": "platesmania-user121559.html", "/userreg.php?gallery=fr1-121559": "platesmania-userreg_php_gallery_fr1_121559.html"}


def drawer(page, which):
    page.evaluate(f"() => {PANEL}.querySelector('.rbtn[data-drawer=\"{which}\"]').click()")
    page.wait_for_timeout(700)


def montage(b, name, n, items, title):
    """items: [(png bytes, caption)] side by side under a title, on the colours of the panel."""
    import base64
    cells = "".join(f'<figure><img src="data:image/png;base64,{base64.b64encode(png).decode()}"><figcaption>{cap}</figcaption></figure>' for png, cap in items)
    html = f"""<html><body style="margin:0;background:#f4f6fb;font-family:Roboto,Arial,sans-serif;color:#1b2a4a">
    <h1 style="margin:0;padding:22px 32px 8px;font-size:26px;font-weight:700">{title}</h1>
    <div style="display:flex;gap:24px;padding:12px 32px 32px;align-items:flex-start;justify-content:center">{cells}</div>
    <style>figure{{margin:0;display:flex;flex-direction:column;gap:10px;flex:1 1 0;min-width:0}}img{{border:1px solid #cfd6e6;box-shadow:0 6px 18px rgba(20,40,90,.12);width:100%}}figcaption{{font-size:16px;font-weight:600}}</style></body></html>"""
    ctx = b.new_context(viewport={"width": 1440, "height": 200})                      # the page is as tall as its content: nothing empty under the shots
    page = ctx.new_page()
    page.set_content(html)
    page.wait_for_timeout(300)
    page.screenshot(path=str(OUT / f"{n:02d}-{name}.png"), full_page=True)
    ctx.close()


def crop(page, selector, pad=12):
    box = page.evaluate("(s) => { const r = document.querySelector(s).getBoundingClientRect(); return { x: r.left + scrollX, y: r.top + scrollY, width: r.width, height: r.height }; }", selector)
    return page.screenshot(clip={"x": max(0, box["x"] - pad), "y": max(0, box["y"] - pad), "width": box["width"] + 2 * pad, "height": box["height"] + 2 * pad}, full_page=True)


@scene(2, "plate-check")
def plate_check(b):
    page = open_page(b, "/fr/add", "platesmania-fr_add.html", size=(1440, 1500))
    page.fill("#nomer1", "AB-123-CD")
    page.wait_for_timeout(2500)
    page.locator("#pmg-plate-card summary").click()
    a = crop(page, "#pmg-plate-card")
    page.locator("#pmg-plate-card").get_by_text("Fill the menus").click()
    page.wait_for_timeout(2500)
    v = page.screenshot(clip=page.evaluate("() => { const a = document.querySelector('select[name=markaavto]').getBoundingClientRect(), r = document.querySelector('.pmg-vbox').getBoundingClientRect(); return { x: 140, y: a.top + scrollY - 40, width: 860, height: r.bottom - a.top + 50 }; }"), full_page=True)
    montage(b, "plate-check", 2, [(a, "Plate check: photos already on the site, your series, lookup links"), (v, "Brand and model: how many photos you already have of each")], "Check the plate before you send the photo")


@scene(3, "country-flags")
def country_flags(b):
    page = open_page(b, "/add", "platesmania-add.html")
    page.locator("#pmg-flags, #mySelect").first.wait_for(state="attached")
    page.wait_for_timeout(1500)
    save(page, "country-flags", 3)


@scene(4, "world-map")
def world_map(b):
    page = open_page(b, *GALLERY, fetches=REAL_FETCHES)
    page.keyboard.press("KeyG")
    page.wait_for_function(f"() => document.getElementById('pmg-worldmap') && {MODAL}.querySelector('svg[role=img]')", timeout=30000)
    page.wait_for_timeout(1200)
    save(page, "world-map", 4)


@scene(5, "region-map")
def region_map(b):
    page = open_page(b, *GALLERY, fetches=REAL_FETCHES)
    page.keyboard.press("KeyG")
    page.wait_for_function(f"() => document.getElementById('pmg-worldmap') && {MODAL}.querySelector('svg[role=img]')", timeout=30000)
    page.evaluate(f"() => {{ const s = {MODAL}.querySelector('select[aria-label=\"Map to show\"]'); s.value = 'fr'; s.dispatchEvent(new Event('change')); }}")
    page.wait_for_function(f"() => {MODAL}.querySelectorAll('svg[role=img] path.c').length > 50", timeout=90000)
    page.wait_for_timeout(1200)
    save(page, "region-map", 5)


@scene(6, "profile")
def profile(b):
    page = open_page(b, *PROFILE, size=(1440, 1700), fetches={"/userawards.php?user=121559": "platesmania-userawards_php_user_121546.html"})
    page.wait_for_timeout(6000)
    save(page, "profile", 6)


def like(user, plate, minute):
    return (f'<li><div><i class="fa fa-heart"></i> <strong><a href="/user1{minute}">{user}</a></strong> <i class="fa fa-hand-o-right"></i> '
            f'<a href="/de/nomer{minute}">{plate}</a><p><small><time datetime="2026-10-05T01:{minute:02d}:00+03:00">x</time></small></p></div></li>')


@scene(7, "notifications")
def notifications(b):
    items = [like("Marie", "MZ HG 950", 9)]
    ctx = b.new_context(viewport={"width": 1440, "height": 900})
    serve(ctx, {GALLERY[0]: GALLERY[1]}, fetches=REAL_FETCHES)
    ctx.route("https://platesmania.com/action2.php**", lambda r: r.fulfill(status=200, content_type="text/html", body="".join(items)))
    page = ctx.new_page()
    page.goto("https://platesmania.com" + GALLERY[0], wait_until="networkidle", timeout=60000)
    page.wait_for_selector("#pmg-host")
    page.add_style_tag(content=HIDE)
    page.evaluate("() => window.dispatchEvent(new Event('pmg-notify-poll'))")
    page.wait_for_function("() => localStorage.getItem('pmg_notify_seen')", timeout=30000)
    items[:0] = [like("Lukas", "BX 646 NG", 21), like("Sofia", "RI 7030-D", 22)]
    page.evaluate("() => window.dispatchEvent(new Event('pmg-notify-poll'))")
    page.wait_for_function(f"() => {TOASTS} && {TOASTS}.querySelectorAll('.t').length >= 2", timeout=30000)
    page.wait_for_timeout(800)
    save(page, "notifications", 7)


@scene(8, "panel")
def panel(b):
    page = open_page(b, *GALLERY, fetches=REAL_FETCHES)
    page.evaluate("() => localStorage.setItem('pmg_members', JSON.stringify([{id: 121559, name: 'freen525'}, {id: 121546, name: 'Aurel'}]))")
    drawer(page, "gallery")
    a = page.screenshot(clip={"x": 1040, "y": 0, "width": 400, "height": 900})
    drawer(page, "keys")
    k = page.screenshot(clip={"x": 1040, "y": 0, "width": 400, "height": 900})
    drawer(page, "search")
    c = page.screenshot(clip={"x": 1040, "y": 0, "width": 400, "height": 900})
    montage(b, "panel", 8, [(c, "Check a plate"), (a, "Browse: pages, members, world map"), (k, "Shortcuts: every key is yours")], "One panel, always at hand")


@scene(9, "settings")
def settings(b):
    page = open_page(b, *GALLERY, fetches=REAL_FETCHES)
    drawer(page, "settings")
    a = page.screenshot(clip={"x": 1040, "y": 0, "width": 400, "height": 900})
    page.evaluate(f"() => {{ const g = [...{PANEL}.querySelectorAll('button')].find(x => x.textContent.startsWith('Profiles and the site')); if (g) g.click(); }}")
    page.wait_for_timeout(500)
    b2 = page.screenshot(clip={"x": 1040, "y": 0, "width": 400, "height": 900})
    montage(b, "settings", 9, [(a, "Settings: five families, one switch per feature"), (b2, "Open a family to see its features")], "Everything can be switched off")


@scene(10, "update")
def update(b):
    page = open_page(b, *GALLERY, fetches=REAL_FETCHES)
    page.evaluate("() => localStorage.setItem('pmg_update_due', '0')")
    page.context.route("https://update.greasyfork.org/**", lambda r: r.fulfill(status=200, content_type="text/plain", headers={"access-control-allow-origin": "*"}, body="// @version      9.9.9"))
    page.reload(wait_until="networkidle")
    page.wait_for_selector("#pmg-host")
    page.add_style_tag(content=HIDE)
    page.wait_for_function(f"() => {TOASTS} && {TOASTS}.querySelector('.t.update')", timeout=30000)
    page.wait_for_timeout(600)
    t = page.screenshot(clip={"x": 1000, "y": 740, "width": 400, "height": 160})
    page.evaluate(f"() => {PANEL}.getElementById('logo').click()")
    page.wait_for_function("() => document.getElementById('pmg-update') && !document.getElementById('pmg-update').shadowRoot.querySelector('.hint').textContent.startsWith('Checking')", timeout=30000)
    page.wait_for_timeout(500)
    box = page.evaluate("() => { const r = document.getElementById('pmg-update').shadowRoot.querySelector('.modal, .frame, [role=dialog]'); const b = r ? r.getBoundingClientRect() : null; return b ? { x: b.left, y: b.top, width: b.width, height: b.height } : null; }")
    w = page.screenshot(clip=box) if box else page.screenshot()
    montage(b, "update", 10, [(t, "A notice when a newer version is out, with the install link"), (w, "The Update window: check by hand, update in one click")], "Always up to date")


def main():
    OUT.mkdir(exist_ok=True)
    names = sys.argv[1:] or sorted(SCENES, key=lambda k: SCENES[k][0])
    with sync_playwright() as p:
        b = p.chromium.launch()
        for name in names:
            print(name)
            SCENES[name][1](b)
        b.close()


if __name__ == "__main__":
    main()
