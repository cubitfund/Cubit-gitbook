import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";

test("Accueil, polices locales et parcours vers les murs", async ({ page }, info) => {
  const errors = [];
  const external = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("request", request => { if (!request.url().startsWith("http://127.0.0.1:4001/")) external.push(request.url()); });
  await page.goto("/");
  await expect(page.locator("#article-body h1")).toContainText("tenir les murs");
  await page.evaluate(() => document.fonts.ready);
  expect(await page.evaluate(() => document.fonts.check('900 48px "Archivo Variable"'))).toBe(true);
  expect(await page.evaluate(() => document.fonts.check('400 12px "Martian Mono Variable"'))).toBe(true);
  await page.screenshot({ path: `test-results/accueil-${info.project.name}.png`, fullPage: true });
  await page.locator(".guide-card").first().click();
  await expect(page).toHaveURL(/comprendre\/murs\.html/);
  await expect(page.locator("#article-body h1")).toContainText("La cible et les murs fixes");
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
});

test("Local search and opening a result", async ({ page }, info) => {
  await page.goto("/");
  if (info.project.name === "mobile") await page.getByRole("button", { name: "Ouvrir le sommaire" }).click();
  else await page.keyboard.press("/");
  const search = page.getByRole("searchbox", { name: "Rechercher dans le guide" });
  await search.fill("launchpad");
  await expect(page.locator(".search-results-list .search-results-item").first()).toBeAttached();
  if (info.project.name === "mobile") await search.press("Enter");
  const link = page.locator(".search-results-list").getByRole("link", { name: "Momentum et Forge", exact: true });
  await expect(link).toBeVisible();
  await link.click();
  await expect(page).toHaveURL(/v2\/momentum-forge\.html/);
  await expect(page.locator("#article-body h1")).toHaveText("Momentum et Forge");
});

test("The target comes back down on the return to 60k and older levels stay fixed", async ({ page }, info) => {
  await page.goto("/comprendre/murs.html");
  const oldWalls = page.locator(".level-row").filter({ hasText: /Ancien mur/ });
  const before = await oldWalls.locator("i").evaluateAll(nodes => nodes.map(node => node.style.width));
  await page.getByRole("button", { name: "100k", exact: true }).click();
  await expect(page.locator("#target-value")).toHaveText(/44.200 unités/);
  await page.getByRole("button", { name: "Retour à 60k", exact: true }).click();
  await expect(page.locator("#target-value")).toHaveText(/28.200 unités/);
  expect(await oldWalls.locator("i").evaluateAll(nodes => nodes.map(node => node.style.width))).toEqual(before);
  await page.locator(".wall-lab").screenshot({ path: `test-results/murs-${info.project.name}.png` });
});

test("Every page is reachable without horizontal overflow", async ({ page }) => {
  const index = JSON.parse(await readFile("_book/fr/search_index.json", "utf8"));
  for (const entry of index) {
    const url = entry.href;
    const response = await page.goto(url);
    expect(response.status(), url).toBe(200);
    await expect(page.locator("#article-body h1")).toBeVisible();
    const dimensions = await page.locator(".body-inner").evaluate(element => ({ content: element.scrollWidth, viewport: element.clientWidth }));
    expect(dimensions.content, url).toBeLessThanOrEqual(dimensions.viewport + 1);
  }
});

test("Contextual table of contents on desktop and an accessible menu on mobile", async ({ page }, info) => {
  if (info.project.name === "desktop") {
    await page.goto("/securite/permissions.html");
    await page.locator("#on-this-page").getByRole("link", { name: "Aucun administrateur du hook", exact: true }).click();
    await expect(page).toHaveURL(/#aucun-administrateur-du-hook$/);
    expect(await page.locator(".body-inner").evaluate(element => element.scrollTop)).toBeGreaterThan(0);
    return;
  }
  await page.goto("/");
  const button = page.getByRole("button", { name: "Ouvrir le sommaire" });
  await button.click();
  await expect(page.locator(".mobile-menu")).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(page.locator(".mobile-menu")).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator(".mobile-menu")).toBeFocused();
  await button.click();
  await page.locator(".book-summary").getByRole("link", { name: "Taxes et circulation des ETH", exact: true }).click();
  await expect(page).toHaveURL(/comprendre\/taxes\.html/);
  await expect(page.locator(".mobile-menu")).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator("#article-body h1")).toBeVisible();
});
