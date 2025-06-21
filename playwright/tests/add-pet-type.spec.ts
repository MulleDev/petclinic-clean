import { test, expect } from '@playwright/test';

test.describe('Pet Typen verwalten – Anlegen', () => {
  test('should add a new Pet Type and show it in the list', async ({ page }) => {
    await page.goto('/pet-types');
    // Button anzeigen und klicken
    const addBtn = page.locator('[data-pw="add-pet-type"]');
    await expect(addBtn).toBeVisible();
    await addBtn.click();
    // Formular erscheint
    const nameInput = page.locator('#addPetTypeForm input[name="name"]');
    const descInput = page.locator('#addPetTypeForm input[name="description"]');
    const saveBtn = page.locator('#addPetTypeForm [data-pw="save-pet-type"]');
    await expect(nameInput).toBeVisible();
    // Testdaten
    const testName = 'Schlange_' + Date.now();
    const testDesc = 'Reptil, ungiftig';
    await nameInput.fill(testName);
    await descInput.fill(testDesc);
    await saveBtn.click();
    // Formular verschwindet
    await expect(page.locator('#addPetTypeForm')).toBeHidden();
    // Neuer Eintrag in Tabelle
    const row = page.locator('#petTypesTbody tr').last();
    const tds = row.locator('td');
    await expect(await tds.nth(0).textContent()).toBe(testName);
    await expect(await tds.nth(1).textContent()).toBe(testDesc);
  });
});
