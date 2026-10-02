import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { load } from 'cheerio';
import { locales, matchLocale, preferredLocale } from './locales.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(root);
const selected = process.argv.indexOf('--locales');
const requested = selected < 0 ? locales.map(locale => locale.id) : process.argv[selected + 1]?.split(',');
if (!requested?.length || requested.some(id => !locales.some(locale => locale.id === id))) throw new Error('Unknown locale selection');
const active = locales.filter(locale => requested.includes(locale.id));
// French supplies stable heading anchors for every translation.
const building = locales.filter(locale => locale.id === 'fr' || requested.includes(locale.id));
const staging = path.join(root, '.build');
const output = path.join(root, '_book');
const source = path.join(root, 'docs');
const config = JSON.parse(await readFile('book.json', 'utf8'));
const frenchUI = JSON.parse(await readFile('i18n/fr.json', 'utf8'));
const encode = value => JSON.stringify(value).replaceAll('<', '\\u003c');

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const groups = await Promise.all(entries.map(entry => entry.isDirectory() ? walk(path.join(directory, entry.name)) : [path.join(directory, entry.name)]));
  return groups.flat();
}
function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit' });
    child.on('error', reject);
    child.on('exit', code => code === 0 ? resolve() : reject(new Error(`${command} exited ${code}`)));
  });
}
const markdown = (await walk(source)).filter(file => file.endsWith('.md')).map(file => path.relative(source, file)).sort();
const pageFiles = markdown.filter(file => file !== 'SUMMARY.md');
const pageURLs = pageFiles.map(file => file === 'README.md' ? 'index.html' : file.replace(/\.md$/, '.html'));
for (const locale of building) {
  const ui = JSON.parse(await readFile(`i18n/${locale.id}.json`, 'utf8'));
  for (const key of Object.keys(frenchUI)) {
    if (typeof ui[key] !== 'string' || !ui[key].trim()) throw new Error(`Missing ${locale.id} UI string: ${key}`);
    if ((ui[key].match(/\{query\}/g) || []).length !== (frenchUI[key].match(/\{query\}/g) || []).length) throw new Error(`Invalid placeholder ${locale.id}:${key}`);
  }
  if (locale.id !== 'fr') {
    const directory = path.join(root, 'translations', locale.id);
    const translatedFiles = (await walk(directory)).filter(file => file.endsWith('.md')).map(file => path.relative(directory, file)).sort();
    if (JSON.stringify(translatedFiles) !== JSON.stringify(markdown)) throw new Error(`Incomplete translation: ${locale.id}`);
    for (const file of markdown) {
      const translated = await readFile(path.join(directory, file), 'utf8');
      if (!translated.trim() || translated === await readFile(path.join(source, file), 'utf8')) throw new Error(`Untranslated ${locale.id}/${file}`);
    }
  }
}
await run(process.execPath, ['scripts/prepare-assets.mjs']);
await rm(staging, { recursive: true, force: true });
await rm(output, { recursive: true, force: true });
await mkdir(staging, { recursive: true });
await writeFile(path.join(staging, 'LANGS.md'), '# Languages\n\n' + building.map(locale => `* [${locale.name}](${locale.id}/)`).join('\n') + '\n');
await writeFile(path.join(staging, 'book.json'), JSON.stringify({ ...config, root: '.', plugins: ['-sharing', '-fontsettings', '-search', '-lunr'] }, null, 2));
for (const locale of building) {
  const destination = path.join(staging, locale.id);
  await cp(source, destination, { recursive: true });
  if (locale.id !== 'fr') await cp(path.join(root, 'translations', locale.id), destination, { recursive: true });
  const ui = JSON.parse(await readFile(`i18n/${locale.id}.json`, 'utf8'));
  const data = { locale, locales: active, ui };
  await writeFile(path.join(destination, 'book.json'), JSON.stringify({
    language: locale.tag, title: ui.siteTitle, description: ui.siteDescription,
    variables: { ...config.variables, ui, locale, locales: active, languageData: encode(data), revisionDate: ui.revisionDate },
  }, null, 2));
}
await run(process.execPath, ['node_modules/honkit/bin/honkit.js', 'build', staging, output]);

// Unicode subsets are requested only when used. Share them across all languages.
const sharedFonts = path.join(output, 'fonts');
await mkdir(sharedFonts, { recursive: true });
for (const family of ['noto-sans-sc', 'noto-sans-kr', 'noto-sans-jp']) {
  const base = path.join(root, 'node_modules/@fontsource-variable', family);
  const css = await readFile(path.join(base, 'wght.css'), 'utf8');
  for (const match of css.matchAll(/\.\/files\/([\w.-]+\.woff2)/g)) await cp(path.join(base, 'files', match[1]), path.join(sharedFonts, match[1]));
  await writeFile(path.join(sharedFonts, `${family}.css`), css.replaceAll('./files/', './'));
  await cp(path.join(base, 'LICENSE'), path.join(sharedFonts, `${family}-LICENSE.txt`));
}

