import { Page } from '@playwright/test';

export class PetPage {
  constructor(private page: Page) {}

  private get nameInput() {
    return this.page.getByTestId('name');
  }
  private get birthDateInput() {
    return this.page.getByTestId('birthDate');
  }
  private get typeSelect() {
    return this.page.getByTestId('type');
  }
  private get addPetButton() {
    return this.page.getByRole('button', { name: 'Add Pet' });
  }
  private get addVisitLink() {
    return this.page.getByRole('link', { name: 'Add Visit' });
  }

  async addPet({ name, birthDate, type }: { name: string, birthDate: string, type: string }) {
    await this.nameInput.fill(name);
    await this.birthDateInput.fill(birthDate);
    await this.typeSelect.selectOption({ label: type });
    await this.addPetButton.click();
  }

  async gotoAddVisit() {
    await this.addVisitLink.click();
  }
}
