// Offline: for every saved upload page, runs the site's own show/hide functions for each plate type
// (fake DOM, nothing is sent to the site) and writes which plate fields are visible for each type.
// Usage: node scripts/extract-fields.cjs [folder with xx.html]   -> writes fields-table.json in that folder
const fs = require('fs'), path = require('path');
const dir = process.argv[2] || path.join(__dirname, '..', 'reference', 'real', 'countries');
const PLATE_ID = /nomer|let|digit|region|^b\d|dip|drop|^dig|trl|letter|^fon|^el$|^tx$|^trz$|^nonr$/i;

// The whole source of "function name(...) { ... }", braces counted
function functionSource(s, name) {
  const a = s.indexOf('function ' + name + '(');
  if (a < 0) return null;
  let d = 0, e = s.indexOf('{', a);
  const start = e;
  for (; e < s.length; e++) {
    if (s[e] === '{') d++;
    else if (s[e] === '}') { d--; if (!d) break; }
  }
  // braces inside strings can unbalance the count: then the body stops at the next function
  if (e >= s.length || e - a > 60000) { const next = s.indexOf('function ', start + 1); return s.slice(a, next > 0 ? next : a + 60000); }
  // HTML inside a string can break the parse: keep the code before the first closing tag
  const body = s.slice(a, e + 1);
  return body.includes('</') ? body.slice(0, body.indexOf('</')) : body;
}

const allFunctions = s => [...new Set([...s.matchAll(/function\s+(\w+)\s*\(/g)].map(m => m[1]))];

function typeList(s) {
  const sel = s.match(/<select[^>]*name="ctype"[\s\S]*?<\/select>/);
  if (!sel) return [];
  return [...sel[0].matchAll(/<option[^>]*value="([^"]*)"[^>]*>([^<]*)/g)].map(m => [m[1], m[2].trim()]);
}

// Functions with no argument that change the visibility of fields (style.visibility / display, read from ctype)
function visibilityFunctions(s) {
  const names = [];
  for (const name of allFunctions(s)) {
    const src = functionSource(s, name);
    if (src && /style\.visibility|style\.display/.test(src) && /ctype|month/.test(src)) names.push(name);
  }
  return names;
}

// Every getElementById("...") the function uses
function idsUsed(src) {
  return [...new Set([...(src || '').matchAll(/getElementById\(\s*["']([^"']+)["']\s*\)/g)].map(m => m[1]))];
}

function run(s, fnName, typeValue) {
  const src = functionSource(s, fnName);
  const mk = () => ({ style: {}, disabled: false, value: '', options: [], selectedIndex: 0, checked: false, removeAttribute() {}, setAttribute() {}, appendChild() {}, addEventListener() {}, parentElement: { style: {}, removeAttribute() {}, setAttribute() {}, appendChild() {} } });
  const els = {};
  for (const id of idsUsed(src)) els[id] = mk();
  els.ctype = { ...mk(), value: typeValue };
  const doc = {
    getElementById: id => (els[id] = els[id] || mk()),
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: () => mk()
  };
  const Option = function (t, v) { this.text = t; this.value = v; };
  // the helpers the page defines too (setLetterFieldMode, vfRbox...), each one only if it parses
  let helpers = '';
  for (const name of allFunctions(s)) {
    if (name === fnName) continue;
    const h = functionSource(s, name);
    if (!h) continue;
    try { new Function(h); helpers += h + ';\n'; } catch (e) { /* not usable here */ }
  }
  try {
    new Function('document', 'Option', 'window', helpers + src + ';\n' + fnName + '();')(doc, Option, {});
  } catch (e) {
    return { error: e.message };
  }
  return { els };
}

const out = {};
for (const f of fs.readdirSync(dir).filter(f => /^[a-z]{2}\.html$/.test(f))) {
  const cc = f.slice(0, 2), s = fs.readFileSync(path.join(dir, f), 'utf8');
  const types = typeList(s), fns = visibilityFunctions(s);
  const entry = { functions: fns, types: {} };
  if (!types.length) { entry.note = 'no type menu'; out[cc] = entry; continue; }
  for (const [v, label] of types) {
    const seen = {};
    let error = null;
    for (const fn of fns) {
      const r = run(s, fn, v);
      if (r.error) { error = r.error; continue; }
      for (const [id, el] of Object.entries(r.els)) {
        if (id === 'ctype' || !PLATE_ID.test(id)) continue;
        seen[id] = el.style.visibility === 'visible' && !el.disabled && el.style.display !== 'none';
      }
    }
    entry.types[v] = { label, visible: Object.keys(seen).filter(id => seen[id]), ...(error ? { error } : {}) };
  }
  out[cc] = entry;
}
fs.writeFileSync(path.join(dir, 'fields-table.json'), JSON.stringify(out, null, 2));

const withFns = Object.values(out).filter(e => e.functions && e.functions.length).length;
const errors = {};
for (const [c, e] of Object.entries(out)) for (const t of Object.values(e.types || {})) if (t.error) errors[c + ': ' + t.error] = (errors[c + ': ' + t.error] || 0) + 1;
console.log(`countries: ${Object.keys(out).length}, with a visibility function: ${withFns}`);
console.log('errors:', errors);
