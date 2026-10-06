"""A simulated PlatesMania, served through Playwright routes.

It only reproduces the markup NextPlaate reads: the gallery (thumbnails, pagination, hearts),
a photo page, the edit page and the upload page. Nothing here talks to the real site.
"""
import base64
import os
import pathlib
import re
from urllib.parse import parse_qs, urlparse

ROOT = pathlib.Path(__file__).resolve().parent.parent
SCRIPT = (ROOT / os.environ.get("NEXTPLAATE_SCRIPT", "nextplaate.user.js")).read_text(encoding="utf-8")

# 1x1 PNG, used for every photo and thumbnail
PNG = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg=="
)

USERREG = []            # the region pages asked
GALLERY_USR = []        # the queries of the member galleries asked
SEARCHES = []     # the plates searched in the gallery, in order (a test reads it)

HEAD = """<!doctype html><html><head><meta charset="utf-8"><title>{title}</title></head><body>
<div class="header"><div class="topbar"><ul class="loginbar"><li><a href="/user121559">freen525</a></li></ul></div></div>
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


# The site's "add tags" link and its pop-up on a photo page: the same picker as the upload page, a Save button, and Bootstrap's own opening
# (simulated: a click on a data-toggle="modal" link counts in window.__bootstrapModal)
PHOTO_TAGS = (
    '<span class="label rounded label-light-green"><a href="#" id="tags-edit-link" data-toggle="modal" data-target="#tagedit">add tags</a></span>'
    '<div class="modal fade" id="tagedit" style="display:none"><div class="modal-dialog"><div class="modal-content"><div class="modal-body">'
    '<form name="contact" class="sky-form pm-tags-edit-form"><div class="pm-tag-type1">'
    '<section class="pm-tag-type1-group" data-group-id="3"><button type="button" class="pm-tag-type1-toggle"><span>Vehicle category</span></button></section>'
    '<section class="pm-tag-type1-group" data-group-id="5"><button type="button" class="pm-tag-type1-toggle"><span>Vehicle purpose</span></button></section>'
    '<div class="pm-tag-type1-list">'
    '<label class="pm-tag-type1-option" data-group-id="3" data-tag-id="21"><input id="CheckBox21" name="CheckBox[21]" type="checkbox"><span>bus</span></label>'
    '<label class="pm-tag-type1-option" data-group-id="3" data-tag-id="22"><input id="CheckBox22" name="CheckBox[22]" type="checkbox" checked><span>truck</span></label>'
    '<label class="pm-tag-type1-option" data-group-id="5" data-tag-id="23"><input id="CheckBox23" name="CheckBox[23]" type="checkbox"><span>police</span></label>'
    '<label class="pm-tag-type1-option" data-group-id="5" data-tag-id="24"><input id="CheckBox24" name="CheckBox[24]" type="checkbox"><span>taxicab</span></label>'
    '</div></div></form></div><div class="modal-footer"><input class="btn btn-success" type="submit" value="Save" id="submit"></div></div></div></div>'
    '<script>'
    'document.addEventListener("click", function (e) { var a = e.target.closest && e.target.closest("[data-toggle=modal]"); if (a) { window.__bootstrapModal = (window.__bootstrapModal || 0) + 1; e.preventDefault(); } });'
    'document.getElementById("submit").addEventListener("click", function () { window.__saved = [].map.call(document.querySelectorAll("#tagedit input:checked"), function (i) { return i.name; }); });'
    '</script>'
)


def photo_page(pid):
    return (
        HEAD.format(title="Photo")
        + f'<img src="https://img1.platesmania.com/10/m/{pid}.jpg" alt="">'
        + '<form action="/fr/edit_dopol.php" method="get">'
        + f'<input type="hidden" name="id" value="{pid}"><button type="submit">Edit</button></form>'
        + PHOTO_TAGS
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
    + '<div class="container" style="max-width:1170px;width:100%;margin:0 auto">'
    + '<form id="frm" action="/fr/add" method="post" enctype="multipart/form-data">'
    + '<input type="text" id="nomer" name="nomer">'
    + '<select id="ctype" name="ctype"><option value="1">Car</option><option value="2">Motorbike</option></select>'
    + '<input type="file" id="filename" name="filename">'
    + '<div class="row"><section class="col-xs-12"><label>Extra information:</label><br><textarea name="dop" rows="3" class="form-control" placeholder="Specify the place of the spot"></textarea></section></div>'
    + '<fieldset><div class="panel-group acc-v1" id="accordion-1"><div class="panel panel-default"><div class="panel-heading"><span id="add-tags-summary" data-tags-label="Tags" data-add-label="Add tags">Add tags</span></div>'
    + '<div class="panel-body"><div class="pm-tag-type1" id="add-tags-picker">'
    + '<section class="pm-tag-type1-group" data-group-id="3"><button type="button" class="pm-tag-type1-toggle"><span>Vehicle category</span></button></section>'
    + '<section class="pm-tag-type1-group" data-group-id="5"><button type="button" class="pm-tag-type1-toggle"><span>Vehicle purpose</span></button></section>'
    + '<div class="pm-tag-type1-list">'
    + '<label class="pm-tag-type1-option" data-group-id="3" data-tag-id="21"><input id="CheckBox21" name="CheckBox[21]" type="checkbox"><span>bus</span></label>'
    + '<label class="pm-tag-type1-option" data-group-id="3" data-tag-id="22"><input id="CheckBox22" name="CheckBox[22]" type="checkbox"><span>truck</span></label>'
    + '<label class="pm-tag-type1-option" data-group-id="5" data-tag-id="23"><input id="CheckBox23" name="CheckBox[23]" type="checkbox"><span>police</span></label>'
    + '<label class="pm-tag-type1-option" data-group-id="5" data-tag-id="24"><input id="CheckBox24" name="CheckBox[24]" type="checkbox"><span>taxicab</span></label>'
    + '</div></div></div></div></div></fieldset>'
    + '<script>document.getElementById("add-tags-picker").addEventListener("change", function () { var n = document.querySelectorAll("#add-tags-picker input:checked").length; var s = document.getElementById("add-tags-summary"); s.textContent = n ? "Tags (" + n + ")" : "Add tags"; });</script>'
    + '<input id="markamodtype" class="ui-autocomplete-input" autocomplete="off">'
    + '<div class="row pm-vehicle-fields-row"><div class="pm-vehicle-column">'
    + '<select name="markaavto" onchange="changeBrand(this.value)"><option value="200">I don`t know...</option><option value="7">Volkswagen</option><option value="8">Audi</option></select>'
    + '<select id="model" name="model" onchange="changeModel(this.value)"></select>'
    + '<select id="modgen" name="modgen"></select></div></div>'
    + '<script>var bmObject = {"7": [70, 71, 72], "8": [80]}, modelObject = {"70": "Golf", "71": "Polo", "72": "Gol", "80": "RS 6"},'
    + ' bmgObject = {"70": [700, 701]}, modgenObject = {"700": "Mk7, 2012–2019", "701": "Mk8, 2019–"};'
    + ' function changeBrand(b) { var m = document.getElementById("model"); m.options.length = 0; m.options[0] = new Option("I don`t know", "");'
    + '   (bmObject[b] || []).forEach(function (id) { m.options[m.options.length] = new Option(modelObject[id], id); }); }'
    + ' function changeModel(id) { var g = document.getElementById("modgen"); g.options.length = 0; g.options[0] = new Option("I don`t know", "0");'
    + '   (bmgObject[id] || []).forEach(function (x) { g.options[g.options.length] = new Option(modgenObject[x], x); }); }</script>'
    + '<div id="informer-preview-wrap"><button type="button" id="informer-preview-btn">Generate preview</button><div id="informer-preview-result" style="display:none"></div></div>'
    + '<script>'
    + 'document.getElementById("informer-preview-btn").addEventListener("click", function () { var f = document.getElementById("nomer"); (window.__previews = window.__previews || []).push(f.value);'
    + ' this.style.display = "none"; var r = document.getElementById("informer-preview-result"); r.style.display = "block"; r.textContent = "preview " + f.value; });'
    + 'document.getElementById("frm").addEventListener("input", function (e) { if (e.target.id === "filename") return;'
    + ' var all = [].slice.call(document.querySelectorAll("#frm input, #frm select")); if (all.indexOf(e.target) > all.findIndex(function (x) { return x.id === "filename"; })) return;'
    + ' document.getElementById("informer-preview-btn").style.display = ""; document.getElementById("informer-preview-result").style.display = "none"; });'
    + '</script>'
    + '<div id="zoomimgid" class="hidden"><img id="zoomimg" width="260" src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=="><div id="fotodiv"></div></div>'
    + '<button type="button" id="pm-photo-editor-open">Upload through editor</button>'
    + '<div style="height:2400px"></div>'
    + '<button class="btn-u" type="submit" onclick="window.__uploads = (window.__uploads || 0) + 1; return false">Upload</button></form>'
    + "</div></body></html>"
)


def inject(html):
    """Adds the userscript at the end of the page, like Tampermonkey does at document-idle."""
    shims = """<script>
