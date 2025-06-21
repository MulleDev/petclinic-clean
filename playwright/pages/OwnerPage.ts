import { Page, expect } from '@playwright/test';

export class OwnerPage {
  constructor(private page: Page) {}

  private get findOwnersLink() {
    return this.page.getByRole('link', { name: 'FIND OWNERS' });
  }
  private get addOwnerLink() {
    return this.page.getByRole('link', { name: 'Add Owner' });
  }
  private get firstNameInput() {
    return this.page.getByTestId('firstName');
  }
  private get lastNameInput() {
    return this.page.getByTestId('lastName');
  }
  private get addressInput() {
    return this.page.getByTestId('address');
  }
  private get cityInput() {
    return this.page.getByTestId('city');
  }
  private get telephoneInput() {
    return this.page.getByTestId('telephone');
  }
  private get addOwnerButton() {
    return this.page.getByRole('button', { name: 'Add Owner' });
  }
  private get addPetLink() {
    return this.page.getByRole('link', { name: 'Add New Pet' });
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
    // Warte auf ein Element, das garantiert auf der Owner-Detailseite existiert (z.B. Adresse)
    //await this.page.getByText('Owner Information', { exact: false }).waitFor({ timeout: 5000 });
    await this.addPetLink.click();
  }

  async checkHasPetType(ownerHref: string, petType: string) {
    await this.page.goto(ownerHref.startsWith('http') ? ownerHref : `${this.page.url().split('/owners')[0]}${ownerHref}`);
    const petTypes = await this.page.locator('table.pet-list td').allTextContents();
    const hasType = petTypes.some(type => type.toLowerCase() === petType.toLowerCase());
    expect(hasType).toBeTruthy();
  }
}
