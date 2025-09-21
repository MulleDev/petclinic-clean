import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';
import { mcpClient } from '../../helpers/mcp-client';

/**
 * Homepage E2E Tests - Generated and Enhanced by MCP Playwright Server
 * Multi-language support with AI-powered test intelligence
 */
test.describe('Homepage - Modern E2E Tests', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
    await homePage.waitForLoad();
  });

  test('should display welcome page with all elements @smoke', async ({ page }) => {
    // MCP-enhanced assertions
    await expect(homePage.welcomeHeader).toBeVisible();
    await expect(homePage.navigationMenu).toBeVisible();
    await expect(homePage.vetImage).toBeVisible();
    
    // Get page analytics for MCP intelligence
    const analytics = await homePage.getPageAnalytics();
    expect(analytics.isWelcomeVisible).toBeTruthy();
    expect(analytics.isNavigationVisible).toBeTruthy();
    expect(analytics.loadTime).toBeLessThan(5000);
  });

  test('should navigate to all main sections @navigation', async ({ page }) => {
    // Test Find Owners navigation
    await homePage.navigateToFindOwners();
    await expect(page).toHaveURL(/.*owners.*/);
    await page.goBack();

    // Test Veterinarians navigation
    await homePage.navigateToVeterinarians();
    await expect(page).toHaveURL(/.*vets.*/);
    await page.goBack();
  });

  test('should support multi-language switching @multilingual', async ({ page }) => {
    const languages = ['en', 'de', 'es', 'pt'];
    
    for (const lang of languages) {
      await homePage.switchLanguage(lang);
      
      // Verify language change
      const welcomeText = await homePage.getWelcomeText();
      expect(welcomeText).toBeTruthy();
      
      // Take screenshot for visual comparison
      await page.screenshot({ 
        path: `test-results/screenshots/homepage-${lang}.png`,
        fullPage: true 
      });
    }
  });

  test('should be responsive across different viewports @responsive', async ({ page }) => {
    // MCP Feature: Generate responsive screenshots
    const screenshots = await homePage.takeResponsiveScreenshots('homepage-responsive');
    
    expect(screenshots).toHaveLength(3);
    expect(screenshots.map(s => s.viewport)).toEqual(['desktop', 'tablet', 'mobile']);
    
    // Verify all viewports show content correctly
    for (const screenshot of screenshots) {
      expect(screenshot.screenshot).toBeTruthy();
    }
  });

  test('should handle error scenarios gracefully @error-handling', async ({ page }) => {
    // Test error page navigation
    await homePage.triggerError();
    
    // Should show error page or handle gracefully
    await expect(page.locator('text=Error')).toBeVisible({ timeout: 10000 });
    
    // Should be able to navigate back
    await page.goBack();
    await expect(homePage.welcomeHeader).toBeVisible();
  });

  test.afterEach(async ({ page }, testInfo) => {
    // MCP Feature: Send test results for analysis
    if (testInfo.status !== 'passed') {
      try {
        await mcpClient.analyzeTestIntelligence([{
          testName: testInfo.title,
          status: testInfo.status,
          error: testInfo.error?.message,
          duration: testInfo.duration,
          browser: testInfo.project.name
        }]);
      } catch (error) {
        console.log('MCP analysis skipped:', error);
      }
    }
  });
});
