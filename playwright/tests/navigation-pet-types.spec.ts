import { test, expect } from '@playwright/test';

// Navigation test for "Pet Typen verwalten"
test.describe('Navigation: Pet Typen verwalten', () => {
  test('should show and navigate to Pet Types Management for logged-in users', async ({ page }) => {
    // TODO: If authentication is required, perform login here
    await page.goto('/');
    const navLink = page.locator('[data-pw="nav-pet-types"] a, [data-pw="nav-pet-types"]');
    await expect(navLink).toBeVisible();
    await navLink.click();
    await expect(page).toHaveURL(/\/pet-types/);
    // Check that the heading is correct and internationalized
    const heading = page.locator('h2');
    await expect(heading).toHaveText(/Pet Typen verwalten|Pet Types Management|Pet Types/);
    // Check that the table is visible
    await expect(page.locator('table')).toBeVisible();
  });
});
