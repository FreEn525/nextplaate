"""The look of the script comes from one place: no colour is written outside the design tokens (src/ui/01-tokens.js)."""
import re
from pathlib import Path

from fake_site import route_site

SRC = Path(__file__).resolve().parents[2] / "src"
# files that hold interface styles; the tokens file defines the palette, the logo is an image, the description code colours the
# text of a photo description (content for the site, not interface)
STYLED = ["ui/04-ribbon-css.js", "ui/06-inline-card.js", "ui/05-ribbon.js", "ui/03-page-style.js", "features/upload/02-manager/00-view.js",
          "features/upload/02-manager/10-controls.js", "features/upload/02-manager/20-cards.js", "boot/01-start.js"]
COLOUR = re.compile(r"#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)")
ALLOWED = {"#fff", "#fff!important"}            # white is the surface, the text on the primary colour


def test_no_colour_outside_the_tokens():
    found = []
    for rel in STYLED:
        for n, line in enumerate((SRC / rel).read_text(encoding="utf-8").splitlines(), 1):
            for m in COLOUR.finditer(line):
                if m.group(0).lower() in ALLOWED:
                    continue
                if m.group(0).startswith("rgba(0,0,0") or m.group(0).startswith("rgba(17,17,17"):
                    continue                     # the dark veil and shadows
                found.append(f"{rel}:{n}: {m.group(0)}")
    assert found == [], "colours written outside the tokens:\n" + "\n".join(found)


def test_the_primary_colour_is_the_one_of_the_site():
    tokens = (SRC / "ui/01-tokens.js").read_text(encoding="utf-8")
    assert "--primary:#4765a0" in tokens and "--primary-h:#324c80" in tokens and "--primary-soft:#cad9f6" in tokens
    assert "SITE_BLUE = '#4765a0'" in tokens


def test_every_token_used_is_defined():
    tokens = (SRC / "ui/01-tokens.js").read_text(encoding="utf-8")
    defined = set(re.findall(r"(--[a-z0-9-]+):", tokens))
    used = set()
    for path in SRC.rglob("*.js"):
        used |= set(re.findall(r"var\((--[a-z0-9-]+)\)", path.read_text(encoding="utf-8")))
    assert used - defined == set(), f"tokens used but not defined: {sorted(used - defined)}"


def test_corners_are_square_and_come_from_one_token():
    tokens = (SRC / "ui/01-tokens.js").read_text(encoding="utf-8")
    assert "--r:0;" in tokens                                    # PlatesMania is all rectangles
    found = []
    for rel in STYLED + ["ui/01-tokens.js"]:
        for n, line in enumerate((SRC / rel).read_text(encoding="utf-8").splitlines(), 1):
            for m in re.finditer(r"border-radius:([^;}'\"]*)", line):
                if m.group(1).strip() not in ("var(--r)", "0"):
                    found.append(f"{rel}:{n}: {m.group(0)}")
    assert found == [], "radius written outside the token:\n" + "\n".join(found)


def test_no_coloured_rule_on_the_blocks():
    for rel in ("ui/04-ribbon-css.js", "ui/06-inline-card.js"):
        text = (SRC / rel).read_text(encoding="utf-8")
        assert not re.search(r"border-(top|bottom):[23]px solid var\(--primary", text), rel


# ---------------------------------------------------------------- the scale, in the browser: sizes come out the same everywhere
FONT_SIZES = {11, 12, 13, 14, 16, 18}                       # the type scale of the tokens


def test_the_font_sizes_of_the_sources_are_on_the_scale():
    found = []
    for rel in STYLED + ["ui/01-tokens.js", "features/68-flags.js", "features/73-members.js", "features/71-tags.js", "features/72-extra.js"]:
        for n, line in enumerate((SRC / rel).read_text(encoding="utf-8").splitlines(), 1):
            for m in re.finditer(r"font(?:-size)?:(?:[^;}'\"]*?\s)?(\d+(?:\.\d+)?)px", line):
                if float(m.group(1)) not in FONT_SIZES:
                    found.append(f"{rel}:{n}: {m.group(0)}")
    assert found == [], "font sizes off the scale (11 12 13 14 16 18):\n" + "\n".join(found)


MEASURE = """() => {
  const out = { btn: [], sm: [], input: [], select: [], icon: [], rail: [], pill: [], flag: [], fontOff: [] };
  const roots = ['#pmg-host', '#pmg-flags', '#pmg-members', '#pmg-tags', '#pmg-extra', '#pmg-lens-card'].map(s => document.querySelector(s)).filter(Boolean).map(h => h.shadowRoot);
  for (const root of roots) for (const el of root.querySelectorAll('*')) {
    const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue;
    const h = Math.round(r.height), cls = String(el.className);
    if (el.tagName === 'BUTTON' && /\bbtn\b/.test(cls)) (/\bsm\b/.test(cls) ? out.sm : out.btn).push(h);
    else if (el.tagName === 'INPUT' && (el.type === 'text' || el.type === 'number')) out.input.push(h);
    else if (el.tagName === 'SELECT') out.select.push(h);
    else if (/\biconbtn\b/.test(cls) && !el.closest('.mrow')) out.icon.push(h);
    else if (/\brbtn\b/.test(cls)) out.rail.push(h);
    else if (/\bpill\b/.test(cls)) out.pill.push(h);
    else if (/\bflag\b/.test(cls)) out.flag.push(h);
  }
  return out;
}"""


def test_controls_have_the_same_height_everywhere():
    from playwright.sync_api import sync_playwright
    from fake_site import PNG
    with sync_playwright() as p:
        b = p.chromium.launch()
        c = b.new_context(viewport={"width": 2560, "height": 1000})
        route_site(c)
        c.route("https://forum.platesmania.com/**", lambda r: r.fulfill(status=200, content_type="image/png", body=PNG))
        page = c.new_page()
        page.goto("https://platesmania.com/user121546")
        page.wait_for_selector("#pmg-members")
        page.evaluate("() => localStorage.setItem('pmg_members', JSON.stringify([{id:'101',name:'a',avatar:''}]))")
        page.reload()
        page.wait_for_selector("#pmg-members")
        measured = {}
        for url in ("https://platesmania.com/fr/add", "https://platesmania.com/user121546"):
            page.goto(url)
            page.wait_for_selector("#pmg-host")
            page.wait_for_timeout(300)
            for i in range(page.evaluate("() => document.getElementById('pmg-host').shadowRoot.querySelectorAll('.rbtn').length")):
                page.evaluate("(i) => { const b = [...document.getElementById('pmg-host').shadowRoot.querySelectorAll('.rbtn')][i]; if (b.getAttribute('aria-pressed') !== 'true') b.click(); }", i)
                page.wait_for_timeout(120)
                for k, v in page.evaluate(MEASURE).items():
                    measured.setdefault(k, set()).update(v)
        b.close()
    assert measured["btn"] <= {38}, measured["btn"]
    assert measured["sm"] <= {32}, measured["sm"]
    assert measured["input"] <= {38}, measured["input"]
    assert measured["icon"] <= {32}, measured["icon"]
    assert measured["rail"] <= {40}, measured["rail"]
    assert measured["pill"] <= {32}, measured["pill"]
    assert measured["flag"] <= {32}, measured["flag"]
