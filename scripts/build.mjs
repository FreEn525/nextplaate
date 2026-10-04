// Builds nextplaate.user.js from the modules in src/.
// Order matters: the modules are joined in this order inside one shared scope.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const ORDER = [
  'core/00-meta.txt',
  'core/01-wrapper-start.js',
  'core/storage.js',
  'ui/shared-look.js',
  'ui/page-style.js',
  'ui/panel.js',
  'photos/detection.js',
  'photos/codegen.js',
  'ui/rendering.js',
  'ui/selection.js',
  'edit/edit-flow.js',
  'edit/back-to-gallery.js',
  'edit/like.js',
  'batch/state.js',
  'batch/manager.js',
  'batch/adding.js',
  'batch/panel.js',
  'batch/start-upload.js',
  'batch/tab-load.js',
  'batch/tab-alive.js',
  'nav/pagination.js',
  'input/shortcuts.js',
  'start.js',
  'core/99-wrapper-end.js',
];

// Every file in src/ must be listed, so a forgotten module fails the build instead of vanishing.
const all = readdirSync(join(root, "src"), { recursive: true }).filter(p => p.endsWith(".js") || p.endsWith(".txt")).map(p => p.replaceAll("\\", "/"));
const listed = new Set(ORDER);
const missing = all.map(p => p.replace(/^src\//, '')).filter(p => !listed.has(p));
if (missing.length) throw new Error('Not listed in build order: ' + missing.join(', '));

const out = ORDER.map(f => readFileSync(join(root, 'src', f), 'utf8')).join('');
writeFileSync(join(root, 'nextplaate.user.js'), out);
console.log(`Built nextplaate.user.js from ${ORDER.length} modules (${out.split('\n').length} lines)`);
