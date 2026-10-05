// Writes docs/COUVERTURE.md: which countries and categories the plate rules cover, and what is left.
//   node scripts/coverage.mjs
// Reads  data/countries/<cc>/search.json    categories of the site (node scripts/analyze-pages.mjs)
//        data/countries/<cc>/search.json    categories of the site (node scripts/analyze-pages.mjs)
//        data/check.json                    result of the last full run of tests/offline/check_db.py
//        src/lib/plate/<cc>.js              a country with its own rule (the others read the visible fields)
//        src/lib/countries.js               every country of the site
// Update after a fix:  python tests/offline/check_db.py && node scripts/coverage.mjs
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const json = p => JSON.parse(readFileSync(join(root, p), 'utf8'));
const check = existsSync(join(root, 'data/check.json')) ? json('data/check.json') : null;
if (!check) throw new Error('data/check.json is missing: run python tests/offline/check_db.py first');

const siteCountries = [...readFileSync(join(root, 'src/lib/countries.js'), 'utf8').matchAll(/\{ code: '([a-z]{2})', name: '([^']*)' \}/g)].map(m => ({ code: m[1], name: m[2] }));
const ownRule = new Set(readdirSync(join(root, 'src/lib/plate')).filter(f => /^[a-z]{2}\.js$/.test(f)).map(f => f.slice(0, 2)));
const index = json('data/index.json');

const rows = [], failing = [], unknown = {};
let cats = 0, ok = 0, bad = 0, none = 0;
for (const c of index) {
  const list = json(`data/countries/${c.code}/search.json`).categories.map(x => x.label);
  const res = check[c.code] ?? {};
  let o = 0, b = 0, n = 0;
  for (const label of list) {
    const r = res[label];
    if (!r) { n++; (unknown[c.code] ??= []).push(label); continue; }
    if (r.ok === r.total) o++;
    else { b++; failing.push({ code: c.code, label, r }); }
  }
  cats += list.length; ok += o; bad += b; none += n;
  rows.push({ code: c.code, name: c.name, rule: ownRule.has(c.code) ? 'own' : 'generic', total: list.length, o, b, n, add: c.upload });
}
const pct = (a, t) => (t ? Math.round((100 * a) / t) : 0) + ' %';
const captured = new Set(index.map(c => c.code));
const notCaptured = siteCountries.filter(c => !captured.has(c.code));

const out = [];
out.push('# Couverture des règles de plaque', '',
  'Généré par `node scripts/coverage.mjs` : ne pas modifier à la main. Après une correction : `python tests/offline/check_db.py && node scripts/coverage.mjs`.', '',
  '**Vérifié** = au moins une plaque connue du site, et toutes relues correctement par le script dans la page sauvegardée. **À corriger** = une plaque connue est mal relue. **À trouver** = aucune plaque connue pour cette catégorie : la règle n\'est pas prouvée.', '',
  '## Résumé', '',
  '| | Nombre | Part |', '|---|---|---|',
  `| Pays du site | ${siteCountries.length} | |`,
  `| Pays capturés (pages sauvegardées) | ${index.length} | ${pct(index.length, siteCountries.length)} |`,
  `| **Pays non capturés** | **${notCaptured.length}** | |`,
  `| Pays avec une règle propre | ${rows.filter(r => r.rule === 'own').length} sur ${index.length} | |`,
  `| Catégories (pays capturés) | ${cats} | |`,
  `| Vérifiées | ${ok} | ${pct(ok, cats)} |`,
  `| **À corriger** | **${bad}** | ${pct(bad, cats)} |`,
  `| **À trouver** (aucune plaque connue) | **${none}** | ${pct(none, cats)} |`, '');

out.push('## À corriger', '');
if (!failing.length) out.push('Aucune.', '');
else {
  out.push('| Pays | Catégorie | OK | Plaque attendue | Lue |', '|---|---|---|---|---|');
  for (const f of failing) for (const x of f.r.failed)
    out.push(`| ${f.code} | ${f.label} | ${f.r.ok}/${f.r.total} | \`${x.plate}\` | \`${x.read}\` |`);
  out.push('');
}

out.push('## Par pays', '', '`own` : règle dans `src/lib/plate/<cc>.js`. `generic` : lecture des champs visibles.', '',
  '| Pays | Règle | Catégories | Vérifiées | À corriger | À trouver | Page d\'ajout |', '|---|---|---|---|---|---|---|');
for (const r of rows.sort((a, b) => (b.b + b.n) - (a.b + a.n) || a.code.localeCompare(b.code)))
  out.push(`| ${r.code} ${r.name} | ${r.rule} | ${r.total} | ${r.o} | ${r.b || ''} | ${r.n || ''} | ${r.add ? 'oui' : 'non'} |`);
out.push('');

out.push('## Catégories à trouver (par pays)', '', 'Pour chacune : trouver une plaque réelle sur le site, la saisir, puis relancer le contrôle. Le remplissage du build dev (`Fill missing plates`) le fait.', '');
for (const code of Object.keys(unknown).sort()) {
  out.push(`<details><summary><b>${code}</b> : ${unknown[code].length}</summary>`, '', ...unknown[code].map(l => `- ${l}`), '', '</details>', '');
}

out.push('## Pays non capturés', '', 'Aucune page sauvegardée : ni catégories, ni règle. Capturer avec le build dev (tiroir *Dev*, `Capture`).', '',
  notCaptured.map(c => `${c.code} ${c.name}`).join(' · '), '');
writeFileSync(join(root, 'docs/COUVERTURE.md'), out.join('\n'));
console.log(`docs/COUVERTURE.md: ${ok} verified, ${bad} to fix, ${none} to find, of ${cats} categories; ${notCaptured.length} countries not captured`);
