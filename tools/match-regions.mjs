// Runs the matching of src/lib/regions-match.js (the very code of the script) on the regions and shapes that tools/measure-regions.py
// collected, and prints for each country and level how many regions were placed. One implementation, measured where it is used.
//   node tools/match-regions.mjs <input.json>     input: { cc: { regions: [{ id, code, name }], levels: { ADM1: [{ name, iso }] } } }
import fs from 'fs';
import path from 'path';
import vm from 'vm';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const sandbox = {};
vm.createContext(sandbox);
// the two files are plain declarations of the script: run together, then the matcher is picked up
const code = ['countries.js', 'regions-alias.js', 'regions-codes.js', 'regions-match.js'].map(f => fs.readFileSync(path.join(root, 'src/lib', f), 'utf8')).join('\n');
vm.runInContext(code + '\n;Object.assign(globalThis, { regionMatch, regionNames, regionDistance });', sandbox);

const input = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const out = {};
for (const [cc, c] of Object.entries(input)) {
  out[cc] = {};
  for (const [level, shapes] of Object.entries(c.levels)) {
    const regions = c.regions.map((x, i) => ({ ...x, id: String(i) }));
    const r = sandbox.regionMatch(regions, shapes, cc);
    out[cc][level] = {
      shapes: shapes.length, placed: r.placed.size, special: r.special.length,
      missing: r.missing.slice(0, 40).map(x => `${x.code}|${x.name}`),
      suggest: process.env.SUGGEST ? r.missing.map(x => {
        const n = sandbox.regionNames(x.name).main[0] || '';
        const near = shapes.map(s => [sandbox.regionDistance(n, sandbox.regionNames(s.name).main[0] || '', 9), s.name]).sort((a, b) => a[0] - b[0]).slice(0, 3).map(a => a[1]);
        return `${x.code}|${x.name} [${n}] ~ ${near.join(' ; ')}`;
      }) : undefined,
      pairs: process.env.PAIRS ? regions.filter(x => r.placed.has(x.id)).map(x => `${x.code}|${x.name} => ${r.placed.get(x.id).map(i => shapes[i].name).join(' + ')}`) : undefined
    };
  }
}
console.log(JSON.stringify(out));
