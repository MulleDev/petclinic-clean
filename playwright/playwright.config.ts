import { defineConfig, devices } from '@playwright/test';

/**
 * MCP Playwright Configuration
 * Generiert durch MCP Playwright Server
 * Optimiert für AI-powered Testing
 */
export default defineConfig({
  // Test-Verzeichnis
  testDir: './tests',
  
  // Globale Test-Konfiguration
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter für bessere Analyse
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/test-results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }]
  ],
  
  // Output-Verzeichnisse
  outputDir: 'test-results/',
  
  // Globale Test-Einstellungen
  use: {
    // Browser-Einstellungen
    actionTimeout: 10000,
    navigationTimeout: 30000,
    
    // Screenshots und Videos
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
    
    // MCP Server Integration
    baseURL: 'http://localhost:8080',
    
    // Erweiterte Selektoren für AI
    testIdAttribute: 'data-testid',
  },

  // Cross-Platform Testing - Generiert durch MCP
  projects: [
    // Desktop Browsers
    {
      name: 'chromium-desktop',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }
      },
    },
    {
      name: 'firefox-desktop',
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 }
      },
    },
    {
      name: 'webkit-desktop',
      use: { 
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 }
      },
    },

    // Tablet Testing
    {
      name: 'tablet-ipad',
      use: { ...devices['iPad Pro'] },
    },
    {
      name: 'tablet-android',
      use: { ...devices['Galaxy Tab S4'] },
    },

    // Mobile Testing
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },

    // API Testing
    {
      name: 'api-tests',
      testMatch: '**/api/**/*.spec.ts',
      use: {
        // API-spezifische Konfiguration
        baseURL: 'http://localhost:8080/api',
      },
    },

    // Visual Testing
    {
      name: 'visual-tests',
      testMatch: '**/visual/**/*.spec.ts',
      use: {
        // Visual Testing Konfiguration
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },
  ],

  // Test-Server für lokale Entwicklung
  webServer: {
    command: 'echo "PetClinic should be running on localhost:8080"',
    port: 8080,
    reuseExistingServer: !process.env.CI,
  },

  // Erweiterte Konfiguration für MCP Features
  globalSetup: './config/global-setup.ts',
  globalTeardown: './config/global-teardown.ts',
});
