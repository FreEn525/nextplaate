# PlatesMania - NextPlaate

Tampermonkey userscript (**NextPlaate**) that makes posting and browsing on [PlatesMania](https://platesmania.com) faster: a docked panel with twenty-two features; every one of them but Settings itself can be switched off in Settings.

## Features, one by one

Where a key is given, it can be changed in the Shortcuts drawer.

**Posting photos**

1. **Photo pair selection** (`S`): pick the front and the rear photo of a vehicle from a gallery.
2. **Location and hashtags**: write your place and hashtags once; they head every description.
3. **Descriptions and auto-fill** (`F`): fills the description of each photo of the pair on the edit page, with a link and a thumbnail of the other side, then saves and goes back to the gallery by itself if you want it to.
4. **Batch upload** (`U`, `N`, `R`): queue many photos (or a folder, HEIC included), give each a country and a plate category, and send them one tab per photo with a delay. The queue survives a reload and pauses 15 minutes when the site asks to wait.
5. **Plate check**: as you type a plate on the upload page, tells how many photos of that plate are already on the site. It reads the plate the way the site's search writes it, for all 96 countries and 829 categories (795 verified on real plates, see `docs/COUVERTURE.md`). The card also offers the vehicle of the photos already on the site (*Fill the menus*), your photos of the plate's series, and the lookup links.
6. **Plate preview as you type**: presses the site's "Generate preview" button for you when you stop typing, so the preview is always there.
7. **Google Lens**: a photo you choose on the upload page is searched on Google Lens by itself, in a background tab that closes when the results are read; the likely brand, model and generation appear under the photo (and in the panel) as three choices each, and a click fills the site's menus. It also reads what Google itself calls the vehicle (shown as *Google says*, a click types it in the site's own brand and model box) and gives it more weight than the titles.
8. **Tag picker**: replaces the site's closed "Add tags" accordion, and its pop-up on a photo page, with buttons by group, a search box, removable chips, your most used tags and the ones of your last upload.
9. **Extra information box**: the site's three-line box becomes a tall card that grows as you type, with buttons to insert your saved location and the date of the photo (its EXIF date, as month and year or in full).
10. **Floating upload button**: while the site's own Upload button is out of view, ours follows you at the bottom of the page and presses it.
11. **Plate lookup links**: for the plate you type, one link to each public lookup page of the country (and to a picture search), each writing the plate the way that site wants it. Plain links opening a new tab: nothing is sent before a click. Each site can be hidden in Settings.
12. **Your photos of this vehicle**: under the brand, model and generation menus, how many photos of each you already have on the site, each number a link to those photos.
13. **Official register** (Netherlands, Israel): a button in the plate card asks the country's open register (RDW open data, data.gov.il) about the plate: make, model, year, colour, inspection date; for the Netherlands it can fill the menus. The plate is sent only when you click.
14. **Series counter**: for 84 countries (checked on the real site with real plates, see `docs/COUVERTURE.md`), how many photos of the plate's series (HF-137-QQ is in HF-*-QQ, AA 7181 is in AA-*) you already have; on a series page, how many of its numbers are on the site, which ones, and how many photos of the series you have.

**Browsing**

15. **Likes** (`L`): like a page, or several pages in a row, with a delay between likes.
16. **Gallery page keys** (`A`, `D`): previous and next page of a gallery from the keyboard.
17. **Country flags**: a link with a flag and a name for every country, to its upload page. In the panel, and on the upload pages and on a member's profile right beside the content (never under the panel); you choose which countries the side bar shows.
18. **Member shortcuts**: the members you go to often, each with picture and name, one click to their page. You are always first; edit mode lets you drag the lines (or use the arrow keys), remove them and add a member by number or link; a star on a profile saves that member. Your own picture is also in the panel's bar.

**Profiles**

19. **Profile: real uploads**: on a member's profile, the real total of the gallery and the uploads of the day (from 03:30 local time), and how far the profile's own figure is: that figure is a statistic the site recalculates from time to time.
20. **Profile: regions**: on a member's profile, a button reads the site's region statistics and shows how many regions (departments, districts, states...) of a country the member has a photo from, with a bar, the regions seen as links and the missing ones. The country menu comes from the site's page.

**The panel itself**

21. **Shortcut editor**: every key is yours to change (AZERTY-safe).
22. **Settings**: one switch per feature; a switched-off feature adds no control and no key.

## Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/).
2. Install the script from [Greasy Fork](https://greasyfork.org/fr/scripts/598722-nextplaate).

### What it contacts, and the permissions

- It works on `platesmania.com`. Everything it reads from the site goes through one queue (one request at a time, three seconds apart, a pause after a block).
- **Google Lens only**: the script also runs on `www.google.*` and `lens.google.com`, but there it does something only for a search that the panel asked for, and it stops at once on any other Google page. It needs `GM_setValue` and `GM_getValue` to pass the photo to that page and the results back.
- **Official register** (Netherlands, Israel): only when you click its button, the plate is sent to that country's open register (`opendata.rdw.nl`, `data.gov.il`), whose data is public and free.
- **Lookup links** are plain links: they open a public lookup site in a new tab only when you click one, and the script reads nothing from those sites.
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
