import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should display the home page', async ({ page }) => {
    await page.goto('/');
    
    // Check for main heading
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    
    // Check for navigation
    await expect(page.getByRole('navigation')).toBeVisible();
  });

  test('should display game cards', async ({ page }) => {
    await page.goto('/');
    
    // Wait for games to load
    await page.waitForSelector('[data-testid="game-card"]', { timeout: 10000 }).catch(() => {
      // If no data-testid, look for game cards by class
    });
    
    // Check that some game content is visible
    const gameLinks = page.locator('a[href^="/games/"]');
    const count = await gameLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should have working navigation links', async ({ page }) => {
    await page.goto('/');

    // Check Store link exists and is clickable
    const storeLink = page.getByRole('link', { name: /store/i });
    await expect(storeLink).toBeVisible();

    // Check Library link exists
    const libraryLink = page.getByRole('link', { name: /library/i });
    await expect(libraryLink).toBeVisible();
    await expect(libraryLink).toHaveAttribute('href', /library/);
  });

  test('should be responsive', async ({ page }) => {
    // Desktop
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await expect(page.getByRole('navigation')).toBeVisible();
    
    // Mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    // Page should still be functional on mobile
    await expect(page.locator('body')).toBeVisible();
  });
});
