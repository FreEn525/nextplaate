"""The look of the script comes from one place: no colour is written outside the design tokens (src/ui/01-tokens.js)."""
import re
from pathlib import Path

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
