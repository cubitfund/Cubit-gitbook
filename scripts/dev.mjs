import { watch } from 'node:fs';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

process.chdir(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'));
let running = false;
let pending = false;
let timer;
async function build() {
  if (running) { pending = true; return; }
  running = true;
  await new Promise(resolve => {
    const child = spawn(process.execPath, ['scripts/build.mjs'], { stdio: 'inherit' });
    child.on('error', error => { console.error(error); resolve(); });
    child.on('exit', code => { if (code) console.error(`Build failed (${code}); edit the source and retry.`); resolve(); });
  });
  running = false;
  if (pending) { pending = false; await build(); }
}
await build();
process.env.CUBIT_DOCS_PORT ||= '4000';
await import('./serve.mjs');
for (const directory of ['docs', 'translations', 'i18n']) {
  watch(directory, { recursive: true }, (_, filename) => {
    // prepare-assets only copies these pinned fonts; avoid a rebuild loop.
    if (filename?.replaceAll('\\', '/').startsWith('assets/fonts/')) return;
    clearTimeout(timer);
    timer = setTimeout(() => void build(), 350);
  });
}
console.log('Watching documentation and translations. Refresh the browser after a successful build.');
