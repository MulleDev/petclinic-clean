import { Page, expect } from '@playwright/test';

export class HomePage {
  constructor(private page: Page) {}

  private get welcomeHeading() {
    return this.page.getByRole('heading', { name: 'Welcome' });
  }

  async goto() {
    await this.page.goto('http://localhost:8080');
  }

  async expectOnPage() {
    await expect(this.welcomeHeading).toBeVisible();
  }
}
