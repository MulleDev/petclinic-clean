import { Page, Locator } from '@playwright/test';

/**
 * SDET Page Object: Main Navigation
 * Handles all navigation actions throughout the application
 */
export class Navigation {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Main Navigation Links
  get homeLink(): Locator {
    return this.page.locator('a[href="/"]').first();
  }

  get findOwnersLink(): Locator {
    return this.page.locator('a[href="/owners/find"]');
  }

  get vetsLink(): Locator {
    return this.page.locator('a[href="/vets.html"]');
  }

  get errorLink(): Locator {
    return this.page.locator('a[href="/oups"]');
  }

  // Verwaltung Dropdown
  get verwaltungDropdown(): Locator {
    return this.page.locator('#verwaltungDropdown, button:has-text("Verwaltung")');
  }

  get petTypesAdminLink(): Locator {
    return this.page.locator('a[href="/verwaltung/pettypes"]');
  }

  get vetsAdminLink(): Locator {
    return this.page.locator('a[href="/verwaltung/vets"]');
  }

  // Language Selector
  get languageSelector(): Locator {
    return this.page.locator('select, combobox');
  }

  // Navigation Actions
  async navigateToHome(): Promise<void> {
    await this.homeLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToFindOwners(): Promise<void> {
    await this.findOwnersLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToVets(): Promise<void> {
    await this.vetsLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToError(): Promise<void> {
    await this.errorLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  // Verwaltung Navigation
  async openVerwaltungDropdown(): Promise<void> {
    await this.verwaltungDropdown.click();
    // Wait for dropdown to be visible
    await this.petTypesAdminLink.waitFor({ state: 'visible' });
  }

  async navigateToPetTypesAdmin(): Promise<void> {
    await this.openVerwaltungDropdown();
    await this.petTypesAdminLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToVetsAdmin(): Promise<void> {
    await this.openVerwaltungDropdown();
    await this.vetsAdminLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  // Language Actions
  async switchLanguage(language: 'Deutsch' | 'English' | 'Español' | 'Русский'): Promise<void> {
    await this.languageSelector.selectOption({ label: language });
    await this.page.waitForLoadState('networkidle');
  }

  async getCurrentLanguage(): Promise<string> {
    const selectedOption = await this.languageSelector.locator('option[selected]').textContent();
    return selectedOption || 'Unknown';
  }

  // Verification Methods
  async verifyHomePageLoaded(): Promise<boolean> {
    return await this.page.locator('h2:has-text("Welcome")').isVisible();
  }

  async verifyNavigationVisible(): Promise<boolean> {
    return await this.homeLink.isVisible() && 
           await this.findOwnersLink.isVisible() && 
           await this.vetsLink.isVisible();
  }

  async verifyVerwaltungDropdownExists(): Promise<boolean> {
    return await this.verwaltungDropdown.isVisible();
  }

  // Utility Methods
  async getCurrentURL(): Promise<string> {
    return this.page.url();
  }

  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }
}
