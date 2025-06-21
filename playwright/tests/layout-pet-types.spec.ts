import { test, expect } from '@playwright/test';

test.describe('Layout – Pet Typen verwalten', () => {
  test('Header und Footer sind sichtbar und konsistent', async ({ page }) => {
    await page.goto('/pet-types');
    // Header: Navigation prüfen (z.B. Logo, Menüpunkt)
    await expect(page.locator('nav.navbar')).toBeVisible();
    await expect(page.locator('[data-pw="nav-pet-types"]')).toBeVisible();
    // Footer: Spring-Logo als Footer-Element prüfen
    await expect(page.locator('img[alt="VMware Tanzu Logo"]')).toBeVisible();
    // Responsiveness: Seite auf schmale Breite setzen und prüfen, ob Navbar-Button sichtbar ist
    await page.setViewportSize({ width: 480, height: 800 });
    await expect(page.locator('.navbar-toggler')).toBeVisible();
  });
});
