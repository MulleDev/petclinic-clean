const fs = require('fs');
const path = require('path');

class TestDataManager {
  constructor() {
    this.dataCache = new Map();
    this.fixturesPath = path.join(__dirname, '..', 'playwright', 'fixtures');
  }

  // Generiere realistische PetClinic Testdaten
  generatePetTypeData(count = 5) {
    const petTypes = [
      { name: "Kaninchen", description: "Kleine Säugetiere, benötigen spezielle Pflege" },
      { name: "Reptil", description: "Kaltblütige Tiere, Terrarium erforderlich" },
      { name: "Vogel", description: "Gefiederte Tiere, Käfighaltung" },
      { name: "Fisch", description: "Wassertiere, Aquarium erforderlich" },
      { name: "Hamster", description: "Kleine Nagetiere, nachtaktiv" },
      { name: "Schildkröte", description: "Langsame Reptilien, lange Lebensdauer" },
      { name: "Meerschweinchen", description: "Gesellige Nagetiere" },
      { name: "Papagei", description: "Intelligente Vögel, können sprechen lernen" }
    ];

    return petTypes.slice(0, count).map((pet, index) => ({
      ...pet,
      name: `${pet.name}_${Date.now()}_${index}`,
      testId: `test_pet_type_${index}`
    }));
  }

  generateOwnerData(count = 3) {
    const owners = [
      {
        firstName: "Maria",
        lastName: "Schmidt",
        address: "Hauptstraße 123",
        city: "Berlin",
        telephone: "030-12345678",
        email: "maria.schmidt@example.com"
      },
      {
        firstName: "Hans",
        lastName: "Müller", 
        address: "Gartenweg 45",
        city: "München",
        telephone: "089-98765432",
        email: "hans.mueller@example.com"
      },
      {
        firstName: "Anna",
        lastName: "Weber",
        address: "Parkstraße 78",
        city: "Hamburg",
        telephone: "040-11223344",
        email: "anna.weber@example.com"
      }
    ];

    return owners.slice(0, count).map((owner, index) => ({
      ...owner,
      firstName: `${owner.firstName}_${Date.now()}`,
      testId: `test_owner_${index}`
    }));
  }

  // Setup-Script für Test-Klassen generieren
  generateSetupScript(dataType, testData) {
    const timestamp = Date.now();
    
    switch(dataType) {
      case 'pet-types':
        return `
// Test Setup für PetTypes - Generated at ${new Date().toISOString()}
import { test as setup } from '@playwright/test';
import { PetTypePage } from '../pages/PetTypePage';

const testData = ${JSON.stringify(testData, null, 2)};

setup('Setup PetTypes', async ({ page }) => {
  const petTypePage = new PetTypePage(page);
  await petTypePage.goto();
  
  for (const petType of testData) {
    await petTypePage.addPetType(petType.name, petType.description);
    console.log(\`✅ Created PetType: \${petType.name}\`);
  }
});

export { testData as petTypeTestData };`;

      case 'owners':
        return `
// Test Setup für Owners - Generated at ${new Date().toISOString()}
import { test as setup } from '@playwright/test';
import { OwnerPage } from '../pages/OwnerPage';
import { Navigation } from '../pages/Navigation';

const testData = ${JSON.stringify(testData, null, 2)};

setup('Setup Owners', async ({ page }) => {
  const ownerPage = new OwnerPage(page);
  const navigation = new Navigation(page);
  
  await navigation.gotoFindOwners();
  
  for (const owner of testData) {
    await ownerPage.gotoAddOwner();
    await ownerPage.addOwner(owner);
    console.log(\`✅ Created Owner: \${owner.firstName} \${owner.lastName}\`);
  }
});

export { testData as ownerTestData };`;
    }
  }

  // Cleanup-Script generieren
  generateCleanupScript(dataType, testData) {
    switch(dataType) {
      case 'pet-types':
        return `
// Cleanup PetTypes after tests
import { test as cleanup } from '@playwright/test';
import { PetTypePage } from '../pages/PetTypePage';

const testData = ${JSON.stringify(testData, null, 2)};

cleanup('Cleanup PetTypes', async ({ page }) => {
  const petTypePage = new PetTypePage(page);
  await petTypePage.goto();
  
  for (const petType of testData) {
    try {
      await petTypePage.deletePetType(petType.name);
      console.log(\`🗑️ Deleted PetType: \${petType.name}\`);
    } catch (error) {
      console.log(\`⚠️ Could not delete \${petType.name}: \${error.message}\`);
    }
  }
});`;

      case 'owners':
        return `
// Cleanup Owners after tests  
import { test as cleanup } from '@playwright/test';
import { OwnerPage } from '../pages/OwnerPage';

const testData = ${JSON.stringify(testData, null, 2)};

cleanup('Cleanup Owners', async ({ page }) => {
  const ownerPage = new OwnerPage(page);
  
  for (const owner of testData) {
    try {
      await ownerPage.deleteOwner(\`\${owner.firstName} \${owner.lastName}\`);
      console.log(\`🗑️ Deleted Owner: \${owner.firstName} \${owner.lastName}\`);
    } catch (error) {
      console.log(\`⚠️ Could not delete owner: \${error.message}\`);
    }
  }
});`;
    }
  }

  // Speichere Testdaten als Fixture
  async saveTestDataFixture(dataType, testData) {
    const fixturePath = path.join(this.fixturesPath, `${dataType}-testdata.json`);
    
    // Stelle sicher, dass fixtures Ordner existiert
    if (!fs.existsSync(this.fixturesPath)) {
      fs.mkdirSync(this.fixturesPath, { recursive: true });
    }

    const fixture = {
      generatedAt: new Date().toISOString(),
      dataType,
      count: testData.length,
      data: testData
    };

    fs.writeFileSync(fixturePath, JSON.stringify(fixture, null, 2));
    return fixturePath;
  }
}

module.exports = TestDataManager;
