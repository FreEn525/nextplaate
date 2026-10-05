// Organises what was collected on PlatesMania into data/, one folder per country.
//   node scripts/build-data.mjs
// Reads  reference/real/countries/plates-db.json   (plates the dev tools saw) and data/countries/<cc>/form.json + search.json
//        (written by scripts/analyze-pages.mjs, which reads the saved pages: local, not in the repository)
// Writes data/countries/<cc>/country.json   name, which pages exist, which menu chooses the plate type
//        data/countries/<cc>/plates.json    plates seen on the site, per category
//        data/index.json                    one line per country, with counts
// The output is sorted and has no run date, so the same input gives the same files (clean diffs).
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(root, 'reference/real/countries');
const OUT = join(root, 'data');
if (!existsSync(SRC)) throw new Error('Missing ' + SRC + ' (the saved pages are local only)');

// two-space JSON, but a list of plain strings stays on one line (field names, for example)
const STR = String.raw`"(?:[^"\\\n]|\\.)*"`;
const LIST = new RegExp(String.raw`\[\n\s*(${STR}(?:,\n\s*${STR})*)\n\s*\]`, 'g');
const pretty = data => JSON.stringify(data, null, 2).replace(LIST, (m, items) => '[' + items.replace(/,\n\s*/g, ', ') + ']') + '\n';
const readJson = f => JSON.parse(readFileSync(join(SRC, f), 'utf8'));
const write = (path, data) => { mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, pretty(data)); };
const byText = (a, b) => String(a).localeCompare(String(b), 'en', { numeric: true });

// country names: the list the script itself uses
const countriesSrc = readFileSync(join(root, 'src/lib/countries.js'), 'utf8');
const names = Object.fromEntries([...countriesSrc.matchAll(/\{ code: '([a-z]{2})', name: '([^']*)' \}/g)].map(m => [m[1], m[2]]));

const seen = readJson('plates-db.json');
const analysed = cc => ['form', 'search'].map(k => { const f = join(OUT, 'countries', cc, k + '.json'); return existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : null; });
const codes = [...new Set([...seen.map(p => p.country),
  ...Object.keys(names).filter(c => existsSync(join(SRC, c + '.html')) || existsSync(join(SRC, 'search-' + c + '.html')))])].sort();

const index = [];
for (const cc of codes) {
  // form.json and search.json come from node scripts/analyze-pages.mjs (run it first)
  const [form, search] = analysed(cc);
  const upload = form ? form.types : [];
  const categories = search ? search.categories : [];
  write(join(OUT, 'countries', cc, 'country.json'), {
    code: cc, name: names[cc] || cc.toUpperCase(),
    pages: { upload: !!form, search: !!search },
    typeMenu: form ? form.typeMenu : null
  });

  // one entry per category and plate, the newest count wins
  const best = new Map();
  for (const p of seen.filter(p => p.country === cc)) {
    const key = p.category + '|' + p.plate.replace(/[\s-]+/g, '').toUpperCase();
    if (!best.has(key) || best.get(key).date < p.date) best.set(key, p);
  }
  const plates = [...best.values()].map(({ category, plate, read, count, date, source }) => ({ category, plate, read, count, date, ...(source ? { source } : {}) }))
    .sort((a, b) => byText(a.category, b.category) || byText(a.plate, b.plate));
  write(join(OUT, 'countries', cc, 'plates.json'), plates);

  index.push({ code: cc, name: names[cc] || cc.toUpperCase(), upload: !!form, uploadTypes: upload.length,
    searchCategories: categories.length, plates: plates.length,
    categoriesWithPlate: new Set(plates.map(p => p.category)).size });
}
write(join(OUT, 'index.json'), index);
console.log(`data/: ${index.length} countries, ${index.reduce((n, c) => n + c.plates, 0)} plates, ${index.reduce((n, c) => n + c.searchCategories, 0)} search categories`);
