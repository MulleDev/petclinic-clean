import { test, expect } from '@playwright/test';

// E2E test for deleting a Pet Type
// Assumes at least one Pet Type exists in the table

test.describe('Pet Types Management: Delete', () => {
  test('should delete an existing Pet Type', async ({ page }) => {
    await page.goto('/pet-types');
    // Find the first row's name and delete button
    const firstRow = page.locator('table tbody tr').first();
    const nameCell = firstRow.locator('td').first();
    const petTypeName = await nameCell.textContent();
    const deleteBtn = firstRow.locator('[data-pw^="delete-pet-type-"]');
    await expect(deleteBtn).toBeVisible();
    await deleteBtn.click();

    // Confirm dialog if present (optional, depends on UI)
    // await page.locator('button:has-text("OK")').click();

    // The row should be gone
    await expect(page.locator('table tr', { hasText: petTypeName || '' })).toHaveCount(0);
  });
});
