# NextPlaate

Tampermonkey userscript that speeds up posting and uploading photos on [PlatesMania](https://platesmania.com).

## Features

- Front/rear descriptions in HTML (`<font color>`), with automatic cross-links between the two photos
- Select a photo pair, then automatic edit, fill, save and return to the gallery
- "Like all" with a delay, across several pages
- Keyboard shortcuts that do not depend on the keyboard layout (`e.code`)
- Batch upload manager (`U`): HEIC previews, country and plate category per photo, one tab per photo with a delay, and Cloudflare pause detection

## Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/).
2. Install the script from Greasy Fork (link to be added) or open `nextplaate.user.js` from this repository and click "Raw".

## Updates

Updates are delivered through Greasy Fork. Tampermonkey checks for a new version about once a day.

## License

MIT, see [LICENSE](LICENSE).

## Development

The source is split into modules in `src/`. `nextplaate.user.js` is generated from them and must not be edited by hand.

```
src/core/      header, wrapper, storage
src/ui/        shared look, page style, panel, rendering, selection
src/photos/    photo detection, code generation
src/edit/      edit flow, back to gallery, like
src/batch/     upload queue, manager, adding photos, tabs
src/nav/       gallery pagination
src/input/     keyboard shortcuts
src/start.js   startup
```

Build locally with `node scripts/build.mjs`. A GitHub Action rebuilds the file on every push that touches `src/`, and Greasy Fork picks up the new version from the repository.

Remember to raise `@version` in `src/core/00-meta.txt` before pushing a release. Without a new version number, installed copies do not update.
