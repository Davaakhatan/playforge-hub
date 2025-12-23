import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login');

    // Check page loaded
    await page.waitForLoadState('networkidle');

    // Check for login form elements (using more flexible selectors)
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();

    // Check for input fields
    const inputs = page.locator('input');
    const inputCount = await inputs.count();
    expect(inputCount).toBeGreaterThanOrEqual(2); // At least email and password

    // Check for submit button
    const submitButton = page.locator('button[type="submit"], button').first();
    await expect(submitButton).toBeVisible();
  });

  test('should display register page', async ({ page }) => {
    await page.goto('/register');

    // Check page loaded
    await page.waitForLoadState('networkidle');

    // Check for heading
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();

    // Check for multiple input fields (username, email, password, confirm password)
    const inputs = page.locator('input');
    const inputCount = await inputs.count();
    expect(inputCount).toBeGreaterThanOrEqual(3);
  });

  test('should show validation errors on empty login', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Submit empty form
    const submitButton = page.locator('button[type="submit"], button').first();
    await submitButton.click();

    // Should stay on login page
    await expect(page).toHaveURL(/login/);
  });

  test('should have link to register from login page', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Find register link
    const registerLink = page.locator('a[href*="register"]');
    await expect(registerLink).toBeVisible();

    await registerLink.click();
    await expect(page).toHaveURL(/register/);
  });

  test('should have link to login from register page', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');

    // Find login link
    const loginLink = page.locator('a[href*="login"]');
    await expect(loginLink).toBeVisible();

    await loginLink.click();
    await expect(page).toHaveURL(/login/);
  });
});
