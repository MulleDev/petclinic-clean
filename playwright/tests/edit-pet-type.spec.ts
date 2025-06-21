import { test, expect } from '@playwright/test';

// E2E test for editing a Pet Type
// Assumes at least one Pet Type exists in the table

test.describe('Pet Types Management: Edit', () => {
  test('should edit an existing Pet Type', async ({ page }) => {
    await page.goto('/pet-types');
    // Find the first row's edit button
    const firstEditBtn = page.locator('[data-pw^="edit-pet-type-"]').first();
    await expect(firstEditBtn).toBeVisible();
    await firstEditBtn.click();

    // Edit form should appear (assume modal or inline form)
    const nameInput = page.locator('[data-pw="pet-type-name-input"]');
    const descInput = page.locator('[data-pw="pet-type-description-input"]');
    const saveBtn = page.locator('[data-pw="save-pet-type"]');
    await expect(nameInput).toBeVisible();
    await expect(descInput).toBeVisible();
    await expect(saveBtn).toBeVisible();

    // Change name and description
    const newName = 'EditedType-' + Date.now();
    const newDesc = 'Edited description ' + Date.now();
    await nameInput.fill(newName);
    await descInput.fill(newDesc);
    await saveBtn.click();

    // Table should update with new values
    const row = page.locator('table tr', { hasText: newName });
    await expect(row).toBeVisible();
    await expect(row).toContainText(newDesc);
  });
});
