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

const rows = [], failing = [], unknown = {}, untestable = {}, emptyGal = {};
let cats = 0, ok = 0, bad = 0, none = 0, noForm = 0, noPlate = 0;
for (const c of index) {
  const list = json(`data/countries/${c.code}/search.json`).categories.map(x => x.label);
  const res = check[c.code] ?? {};
  const emptyFile = join(root, `data/countries/${c.code}/empty.json`);
  const empties = new Set(existsSync(emptyFile) ? json(`data/countries/${c.code}/empty.json`) : []);
  let o = 0, b = 0, n = 0, u = 0, e = 0;
  // a category can be tried only through the upload form's type menu: no upload page, or no menu (the Netherlands), means it cannot
  const form = existsSync(join(root, `data/countries/${c.code}/form.json`)) ? json(`data/countries/${c.code}/form.json`) : null;
  const why = !form ? "pas de page d'ajout" : !form.typeMenu ? 'pas de menu de type' : null;
  for (const label of list) {
    const r = res[label];
    if (!r && why) { u++; (untestable[c.code] ??= []).push({ label, why }); continue; }
    if (!r && empties.has(label)) { e++; (emptyGal[c.code] ??= []).push(label); continue; }
    if (!r) { n++; (unknown[c.code] ??= []).push(label); continue; }
    if (r.ok === r.total) o++;
    // every failed plate says the form cannot take this category at all: not a rule to fix
    else if (r.ok === 0 && r.failed.every(f => f.status === 'no-type')) { u++; (untestable[c.code] ??= []).push({ label, why: 'absente du menu du formulaire' }); }
    else if (r.ok === 0 && r.failed.every(f => f.status === 'no-field')) { u++; (untestable[c.code] ??= []).push({ label, why: "le formulaire n'a aucun champ de plaque pour ce type" }); }
    else { b++; failing.push({ code: c.code, label, r }); }
  }
  cats += list.length; ok += o; bad += b; none += n; noForm += u; noPlate += e;
  rows.push({ code: c.code, name: c.name, rule: ownRule.has(c.code) ? 'own' : 'generic', total: list.length, o, b, n, u, e, add: c.upload });
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
  `| **À trouver** (aucune plaque connue) | **${none}** | ${pct(none, cats)} |`,
  `| Galerie vide sur le site (aucune plaque n'existe) | ${noPlate} | ${pct(noPlate, cats)} |`,
  `| Non prouvables par catégorie (pas de menu de type, catégorie absente du menu, ou aucun champ de plaque) | ${noForm} | ${pct(noForm, cats)} |`, '');

out.push('## À corriger', '');
if (!failing.length) out.push('Aucune.', '');
else {
  out.push('| Pays | Catégorie | OK | Plaque attendue | Lue |', '|---|---|---|---|---|');
  for (const f of failing) for (const x of f.r.failed)
    out.push(`| ${f.code} | ${f.label} | ${f.r.ok}/${f.r.total} | \`${x.plate}\` | \`${x.read}\` |`);
  out.push('');
}

out.push('## Par pays', '', '`own` : règle dans `src/lib/plate/<cc>.js`. `generic` : lecture des champs visibles.', '',
  "| Pays | Règle | Catégories | Vérifiées | À corriger | À trouver | Galerie vide | Non testables | Page d'ajout |", '|---|---|---|---|---|---|---|---|---|');
for (const r of rows.sort((a, b) => (b.b + b.n) - (a.b + a.n) || a.code.localeCompare(b.code)))
  out.push(`| ${r.code} ${r.name} | ${r.rule} | ${r.total} | ${r.o} | ${r.b || ''} | ${r.n || ''} | ${r.e || ''} | ${r.u || ''} | ${r.add ? 'oui' : 'non'} |`);
out.push('');

out.push('## Catégories à trouver (par pays)', '', 'Pour chacune : trouver une plaque réelle sur le site, la saisir, puis relancer le contrôle. Le remplissage du build dev (`Fill missing plates`) le fait.', '');
for (const code of Object.keys(unknown).sort()) {
  out.push(`<details><summary><b>${code}</b> : ${unknown[code].length}</summary>`, '', ...unknown[code].map(l => `- ${l}`), '', '</details>', '');
}

out.push('## Galerie vide sur le site', '', "Aucune photo dans la galerie de ces catégories : il n'y a pas de plaque à utiliser. À revérifier de temps en temps.", '');
for (const code of Object.keys(emptyGal).sort()) out.push(`- **${code}** : ${emptyGal[code].join(', ')}`);
out.push('');

out.push('## Non prouvables par catégorie', '', "Ces catégories existent dans la recherche du site mais le formulaire d'ajout ne permet pas de les choisir : leur règle ne peut pas être prouvée hors ligne **par catégorie**. La vérification de plaque, elle, cherche le texte de la plaque et marche quand même (vérifié à la main pour les Pays-Bas).", '');
for (const code of Object.keys(untestable).sort()) {
  const byWhy = {};
  for (const x of untestable[code]) (byWhy[x.why] ??= []).push(x.label);
  out.push(`- **${code}** : ` + Object.entries(byWhy).map(([why, l]) => `${why} (${l.length})` + (l.length <= 4 ? ' : ' + l.join(', ') : '')).join(' ; '));
}
out.push('');

// what was checked by hand on the real site (tests/offline/known_plates.json): the proof the offline check cannot give
const known = JSON.parse(readFileSync(join(root, 'tests/offline/known_plates.json'), 'utf8'));
const knownList = Object.entries(known).flatMap(([cc, v]) => (Array.isArray(v) ? v : [v]).map(x => (typeof x === 'string' ? x : x.plate + (x.category ? ' (' + x.category + ')' : '')) + ' [' + cc + ']'));
out.push('## Vérifiées à la main sur le vrai site', '', `${knownList.length} plaques tapées dans le formulaire du site, que la vérification a trouvées : ${knownList.join(' · ')}.`, '',
  'La vérification de plaque cherche le **texte de la plaque** sur le site, sans la catégorie : pour un formulaire sans menu de type (Pays-Bas, Mexique, Singapour...) elle fonctionne donc, même si la catégorie ne peut pas être prouvée hors ligne.', '');

out.push('## Pays non capturés', '', 'Aucune page sauvegardée : ni catégories, ni règle. Capturer avec le build dev (tiroir *Dev*, `Capture`).', '',
  notCaptured.map(c => `${c.code} ${c.name}`).join(' · '), '');
writeFileSync(join(root, 'docs/COUVERTURE.md'), out.join('\n'));
console.log(`docs/COUVERTURE.md: ${ok} verified, ${bad} to fix, ${none} to find, of ${cats} categories; ${notCaptured.length} countries not captured`);
