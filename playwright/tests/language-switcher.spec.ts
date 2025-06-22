import { test, expect } from '@playwright/test';

// Testet die Sprachumschaltung im Footer

test.describe('Language Switcher', () => {
  test('should switch language and update UI texts', async ({ page }) => {
    await page.goto('/');
    // Warte auf die Combobox
    const combobox = await page.waitForSelector('[data-pw="language-combobox"]');
    // Teste alle verfügbaren Sprachen
    const langs = await page.$$eval('[data-pw^="language-option-"]', opts => opts.map(o => o.value));
    // Mappe Sprache auf einen typischen UI-Text
    const expectedTexts = {
      'default': 'Welcome',
      'de': 'Willkommen',
      'en': 'Welcome',
      'es': 'Bienvenido',
      'fa': 'خوش آمدید',
      'ko': '환영합니다',
      'pt': 'Bem-vindo',
      'ru': 'Добро пожаловать',
      'tr': 'Hoş geldiniz'
    };
    for (const lang of langs) {
      await combobox.selectOption(lang);
      await page.waitForTimeout(300); // Warte auf AJAX
      const text = await page.locator('[data-i18n="welcome"]').textContent();
      expect(text?.trim()).toBe(expectedTexts[lang]);
    }
  });
});
