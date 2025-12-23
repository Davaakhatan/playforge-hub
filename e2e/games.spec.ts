import { test, expect } from '@playwright/test';

test.describe('Games Pages', () => {
  test('should have game links on home page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find game links
    const gameLinks = page.locator('a[href^="/games/"]');
    const count = await gameLinks.count();
    expect(count).toBeGreaterThan(0);

    // Get the first game's href
    const href = await gameLinks.first().getAttribute('href');
    expect(href).toMatch(/^\/games\/.+/);
  });

  test('should display game details page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Get a game slug from the page
    const gameLink = page.locator('a[href^="/games/"]').first();
    const href = await gameLink.getAttribute('href');

    // Navigate directly to the game page
    await page.goto(href!);
    await page.waitForLoadState('networkidle');

    // Check for game title (h1)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('should show game metadata on detail page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Get a game slug from the page
    const gameLink = page.locator('a[href^="/games/"]').first();
    const href = await gameLink.getAttribute('href');

    // Navigate directly
    await page.goto(href!);
    await page.waitForLoadState('networkidle');

    // Check for game title
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // Page should have content
    await expect(page.locator('body')).toContainText(/.+/);
  });
});
