import { test, expect } from '@playwright/test';

test('should add a random pet type and check all columns and buttons', async ({ page }) => {
  await page.goto('/pet-types');
  await page.locator('[data-pw="add-pet-type"]').click();

  // Zufällige Werte
  const randomName = 'TestType_' + Math.random().toString(36).substring(2, 8);
  const randomDesc = 'Beschreibung_' + Math.random().toString(36).substring(2, 8);

  await page.locator('#name').fill(randomName);
  await page.locator('#description').fill(randomDesc);
  await page.locator('[data-pw="save-pet-type"]').click();

  // Prüfe, ob die neue Zeile mit Name und Beschreibung existiert
  const row = page.locator(`tr:has-text("${randomName}")`);
  await expect(row).toBeVisible();
  await expect(row.locator('td')).toContainText([randomName, randomDesc]);

  // Prüfe, ob Edit- und Delete-Button mit data-pw vorhanden sind
  const editBtn = row.locator(`[data-pw^="edit-pet-type-"]`);
  const deleteBtn = row.locator(`[data-pw^="delete-pet-type-"]`);
  await expect(editBtn).toBeVisible();
  await expect(deleteBtn).toBeVisible();
});
