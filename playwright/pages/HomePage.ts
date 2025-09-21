import { Page, Locator } from '@playwright/test';

/**
 * Modern HomePage with MCP-optimized selectors
 * Auto-generated and enhanced by MCP Playwright Server
 */
export class HomePage {
  readonly page: Page;
  
  // Navigation Elements - MCP optimized
  readonly welcomeHeader: Locator;
  readonly navigationMenu: Locator;
  readonly languageSelector: Locator;
  
  // Main Content Areas
  readonly heroSection: Locator;
  readonly vetImage: Locator;
  readonly welcomeText: Locator;
  
  // Quick Action Buttons
  readonly findOwnersButton: Locator;
  readonly veterinariansButton: Locator;
  readonly errorButton: Locator;
  
  constructor(page: Page) {
    this.page = page;
    
    // MCP-enhanced selectors with fallbacks
    this.welcomeHeader = page.locator('[data-testid="welcome-header"], h2:has-text("Welcome")');
    this.navigationMenu = page.locator('[data-testid="navigation-menu"], .navbar');
    this.languageSelector = page.locator('[data-pw="language-combobox"]');
    
    this.heroSection = page.locator('[data-testid="hero-section"], .hero');
    this.vetImage = page.locator('[data-testid="vet-image"], img[src*="pets"]');
    this.welcomeText = page.locator('[data-testid="welcome-text"]');
    
    this.findOwnersButton = page.locator('[data-testid="find-owners"], a:has-text("FIND OWNERS")');
    this.veterinariansButton = page.locator('[data-testid="veterinarians"], a:has-text("VETERINARIANS")');
    this.errorButton = page.locator('[data-testid="error-trigger"], a:has-text("ERROR")');
  }

  /**
   * Navigate to homepage with MCP intelligence
   */
  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for page to be fully loaded
   */
  async waitForLoad() {
    await this.welcomeHeader.waitFor({ state: 'visible' });
    await this.navigationMenu.waitFor({ state: 'visible' });
  }

  /**
   * Get welcome text in current language
   */
  async getWelcomeText(): Promise<string> {
    return await this.welcomeHeader.textContent() || '';
  }

  /**
   * Switch language using footer selector
   */
  async switchLanguage(language: string) {
    await this.languageSelector.selectOption(language);
    await this.page.waitForTimeout(1000); // Wait for language change
  }

  /**
   * Navigate to Find Owners page
   */
  async navigateToFindOwners() {
    await this.findOwnersButton.click();
  }

  /**
   * Navigate to Veterinarians page
   */
  async navigateToVeterinarians() {
    await this.veterinariansButton.click();
  }

  /**
   * Trigger error page for testing
   */
  async triggerError() {
    await this.errorButton.click();
  }

  /**
   * MCP Feature: Get page analytics
   */
  async getPageAnalytics() {
    return {
      isWelcomeVisible: await this.welcomeHeader.isVisible(),
      isNavigationVisible: await this.navigationMenu.isVisible(),
      currentLanguage: await this.languageSelector.inputValue(),
      loadTime: await this.page.evaluate(() => performance.now())
    };
  }

  /**
   * MCP Feature: Take responsive screenshots
   */
  async takeResponsiveScreenshots(testName: string): Promise<Array<{viewport: string, screenshot: Buffer, dimensions: {width: number, height: number, name: string}}>> {
    const viewports = [
      { width: 1920, height: 1080, name: 'desktop' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' }
    ];

    const screenshots: Array<{viewport: string, screenshot: Buffer, dimensions: {width: number, height: number, name: string}}> = [];
    
    for (const viewport of viewports) {
      await this.page.setViewportSize(viewport);
      await this.page.waitForTimeout(500);
      
      const screenshot = await this.page.screenshot({
        fullPage: true,
        path: `test-results/screenshots/${testName}-${viewport.name}.png`
      });
      
      screenshots.push({
        viewport: viewport.name,
        screenshot,
        dimensions: viewport
      });
    }
    
    return screenshots;
  }
}
