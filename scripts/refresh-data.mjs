// Rebuilds everything derived from the saved pages, in order:
//   node scripts/refresh-data.mjs
//   1. extract-fields.cjs  which fields each plate type shows (runs the site's own show/hide functions)
//   2. analyze-pages.mjs   data/countries/<cc>/form.json and search.json, docs/FORMULAIRES.md
//   3. build-data.mjs      data/countries/<cc>/country.json and plates.json, data/index.json
//   4. coverage.mjs        docs/COUVERTURE.md (uses data/check.json: run python tests/offline/check_db.py first to refresh it)
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));
for (const script of ['extract-fields.cjs', 'analyze-pages.mjs', 'build-data.mjs', 'coverage.mjs']) {
  console.log('>', script);
  execFileSync(process.execPath, [join(dir, script)], { stdio: 'inherit' });
}
