import { test } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { Navigation } from '../pages/Navigation';
import { FindOwnersPage } from '../pages/FindOwnersPage';
import { OwnerPage } from '../pages/OwnerPage';
import { PetPage } from '../pages/PetPage';
import ownerSnakeTestdata from '../fixtures/owner-snake-testdata.json';
import { toAbsoluteUrl } from '../helpers/TestUtils';

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
    await page.goto(toAbsoluteUrl(page.url(), href));
    // Verwende die generische Methode aus OwnerPage
    const hasSnake = await ownerPage.hasPetType('snake');
    if (!hasSnake) {
      await ownerPage.gotoAddPet();
      await petPage.addPet({ name: 'Snake', birthDate: '2020-01-01', type: 'snake' });
    }
  }
});
