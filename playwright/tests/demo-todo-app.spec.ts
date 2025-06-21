import { test } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { Navigation } from '../pages/Navigation';
import { FindOwnersPage } from '../pages/FindOwnersPage';
import { OwnerPage } from '../pages/OwnerPage';
import { PetPage } from '../pages/PetPage';
import testdata from '../fixtures/petclinic-testdata.json';

test.describe('Petclinic E2E', () => {
  for (const { owner, pets } of testdata) {
    test(`should create owner ${owner.firstName} ${owner.lastName} with ${pets.length} pets`, async ({ page }) => {
      const homePage = new HomePage(page);
      const navigation = new Navigation(page);
      const findOwnersPage = new FindOwnersPage(page);
      const ownerPage = new OwnerPage(page);
      const petPage = new PetPage(page);

      // Startseite aufrufen und prüfen
      await homePage.goto();
      await homePage.expectOnPage();

      // Navigation zu Find Owners
      await navigation.gotoFindOwners();
      await findOwnersPage.expectOnPage();
      await findOwnersPage.gotoAddOwner();
      await ownerPage.addOwner(owner);

      // Für jeden Pet-Eintrag Haustier hinzufügen
      for (const pet of pets) {
        await ownerPage.gotoAddPet();
        await petPage.addPet(pet);
      }
    });
  }
});
