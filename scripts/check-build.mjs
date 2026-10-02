import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { load } from "cheerio";

const root = path.resolve("_book");
async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const groups = await Promise.all(entries.map(entry => entry.isDirectory() ? walk(path.join(directory, entry.name)) : [path.join(directory, entry.name)]));
  return groups.flat();
}
const files = await walk(root);
const manifest = JSON.parse(await readFile(path.join(root, 'locales.json'), 'utf8'));
const html = files.filter(file => file.endsWith(".html"));
const documents = new Set(manifest.locales.flatMap(locale => manifest.pages.map(page => path.join(root, locale.id, page))));
const errors = [];
const parsed = new Map();
for (const file of html) parsed.set(file, load(await readFile(file, "utf8")));
let checked = 0;

async function checkLink(from, value) {
  if (!value || /^(?:https?:|mailto:|data:|javascript:|tel:)/.test(value)) return;
  const url = new URL(value, `https://docs.invalid/${path.relative(root, from).replaceAll(path.sep, "/")}`);
  let target = path.join(root, decodeURIComponent(url.pathname));
  try {
    if ((await stat(target)).isDirectory()) target = path.join(target, "index.html");
    await stat(target);
    if (url.hash && parsed.has(target)) {
      const id = decodeURIComponent(url.hash.slice(1));
      const $ = parsed.get(target);
      if (!$("[id]").toArray().some(node => $(node).attr("id") === id) && !$("a[name]").toArray().some(node => $(node).attr("name") === id)) throw new Error(`ancre absente : ${id}`);
    }
    checked++;
  } catch (error) { errors.push(`${path.relative(root, from)} → ${value} (${error.message.split("\n")[0]})`); }
}

for (const file of documents) if (!parsed.has(file)) errors.push(`Missing page: ${path.relative(root, file)}`);
for (const [file, $] of parsed) {
  if (documents.has(file)) {
    const id = path.relative(root, file).split(path.sep)[0];
    const locale = manifest.locales.find(locale => locale.id === id);
    if ($('html').attr('lang') !== locale.tag) errors.push(`${file}: langue incorrecte`);
    if ($('#article-body h1').length !== 1) errors.push(`${file}: main H1 title missing or repeated`);
    if (!$('input#cubit-search').length) errors.push(`${file}: recherche absente`);
    if (!$('.site-header').length || !$('.book-summary').length) errors.push(`${file}: navigation absente`);
    if ($('.lang-option').length !== manifest.locales.length || $('.lang-option[aria-selected="true"]').attr('data-language') !== id) errors.push(`${file}: invalid language selector`);
    const publicText = $('#article-body').clone(); publicText.find('script,style').remove();
    if (/enabledFeatures|earliestActivation|FeatureActivated|FeatureDeactivated|activate\(|\b(?:feature|activation)\s+flags?\b|\bflags?\s*[=:]\s*\d|\bmasques?\s+d.activation\b/i.test(publicText.text())) errors.push(`Internal V2 release detail in the public site: ${file}`);
    if (file.endsWith('index.html')) {
      const metrics = $('.metric-strip dd').toArray().map(node => $(node).text().replace(/[^0-9,.]/g, ''));
      if (metrics[1] !== '3' || metrics[2] !== '15') errors.push(`${file}: inconsistent taxes`);
    }
  }
  for (const element of $("a[href],link[href],script[src],img[src]").toArray()) {
    await checkLink(file, $(element).attr("href") || $(element).attr("src"));
  }
}
for (const file of files.filter(file => file.endsWith(".css"))) {
  const text = await readFile(file, "utf8");
  for (const match of text.matchAll(/url\(\s*['"]?([^'"\)\s]+)['"]?\s*\)/g)) await checkLink(file, match[1]);
}
for (const locale of manifest.locales) {
  const search = JSON.parse(await readFile(path.join(root, locale.id, 'search_index.json'), 'utf8'));
  if (!Array.isArray(search) || search.length !== manifest.pages.length) errors.push(`Index incomplet : ${locale.id}`);
  for (const page of manifest.pages) {
    const entry = search.find(entry => entry.href === `/${locale.id}/${page}`);
    if (!entry?.title || !entry?.body) errors.push(`Page absente de la recherche : ${locale.id}/${page}`);
  }
}
for (const file of files) {
  const rel = path.relative(root, file);
  if (/(^|\/)(?:\.env(?:\.|$)|broadcast|node_modules|\.git)(?:\/|$)|(?:private.?key)|\.log$/i.test(rel)) errors.push(`Unexpected file in the site: ${rel}`);
  if (/\.(html|json|txt|md)$/.test(file)) {
    const content = await readFile(file, "utf8");

    if (/\{[#%]/.test(content) && file.endsWith(".html")) errors.push(`Template non rendu dans le site : ${rel}`);
  }
}
if (errors.length) { console.error(errors.join("\n")); process.exitCode = 1; }
else console.log(`Check passed: ${documents.size} pages, ${manifest.locales.length} languages, ${checked} local links/resources, complete search indexes, taxes 3% / 15%, no unexpected private file.`);
