// Reads every saved upload page and search page, and writes what they contain, country by country.
//   node scripts/analyze-pages.mjs            (after node scripts/extract-fields.cjs, which gives the visible fields)
// Reads  reference/real/countries/<cc>.html          the upload page   (saved by the dev capture)
//        reference/real/countries/search-<cc>.html   the search page
//        reference/real/countries/fields-table.json  visible fields per plate type
// Writes data/countries/<cc>/form.json    the upload form: plate types, plate fields in page order, other fields
//        data/countries/<cc>/search.json  the search form: its categories, fields and their options
// Nothing is guessed: a field is what the HTML declares (id, type, size, example, options). What the script
// cannot place is listed under "notes".
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(root, 'reference/real/countries');
const OUT = join(root, 'data/countries');

const decode = s => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const attrs = tag => Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*"([^"]*)"|\b(disabled|hidden|required|checked|multiple|readonly|selected)\b/g)].map(m => [m[1] ?? m[3], m[2] ?? true]));
const STR = String.raw`"(?:[^"\\\n]|\\.)*"`;
const LIST = new RegExp(String.raw`\[\n\s*(${STR}(?:,\n\s*${STR})*)\n\s*\]`, 'g');
const pretty = d => JSON.stringify(d, null, 2).replace(LIST, (m, items) => '[' + items.replace(/,\n\s*/g, ', ') + ']') + '\n';
const write = (p, data) => { mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, pretty(data)); };

// The fields of an HTML piece, in page order. A select keeps its options.
function fieldsOf(html) {
  const out = [];
  const re = /<(input|select|textarea)\b([^>]*)>/gi;
  let m;
  while ((m = re.exec(html))) {
    const a = attrs(m[2]), tag = m[1].toLowerCase();
    if (tag === 'input' && a.type === 'hidden') continue;   // hidden values (file size limit...) are not form fields to read
    const f = { tag, id: a.id ?? null, name: a.name ?? null };
    if (tag === 'input') f.type = a.type || 'text';
    if (a.maxlength) f.maxlength = +a.maxlength;
    if (a.placeholder) f.example = a.placeholder;
    if (a.value && tag === 'input' && ['hidden', 'radio', 'checkbox'].includes(a.type)) f.value = a.value;
    if (a.disabled) f.disabledAtLoad = true;
    if (/display:\s*none|visibility:\s*hidden/.test(a.style || '')) f.hiddenAtLoad = true;
    if (a.onkeypress && /keyCode/.test(a.onkeypress)) f.digitsOnly = true;
    if (tag === 'select') {
      const end = html.indexOf('</select>', re.lastIndex);
      const body = html.slice(re.lastIndex, end < 0 ? re.lastIndex : end);
      f.options = [...body.matchAll(/<option\b([^>]*)>([\s\S]*?)(?=<\/option>|<option\b|$)/gi)].map(o => {
        const oa = attrs(o[1]);
        return { value: oa.value ?? '', label: decode(o[2].replace(/<[^>]+>/g, '')), ...(oa.class ? { class: oa.class } : {}) };
      });
      re.lastIndex = end < 0 ? re.lastIndex : end;
    }
    out.push(f);
  }
  return out;
}

