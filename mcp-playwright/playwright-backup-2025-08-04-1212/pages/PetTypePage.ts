import { Page, expect, Locator } from '@playwright/test';

export class PetTypePage {
  constructor(private page: Page) {}

  // --- Locators ---
  private get addPetTypeButton() {
    return this.page.locator('[data-pw="add-pet-type"]');
  }
  private get petTypeForm() {
    return this.page.locator('[data-pw="pet-type-form"]');
  }
  private get nameInput() {
    return this.petTypeForm.locator('[data-pw="pet-type-name"]');
  }
  private get descInput() {
    return this.petTypeForm.locator('[data-pw="pet-type-description"]');
  }
  private get saveButton() {
    return this.petTypeForm.locator('[data-pw="save-pet-type"]');
  }
  private get cancelButton() {
    return this.petTypeForm.locator('[data-pw="cancel-pet-type"]');
  }
  rowByName(name: string): Locator {
    return this.page.locator('#petTypesTbody tr').filter({ hasText: name });
  }
  editButtonByName(name: string): Locator {
    return this.rowByName(name).locator('[data-pw^="edit-pet-type-"]');
  }
  deleteButtonByName(name: string): Locator {
    return this.rowByName(name).locator('[data-pw^="delete-pet-type-"]');
  }

  // --- Actions ---
  async goto() {
    await this.page.goto('/pet-types');
  }

  async addPetType(name: string, desc: string) {
    await expect(this.addPetTypeButton).toBeVisible();
    await this.addPetTypeButton.click();
    await expect(this.nameInput).toBeVisible();
    await this.nameInput.fill(name);
    await this.descInput.fill(desc);
    await this.saveButton.click();
    await expect(this.page).not.toHaveURL(/\/pettypes\/(new|\d+\/edit)$/);
  }

  async editPetType(name: string, newName: string, newDesc: string) {
    const editBtn = this.editButtonByName(name);
    await expect(editBtn).toBeVisible();
    await editBtn.click();
    await expect(this.nameInput).toBeVisible();
    await this.nameInput.fill(newName);
    await this.descInput.fill(newDesc);
    await this.saveButton.click();
    await expect(this.page).not.toHaveURL(/\/pettypes\/(new|\d+\/edit)$/);
  }

  async deletePetType(name: string) {
    const deleteBtn = this.deleteButtonByName(name);
    await expect(deleteBtn).toBeVisible();
    this.page.once('dialog', dialog => dialog.accept());
    await deleteBtn.click();
    await expect(this.rowByName(name)).toHaveCount(0);
  }

  // --- Assertions ---
  async expectPetTypeExists(name: string, desc: string) {
    const row = this.rowByName(name);
    const tds = row.locator('td');
    await expect(await tds.nth(0).textContent()).toBe(name);
    await expect(await tds.nth(1).textContent()).toBe(desc);
  }

  async expectPetTypeNotExists(name: string) {
    await expect(this.rowByName(name)).toHaveCount(0);
  }

  async reloadAndExpectPetType(name: string, desc: string) {
    await this.page.reload();
    await this.expectPetTypeExists(name, desc);
  }
}
