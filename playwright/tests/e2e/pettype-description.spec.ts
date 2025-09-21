import { test, expect } from '@playwright/test';
import { PetTypePage } from '../../pages/PetTypePage';
import { VerwaltungPage } from '../../pages/VerwaltungPage';
import petTypeCases from '../../fixtures/pettype-description-cases.json';

// Echte MCP Playwright Integration
class MCPClient {
  private baseUrl = 'http://localhost:3003';

  async analyzeTestQuality(testFiles: string[], testResults: any[]) {
    try {
      const response = await fetch(`${this.baseUrl}/playwright/analyze-test-quality`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testFiles,
          testResults,
          timestamp: new Date().toISOString()
        })
      });
      return await response.json();
    } catch (error) {
      console.log('MCP test quality analysis failed:', error);
      return null;
    }
  }
}

test.describe('PetType Description Tests', () => {
  let petTypePage: PetTypePage;
  let verwaltungPage: VerwaltungPage;
  const createdPetTypes: string[] = [];
  const mcpClient = new MCPClient();
  const testResults: any[] = [];

  test.beforeEach(async ({ page }) => {
    petTypePage = new PetTypePage(page);
    verwaltungPage = new VerwaltungPage(page);
    await page.goto('http://localhost:8080');
    await verwaltungPage.navigateToPetTypes();
  });

  test.afterEach(async ({ page }, testInfo) => {
    // Cleanup test data
    for (const petTypeName of createdPetTypes) {
      try {
        await petTypePage.deletePetType(petTypeName);
      } catch (error) {
        console.log(`Failed to delete ${petTypeName}:`, error);
      }
    }
    createdPetTypes.length = 0;

    // Track test results for MCP analysis
    const testResult = {
      testName: testInfo.title,
      status: testInfo.status,
      duration: testInfo.duration,
      errors: testInfo.errors.map(e => e.message || e.toString())
    };
    testResults.push(testResult);
  });

  for (const { namePrefix, description } of petTypeCases) {
    const testTitle = description
      ? `should create PetType '${namePrefix}' with description` 
      : `should create PetType '${namePrefix}' without description`;
    test(testTitle, async ({ page }) => {
      const uniqueName = petTypePage.generateUniqueName(namePrefix);
      if (description) {
        await petTypePage.createPetType(uniqueName, description);
      } else {
        await petTypePage.createPetType(uniqueName);
      }
      createdPetTypes.push(uniqueName);
      await petTypePage.verifySuccessMessage();
      await petTypePage.verifyPetTypeExists(uniqueName);
    });
  }

  // Generate test quality analysis after all tests using real MCP
  test.afterAll(async () => {
    console.log('🤖 Analyzing test quality via MCP...');
    const analysis = await mcpClient.analyzeTestQuality(
      ['tests/e2e/pettype-description.spec.ts'], 
      testResults
    );
    if (analysis) {
      console.log('📊 MCP Test Quality Analysis:', JSON.stringify(analysis, null, 2));
    }
  });
});