// A long option list (regions, makes) is summarised: its size and its first entries
const shortOptions = (opts, limit) => (opts.length > limit ? { count: opts.length, first: opts.slice(0, 5) } : opts);
const title = html => decode((html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || '');
// the <form> that holds the element with this id
function formAround(html, id) {
  const a = html.indexOf(`id="${id}"`);
  if (a < 0) return null;
  const s = html.lastIndexOf('<form', a), e = html.indexOf('</form>', a);
  return html.slice(s, e < 0 ? html.length : e);
}

const fields = existsSync(join(SRC, 'fields-table.json')) ? JSON.parse(readFileSync(join(SRC, 'fields-table.json'), 'utf8')) : {};
const codes = [...new Set(readdirSync(SRC).map(f => (f.match(/^(?:search-)?([a-z]{2})\.html$/) || [])[1]).filter(Boolean))].sort();
const PLATE_ID = /nomer|let|digit|region|^b\d|dip|drop|^dig|trl|letter|^fon|^el$|^tx$|^trz$|^nonr$/i;   // same list as extract-fields.cjs
const summary = [];

for (const cc of codes) {
  // ---- upload page
  const upFile = join(SRC, cc + '.html');
  if (existsSync(upFile)) {
    const html = readFileSync(upFile, 'utf8');
    const form = formAround(html, 'frm'), notes = [];
    if (!form) notes.push('no upload form (#frm) in the page');
    else {
      const all = fieldsOf(form);
      const iFile = all.findIndex(f => f.type === 'file');
      // The menu that chooses the plate type: #ctype on most pages; Andorra and Malta call it drop_2; the Netherlands has none
      // (its "fon" menu is the look of the plate, and the category follows from the plate text).
      const typeMenu = all.find(f => f.id === 'ctype') || all.find(f => f.id === 'drop_2') || null;
      // How the form describes the plate: a type menu (ctype / drop_2), or only a region menu (drop_1: US states, Australian
      // states, Canadian provinces, emirates) with a free plate text, or just a free plate text
      const hasRegion = all.some(x => x.id === 'drop_1' && x.tag === 'select');
      const layout = typeMenu ? 'type-menu' : hasRegion ? 'region-menu' : 'free-text';
      if (!typeMenu) notes.push(hasRegion ? 'no plate type menu: the plate is chosen by region (#drop_1) and typed freely' : 'no plate type menu: the plate is typed freely');
      else if (typeMenu.id !== 'ctype') notes.push(`the plate type menu is #${typeMenu.id}, not #ctype`);
      if (iFile < 0) notes.push('no photo field');
      const before = iFile < 0 ? all : all.slice(0, iFile);               // everything before the photo field: the plate
      const after = iFile < 0 ? [] : all.slice(iFile + 1);                // after it: description, make, model...
      const f = fields[cc] || {};
      const plateFields = before.filter(x => x !== typeMenu);
      // which fields show for a type: computed by running the site's own show/hide function (extract-fields.cjs);
      // a page with no such function shows every field that is not hidden when the page loads
      const fromScript = (f.functions ?? []).length > 0;
      const shownAtLoad = plateFields.filter(x => PLATE_ID.test(x.id || x.name || '') && !x.hiddenAtLoad && !x.disabledAtLoad).map(x => x.id || x.name);
      const types = (typeMenu?.options ?? []).filter(o => o.value).map(o => ({
        id: o.value, label: o.label, ...(o.class ? { class: o.class } : {}),
        visible: fromScript ? (f.types?.[o.value]?.visible ?? null) : shownAtLoad,
        ...(f.types?.[o.value]?.error ? { error: f.types[o.value].error } : {})
      }));
      write(join(OUT, cc, 'form.json'), {
        code: cc, title: title(html), action: (form.match(/action="([^"]*)"/) || [])[1] ?? null,
        typeMenu: typeMenu ? typeMenu.id : null,
        layout,
        visibleFrom: fromScript ? 'site-script' : 'page-at-load',
        types,
        hooks: f.functions ?? [],
        plateFields: plateFields.map(x => ({ ...x, ...(x.options ? { options: shortOptions(x.options, 400) } : {}) })),
        otherFields: after.map(x => ({ tag: x.tag, id: x.id, name: x.name, ...(x.type ? { type: x.type } : {}), ...(x.options ? { options: x.options.length } : {}) })),
        notes
      });
      summary.push({ cc, kind: 'add', typeMenu: typeMenu?.id ?? null, types: types.length, plateFields: plateFields.length, other: after.length, fromScript, errors: types.filter(t => t.error).length, notes });
    }
    if (!form) summary.push({ cc, kind: 'add', notes });
  }
  // ---- search page: the form that holds the category menu
  const seFile = join(SRC, `search-${cc}.html`);
  if (existsSync(seFile)) {
    const html = readFileSync(seFile, 'utf8');
    const form = formAround(html, 'ctype'), notes = [];
    const fl = form ? fieldsOf(form) : [];
    if (!form) notes.push('no category menu (#ctype)');
    const cats = (fl.find(f => f.id === 'ctype')?.options ?? []).filter(o => o.value);
    write(join(OUT, cc, 'search.json'), {
      code: cc, title: title(html),
      categories: cats.map(o => ({ id: o.value, label: o.label, ...(o.class ? { class: o.class } : {}) })),
      fields: fl.filter(f => f.id !== 'ctype').map(x => ({ ...x, ...(x.options ? { options: shortOptions(x.options, 60) } : {}) })),
      notes
    });
    summary.push({ cc, kind: 'search', categories: cats.length, fields: fl.length - (form ? 1 : 0), notes });
  }
}
console.log(`${summary.filter(s => s.kind === 'add').length} upload pages, ${summary.filter(s => s.kind === 'search').length} search pages analysed`);
for (const s of summary.filter(s => s.notes.length)) console.log('  note', s.cc, s.kind, s.notes.join('; '));

// ---- docs/FORMULAIRES.md: what the pages say, all countries side by side (generated: do not edit by hand)
const rd = p => JSON.parse(readFileSync(join(OUT, p), 'utf8'));
const rows = [], vocab = {}, otherVocab = {}, onlyForm = [], onlySearch = [];
for (const cc of codes) {
  if (!existsSync(join(OUT, cc, 'form.json')) || !existsSync(join(OUT, cc, 'search.json'))) continue;
  const f = rd(`${cc}/form.json`), se = rd(`${cc}/search.json`);
  const norm = s => s.toLowerCase();
  const same = (a, b) => norm(a) === norm(b) || norm(a).startsWith(norm(b) + ' (');   // "2001 year system (AA11AAA)" is the form's name for "2001 year system"
  const fOnly = f.types.filter(t => !se.categories.some(c => same(t.label, c.label))).map(t => t.label);
  const sOnly = se.categories.filter(c => !f.types.some(t => same(t.label, c.label))).map(c => c.label);
  fOnly.forEach(l => onlyForm.push(`${cc}: ${l}`)); sOnly.forEach(l => onlySearch.push(`${cc}: ${l}`));
  f.plateFields.forEach(x => { const k = x.id || x.name; (vocab[k] ??= new Set()).add(cc); });
  f.otherFields.forEach(x => { const k = x.id || x.name; (otherVocab[k] ??= new Set()).add(cc); });
  rows.push({ cc, menu: f.typeMenu ?? '-', layout: f.layout, types: f.types.length, cats: se.categories.length, fromScript: f.visibleFrom === 'site-script', errors: f.types.filter(t => t.error).length, fields: f.plateFields.length, sOnly: sOnly.length, fOnly: fOnly.length, notes: f.notes });
}
const sum = k => rows.reduce((n, r) => n + r[k], 0);
const md = [
  '# Ce que disent les pages sauvegardées', '',
  'Généré par `node scripts/analyze-pages.mjs` à partir de `reference/real/countries` : ne pas modifier à la main. Les détails de chaque pays sont dans `data/countries/<cc>/form.json` (formulaire d\'ajout) et `search.json` (page de recherche).', '',
  '## En chiffres', '',
  `- Pays analysés : ${rows.length} (page d'ajout et page de recherche).`,
  `- Menu de type de plaque : \`#ctype\` dans ${rows.filter(r => r.menu === 'ctype').length} pays, \`#drop_2\` dans ${rows.filter(r => r.menu === 'drop_2').length} (${rows.filter(r => r.menu === 'drop_2').map(r => r.cc).join(', ')}), aucun dans ${rows.filter(r => r.menu === '-').length} (${rows.filter(r => r.menu === '-').map(r => r.cc).join(', ')}).`,
  `- Types dans les formulaires d'ajout : ${sum('types')}. Catégories dans les pages de recherche : ${sum('cats')}.`,
  `- Champs visibles par type : calculés avec le script du site dans ${rows.filter(r => r.fromScript).length} pays ; lus tels que la page les affiche au chargement dans ${rows.filter(r => !r.fromScript).length} pays (aucune fonction d'affichage : ${rows.filter(r => !r.fromScript).map(r => r.cc).join(', ')}).`,
  `- Types où le calcul a échoué : ${sum('errors')}.`, '',
  '## Les trois formes de formulaire', '',
  `- **Menu de type** (\`ctype\` : ${rows.filter(r => r.menu === 'ctype').length} pays ; \`drop_2\` : ${rows.filter(r => r.menu === 'drop_2').map(r => r.cc).join(', ')}) : la catégorie se choisit dans le formulaire, donc sa règle peut être essayée une à une.`,
  `- **Menu de région seulement** (\`drop_1\`, texte libre pour la plaque) : ${rows.filter(r => r.layout === 'region-menu').map(r => r.cc).join(', ')}. Le formulaire ne choisit pas de catégorie : la recherche du site filtre par région (ae, au, ca, us, xx n'ont donc aucune catégorie de recherche ; mx en a 20 qui ne se choisissent pas dans le formulaire).`,
  `- **Texte libre** (aucun menu) : ${rows.filter(r => r.layout === 'free-text').map(r => r.cc).join(', ')}. La catégorie se déduit du texte de la plaque côté site (Pays-Bas : le champ \`fon\` ne décrit que l'apparence).`,
  '', '### Noms de catégorie qui ne correspondent pas entre le formulaire et la recherche', '',
  ...(onlyForm.length || onlySearch.length ? [...onlyForm.map(l => `- formulaire seulement : ${l}`), ...onlySearch.map(l => `- recherche seulement : ${l}`)] : ['Aucun.']), '',
  '## Par pays', '', '| Pays | Forme | Menu de type | Types (ajout) | Catégories (recherche) | Champs de plaque | Champs visibles | Erreurs | Notes |', '|---|---|---|---|---|---|---|---|---|',
  ...rows.map(r => `| ${r.cc} | ${r.layout} | ${r.menu} | ${r.types} | ${r.cats} | ${r.fields} | ${r.fromScript ? 'script du site' : 'page au chargement'} | ${r.errors || ''} | ${r.notes.join(' ; ')} |`), '',
  '## Champs de plaque (identifiants et nombre de pays qui les ont)', '',
  Object.entries(vocab).sort((a, b) => b[1].size - a[1].size || a[0].localeCompare(b[0])).map(([k, v]) => `\`${k}\` ${v.size}`).join(' · '), '',
  '## Autres champs du formulaire (après la photo)', '',
  Object.entries(otherVocab).sort((a, b) => b[1].size - a[1].size || a[0].localeCompare(b[0])).map(([k, v]) => `\`${k}\` ${v.size}`).join(' · '), ''
];
writeFileSync(join(root, 'docs/FORMULAIRES.md'), md.join('\n'));
console.log('docs/FORMULAIRES.md written');