for (const file of pageURLs) {
  const french = load(await readFile(path.join(output, 'fr', file), 'utf8'));
  const anchors = french('#article-body h1, #article-body h2, #article-body h3, #article-body h4').toArray().map(node => ({ tag: node.tagName, id: french(node).attr('id') }));
  for (const locale of active) {
    const destination = path.join(output, locale.id, file);
    const $ = load(await readFile(destination, 'utf8'));
    const headings = $('#article-body h1, #article-body h2, #article-body h3, #article-body h4').toArray();
    if (headings.length !== anchors.length || headings.some((node, i) => node.tagName !== anchors[i].tag)) throw new Error(`Heading structure changed: ${locale.id}/${file}`);
    for (const selector of ['p', 'li', 'tr', 'pre', '.source-note']) {
      if ($(`#article-body ${selector}`).length !== french(`#article-body ${selector}`).length) throw new Error(`Content structure changed (${selector}): ${locale.id}/${file}`);
    }
    const changed = new Map();
    headings.forEach((node, i) => {
      if (!anchors[i].id) return;
      const previous = $(node).attr('id');
      if (previous) changed.set(previous, anchors[i].id);
      $(node).attr('id', anchors[i].id);
    });
    $('a[href^="#"]').each((_, node) => {
      const previous = decodeURIComponent($(node).attr('href').slice(1));
      if (changed.has(previous)) $(node).attr('href', '#' + changed.get(previous));
    });
    // The default theme links its own generator on GitHub in the sidebar; CUBIT publishes no GitHub link.
    $('.gitbook-link').closest('li').prev('li.divider').remove();
    $('.gitbook-link').closest('li').remove();
    $('html').attr('lang', locale.tag);
    $('head').append(active.map(other => `<link rel="alternate" hreflang="${other.tag}" href="/${other.id}/${file}">`).join(''));
    await writeFile(destination, $.html());
  }
}
for (const locale of active) {
  const search = [];
  for (const file of pageURLs) {
    const $ = load(await readFile(path.join(output, locale.id, file), 'utf8'));
    const article = $('#article-body').clone();
    article.find('.page-end, .page-pagination, .source-note, script, style').remove();
    search.push({ href: `/${locale.id}/${file}`, title: article.find('h1').first().text().trim(), body: article.text().replace(/\s+/g, ' ').trim() });
  }
  await writeFile(path.join(output, locale.id, 'search_index.json'), encode(search));
}
if (!active.some(locale => locale.id === 'fr')) await rm(path.join(output, 'fr'), { recursive: true });
await mkdir(path.join(output, 'flags'), { recursive: true });
for (const locale of active) await cp(`node_modules/flag-icons/flags/4x3/${locale.flag}.svg`, path.join(output, 'flags', `${locale.flag}.svg`));
await cp('node_modules/flag-icons/LICENSE', path.join(output, 'flags', 'LICENSE.txt'));
const routingData = encode({ locales: active });
const chooserScript = `${matchLocale.toString()}\n${preferredLocale.toString()}\n(function(){var locales=${routingData}.locales;var saved;try{saved=localStorage.getItem('cubit.docs.locale')}catch(_){}var target=preferredLocale(saved,navigator.languages||[navigator.language],locales);var page=document.documentElement.dataset.docPage||'index.html';location.replace('/'+target+'/'+page+location.search+location.hash)})();`;
await writeFile(path.join(output, 'locale-redirect.js'), chooserScript);
const escape = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
for (const file of pageURLs) {
  const destination = path.join(output, file);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, `<!doctype html><html lang="en" data-doc-page="${escape(file)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>CUBIT — Choose your language</title><link rel="stylesheet" href="/fonts/noto-sans-sc.css"><link rel="stylesheet" href="/fonts/noto-sans-kr.css"><link rel="stylesheet" href="/fonts/noto-sans-jp.css"><script src="/locale-redirect.js" defer></script><style>body{font:18px system-ui;background:#f5f1e8;color:#111312;max-width:720px;margin:10vh auto;padding:24px}h1{font-size:2.5rem}ul{list-style:none;padding:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px}a{display:flex;align-items:center;gap:12px;color:#111312;padding:15px;border:2px solid;box-shadow:3px 3px #111312;text-decoration:none}a:hover,a:focus{background:#c7ff3d}a:lang(zh){font-family:"Noto Sans SC Variable",sans-serif}a:lang(ko){font-family:"Noto Sans KR Variable",sans-serif}a:lang(ja){font-family:"Noto Sans JP Variable",sans-serif}</style></head><body><h1>CUBIT</h1><p>Choose your language · Choisissez votre langue</p><ul>${active.map(locale => `<li><a href="/${locale.id}/${file}" lang="${locale.tag}"><img src="/flags/${locale.flag}.svg" alt="" width="24" height="18">${locale.name}</a></li>`).join('')}</ul></body></html>`);
}
await writeFile(path.join(output, 'locales.json'), encode({ locales: active, pages: pageURLs, taxPolicy: { buyPercent: 3, sellPercent: 15, sellWallsPercent: 12, teamPercent: 3 } }));
await run(process.execPath, ['scripts/check-build.mjs']);
