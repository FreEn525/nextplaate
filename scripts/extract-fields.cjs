// Offline: for every saved upload page, runs the site's own show/hide functions for each plate type
// (fake DOM, nothing is sent to the site) and writes which plate fields are visible for each type.
// Usage: node scripts/extract-fields.cjs [folder with xx.html]   -> writes fields-table.json in that folder
const fs = require('fs'), path = require('path');
const dir = process.argv[2] || path.join(__dirname, '..', 'reference', 'real', 'countries');
const PLATE_ID = /nomer|let|digit|region|^b\d|dip|drop|^dig|trl|letter|^fon|^el$|^tx$|^trz$|^nonr$/i;

// The whole source of "function name(...) { ... }", braces counted. A function lives in one <script> block, so the
// text stops at its </script>; comments are removed first (a commented-out "if (...) {" would unbalance the count).
function functionSource(s, name) {
  const a = s.indexOf('function ' + name + '(');
  if (a < 0) return null;
  const close = s.indexOf('</script>', a);
  const block = s.slice(a, close < 0 ? a + 200000 : close)
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:"'\\])\/\/[^\n]*/g, '$1');
  let d = 0, e = block.indexOf('{');
  if (e < 0) return null;
  for (; e < block.length; e++) {
    if (block[e] === '{') d++;
    else if (block[e] === '}') { d--; if (!d) return block.slice(0, e + 1); }
  }
  return null;                                   // never balanced: not a usable function
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

// "var NAME = [...]" or "NAME = {...}" in a page script: the statement, up to the closing bracket
function definitionOf(s, name) {
  const m = new RegExp('(?:^|[;\\n])\\s*(?:var\\s+|let\\s+|const\\s+)?' + name + '\\s*=\\s*([\\[{])').exec(s);
  if (m) {
    const open = m.index + m[0].length - 1, close = m[1] === '[' ? ']' : '}';
    let d = 0, inStr = null;
    for (let i = open; i < s.length; i++) {
      const c = s[i];
      if (inStr) { if (c === '\\') i++; else if (c === inStr) inStr = null; continue; }
      if (c === '"' || c === "'") inStr = c;
      else if (c === m[1]) d++;
      else if (c === close && !--d) return 'var ' + name + ' = ' + s.slice(open, i + 1) + ';';
    }
  }
  if (new RegExp('\\bid="' + name + '"').test(s)) return `var ${name} = document.getElementById('${name}');`;
  return `var ${name} = {};`;
}

function run(s, fnName, typeValue) {
  const src = functionSource(s, fnName);
  const parent = { style: {}, removeAttribute() {}, setAttribute() {}, appendChild() {}, insertBefore() {}, removeChild() {}, children: [], innerHTML: '' };
  const mk = () => ({ style: {}, disabled: false, value: '', options: [{ text: '', value: '', style: {} }], selectedIndex: 0, checked: false, removeAttribute() {}, setAttribute() {}, getAttribute: () => null, appendChild() {}, insertBefore() {}, removeChild() {}, getElementsByTagName: () => [], querySelector: () => null, querySelectorAll: () => [], addEventListener() {}, focus() {}, click() {}, children: [], firstChild: null, innerHTML: '', dataset: {}, classList: { add() {}, remove() {}, contains: () => false, toggle() {} }, parentElement: parent, parentNode: parent });
  const els = {};
  for (const id of idsUsed(src)) els[id] = mk();
  // every plate field of the page, even the ones the function never mentions
  for (const m of s.matchAll(/<(?:input|select)[^>]*\bid="([^"]+)"/g)) if (PLATE_ID.test(m[1])) els[m[1]] = els[m[1]] || mk();
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
  // Germany's helpers use a global that the page sets elsewhere ("selectReg = document.getElementById('regionfed1')")
  let globals = /\bselectReg\b/.test(helpers + src) ? "var selectReg = document.getElementById('regionfed1');\n" : '';
  // A name the function needs but only the page defines (a data table such as bmObject1 or fonOptions56, a list of ids,
  // an element kept in a variable): take its definition from the page, else the element of that id, else an empty
  // object. The visible fields come from style and disabled on known elements, so these data do not change them.
  for (let attempt = 0; attempt < 8; attempt++) {
    try {
      new Function('document', 'Option', 'window', globals + helpers + src + ';\n' + fnName + '();')(doc, Option, {});
      return { els };
    } catch (e) {
      const missing = /^(\w+) is not defined$/.exec(e.message);
      if (!missing || attempt === 7) return { error: e.message };
      globals += definitionOf(s, missing[1]) + '\n';
    }
  }
  return { els };
}

const out = {};
for (const f of fs.readdirSync(dir).filter(f => /^[a-z]{2}\.html$/.test(f))) {
  const cc = f.slice(0, 2), s = fs.readFileSync(path.join(dir, f), 'utf8');
  const types = typeList(s), fns = visibilityFunctions(s);
  const pageIds = new Set([...s.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]));   // every id of the page (a ">" in an attribute would break a tag-by-tag match)
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
        // a field the function never hides is visible by default (the page shows it)
        if (!pageIds.has(id)) continue;             // a function may name an element the page does not have: not a field
        seen[id] = el.style.visibility !== 'hidden' && !el.disabled && el.style.display !== 'none';
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
