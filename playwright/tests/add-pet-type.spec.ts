import { test, expect } from '@playwright/test';

test.describe('Pet Typen verwalten – Anlegen', () => {
  test('should add a new Pet Type, verify persistence after reload, and delete it', async ({ page }) => {
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

    // 1. Seite neu laden und prüfen, ob der Eintrag noch da ist
    await page.reload();
    const rows = page.locator('#petTypesTbody tr');
    const found = rows.filter({ hasText: testName });
    await expect(found).toHaveCount(1);
    const foundTds = found.locator('td');
    await expect(await foundTds.nth(0).textContent()).toBe(testName);
    await expect(await foundTds.nth(1).textContent()).toBe(testDesc);

    // 2. Löschen-Funktion testen
    const deleteBtn = found.locator('[data-pw^="delete-pet-type-"]');
    await expect(deleteBtn).toBeVisible();
    // Dialog-Handler vor dem Klick registrieren
    page.once('dialog', dialog => dialog.accept());
    await deleteBtn.click();
    // Prüfen, dass der Eintrag entfernt wurde
    await expect(rows.filter({ hasText: testName })).toHaveCount(0);
  });
});
