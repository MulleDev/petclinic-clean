import { test } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { Navigation } from '../pages/Navigation';
import { FindOwnersPage } from '../pages/FindOwnersPage';
import { OwnerPage } from '../pages/OwnerPage';
import { PetPage } from '../pages/PetPage';
import ownerSnakeTestdata from '../fixtures/owner-snake-testdata.json';

// Test: Lege einen neuen Owner mit Nachnamen, der mit S beginnt, an

test('create new owner with last name starting with S', async ({ page }) => {
  const homePage = new HomePage(page);
  const navigation = new Navigation(page);
  const findOwnersPage = new FindOwnersPage(page);
  const ownerPage = new OwnerPage(page);

  const ownerData = ownerSnakeTestdata[0];

  await homePage.goto();
  await navigation.gotoFindOwners();
  await findOwnersPage.expectOnPage();
  await findOwnersPage.gotoAddOwner();
  await ownerPage.addOwner(ownerData);
});

// Test: Lege für alle Owner mit Nachnamen, die mit S beginnen, eine Schlange als Pet an

test('add snake pet for all owners with last name starting with S', async ({ page }) => {
  const homePage = new HomePage(page);
  const navigation = new Navigation(page);
  const findOwnersPage = new FindOwnersPage(page);
  const ownerPage = new OwnerPage(page);
  const petPage = new PetPage(page);

  await homePage.goto();
  await navigation.gotoFindOwners();
  await findOwnersPage.expectOnPage();
  await findOwnersPage.searchOwner('');

  // Sammle alle Links zu Owner-Detailseiten mit Nachnamen, die mit S beginnen (über alle Seiten)
  const sOwnerHrefs = await findOwnersPage.getOwnerDetailLinksByLastNameMatch('S');

  for (const href of sOwnerHrefs) {
    await page.goto(href.startsWith('http') ? href : `${page.url().split('/owners')[0]}${href}`);
    // Prüfe, ob bereits eine Schlange vorhanden ist
    const petTypes = await page.locator('table td').allTextContents();
    const hasSnake = petTypes.some(type => type.trim().toLowerCase() === 'snake');
    if (!hasSnake) {
      await ownerPage.gotoAddPet();
      await petPage.addPet({ name: 'Snake', birthDate: '2020-01-01', type: 'snake' });
    }
  }
});
