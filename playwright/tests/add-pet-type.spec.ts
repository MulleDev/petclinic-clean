import { test } from '@playwright/test';
import { PetTypePage } from '../pages/PetTypePage';

test.describe('Pet Typen verwalten – Anlegen', () => {
  test('should add a new Pet Type, verify persistence after reload, and delete it', async ({ page }) => {
    const petTypePage = new PetTypePage(page);
    await petTypePage.goto();
    // Testdaten
    const testName = 'Schlange_' + Date.now();
    const testDesc = 'Reptil, ungiftig';
    // Anlegen
    await petTypePage.addPetType(testName, testDesc);
    await petTypePage.expectPetTypeExists(testName, testDesc);
    // Nach Reload prüfen
    await petTypePage.reloadAndExpectPetType(testName, testDesc);
    // Löschen
    await petTypePage.deletePetType(testName);
    await petTypePage.expectPetTypeNotExists(testName);
  });
});