window.unsafeWindow = window;
window.GM_openInTab = (url) => { const w = window.open(url, '_blank'); return { close() { if (w) w.close(); } }; };
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
            plate = re.sub(r"[\s-]+", "", query["nomer"][0]).upper()
            SEARCHES.append(plate)
            # the photos of a plate, each with the catalogue link of its vehicle: AB123CD is two Golf Mk8 and a Polo, ZZ999ZZ a brand the menus do not know
            cars = {"AB123CD": ["markaavto=7&model=70&modgen=701", "markaavto=7&model=70&modgen=701", "markaavto=7&model=71"], "ZZ999ZZ": ["markaavto=9999&model=1"]}.get(plate, [])
            n = 2 if plate == "AB123CD" else len(cars)
            cards = "".join(f'<div class="panel-body"><h4 class="text-center"><a href="/fr/nomer{i}">car</a></h4><small><p class="text-center"><a href="/gallery.php?{c}">gen</a></p></small></div>' for i, c in enumerate(cars))
            html = HEAD.format(title="Search") + f'<div class="breadcrumbs"><h1 class="pull-left">License plates found <b>{n}</b></h1></div>{cards}</body></html>'
            return route.fulfill(status=200, content_type="text/html; charset=utf-8", body=html)
        if path == "/fr/series.php":
            html = HEAD.format(title="Series") + '<div class="container"><table class="table table-bordered table-condensed"><tbody><tr><td><a href="gallery.php?nomer=AA * AA">AA-AA</a></td><td><a href="/fr/series-HF-QQ-1">HF-QQ</a></td></tr></tbody></table></div></body></html>'
            return route.fulfill(status=200, content_type="text/html; charset=utf-8", body=html)
        if re.fullmatch(r"/fr/series-[A-Z]{2}-[A-Z]{2}-\d+", path):
            cells = "".join(
                (f'<td class="text-center"><a href="/fr/nomer{9000 + i}"><img src="data:,"></a><br><a href="/fr/nomer{9000 + i}">{i:03d}</a></td>' if i in (9, 137, 300)
                 else f'<td class="warning text-center"><a href="/fr/add.php?digit={i:03d}"><i></i></a><br>{i:03d}</td>') for i in range(1, 1000))
            html = HEAD.format(title="Series") + f'<div class="container"><table class="table table-bordered table-condensed"><tbody><tr>{cells}</tr></tbody></table></div></body></html>'
            return route.fulfill(status=200, content_type="text/html; charset=utf-8", body=inject(html) if route.request.resource_type == "document" else html)
        if re.fullmatch(r"/[a-z]{2}/gallery\.php", path) and "fastsearch" in query:
            GALLERY_USR.append(query)
            html = HEAD.format(title="Search") + '<div class="breadcrumbs"><h1 class="pull-left">License plates found <b>2</b></h1></div></body></html>'
            return route.fulfill(status=200, content_type="text/html; charset=utf-8", body=html)
        if path == "/userreg.php":
            system, uid = query.get("gallery", ["fr1-0"])[0].rsplit("-", 1)
            USERREG.append(system)
            flag = '<td class="region-flag-column"></td>'
            def row(rid, code, name, n):
                photos = f'<a href="/fr/gallery.php?region={rid}&amp;usr={uid}"><i class="fa fa-camera-retro color-blue"></i> {n}</a>' if n else "-"
                return f'<tr class="odd" role="row">{flag}<td class="sorting_1"><span>{rid}</span></td><td><b>{code}</b></td><td align="left"><b>{name}</b></td><td>{photos}</td><td>-</td><td>-</td></tr>'
            rows = {"fr1": [row(2103, "", "Without code of department", 3), row(21000, "01", "Ain", 0), row(21001, "02", "Aisne", 4), row(21002, "03", "Allier", 0), row(21003, "04", "Alpes", 2)],
                    "de": [row(20001, "A", "Augsburg", 0), row(20002, "AA", "Ostalbkreis", 0)], "lu": []}.get(system, [])
            menu = "".join(f'<option value="{c}-{uid}"{" selected" if c == system else ""}>{n}</option>' for c, n in [("fr1", "France (SIV)"), ("de", "Germany"), ("lu", "Luxembourg")])
            html = HEAD.format(title="Statistics by regions") + f'<select name="gallery">{menu}</select><table id="example"><thead><tr><th></th><th></th><th>#</th><th>region</th><th></th><th></th><th></th></tr></thead><tbody>{"".join(rows)}</tbody></table></body></html>'
            return route.fulfill(status=200, content_type="text/html; charset=utf-8", body=html)
        if path == "/gallery.php" and "usr" in query:
            # a member's gallery: the real total, or the count inside a window of dates
            GALLERY_USR.append(query)
            n = 2 if "date1" in query else 1 if "modgen" in query else 3 if "model" in query else 5 if "markaavto" in query else 731
            html = HEAD.format(title="Gallery") + f'<div class="breadcrumbs"><h1 class="pull-left">License plates found <b>{n}</b></h1></div></body></html>'
            return route.fulfill(status=200, content_type="text/html; charset=utf-8", body=html)
        if path in ("/fr/gallery.php",):
            html = gallery_page(query.get("start", ["0"])[0])
        elif re.fullmatch(r"/fr/nomer\d+", path):
            html = photo_page(path.rsplit("nomer", 1)[1])
        elif path == "/fr/edit_dopol.php":
            html = edit_page(query.get("id", ["101"])[0])
        elif re.fullmatch(r"/[a-z]{2}/add", path):
            html = UPLOAD_PAGE
        elif re.fullmatch(r"/user\d+", path):
            uid = path[5:]
            if uid == "99999999":
                return route.fulfill(status=200, content_type="text/html", body=HEAD.format(title="No member") + "</body></html>")
            html = (HEAD.format(title="Profile") + '<div class="container content profile" style="max-width:1170px;width:100%;margin:0 auto"><div class="row"><div class="col-md-3 text-center">'
                    + f'<img class="img-responsive profile-img" width="120" height="120" alt="" src="https://forum.platesmania.com/data/avatars/l/121/{uid}.jpg"></div>'
                    + f'<div class="col-md-9"><h1><a href="https://forum.platesmania.com/members/member{uid}.{uid}/">member{uid}</a> <small class="pull-right">ID: {uid}</small></h1></div></div>'
                    + f'<div class="service-block-v3"><a href="/userreg.php?gallery=fr1-{uid}" class="tooltips"><i class="fa fa-globe"></i></a><span class="counter"><a href="/gallery.php?usr={uid}">715 </a>  <font style="color:green">(+28)</font></span></div></div></body></html>')
        elif path == "/add":
            html = HEAD.format(title="Add") + '<div class="content"><div class="container" style="max-width:1170px;width:100%;margin:0 auto"><h2>Choose a country</h2></div></div></body></html>'
        else:
            return route.fulfill(status=404, content_type="text/html", body="<h1>404</h1>")
        # a page the script reads with fetch() is the site's page alone; the script is added only to the pages that are opened
        body = inject(html) if route.request.resource_type == "document" else html
        return route.fulfill(status=200, content_type="text/html", body=body)

    context.route(re.compile(r"https://(platesmania\.com|img\d+\.platesmania\.com)/.*"), site)
    context.route(re.compile(r"https?://(?!platesmania\.com).*"), lambda r: r.abort())
