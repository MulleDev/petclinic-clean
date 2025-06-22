import { Page, expect, Locator } from '@playwright/test';

export class PetTypePage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/pet-types');
  }

  async addPetType(name: string, desc: string) {
    const addBtn = this.page.locator('[data-pw="add-pet-type"]');
    await expect(addBtn).toBeVisible();
    await addBtn.click();
    const nameInput = this.page.locator('#addPetTypeForm input[name="name"]');
    const descInput = this.page.locator('#addPetTypeForm input[name="description"]');
    const saveBtn = this.page.locator('#addPetTypeForm [data-pw="save-pet-type"]');
    await expect(nameInput).toBeVisible();
    await nameInput.fill(name);
    await descInput.fill(desc);
    await saveBtn.click();
    await expect(this.page.locator('#addPetTypeForm')).toBeHidden();
  }

  rowByName(name: string): Locator {
    return this.page.locator('#petTypesTbody tr').filter({ hasText: name });
  }

  async expectPetTypeExists(name: string, desc: string) {
    const row = this.rowByName(name);
    const tds = row.locator('td');
    await expect(await tds.nth(0).textContent()).toBe(name);
    await expect(await tds.nth(1).textContent()).toBe(desc);
  }

  async expectPetTypeNotExists(name: string) {
    const row = this.rowByName(name);
    await expect(row).toHaveCount(0);
  }

  async reloadAndExpectPetType(name: string, desc: string) {
    await this.page.reload();
    await this.expectPetTypeExists(name, desc);
  }

  async deletePetType(name: string) {
    const row = this.rowByName(name);
    const deleteBtn = row.locator('[data-pw^="delete-pet-type-"]');
    await expect(deleteBtn).toBeVisible();
    this.page.once('dialog', dialog => dialog.accept());
    await deleteBtn.click();
    await expect(row).toHaveCount(0);
  }
}
