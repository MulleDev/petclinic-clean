import { test, expect } from '@playwright/test';
import { PetTypePage } from '../pages/PetTypePage';

// E2E test for deleting a Pet Type
// Assumes at least one Pet Type exists in the table

test.describe('Pet Types Management: Delete', () => {
  test('should delete an existing Pet Type', async ({ page }) => {
    const petTypePage = new PetTypePage(page);
    await petTypePage.goto();
    // Zeilenzahl vor dem Löschen
    const rowCountBefore = await page.locator('table tbody tr').count();
    // Namen des ersten Pet Types ermitteln
    const firstRow = page.locator('table tbody tr').first();
    const nameCell = firstRow.locator('td').first();
    const petTypeName = await nameCell.textContent();
    // Löschen über POM
    await petTypePage.deletePetType(petTypeName || '');
    // Warte, bis die Zeile mit dem Namen verschwunden ist
    await expect(page.locator('table tbody tr', { hasText: petTypeName || '' })).toHaveCount(0);
    // Zeilenzahl nach dem Löschen
    const rowCountAfter = await page.locator('table tbody tr').count();
    expect(rowCountAfter).toBe(rowCountBefore - 1);
  });
});
