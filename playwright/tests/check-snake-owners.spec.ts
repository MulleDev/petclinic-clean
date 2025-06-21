import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { Navigation } from '../pages/Navigation';
import { FindOwnersPage } from '../pages/FindOwnersPage';

// Test: Alle Owner mit Nachnamen, die mit S beginnen, haben eine Schlange als Pet

test('all owners with last name starting with S have a snake as pet', async ({ page }) => {
  const homePage = new HomePage(page);
  const navigation = new Navigation(page);
  const findOwnersPage = new FindOwnersPage(page);

  // Gehe zur Startseite und dann zu "Find Owners"
  await homePage.goto();
  await navigation.gotoFindOwners();
  await findOwnersPage.expectOnPage();

  // Suche alle Owner mit Nachnamen, die mit S beginnen
  await findOwnersPage.searchOwner('S');

  // Hole alle Zeilen der Owner-Tabelle
  const ownerRows = await page.locator('table tbody tr').all();

  for (let i = 0; i < ownerRows.length; i++) {
    const row = ownerRows[i];
    const lastName = await row.locator('td').nth(0).innerText();
    if (lastName.startsWith('S')) {
      // Klicke auf den Owner-Link, um die Detailseite zu öffnen
      await row.locator('a').first().click();

      // Prüfe, ob mindestens ein Pet vom Typ "snake" existiert
      const petTypes = await page.locator('table.pet-list td').allTextContents();
      const hasSnake = petTypes.some(type => type.toLowerCase() === 'snake');
      expect(hasSnake).toBeTruthy();

      // Gehe zurück zur Owner-Liste
      await navigation.gotoFindOwners();
      await findOwnersPage.expectOnPage();
      await findOwnersPage.searchOwner('S');
    }
  }
});
