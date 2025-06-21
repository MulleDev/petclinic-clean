import { test } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { Navigation } from '../pages/Navigation';
import { FindOwnersPage } from '../pages/FindOwnersPage';
import { OwnerPage } from '../pages/OwnerPage';
import { PetPage } from '../pages/PetPage';
import { VisitPage } from '../pages/VisitPage';
import testdata from '../fixtures/petclinic-testdata.json';

test.describe('Petclinic E2E', () => {
  test('should create owner, add pet and make a visit', async ({ page }) => {
    const homePage = new HomePage(page);
    const navigation = new Navigation(page);
    const findOwnersPage = new FindOwnersPage(page);
    const ownerPage = new OwnerPage(page);
    const petPage = new PetPage(page);
    const visitPage = new VisitPage(page);
    
    // Testdaten aus dem ersten Datensatz verwenden
    const { owner, pet, visit } = testdata[0];

    // Startseite aufrufen und prüfen
    await homePage.goto();
    await homePage.expectOnPage();

    // Navigation zu Find Owners
    await navigation.gotoFindOwners();
    await findOwnersPage.expectOnPage();
    await findOwnersPage.gotoAddOwner();
    await ownerPage.addOwner(owner);

    // Pet hinzufügen
    await ownerPage.gotoAddPet();
    await petPage.addPet(pet);

    // Visit hinzufügen
    await petPage.gotoAddVisit();
    await visitPage.addVisit(visit);
    await visitPage.expectVisit(visit.description);
  });
});
