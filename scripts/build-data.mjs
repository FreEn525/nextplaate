// Organises what was collected on PlatesMania into data/, one folder per country.
//   node scripts/build-data.mjs
// Reads  reference/real/countries/   (saved pages and dev exports: local, not in the repository)
// Writes data/countries/<cc>/country.json   name, search categories, upload form types (visible fields)
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
const decode = s => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();
const byText = (a, b) => String(a).localeCompare(String(b), 'en', { numeric: true });

// country names: the list the script itself uses
const countriesSrc = readFileSync(join(root, 'src/lib/countries.js'), 'utf8');
const names = Object.fromEntries([...countriesSrc.matchAll(/\{ code: '([a-z]{2})', name: '([^']*)' \}/g)].map(m => [m[1], m[2]]));

// the type menu (ctype) of a saved page: [{ id, label }]
function ctypeOptions(file) {
  if (!existsSync(join(SRC, file))) return null;
  const html = readFileSync(join(SRC, file), 'utf8');
  const sel = html.match(/<select[^>]*\bid="ctype"[^>]*>([\s\S]*?)<\/select>/i);
  if (!sel) return [];
  return [...sel[1].matchAll(/<option[^>]*value="([^"]*)"[^>]*>([\s\S]*?)<\/option>/gi)]
    .map(m => ({ id: m[1], label: decode(m[2].replace(/<[^>]+>/g, '')) })).filter(o => o.id && o.label);
}

const fields = readJson('fields-table.json');
const seen = readJson('plates-db.json');
const codes = [...new Set([...Object.keys(fields), ...seen.map(p => p.country),
  ...Object.keys(names).filter(c => existsSync(join(SRC, c + '.html')) || existsSync(join(SRC, 'search-' + c + '.html')))])].sort();

const index = [];
for (const cc of codes) {
  const search = ctypeOptions(`search-${cc}.html`);
  const hasAdd = existsSync(join(SRC, cc + '.html'));
  const f = fields[cc] || { functions: [], types: {} };
  const upload = Object.entries(f.types).map(([id, t]) => ({ id, label: t.label, visible: t.visible }))
    .sort((a, b) => byText(a.id, b.id));
  write(join(OUT, 'countries', cc, 'country.json'), {
    code: cc, name: names[cc] || cc.toUpperCase(),
    upload: hasAdd ? { typeMenu: upload.length > 0, hooks: f.functions, types: upload } : null,
    search: search ? { categories: search } : null
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

  index.push({ code: cc, name: names[cc] || cc.toUpperCase(), upload: hasAdd, uploadTypes: upload.length,
    searchCategories: search ? search.length : 0, plates: plates.length,
    categoriesWithPlate: new Set(plates.map(p => p.category)).size });
}
write(join(OUT, 'index.json'), index);
console.log(`data/: ${index.length} countries, ${index.reduce((n, c) => n + c.plates, 0)} plates, ${index.reduce((n, c) => n + c.searchCategories, 0)} search categories`);
