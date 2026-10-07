"""What the public sees (the script, its header, the text pasted on Greasy Fork) does not mention the repository."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
# the project's own repository, by its owner or its name; other hosts the script needs (the shapes of geoBoundaries sit on github.com too) are fine
REPO = re.compile(r"FreEn525|(github\.com|githubusercontent\.com)/[^\s'\"`]*nextplaate", re.I)


def test_the_script_and_its_header_do_not_mention_the_repository():
    found = [str(p.relative_to(ROOT)) for p in (ROOT / "src").rglob("*") if p.is_file() and not p.parts[-2] == "dev" and REPO.search(p.read_text(encoding="utf-8", errors="ignore"))]
    assert found == [], found
    assert not REPO.search((ROOT / "nextplaate.user.js").read_text(encoding="utf-8"))


def test_the_text_to_paste_on_greasy_fork_does_not_mention_the_repository():
    doc = (ROOT / "docs" / "GREASYFORK.md").read_text(encoding="utf-8")
    block = re.search(r"```markdown\n(.*?)```", doc, re.S).group(1)
    assert not REPO.search(block)
    assert "Twenty-six features" in block                                                                # and it is the list of the features


LICENCE = "All rights reserved"


def test_the_licence_is_all_rights_reserved_everywhere_it_is_written():
    """Not MIT any more (from 5.11.8): the header, the add-on, LICENSE and the README say the same; third-party notices keep their own licences."""
    header = (ROOT / "src" / "meta" / "00-header.txt").read_text(encoding="utf-8")
    assert re.search(r"@license\s+" + LICENCE, header) and "@license      MIT" not in header
    assert re.search(r"@license\s+" + LICENCE, (ROOT / "addons" / "nextplaate-autolike.user.js").read_text(encoding="utf-8"))
    text = (ROOT / "LICENSE").read_text(encoding="utf-8")
    assert text.startswith("NextPlaate - All rights reserved") and "MIT License" not in text and "FreEn525" not in text
    assert "You may not" in text and "modify it" in text and "THIRD_PARTY.md" in text
    readme = (ROOT / "README.md").read_text(encoding="utf-8")
    assert "MIT license." not in readme and "All rights reserved" in readme
    assert "MIT" in (ROOT / "THIRD_PARTY.md").read_text(encoding="utf-8")                                # what others wrote keeps its own licence
