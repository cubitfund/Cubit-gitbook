import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { locales } from '../scripts/locales.mjs';

for (const locale of locales) {
  test(`${locale.name}: langue du navigateur et drapeau`, async ({ page }) => {
    await page.addInitScript(language => {
      Object.defineProperty(navigator, 'languages', { get: () => [language, 'fr'] });
    }, locale.tag);
    await page.goto('/');
    await expect(page).toHaveURL(new RegExp(`/${locale.id}/index\\.html$`));
    await expect(page.locator('html')).toHaveAttribute('lang', locale.tag);
    await expect(page.locator('.lang-toggle img')).toHaveAttribute('src', `/flags/${locale.flag}.svg`);
    await page.locator('.lang-toggle').click();
    await expect(page.locator('.lang-menu [role="option"]')).toHaveCount(10);
    await expect(page.locator('.lang-menu [aria-selected="true"]')).toHaveAttribute('data-language', locale.id);
  });

  test(`${locale.name}: 23 pages, taxes et recherche locale`, async ({ page }, info) => {
    test.setTimeout(90000);
    const failures = [];
    page.on('pageerror', error => failures.push(error.message));
    const index = JSON.parse(await readFile(`_book/${locale.id}/search_index.json`, 'utf8'));
    expect(index).toHaveLength(23);
    for (const entry of index) {
      const response = await page.goto(entry.href);
      expect(response.status(), entry.href).toBe(200);
      await expect(page.locator('html')).toHaveAttribute('lang', locale.tag);
      await expect(page.locator('#article-body h1')).toHaveText(entry.title);
      const width = await page.locator('.body-inner').evaluate(node => [node.scrollWidth, node.clientWidth]);
      expect(width[0], entry.href).toBeLessThanOrEqual(width[1] + 1);
    }
    await page.goto(`/${locale.id}/index.html`);
    await expect(page.locator('.metric-strip dd').nth(1)).toHaveText(/3\s*%/);
    await expect(page.locator('.metric-strip dd').nth(2)).toHaveText(/15\s*%/);
    if (info.project.name === 'mobile') await page.locator('.mobile-menu').click();
    const query = index.find(entry => entry.href.endsWith('/comprendre/taxes.html')).title;
    await page.locator('#cubit-search').fill(query);
    if (info.project.name === 'mobile') await page.locator('#cubit-search').press('Enter');
    const result = page.locator('.search-results-list a').first();
    await expect(result).toHaveAttribute('href', `/${locale.id}/comprendre/taxes.html`);
    await result.click();
    await expect(page.locator('#article-body h1')).toHaveText(query);
    expect(await page.locator('.lang-toggle img').evaluate(image => image.naturalWidth)).toBeGreaterThan(0);
    expect(failures).toEqual([]);
    if (['ja', 'de', 'vi'].includes(locale.id)) {
      await page.screenshot({ path: `test-results/taxes-${locale.id}-${info.project.name}.png`, fullPage: true });
      await page.locator('.lang-toggle').click();
      await page.screenshot({ path: `test-results/langues-${locale.id}-${info.project.name}.png` });
    }
  });
}

test('Remembered choice, page and anchor kept, explicit URL respected', async ({ page }) => {
  await page.goto('/fr/securite/permissions.html#aucun-administrateur-du-hook');
  await page.locator('.lang-toggle').click();
  await page.locator('[data-language="ja"]').click();
  await expect(page).toHaveURL('/ja/securite/permissions.html#aucun-administrateur-du-hook');
  await expect(page.locator('#aucun-administrateur-du-hook')).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('cubit.docs.locale'))).toBe('ja');
  await page.goto('/');
  await expect(page).toHaveURL('/ja/index.html');
  await page.goto('/en/index.html');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('Keyboard selector, cancel and focus', async ({ page }) => {
  await page.goto('/fr/index.html');
  const toggle = page.locator('.lang-toggle');
  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-language="fr"]')).toBeFocused();
  await page.keyboard.press('End');
  await expect(page.locator('[data-language="vi"]')).toBeFocused();
  await page.keyboard.press('Home');
  await expect(page.locator('[data-language="en"]')).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('[data-language="fr"]')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
});

test('The three Asian labels use local fonts with their glyphs', async ({ page }) => {
  await page.goto('/fr/index.html');
  await page.locator('.lang-toggle').click();
  await page.evaluate(async () => {
    await Promise.all([
      document.fonts.load('13px "Noto Sans KR Variable"', '한국어'),
      document.fonts.load('13px "Noto Sans JP Variable"', '日本語'),
      document.fonts.load('13px "Noto Sans SC Variable"', '中文'),
    ]);
    await document.fonts.ready;
  });
  const session = await page.context().newCDPSession(page);
  await session.send('DOM.enable');
  await session.send('CSS.enable');
  const { root } = await session.send('DOM.getDocument');
  for (const [id, family] of [['ko', 'Noto Sans KR'], ['ja', 'Noto Sans JP'], ['zh', 'Noto Sans SC']]) {
    const { nodeId } = await session.send('DOM.querySelector', { nodeId: root.nodeId, selector: `[data-language="${id}"] span` });
    const { fonts } = await session.send('CSS.getPlatformFontsForNode', { nodeId });
    expect(fonts.some(font => font.isCustomFont && font.familyName.includes(family) && font.glyphCount > 0), `${id}: ${JSON.stringify(fonts)}`).toBe(true);
  }
  await session.detach();
});

test('Storage refused: detection and language switch still work', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Blocked', 'SecurityError'); } });
    Object.defineProperty(navigator, 'languages', { get: () => ['pt-PT'] });
  });
  await page.goto('/comprendre/murs.html?source=test#la-formule');
  await expect(page).toHaveURL('/pt-br/comprendre/murs.html?source=test#la-formule');
  await page.locator('.lang-toggle').click();
  await page.locator('[data-language="ko"]').click();
  await expect(page).toHaveURL('/ko/comprendre/murs.html?source=test#la-formule');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ko');
});

test('Search: hostile text shown without injection, network error recoverable', async ({ page }, info) => {
  await page.route('**/fr/search_index.json', route => route.abort());
  await page.goto('/fr/index.html');
  if (info.project.name === 'mobile') await page.locator('.mobile-menu').click();
  const input = page.locator('#cubit-search');
  await input.fill('murs');
  await expect(page.locator('#search-results-title')).toHaveText(/indisponible/i);
  await page.unroute('**/fr/search_index.json');
  const payload = '<img src=x onerror="window.injection=true">';
  await input.fill(payload);
  await expect(page.locator('#search-results-title')).toContainText(payload);
  expect(await page.evaluate(() => window.injection)).toBeUndefined();
  await expect(page.locator('#search-results-title img')).toHaveCount(0);
  await input.fill('murs');
  await expect(page.locator('.search-results-list a').first()).toBeAttached();
});

test('Without JavaScript: ten language links and readable articles', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL: 'http://127.0.0.1:4001' });
  try {
    const page = await context.newPage();
    await page.goto('/');
    await expect(page.locator('a[lang]')).toHaveCount(10);
    await page.locator('a[lang="ko"]').click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'ko');
    await expect(page.locator('#article-body h1')).toBeVisible();
  } finally { await context.close(); }
});
