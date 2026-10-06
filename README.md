# PlatesMania - NextPlaate

Tampermonkey userscript (**NextPlaate**) that makes posting and browsing on [PlatesMania](https://platesmania.com) faster: a docked panel with fifteen features; every one of them but Settings itself can be switched off in Settings.

## Features, one by one

Where a key is given, it can be changed in the Shortcuts drawer.

**Posting photos**

1. **Photo pair selection** (`S`): pick the front and the rear photo of a vehicle from a gallery.
2. **Location and hashtags**: write your place and hashtags once; they head every description.
3. **Descriptions and auto-fill** (`F`): fills the description of each photo of the pair on the edit page, with a link and a thumbnail of the other side, then saves and goes back to the gallery by itself if you want it to.
4. **Batch upload** (`U`, `N`, `R`): queue many photos (or a folder, HEIC included), give each a country and a plate category, and send them one tab per photo with a delay. The queue survives a reload and pauses 15 minutes when the site asks to wait.
5. **Plate check**: as you type a plate on the upload page, tells how many photos of that plate are already on the site. It reads the plate the way the site's search writes it, for all 96 countries and 829 categories (795 verified on real plates, see `docs/COUVERTURE.md`).
6. **Plate preview as you type**: presses the site's "Generate preview" button for you when you stop typing, so the preview is always there.
7. **Google Lens**: a photo you choose on the upload page is searched on Google Lens by itself, in a background tab that closes when the results are read; the likely brand, model and generation appear under the photo (and in the panel) as three choices each, and a click fills the site's menus.
8. **Tag picker**: replaces the site's closed "Add tags" accordion, and its pop-up on a photo page, with buttons by group, a search box, removable chips, your most used tags and the ones of your last upload.
9. **Extra information box**: the site's three-line box becomes a tall card that grows as you type, with a button to insert your saved location.

**Browsing**

10. **Likes** (`L`): like a page, or several pages in a row, with a delay between likes.
11. **Gallery page keys** (`A`, `D`): previous and next page of a gallery from the keyboard.
12. **Country flags**: a link with a flag and a name for every country, to its upload page. In the panel, and on the upload pages and on a member's profile right beside the content (never under the panel); you choose which countries the side bar shows.
13. **Member shortcuts**: the members you go to often, each with picture and name, one click to their page. You are always first; edit mode lets you drag the lines (or use the arrow keys), remove them and add a member by number or link; a star on a profile saves that member. Your own picture is also in the panel's bar.

**The panel itself**

14. **Shortcut editor**: every key is yours to change (AZERTY-safe).
15. **Settings**: one switch per feature; a switched-off feature adds no control and no key.

## Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/).
2. Install the script from [Greasy Fork](https://greasyfork.org/fr/scripts/598722-nextplaate), or open `nextplaate.user.js` from this repository and click "Raw".

### What it contacts, and the permissions

- It works on `platesmania.com`. Everything it reads from the site goes through one queue (one request at a time, three seconds apart, a pause after a block).
- **Google Lens only**: the script also runs on `www.google.*` and `lens.google.com`, but there it does something only for a search that the panel asked for, and it stops at once on any other Google page. It needs `GM_setValue` and `GM_getValue` to pass the photo to that page and the results back.
- `GM_openInTab` opens the tabs of the batch upload and of the Lens search. Nothing is sent to any server of ours: there is none.

## Updates

Updates are delivered through Greasy Fork. Tampermonkey checks for a new version about once a day. See [CHANGELOG.md](CHANGELOG.md).

## License

MIT, see [LICENSE](LICENSE). Third-party material is listed in [THIRD_PARTY.md](THIRD_PARTY.md).

## Development

The source is split into modules in `src/`. `nextplaate.user.js` is generated from them and must not be edited by hand.

```
src/meta/        userscript header (name, version, grants)
src/core/        wrapper, storage, settings registry, page detection, feature registry, keyboard
src/lib/         helpers: photo detection, description code, countries, bridge to another site, vehicle catalogue
src/lib/plate/   one file per country: how its plate is read from the upload form
src/ui/          design tokens, DOM helper, the docked ribbon, inline card, window
src/features/    one file per feature (upload/ holds the batch upload)
src/dev/         tools of the dev build only (capture, plate test, Verify the reads, Database)
src/boot/        start-up sequence
data/            what was collected on the site, one folder per country (see data/README.md)
tests/           e2e/ (pytest, simulated site) and offline/ (saved pages)
tools/           diagnostics to fix a plate rule (see docs/REGLES.md)
scripts/         build, data and coverage generators
docs/            state and plan, features, rules, coverage, style, reusable parts
```

A feature is one file that calls `registerFeature({...})`: its ribbon groups, its keys and its Esc behaviour. Copy an existing one (for example `src/features/20-details.js`) as a starting point; `docs/BRIQUES.md` lists the shared parts it can use.

Build locally with `node scripts/build.mjs` (add `--dev` for the dev build, which has the Developer drawer and is never published). Test with `python -m pytest -q` (needs `pip install playwright pytest pytest-xdist` and `playwright install chromium`); `NEXTPLAATE_SCRIPT=nextplaate.dev.user.js python -m pytest -q` runs the dev tests too. The tests run in parallel against a simulated PlatesMania (about 30 s). `python tests/offline/check_db.py` replays every known plate on the saved pages; `node scripts/refresh-data.mjs` rebuilds `data/` and `docs/COUVERTURE.md` from them.

Two GitHub Actions run on `main`: `build` rebuilds `nextplaate.user.js` on every push that touches `src/` (Greasy Fork picks the new version up from the repository), and `tests` runs the public and dev test suites and fails when the public script changed without a new `@version`.

Where to start: `docs/ETAT-ET-PLAN.md` (state and plan), `docs/FONCTIONNALITES.md` (every feature in detail, in French), `docs/BRIQUES.md` (the reusable parts), `docs/STYLE.md` (design tokens, taken from the site's palette), `docs/REGLES.md` (fixing a plate rule), `docs/GREASYFORK.md` (the Greasy Fork page and how it is updated), `docs/TODO.md` (what is left).

Remember to raise `@version` in `src/meta/00-header.txt` and to add an entry to `CHANGELOG.md` before pushing a release. Without a new version number, installed copies do not update.
