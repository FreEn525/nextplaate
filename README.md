# PlatesMania - NextPlaate

Tampermonkey userscript (**NextPlaate**) that makes posting and browsing on [PlatesMania](https://platesmania.com) faster: a docked panel with twenty-five features; every one of them but Settings itself can be switched off in Settings.

Made by [NextEnzzo](https://platesmania.com/user121559). © 2026 NextEnzzo. All rights reserved: free to use, not to copy, modify or redistribute (see [LICENSE](LICENSE)).

After an update the script shows a *What's new* window once (also in Settings > About). A click on the logo of the panel checks for a newer version.

## Where each feature works

Settings lists every feature with what it does and where it works. The short version: the plate check works for **all 96 countries and 829 plate categories** (795 checked exactly on real plates); the series counter for 84 countries (checked on the real site); the official register only for the Netherlands and Israel (the only free, open registers found); lookup links for every country, with their own sites for 14. Everything else (Lens, tags, flags, batch upload, the profile cards...) works for every country and every member.

The bar follows the order of use: **Check a plate**, **Send photos**, **Describe a pair**, **Browse**.

## Features, one by one

Where a key is given, it can be changed in the Shortcuts drawer.

**Posting photos**

1. **Photo pair selection** (`S`): pick the front and the rear photo of a vehicle from a gallery.
2. **Location and hashtags**: write your place and hashtags once; they head every description.
3. **Descriptions and auto-fill** (`F`): fills the description of each photo of the pair on the edit page, with a link and a thumbnail of the other side, then saves and goes back to the gallery by itself if you want it to.
4. **Batch upload** (`U`, `N`, `R`): queue many photos (or a folder, HEIC included), give each a country and a plate category, and send them one tab per photo with a delay. The queue survives a reload and pauses 15 minutes when the site asks to wait.
5. **Plate check**: as you type a plate on the upload page, tells how many photos of that plate are already on the site. It reads the plate the way the site's search writes it, for all 96 countries and 829 categories (795 verified on real plates, see `docs/COUVERTURE.md`). The card also offers the vehicle of the photos already on the site (*Fill the menus*), your photos of the plate's series, and the lookup links.
6. **Plate preview as you type**: presses the site's "Generate preview" button for you when you stop typing, so the preview is always there.
7. **Google Lens**: a photo you choose on the upload page is searched on Google Lens by itself, in a background tab that closes when the results are read; the likely brand, model and generation appear under the photo (and in the panel) as three choices each, and a click fills the site's menus. It also reads what Google itself calls the vehicle (shown as *Google calls it*, a click types it in the site's own brand and model box) and gives it more weight than the titles. The card reads top to bottom: best match with one *Fill the menus* button, what Google calls it, then the other choices.
8. **Tag picker**: replaces the site's closed "Add tags" accordion, and its pop-up on a photo page, with buttons by group, a search box, removable chips, your most used tags and the ones of your last upload.
9. **Extra information box**: the site's three-line box becomes a tall card that grows as you type, with buttons to insert your saved location and the date of the photo (its EXIF date, as month and year or in full).
10. **Floating upload button**: while the site's own Upload button is out of view, ours follows you at the bottom of the page and presses it.
11. **Plate lookup links**: for the plate you type, one link to each public lookup page of the country (and to a picture search), each writing the plate the way that site wants it. Plain links opening a new tab: nothing is sent before a click. Each site can be hidden in Settings.
12. **Your photos of this vehicle**: under the brand, model and generation menus, how many photos of each you already have on the site, each number a link to those photos.
13. **Official register** (Netherlands, Israel): a button in the plate card asks the country's open register (RDW open data, data.gov.il) about the plate: make, model, year, colour, inspection date; for the Netherlands it fills the menus that are still empty. It asks by itself (public open data, the plate is the only thing sent); two switches in Settings turn that off.
14. **Series counter**: for 84 countries (checked on the real site with real plates, see `docs/COUVERTURE.md`), how many photos of the plate's series (HF-137-QQ is in HF-*-QQ, AA 7181 is in AA-*) you already have; on a series page, how many of its numbers are on the site, which ones, and how many photos of the series you have.

**Browsing**

15. **Gallery page keys** (`A`, `D`): previous and next page of a gallery from the keyboard.
16. **Country flags**: a link with a flag and a name for every country, to its upload page. In the panel; on the page `/add` the site's drop-down becomes large flags with a search box and the countries you opened last; on the other upload pages and on a member's profile a bar beside the content where there is room, otherwise a tab *Add a photo in…* at the right edge (the same place on every screen). You choose which countries the bar shows.
17. **Member shortcuts**: the members you go to often, each with picture and name, one click to their page. You are always first; edit mode lets you drag the lines (or use the arrow keys), remove them and add a member by number or link; a star on a profile saves that member. Your own picture is also in the panel's bar.

**Profiles**

18. **Profile: real uploads**: on a member's profile, the real total of the gallery and the uploads of the day (from 03:30 local time), and how far the profile's own figure is: that figure is a statistic the site recalculates from time to time.
19. **Profile: regions**: on a member's profile, a button reads the site's region statistics and shows how many regions (departments, districts, states...) of a country the member has a photo from, with a bar, the regions seen as links and the missing ones. The country menu comes from the site's page.

20. **World map** (`G`, for globe): the countries a member has photos from on a map of the world, shaded by how many photos, each country a link to the member's photos of it; a Europe view; yours or anyone's (a member number or the link of a profile, or one of the members you saved); and, for 54 countries, a map of the regions (France's departments, the US states, Russia's regions...) with the same zoom.

**The panel itself**

21. **Profile page look**: a member's profile in the look of the script: the picture, badges and figures in one box, the uploads, likes and comments as tiles, the private messages and the notifications in two identical panels, the countries table and the last photos tidied. Only the style of the site's own elements changes (sort, filter and delete of the messages keep working); one switch gives the site's look back.
22. **Notification pop-ups**: a notice in the corner, like a phone's, for a new like, comment or private message, on any PlatesMania page while a tab is open: you choose the kinds and how often (2 to 30 minutes), and can ask for a system notification when the tab is in the background. The first look marks what is there as seen.
23. **Latest plates strip**: the line of the latest uploads that every page carries becomes a slim strip with a flag and a chip per plate.
24. **Shortcut editor**: every key is yours to change (AZERTY-safe).
25. **Settings**: one switch per feature; a switched-off feature adds no control and no key.

## Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/).
2. Install the script from [Greasy Fork](https://greasyfork.org/fr/scripts/598722-nextplaate).

### What it contacts, and the permissions

- It works on `platesmania.com`. Everything it reads from the site goes through one queue (one request at a time, three seconds apart, a pause after a block).
- **Google Lens only**: the script also runs on `www.google.*` and `lens.google.com`, but there it does something only for a search that the panel asked for, and it stops at once on any other Google page. It needs `GM_setValue` and `GM_getValue` to pass the photo to that page and the results back.
- **Official register** (Netherlands, Israel): the plate you typed is sent to that country's open register (`opendata.rdw.nl`, `data.gov.il`), whose data is public and free, as soon as the plate check has read it; Settings has a switch to ask only when you click a button, and one to not fill the menus.
- **Update check**: only when you click the logo of the panel, the script reads the header of the published script on Greasy Fork (`update.greasyfork.org`) to compare versions.
- **Lookup links** are plain links: they open a public lookup site in a new tab only when you click one, and the script reads nothing from those sites.
- `GM_openInTab` opens the tabs of the batch upload and of the Lens search. Nothing is sent to any server of ours: there is none.

## Updates

Updates are delivered through Greasy Fork. Tampermonkey checks for a new version about once a day. See [CHANGELOG.md](CHANGELOG.md).

## Credits

The world map is [Natural Earth](https://www.naturalearthdata.com/) data (public domain), through the [world-atlas](https://github.com/topojson/world-atlas) package. The maps of regions use the shapes of [geoBoundaries](https://www.geoboundaries.org/) (CC-BY 4.0 and the licence of each country's source, shown under the map), loaded when you choose a country. Plate codes, towns and coordinates that place a region on its shape come from [Wikidata](https://www.wikidata.org/) (CC0).

## License

All rights reserved, see [LICENSE](LICENSE): you may install and use the script and read its code; you may not copy, modify or redistribute it. Versions published before 2026-10-07 were under the MIT licence, which stays with the copies already made. Third-party material (under its own licences) is listed in [THIRD_PARTY.md](THIRD_PARTY.md).

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
