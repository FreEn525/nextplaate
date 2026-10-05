# PlatesMania - NextPlaate

Tampermonkey userscript (**NextPlaate**) that speeds up posting and uploading photos on [PlatesMania](https://platesmania.com).

## Features

- Front/rear descriptions in HTML (`<font color>`), with automatic cross-links between the two photos
- Select a photo pair, then automatic edit, fill, save and return to the gallery
- "Like all" with a delay, across several pages
- Keyboard shortcuts that do not depend on the keyboard layout (`e.code`)
- Batch upload manager (`U`): HEIC previews, country and plate category per photo, one tab per photo with a delay, and Cloudflare pause detection

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
src/boot/        start-up sequence
```

A feature is one file that calls `registerFeature({...})`: its ribbon groups, its keys and its Esc behaviour. Copy an existing one (for example `src/features/20-details.js`) as a starting point.

Build locally with `node scripts/build.mjs`. Test with `python -m pytest -q` (needs `pip install playwright pytest pytest-xdist` and `playwright install chromium`). The tests run in parallel against a simulated PlatesMania (about 8 s). `python tests/offline/check_db.py` replays every known plate on the saved pages (about 20 s); `node scripts/build-data.mjs` rebuilds `data/` from them.

A GitHub Action rebuilds the file on every push that touches `src/`, and Greasy Fork picks up the new version from the repository.

Remember to raise `@version` in `src/meta/00-header.txt` before pushing a release. Without a new version number, installed copies do not update.
