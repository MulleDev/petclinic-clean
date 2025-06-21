import { Page } from '@playwright/test';

export class Navigation {
  constructor(private page: Page) {}

  private get homeLink() {
    return this.page.getByRole('link', { name: 'HOME' });
  }
  private get findOwnersLink() {
    return this.page.getByRole('link', { name: 'FIND OWNERS' });
  }
  private get veterinariansLink() {
    return this.page.getByRole('link', { name: 'VETERINARIANS' });
  }
  private get errorLink() {
    return this.page.getByRole('link', { name: 'ERROR' });
  }

  async gotoHome() {
    await this.homeLink.click();
  }
  async gotoFindOwners() {
    await this.findOwnersLink.click();
  }
  async gotoVeterinarians() {
    await this.veterinariansLink.click();
  }
  async gotoError() {
    await this.errorLink.click();
  }
}
