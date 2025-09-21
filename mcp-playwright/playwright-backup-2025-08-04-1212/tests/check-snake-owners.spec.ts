import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { Navigation } from '../pages/Navigation';
import { FindOwnersPage } from '../pages/FindOwnersPage';
import { OwnerPage } from '../pages/OwnerPage';

// Test: Alle Owner mit Nachnamen, die mit S beginnen, haben eine Schlange als Pet

test('all owners with last name starting with S have a snake as pet', async ({ page }) => {
  const homePage = new HomePage(page);
  const navigation = new Navigation(page);
  const findOwnersPage = new FindOwnersPage(page);
  const ownerPage = new OwnerPage(page);

  // Gehe zur Startseite und dann zu "Find Owners"
  await homePage.goto();
  await navigation.gotoFindOwners();
  await findOwnersPage.expectOnPage();

  // Suche alle Owner ohne Nachnamen, um alle anzuzeigen
  // Dies setzt die Pagination zurück, falls sie vorher gesetzt war
  await findOwnersPage.searchOwner('');

  // Sammle alle Links zu Owner-Detailseiten mit Nachnamen, die mit S beginnen (über alle Seiten)
  const sOwnerHrefs = await findOwnersPage.getOwnerDetailLinksByLastNameMatch('S');

  // Jetzt alle gesammelten Owner-Detailseiten prüfen
  console.log('Gesammelte Owner-Detail-Links (sOwnerHrefs):', sOwnerHrefs);
  for (const href of sOwnerHrefs) {
    await ownerPage.checkHasPetType(href, 'snake');
  }
});
