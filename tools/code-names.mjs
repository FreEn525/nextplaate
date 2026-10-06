// For the regions that found no shape by their own name, looks in what Wikidata says (tools/wikidata-codes.py, tools/wikidata-parents.py):
//  - codes: the first label of the plate code that finds a shape becomes the name of that code;
//  - parents: the first administrative unit the place lies in (the county of a town) that finds a shape, by normalised place name.
// Prints { cc: { codes: { code: label }, parents: { place: parent } } }.
//   node tools/code-names.mjs <input.json>     input: { cc: { regions: [{ code, name }], shapes: [{ name, iso }], labels: { code: [label] }, parents: { place: [parent] } } }
import fs from 'fs';
import path from 'path';
import vm from 'vm';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const sandbox = {};
vm.createContext(sandbox);
const code = ['countries.js', 'regions-alias.js', 'regions-match.js'].map(f => fs.readFileSync(path.join(root, 'src/lib', f), 'utf8')).join('\n');
vm.runInContext(code + '\n;Object.assign(globalThis, { regionMatch, regionNorm });', sandbox);

const input = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const out = {};
for (const [cc, c] of Object.entries(input)) {
  out[cc] = { codes: {}, parents: {} };
  const placed = name => sandbox.regionMatch([{ id: 'x', code: '', name }], c.shapes, cc).placed.size > 0;
  const parentsOf = {};
  for (const [place, list] of Object.entries(c.parents || {})) parentsOf[sandbox.regionNorm(place)] = list;
  for (const r of c.regions) {
    if (placed(r.name)) continue;                                              // it has a shape already
    const label = r.code && ((c.labels || {})[r.code] || []).find(placed);
    if (label) { out[cc].codes[r.code] = label; continue; }
    for (const part of r.name.replace(/\([^)]*\)/g, ' ').split(/[,;/]/)) {
      const key = sandbox.regionNorm(part);
      const parent = (parentsOf[key] || []).find(placed);
      if (parent && !out[cc].parents[key]) out[cc].parents[key] = parent;
    }
  }
}
console.log(JSON.stringify(out));
