const fs = require('fs');
const path = require('path');

class VisualTestGenerator {
  constructor() {
    this.screenshotsPath = path.join(__dirname, '..', 'playwright', 'screenshots');
  }

  // Generiere Visual Tests für PetClinic Features
  generateVisualTest(feature, pageUrl, components = []) {
    const testName = `${feature}-visual-regression`;
    
    return `
import { test, expect } from '@playwright/test';
import { ${this.getPageClass(feature)} } from '../pages/${this.getPageClass(feature)}';

test.describe('${feature} - Visual Regression Tests', () => {
  let page${feature};

  test.beforeEach(async ({ page }) => {
    page${feature} = new ${this.getPageClass(feature)}(page);
    await page${feature}.goto();
    
    // Warte bis Seite vollständig geladen
    await page.waitForLoadState('networkidle');
  });

  test('${feature} - Vollseiten Screenshot', async ({ page }) => {
    // Verstecke dynamische Elemente für konsistente Screenshots
    await page.addStyleTag({
      content: \`
        .timestamp, .loading-spinner, .notification {
          visibility: hidden !important;
        }
      \`
    });
    
    await expect(page).toHaveScreenshot('${testName}-full-page.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  ${this.generateComponentScreenshots(components, feature)}

  test('${feature} - Responsive Screenshots', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080, name: 'desktop' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(500); // Layout stabilisieren
      
      await expect(page).toHaveScreenshot(\`${testName}-\${viewport.name}.png\`, {
        fullPage: true
      });
    }
  });

  test('${feature} - Dark Mode (falls vorhanden)', async ({ page }) => {
    // Toggle Dark Mode falls verfügbar
    const darkModeToggle = page.locator('[data-pw="dark-mode-toggle"]');
    if (await darkModeToggle.isVisible()) {
      await darkModeToggle.click();
      await page.waitForTimeout(300);
      
      await expect(page).toHaveScreenshot('${testName}-dark-mode.png');
    }
  });
});`;
  }

  generateComponentScreenshots(components, feature) {
    if (!components.length) return '';
    
    return components.map(component => `
  test('${feature} - ${component.name} Component', async ({ page }) => {
    const componentLocator = page.locator('${component.selector}');
    await expect(componentLocator).toBeVisible();
    
    await expect(componentLocator).toHaveScreenshot('${feature}-${component.name.toLowerCase()}.png');
    
    ${component.states ? this.generateStateScreenshots(component) : ''}
  });`).join('\n');
  }

  generateStateScreenshots(component) {
    return component.states.map(state => `
    // ${state.name} State
    ${state.action}
    await expect(componentLocator).toHaveScreenshot('${component.name.toLowerCase()}-${state.name.toLowerCase()}.png');`).join('\n');
  }

  getPageClass(feature) {
    const mapping = {
      'pet-types': 'PetTypePage',
      'owners': 'OwnerPage', 
      'pets': 'PetPage',
      'visits': 'VisitPage',
      'veterinarians': 'VeterinariansPage'
    };
    return mapping[feature] || 'Page';
  }

  // Generiere Visual Test Config
  generateVisualTestConfig() {
    return `
// playwright.visual.config.ts
import { defineConfig } from '@playwright/test';
import { baseConfig } from './playwright.config';

export default defineConfig({
  ...baseConfig,
  
  // Visual Testing spezifische Einstellungen
  expect: {
    // Toleranz für Visual Diffs
    threshold: 0.3,
    toHaveScreenshot: {
      // Konsistente Screenshots
      animations: 'disabled',
      caret: 'hide'
    }
  },

  projects: [
    {
      name: 'visual-chrome',
      use: {
        ...devices['Desktop Chrome'],
        // Feste Viewport für konsistente Screenshots
        viewport: { width: 1280, height: 720 }
      }
    },
    {
      name: 'visual-mobile',
      use: {
        ...devices['iPhone 12'],
      }
    }
  ],

  // Visual Test Reports
  reporter: [
    ['html', { outputFolder: 'visual-test-results' }],
    ['json', { outputFile: 'visual-test-results.json' }]
  ]
});`;
  }

  // Analysiere Screenshot und generiere Test
  async analyzeScreenshotAndGenerateTest(screenshotPath, description) {
    // Hier würde eine KI-Analyse des Screenshots stattfinden
    // Für jetzt simulieren wir das mit Regeln
    
    const components = this.detectComponentsFromDescription(description);
    const feature = this.extractFeatureFromPath(screenshotPath);
    
    return this.generateVisualTest(feature, '/', components);
  }

  detectComponentsFromDescription(description) {
    const components = [];
    
    if (description.includes('table') || description.includes('list')) {
      components.push({
        name: 'DataTable',
        selector: '[data-pw*="table"], .table',
        states: [
          { name: 'Loading', action: '// Simulate loading state' },
          { name: 'Empty', action: '// Clear all data' }
        ]
      });
    }
    
    if (description.includes('form')) {
      components.push({
        name: 'Form',
        selector: 'form, [data-pw*="form"]',
        states: [
          { name: 'Empty', action: '// Clear form' },
          { name: 'Filled', action: '// Fill form with test data' },
          { name: 'Error', action: '// Trigger validation errors' }
        ]
      });
    }
    
    if (description.includes('navigation') || description.includes('menu')) {
      components.push({
        name: 'Navigation',
        selector: 'nav, [data-pw*="nav"]',
        states: []
      });
    }
    
    return components;
  }

  extractFeatureFromPath(screenshotPath) {
    const filename = path.basename(screenshotPath, path.extname(screenshotPath));
    
    if (filename.includes('pet') && filename.includes('type')) return 'pet-types';
    if (filename.includes('owner')) return 'owners';
    if (filename.includes('visit')) return 'visits';
    if (filename.includes('vet')) return 'veterinarians';
    
    return 'general';
  }
}

module.exports = VisualTestGenerator;
