import { Page, Locator } from '@playwright/test';

/**
 * SDET Page Object: Verwaltung (Administration) Navigation
 * Handles the dropdown menu for administrative functions
 */
export class VerwaltungPage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Selectors
  get verwaltungDropdown(): Locator {
    return this.page.locator('#verwaltungDropdown, button:has-text("Verwaltung")');
  }

  get petTypesLink(): Locator {
    return this.page.locator('a[href="/verwaltung/pettypes"]');
  }

  get vetsLink(): Locator {
    return this.page.locator('a[href="/verwaltung/vets"]');
  }

  // Actions
  async openVerwaltungDropdown(): Promise<void> {
    await this.verwaltungDropdown.click();
    // Wait for dropdown to be visible
    await this.petTypesLink.waitFor({ state: 'visible' });
  }

  async navigateToPetTypes(): Promise<void> {
    await this.openVerwaltungDropdown();
    await this.petTypesLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToVets(): Promise<void> {
    await this.openVerwaltungDropdown();
    await this.vetsLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  // Verifications
  async isDropdownVisible(): Promise<boolean> {
    return await this.verwaltungDropdown.isVisible();
  }

  async isPetTypesLinkVisible(): Promise<boolean> {
    await this.openVerwaltungDropdown();
    return await this.petTypesLink.isVisible();
  }

  async isVetsLinkVisible(): Promise<boolean> {
    await this.openVerwaltungDropdown();
    return await this.vetsLink.isVisible();
  }
}
