"""A simulated PlatesMania, served through Playwright routes.

It only reproduces the markup NextPlaate reads: the gallery (thumbnails, pagination, hearts),
a photo page, the edit page and the upload page. Nothing here talks to the real site.
"""
import base64
import pathlib
import re
from urllib.parse import parse_qs, urlparse

ROOT = pathlib.Path(__file__).resolve().parent.parent
SCRIPT = (ROOT / "nextplaate.user.js").read_text(encoding="utf-8")

# 1x1 PNG, used for every photo and thumbnail
PNG = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg=="
)

HEAD = """<!doctype html><html><head><meta charset="utf-8"><title>{title}</title></head><body>
<h1 class="pull-left">PlatesMania</h1>"""

HEARTS_JS = """<script>
document.addEventListener('click', e => {
  const el = e.target.closest && e.target.closest('i.rating');
  if (el) el.className = 'fa fa-heart rating';
});
</script>"""

# Photos per gallery page. start=0 is page 1, start=10 is page 2.
GALLERY = {
    "0": [("101", "10"), ("102", "10"), ("103", "10")],
    "10": [("201", "20"), ("202", "20")],
}


def gallery_page(start):
    photos = GALLERY.get(start, GALLERY["0"])
    items = "".join(
        f'<div class="thumb"><a href="/fr/nomer{pid}"><img src="https://img1.platesmania.com/{folder}/s/{pid}.jpg" alt="AB 12{pid[-1]}"></a>'
        f'<i id="unit_ul{pid}" class="fa fa-heart-o rating"></i></div>'
        for pid, folder in photos
    )
    pages = [("/fr/gallery.php", "0"), ("/fr/gallery.php?start=10", "10")]
    lis = ""
    for href, key in pages:
        cls = ' class="active"' if key == start else ""
        lis += f'<li{cls}><a href="{href}">{pages.index((href, key)) + 1}</a></li>'
    pagination = f'<ul class="pagination">{lis}</ul>'
    return HEAD.format(title="Gallery") + items + pagination + HEARTS_JS + "</body></html>"


def photo_page(pid):
    return (
        HEAD.format(title="Photo")
        + f'<img src="https://img1.platesmania.com/10/m/{pid}.jpg" alt="">'
        + '<form action="/fr/edit_dopol.php" method="get">'
        + f'<input type="hidden" name="id" value="{pid}"><button type="submit">Edit</button></form>'
        + "</body></html>"
    )


def edit_page(pid):
    return (
        HEAD.format(title="Edit")
        + '<div class="headline"><h2>AB 123</h2></div>'
        + '<form action="/fr/save_dop.php" method="post">'
        + f'<input type="hidden" name="id" value="{pid}">'
        + '<textarea name="dop"></textarea><button type="submit">Save</button></form>'
        + "</body></html>"
    )


UPLOAD_PAGE = (
    HEAD.format(title="Upload")
    + '<form id="frm" action="/fr/add" method="post" enctype="multipart/form-data">'
    + '<input type="text" id="nomer" name="nomer">'
    + '<select id="ctype" name="ctype"><option value="1">Car</option><option value="2">Motorbike</option></select>'
    + '<input type="file" id="filename" name="filename">'
    + '<button type="button" id="pm-photo-editor-open">Upload through editor</button></form>'
    + "</body></html>"
)


def inject(html):
    """Adds the userscript at the end of the page, like Tampermonkey does at document-idle."""
    shims = """<script>
window.unsafeWindow = window;
window.GM_openInTab = (url) => { window.open(url, '_blank'); return { close() {} }; };
window.GM_addStyle = (css) => { const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s); return s; };
window.GM_getValue = (k, d) => { const v = localStorage.getItem('gm_' + k); return v === null ? d : JSON.parse(v); };
window.GM_setValue = (k, v) => localStorage.setItem('gm_' + k, JSON.stringify(v));
</script>"""
    return html.replace("</body>", f"{shims}<script>{SCRIPT}</script></body>")


def route_site(context):
    """Routes every request of a test context to the simulated site."""

    def site(route):
        req = route.request
        url = urlparse(req.url)
        if url.hostname and url.hostname.startswith("img") and url.hostname.endswith("platesmania.com"):
            return route.fulfill(status=200, content_type="image/png", body=PNG)
        if url.hostname != "platesmania.com":
            return route.abort()

        path, query = url.path, parse_qs(url.query)
        if req.method == "POST" and path == "/fr/save_dop.php":
            body = parse_qs(req.post_data or "")
            pid = body.get("id", ["101"])[0]
            return route.fulfill(status=200, content_type="text/html", body=inject(photo_page(pid)))

        if path == "/fr/gallery.php" and "nomer" in query:
            n = 2 if query["nomer"][0] == "AB123" else 0
            html = HEAD.format(title="Search") + f"<p>Nombre total de plaques d’immatriculation trouvées <b>{n}</b></p></body></html>"
            return route.fulfill(status=200, content_type="text/html; charset=utf-8", body=html)
        if path in ("/fr/gallery.php",):
            html = gallery_page(query.get("start", ["0"])[0])
        elif re.fullmatch(r"/fr/nomer\d+", path):
            html = photo_page(path.rsplit("nomer", 1)[1])
        elif path == "/fr/edit_dopol.php":
            html = edit_page(query.get("id", ["101"])[0])
        elif re.fullmatch(r"/[a-z]{2}/add", path):
            html = UPLOAD_PAGE
        else:
            return route.fulfill(status=404, content_type="text/html", body="<h1>404</h1>")
        return route.fulfill(status=200, content_type="text/html", body=inject(html))

    context.route(re.compile(r"https://(platesmania\.com|img\d+\.platesmania\.com)/.*"), site)
    context.route(re.compile(r"https?://(?!platesmania\.com).*"), lambda r: r.abort())
