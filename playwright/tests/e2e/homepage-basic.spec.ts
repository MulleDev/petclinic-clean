import { test, expect } from '@playwright/test';

/**
 * Basic Homepage Tests - SDET Clean Implementation
 * Tests fundamental functionality without complex selectors
 */
test.describe('Homepage - Basic Functionality', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to PetClinic homepage
    await page.goto('/');
  });

  test('should load homepage successfully', async ({ page }) => {
    // Verify page loads
    await expect(page).toHaveTitle(/petclinic/i);
    
    // Check for Welcome heading (actual content from app)
    await expect(page.locator('h2[data-i18n="welcome"]')).toContainText(/welcome/i);
  });

  test('should display navigation menu', async ({ page }) => {
    // Check navigation exists
    const nav = page.locator('nav, .navbar');
    await expect(nav).toBeVisible();
    
    // Check for specific navigation items found in app
    await expect(page.getByRole('link', { name: ' Home' })).toBeVisible();
    await expect(page.getByRole('link', { name: ' Find Owners' })).toBeVisible();
  });

  test('should display veterinarians link', async ({ page }) => {
    // Find specific vets link from navbar
    const vetsLink = page.getByRole('link', { name: ' Veterinarians' });
    await expect(vetsLink).toBeVisible();
    
    // Click and verify navigation
    await vetsLink.click();
    await expect(page).toHaveURL(/.*vets.*/);
  });

  test('should handle error page navigation', async ({ page }) => {
    // Navigate to error page
    await page.goto('/oups');
    
    // Should show error content (actual text from app: "Something happened...")
    await expect(page.locator('body')).toContainText(/something happened/i);
  });

  test('should be responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload();
    
    // Page should still be accessible
    await expect(page.locator('h2[data-i18n="welcome"]')).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.reload();
    
    // Page should still be accessible
    await expect(page.locator('h2[data-i18n="welcome"]')).toBeVisible();
  });
});
