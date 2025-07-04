import { Page, expect } from '@playwright/test';

export class OwnerPage {
  constructor(private page: Page) {}

  private get findOwnersLink() {
    return this.page.locator('[data-pw="nav-find-owners"] a');
  }
  private get addOwnerLink() {
    return this.page.locator('[data-pw="owner-add-link"]');
  }
  private get firstNameInput() {
    return this.page.locator('[data-pw="firstName"]');
  }
  private get lastNameInput() {
    return this.page.locator('[data-pw="lastName"]');
  }
  private get addressInput() {
    return this.page.locator('[data-pw="address"]');
  }
  private get cityInput() {
    return this.page.locator('[data-pw="city"]');
  }
  private get telephoneInput() {
    return this.page.locator('[data-pw="telephone"]');
  }
  private get addOwnerButton() {
    return this.page.locator('[data-pw="owner-submit"]');
  }
  private get addPetLink() {
    return this.page.locator('[data-pw="pet-add-link"]');
  }
  private get editOwnerLink() {
    return this.page.locator('[data-pw="owner-edit-link"]');
  }

  async gotoFindOwners() {
    await this.findOwnersLink.click();
  }

  async gotoAddOwner() {
    await this.addOwnerLink.click();
  }

  async addOwner({ firstName, lastName, address, city, telephone }: { firstName: string, lastName: string, address: string, city: string, telephone: string }) {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.addressInput.fill(address);
    await this.cityInput.fill(city);
    await this.telephoneInput.fill(telephone);
    await this.addOwnerButton.click();
  }

  async gotoAddPet() {
    await this.addPetLink.click();
  }

  async checkHasPetType(ownerHref: string, petType: string) {
    await this.page.goto(ownerHref.startsWith('http') ? ownerHref : `${this.page.url().split('/owners')[0]}${ownerHref}`);
    // Selektiere alle <dt> mit Text 'Type' und hole das zugehörige <dd>
    const typeDDs = await this.page.locator('dt', { hasText: 'Type' }).evaluateAll((dts) =>
      dts.map(dt => dt.nextElementSibling?.textContent?.trim() || '')
    );
    const hasType = typeDDs.some(type => type.toLowerCase() === petType.toLowerCase());
    expect(hasType).toBeTruthy();
  }

  async hasPetType(petType: string): Promise<boolean> {
    const typeDDs = await this.page.locator('dt', { hasText: 'Type' }).evaluateAll((dts) =>
      dts.map(dt => dt.nextElementSibling?.textContent?.trim() || '')
    );
    return typeDDs.some(type => type.toLowerCase() === petType.toLowerCase());
  }

  async checkLabels(labels: Record<string, string>) {
    await expect(this.page.locator('[data-i18n="ownerInformation"]')).toHaveText(labels.ownerInformation);
    await expect(this.page.locator('th[data-i18n="name"]')).toHaveText(labels.name);
    await expect(this.page.locator('th[data-i18n="address"]')).toHaveText(labels.address);
    await expect(this.page.locator('th[data-i18n="city"]')).toHaveText(labels.city);
    await expect(this.page.locator('th[data-i18n="telephone"]')).toHaveText(labels.telephone);
  }
}
