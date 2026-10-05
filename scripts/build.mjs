// Builds the userscript from the modules in src/.
//   node scripts/build.mjs          -> nextplaate.user.js       (published)
//   node scripts/build.mjs --dev    -> nextplaate.dev.user.js   (your own copy, with src/dev/ tools)
//
// Every group is joined in this order, inside one shared scope, so the modules can call each other:
//   meta     the userscript header (name, version, grants)
//   core     the wrapper, storage, the page check, the feature registry and the keyboard
//   lib      pure helpers: photo detection, description code, countries, plate format
//   ui       the design tokens, the DOM helper, the docked ribbon
//   features one file per feature (features/upload/ holds the batch upload)
//   dev      developer tools: only in the dev build
//   boot     the start-up sequence, then the closing of the wrapper
// Inside a group, files are sorted by name (use the 00-, 10-, ... prefixes to set the order).
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const DEV = process.argv.includes('--dev');
const GROUPS = ['meta', 'core', 'lib', 'ui', 'features', ...(DEV ? ['dev'] : []), 'boot'];

const files = readdirSync(join(root, 'src'), { recursive: true })
  .map(p => p.split(sep).join('/'))
  .filter(p => /\.(js|txt)$/.test(p))
  .filter(p => DEV || !p.startsWith('dev/'));                  // the published script never contains src/dev/

const orphans = files.filter(p => !GROUPS.some(g => p.startsWith(g + '/')));
if (orphans.length) throw new Error('Not in a build group: ' + orphans.join(', '));

const ordered = GROUPS.flatMap(g =>
  files.filter(p => p.startsWith(g + '/')).sort((a, b) => a.localeCompare(b, 'en', { numeric: true })));

let out = ordered.map(p => readFileSync(join(root, 'src', p), 'utf8')).join('');
const target = DEV ? 'nextplaate.dev.user.js' : 'nextplaate.user.js';
out = out.replace("'__DEBUG__'", DEV ? "'1'" : "'0'");   // logs: on in the dev build, off in the public one
if (DEV) {
  // its own script in Tampermonkey, so it never replaces the published one
  out = out.replace('// @name         NextPlaate\n', '// @name         NextPlaate (dev)\n')
           .replace('// @namespace    nextplaate\n', '// @namespace    nextplaate-dev\n');
}
writeFileSync(join(root, target), out);
console.log(`Built ${target} from ${ordered.length} modules (${out.split('\n').length} lines)`);
if (!DEV) console.log(ordered.map(p => '  ' + p).join('\n'));
