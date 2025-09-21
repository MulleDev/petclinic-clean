import { Page } from '@playwright/test';

export class Navigation {
  constructor(private page: Page) {}

  get homeLink() {
    return this.page.locator('[data-pw="nav-home"] a');
  }
  get findOwnersLink() {
    return this.page.locator('[data-pw="nav-find-owners"] a');
  }
  get veterinariansLink() {
    return this.page.locator('[data-pw="nav-vets"] a');
  }
  get errorLink() {
    return this.page.locator('[data-pw="nav-error"] a');
  }
  get petTypesLink() {
    return this.page.locator('[data-pw="nav-pet-types"] a');
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
  async gotoPetTypes() {
    await this.petTypesLink.click();
  }
}
