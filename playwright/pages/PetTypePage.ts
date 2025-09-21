import { Page, Locator, expect } from '@playwright/test';

/**
 * SDET Page Object: PetType Management
 * Handles all PetType CRUD operations and validations
 */
export class PetTypePage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Selectors based on actual HTML templates
  get addPetTypeButton(): Locator {
    return this.page.locator('[data-pw="add-pet-type"]');
  }

  get petTypeForm(): Locator {
    return this.page.locator('[data-pw="pet-type-form"]');
  }

  get nameInput(): Locator {
    return this.page.locator('[data-pw="pet-type-name"]');
  }

  get descriptionInput(): Locator {
    return this.page.locator('[data-pw="pet-type-description"]');
  }

  get saveButton(): Locator {
    return this.page.locator('[data-pw="save-pet-type"]');
  }

  get cancelButton(): Locator {
    return this.page.locator('[data-pw="cancel-pet-type"]');
  }

  get petTypesTable(): Locator {
    return this.page.locator('table.table-striped');
  }

  get successAlert(): Locator {
    return this.page.locator('.alert-success');
  }

  get errorAlert(): Locator {
    return this.page.locator('.alert-danger');
  }

  // Navigation
  async navigateTo(): Promise<void> {
    await this.page.goto('/verwaltung/pettypes');
    await this.page.waitForLoadState('networkidle');
  }

  // Form Actions
  async clickAddPetType(): Promise<void> {
    await this.addPetTypeButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async fillName(name: string): Promise<void> {
    await this.nameInput.fill(name);
  }

  async fillDescription(description: string): Promise<void> {
    await this.descriptionInput.fill(description);
  }

  async clickSave(): Promise<void> {
    await this.saveButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  // CRUD Operations
  async createPetType(name: string, description?: string): Promise<void> {
    await this.clickAddPetType();
    await this.fillName(name);
    if (description) {
      await this.fillDescription(description);
    }
    await this.clickSave();
  }

  // Verifications
  async verifyPetTypeExists(name: string): Promise<void> {
    const row = this.page.locator(`tr:has-text("${name}")`);
    await expect(row).toBeVisible();
  }

  async verifySuccessMessage(): Promise<void> {
    await expect(this.successAlert).toBeVisible();
  }

  // Utility Methods
  generateUniqueName(base: string = 'Test'): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `${base}-${timestamp}-${random}`;
  }

  async deletePetType(petTypeName: string): Promise<void> {
    // Navigate to PetTypes list if not already there
    await this.navigateTo();
    await this.page.waitForTimeout(1000);
    
    // Find the row with the specific PetType name
    const rows = this.page.locator('tbody tr');
    const rowCount = await rows.count();
    
    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i);
      const nameCell = row.locator('td').first();
      const nameText = await nameCell.textContent();
      
      if (nameText && nameText.trim() === petTypeName) {
        // Found the row, click delete button
        const deleteButton = row.locator('button:has-text("Löschen")');
        if (await deleteButton.isVisible()) {
          // Set up dialog handler before clicking
          this.page.once('dialog', async dialog => {
            await dialog.accept();
          });
          
          await deleteButton.click();
          await this.page.waitForTimeout(2000); // Wait for deletion to complete
          console.log(`Successfully deleted PetType: ${petTypeName}`);
          return;
        }
      }
    }
    
    console.log(`PetType not found for deletion: ${petTypeName}`);
  }
}
