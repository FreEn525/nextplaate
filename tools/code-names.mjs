// For the regions that found no shape by their own name, looks in what Wikidata says about their plate code (tools/wikidata-codes.py):
// the first label of that code that does find a shape becomes the name of the code for that country. Prints { cc: { code: label } }.
//   node tools/code-names.mjs <input.json>     input: { cc: { regions: [{ code, name }], shapes: [{ name, iso }], labels: { code: [label] } } }
import fs from 'fs';
import path from 'path';
import vm from 'vm';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const sandbox = {};
vm.createContext(sandbox);
const code = ['countries.js', 'regions-alias.js', 'regions-match.js'].map(f => fs.readFileSync(path.join(root, 'src/lib', f), 'utf8')).join('\n');
vm.runInContext(code + '\n;Object.assign(globalThis, { regionMatch });', sandbox);

const input = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const out = {};
for (const [cc, c] of Object.entries(input)) {
  out[cc] = {};
  const placed = (name) => sandbox.regionMatch([{ id: 'x', code: '', name }], c.shapes, cc).placed.size > 0;
  for (const r of c.regions) {
    if (!r.code || out[cc][r.code] || placed(r.name)) continue;                  // it has a shape already, or no code to ask about
    const label = (c.labels[r.code] || []).find(l => placed(l));
    if (label) out[cc][r.code] = label;
  }
}
console.log(JSON.stringify(out));
