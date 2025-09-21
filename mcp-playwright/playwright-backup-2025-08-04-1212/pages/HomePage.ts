import { Page, expect } from '@playwright/test';

export class HomePage {
  constructor(private page: Page) {}

  private get welcomeHeading() {
    return this.page.locator('[data-i18n="welcome"]');
  }

  async goto() {
    await this.page.goto('/');
  }

  async expectOnPage() {
    await expect(this.welcomeHeading).toBeVisible();
  }
}
