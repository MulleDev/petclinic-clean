import { Page, expect } from '@playwright/test';

export class FindOwnersPage {
  constructor(private page: Page) {}

  private get lastNameInput() {
    return this.page.locator('[data-pw="find-owner-lastname"]');
  }
  private get findOwnerButton() {
    return this.page.getByRole('button', { name: 'Find Owner' });
  }
  private get addOwnerButton() {
    return this.page.getByRole('link', { name: 'Add Owner' });
  }

  async searchOwner(lastName: string) {
    await this.lastNameInput.fill(lastName);
    await this.findOwnerButton.click();
  }

  async gotoAddOwner() {
    await this.addOwnerButton.click();
  }

  async expectOnPage() {
    await expect(this.page.getByRole('heading', { name: 'Find Owners' })).toBeVisible();
  }
}
