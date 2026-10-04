// Builds nextplaate.user.js from the modules in src/.
//
// Every group is joined in this order, inside one shared scope, so the modules can call each other:
//   meta     the userscript header (name, version, grants)
//   core     the wrapper, storage, the page check, the feature registry and the keyboard
//   lib      pure helpers: photo detection, description code, countries
//   ui       the design tokens, the DOM helper, the docked ribbon
//   features one file per feature (features/upload/ holds the batch upload)
//   boot     the start-up sequence, then the closing of the wrapper
// Inside a group, files are sorted by name (use the 00-, 10-, ... prefixes to set the order).
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const GROUPS = ['meta', 'core', 'lib', 'ui', 'features', 'boot'];

const files = readdirSync(join(root, 'src'), { recursive: true })
  .map(p => p.split(sep).join('/'))
  .filter(p => /\.(js|txt)$/.test(p));

const orphans = files.filter(p => !GROUPS.some(g => p.startsWith(g + '/')));
if (orphans.length) throw new Error('Not in a build group: ' + orphans.join(', '));

const ordered = GROUPS.flatMap(g =>
  files.filter(p => p.startsWith(g + '/')).sort((a, b) => a.localeCompare(b, 'en', { numeric: true })));

const out = ordered.map(p => readFileSync(join(root, 'src', p), 'utf8')).join('');
writeFileSync(join(root, 'nextplaate.user.js'), out);
console.log(`Built nextplaate.user.js from ${ordered.length} modules (${out.split('\n').length} lines)`);
console.log(ordered.map(p => '  ' + p).join('\n'));
