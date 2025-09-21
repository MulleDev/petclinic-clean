import { test, expect } from '@playwright/test';
import translations from '../fixtures/owner-translations.json';
import { OwnerPage } from '../pages/OwnerPage';

test.describe('UI Sprache/Übersetzungen Owner-Seite', () => {
  for (const [lang, labels] of Object.entries(translations)) {
    test(`Owner-Seite Übersetzungen für ${lang}`, async ({ page }) => {
      await page.goto('/owners/1');
      await expect(page.locator('[data-pw="language-combobox"]')).toBeVisible({ timeout: 5000 });
      await page.locator('[data-pw="language-combobox"]').selectOption(lang);
      const ownerPage = new OwnerPage(page);
      await ownerPage.checkLabels(labels);
    });
  }
});
