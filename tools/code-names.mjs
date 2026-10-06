// For the regions that found no shape by their own name, looks in what Wikidata says (tools/wikidata-*.py):
//  - codes: the first label of the plate code that finds a shape becomes the name of that code;
//  - parents: the first administrative unit the place lies in (the county of a town) that finds a shape, by normalised place name; else the
//    shape that holds the point of the place (Wikidata coordinates, geo: place -> shape name);
//  - countries: what is still not placed and is the name of a country (diplomatic plates) is no area: its normalised name is kept.
// Prints { cc: { codes: { code: label }, parents: { place: parent } }, _countries: [normalised names] }.
//   node tools/code-names.mjs <input.json>
//   input: { _countries: [names], cc: { regions: [{ code, name }], shapes: [{ name, iso }], labels: { code: [label] }, parents: { place: [parent] }, geo: { place: shape } } }
import fs from 'fs';
import path from 'path';
import vm from 'vm';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const sandbox = {};
vm.createContext(sandbox);
const code = ['countries.js', 'regions-alias.js', 'regions-match.js'].map(f => fs.readFileSync(path.join(root, 'src/lib', f), 'utf8')).join('\n');
vm.runInContext(code + '\n;Object.assign(globalThis, { regionMatch, regionNorm, regionNames });', sandbox);

const input = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const countries = new Set((input._countries || []).map(n => sandbox.regionNorm(n)));
const out = { _countries: [] };
const seen = new Set();
for (const [cc, c] of Object.entries(input)) {
  if (cc === '_countries') continue;
  out[cc] = { codes: {}, parents: {} };
  const placed = name => sandbox.regionMatch([{ id: 'x', code: '', name }], c.shapes, cc).placed.size > 0;
  const parentsOf = {};
  for (const [place, list] of Object.entries(c.parents || {})) parentsOf[sandbox.regionNorm(place)] = list;
  const geoOf = {};
  for (const [place, shape] of Object.entries(c.geo || {})) if (shape && placed(shape)) geoOf[sandbox.regionNorm(place)] = shape;
  for (const r of c.regions) {
    if (placed(r.name)) continue;                                              // it has a shape already
    const label = r.code && ((c.labels || {})[r.code] || []).find(placed);
    if (label) { out[cc].codes[r.code] = label; continue; }
    const { main, extra } = sandbox.regionNames(r.name);
    let found = false;
    for (const key of [...main, ...extra]) {
      let parent = (parentsOf[key] || []).find(placed);
      if (!parent) parent = geoOf[key];                                       // the shape that holds the point of the place
      if (parent) { found = true; if (!out[cc].parents[key]) out[cc].parents[key] = parent; if (main.includes(key)) break; }
    }
    const names = main.filter(n => countries.has(n));
    if (!found && names.length) names.forEach(n => { if (!seen.has(n)) { seen.add(n); out._countries.push(n); } });
  }
}
console.log(JSON.stringify(out));
