# PlatesMania - NextPlaate

Tampermonkey userscript (**NextPlaate**) that speeds up posting and uploading photos on [PlatesMania](https://platesmania.com).

## Features

- Front/rear descriptions in HTML (`<font color>`), with automatic cross-links between the two photos
- Select a photo pair, then automatic edit, fill, save and return to the gallery
- "Like all" with a delay, across several pages
- Keyboard shortcuts that do not depend on the keyboard layout (`e.code`)
- Batch upload manager (`U`): HEIC previews, country and plate category per photo, one tab per photo with a delay, and Cloudflare pause detection
- Plate check on the upload page: how many photos of the plate you are typing are already on the site. Rules for the 96 countries (829 categories, 795 verified on real plates), see `docs/COUVERTURE.md`
- A Settings drawer with one switch per feature

## Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/).
2. Install the script from [Greasy Fork](https://greasyfork.org/fr/scripts/598722-nextplaate), or open `nextplaate.user.js` from this repository and click "Raw".

## Updates

Updates are delivered through Greasy Fork. Tampermonkey checks for a new version about once a day.

## License

MIT, see [LICENSE](LICENSE).

## Development

The source is split into modules in `src/`. `nextplaate.user.js` is generated from them and must not be edited by hand.

```
src/meta/        userscript header (name, version, grants)
src/core/        wrapper, storage, page detection, feature registry, keyboard
src/lib/         helpers: photo detection, description code, countries
src/ui/          design tokens, DOM helper, the docked ribbon
src/lib/plate/   one file per country: how its plate is read from the upload form
src/features/    one file per feature (upload/ holds the batch upload)
data/            what was collected on the site, one folder per country (see data/README.md)
tests/           e2e/ (pytest, simulated site) and offline/ (saved pages)
tools/           diagnostics to fix a plate rule (see docs/REGLES.md)
scripts/         build, data and coverage generators
docs/            state and plan, rules, coverage, forms, changelog of the work
src/dev/         tools of the dev build only (capture, plate test, Verify the reads, Database)
src/boot/        start-up sequence
```

A feature is one file that calls `registerFeature({...})`: its ribbon groups, its keys and its Esc behaviour. Copy an existing one (for example `src/features/20-details.js`) as a starting point.

Build locally with `node scripts/build.mjs`. Test with `python -m pytest -q` (needs `pip install playwright pytest pytest-xdist` and `playwright install chromium`). The tests run in parallel against a simulated PlatesMania (about 8 s). `python tests/offline/check_db.py` replays every known plate on the saved pages (about 20 s); `node scripts/build-data.mjs` rebuilds `data/` from them, and `node scripts/coverage.mjs` updates `docs/COUVERTURE.md` (countries and categories still to fix or to find).

Two GitHub Actions run on `main`: `build` rebuilds `nextplaate.user.js` on every push that touches `src/` (Greasy Fork picks the new version up from the repository), and `tests` runs the public and dev test suites and fails when the public script changed without a new `@version`. The dev build (`node scripts/build.mjs --dev`, not versioned) adds a Developer drawer for collecting data.

Where to start: `docs/ETAT-ET-PLAN.md` (state and plan), `docs/BRIQUES.md` (the reusable parts: bridge to another site, vehicle catalogue, inline card), `docs/STYLE.md` (design tokens, taken from the site's palette), `docs/REGLES.md` (fixing a plate rule), `docs/TODO.md` (what is left).

Remember to raise `@version` in `src/meta/00-header.txt` before pushing a release. Without a new version number, installed copies do not update.
