import { Page, Locator, expect } from '@playwright/test';

/**
 * SDET Page Object: Veterinarians Management
 * Handles all Vet CRUD operations and verifications
 */
export class VetsPage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Selectors for Verwaltung Vets Page
  get addVetButton(): Locator {
    return this.page.locator('a[href="/verwaltung/vets/new"]');
  }

  get vetsTable(): Locator {
    return this.page.locator('table.table-striped');
  }

  get successAlert(): Locator {
    return this.page.locator('.alert-success');
  }

  get errorAlert(): Locator {
    return this.page.locator('.alert-danger');
  }

  // Form selectors (for add/edit forms)
  get firstNameInput(): Locator {
    return this.page.locator('#firstName');
  }

  get lastNameInput(): Locator {
    return this.page.locator('#lastName');
  }

  get emailInput(): Locator {
    return this.page.locator('#email');
  }

  get telephoneInput(): Locator {
    return this.page.locator('#telephone');
  }

  get saveButton(): Locator {
    return this.page.locator('button[type="submit"]');
  }

  get cancelButton(): Locator {
    return this.page.locator('a:has-text("Abbrechen"), a:has-text("Cancel")');
  }

  // Navigation
  async navigateTo(): Promise<void> {
    await this.page.goto('/verwaltung/vets');
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToPublicVets(): Promise<void> {
    await this.page.goto('/vets.html');
    await this.page.waitForLoadState('networkidle');
  }

  // Actions
  async clickAddVet(): Promise<void> {
    await this.addVetButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async fillVetForm(vetData: {
    firstName: string;
    lastName: string;
    email?: string;
    telephone?: string;
  }): Promise<void> {
    await this.firstNameInput.fill(vetData.firstName);
    await this.lastNameInput.fill(vetData.lastName);
    
    if (vetData.email) {
      await this.emailInput.fill(vetData.email);
    }
    
    if (vetData.telephone) {
      await this.telephoneInput.fill(vetData.telephone);
    }
  }

  async saveVet(): Promise<void> {
    await this.saveButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async cancelVetForm(): Promise<void> {
    await this.cancelButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  // CRUD Operations
  async createVet(vetData: {
    firstName: string;
    lastName: string;
    email?: string;
    telephone?: string;
  }): Promise<void> {
    await this.clickAddVet();
    await this.fillVetForm(vetData);
    await this.saveVet();
  }

  async editVetById(id: string, vetData: {
    firstName?: string;
    lastName?: string;
    email?: string;
    telephone?: string;
  }): Promise<void> {
    const editButton = this.page.locator(`a[href="/verwaltung/vets/${id}/edit"]`);
    await editButton.click();
    await this.page.waitForLoadState('networkidle');
    
    if (vetData.firstName) await this.firstNameInput.fill(vetData.firstName);
    if (vetData.lastName) await this.lastNameInput.fill(vetData.lastName);
    if (vetData.email) await this.emailInput.fill(vetData.email);
    if (vetData.telephone) await this.telephoneInput.fill(vetData.telephone);
    
    await this.saveVet();
  }

  async deleteVetById(id: string): Promise<void> {
    const deleteButton = this.page.locator(`form[action="/verwaltung/vets/${id}/delete"] button`);
    await deleteButton.click();
    
    // Handle confirmation if present
    const confirmButton = this.page.getByRole('button', { name: 'OK' });
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
    }
    
    await this.page.waitForLoadState('networkidle');
  }

  // Verifications
  async verifyVetExists(firstName: string, lastName: string): Promise<void> {
    const fullName = `${firstName} ${lastName}`;
    const row = this.page.locator(`tr:has-text("${fullName}")`);
    await expect(row).toBeVisible();
  }

  async verifyVetNotExists(firstName: string, lastName: string): Promise<void> {
    const fullName = `${firstName} ${lastName}`;
    const row = this.page.locator(`tr:has-text("${fullName}")`);
    await expect(row).not.toBeVisible();
  }

  async verifySuccessMessage(): Promise<void> {
    await expect(this.successAlert).toBeVisible();
  }

  async verifyErrorMessage(): Promise<void> {
    await expect(this.errorAlert).toBeVisible();
  }

  // Utility Methods
  async getVetCount(): Promise<number> {
    const rows = this.page.locator('tbody tr');
    return await rows.count();
  }

  async getAllVetNames(): Promise<string[]> {
    const nameElements = this.page.locator('tbody tr td:first-child');
    const count = await nameElements.count();
    const names: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const name = await nameElements.nth(i).textContent();
      if (name) names.push(name.trim());
    }
    
    return names;
  }

  // Pagination (for public vets list)
  async navigateToPage(pageNumber: number): Promise<void> {
    const pageLink = this.page.locator(`a:has-text("${pageNumber}")`);
    if (await pageLink.isVisible()) {
      await pageLink.click();
      await this.page.waitForLoadState('networkidle');
    }
  }

  async navigateToNextPage(): Promise<void> {
    const nextButton = this.page.locator('a[title="Next"], .fa-step-forward');
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await this.page.waitForLoadState('networkidle');
    }
  }

  async navigateToPreviousPage(): Promise<void> {
    const prevButton = this.page.locator('a[title="Previous"], .fa-step-backward');
    if (await prevButton.isVisible()) {
      await prevButton.click();
      await this.page.waitForLoadState('networkidle');
    }
  }

  // Specialties handling (for public vets view)
  async getVetSpecialties(vetName: string): Promise<string[]> {
    const row = this.page.locator(`tr:has-text("${vetName}")`);
    const specialtiesCell = row.locator('td').nth(1);
    const specialtiesText = await specialtiesCell.textContent();
    
    if (!specialtiesText || specialtiesText.includes('none')) {
      return [];
    }
    
    return specialtiesText.split(' ').filter(s => s.trim().length > 0);
  }

  // Generate unique test data
  generateUniqueVetData(prefix: string = 'Test'): {
    firstName: string;
    lastName: string;
    email: string;
    telephone: string;
  } {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    
    return {
      firstName: `${prefix}Vorname${random}`,
      lastName: `${prefix}Nachname${timestamp}`,
      email: `${prefix.toLowerCase()}${random}@example.com`,
      telephone: `555${String(random).padStart(7, '0')}`
    };
  }

  // Cleanup utility for tests
  async cleanupTestData(prefix: string = 'Test'): Promise<void> {
    const allNames = await this.getAllVetNames();
    const testNames = allNames.filter(name => name.includes(prefix));
    
    for (const name of testNames) {
      try {
        const row = this.page.locator(`tr:has-text("${name}")`);
        const deleteButton = row.locator('form button:has-text("Löschen"), form button:has-text("Delete")');
        
        if (await deleteButton.isVisible()) {
          await deleteButton.click();
          const confirmButton = this.page.getByRole('button', { name: 'OK' });
          if (await confirmButton.isVisible()) {
            await confirmButton.click();
          }
          await this.page.waitForLoadState('networkidle');
        }
      } catch (error) {
        console.log(`Could not delete test Vet: ${name}`, error);
      }
    }
  }
}
