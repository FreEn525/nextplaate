"""What the public sees (the script, its header, the text pasted on Greasy Fork) does not mention the repository."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
REPO = re.compile(r"github\.com|githubusercontent|FreEn525", re.I)


def test_the_script_and_its_header_do_not_mention_the_repository():
    found = [str(p.relative_to(ROOT)) for p in (ROOT / "src").rglob("*") if p.is_file() and not p.parts[-2] == "dev" and REPO.search(p.read_text(encoding="utf-8", errors="ignore"))]
    assert found == [], found
    assert not REPO.search((ROOT / "nextplaate.user.js").read_text(encoding="utf-8"))


def test_the_text_to_paste_on_greasy_fork_does_not_mention_the_repository():
    doc = (ROOT / "docs" / "GREASYFORK.md").read_text(encoding="utf-8")
    block = re.search(r"```markdown\n(.*?)```", doc, re.S).group(1)
    assert not REPO.search(block)
    assert "Fifteen features" in block                                                                # and it is the list of the features
