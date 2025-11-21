import { Page, Locator } from '@playwright/test';

/**
 * Modern HomePage with MCP-optimized selectors
 * Auto-generated and enhanced by MCP Playwright Server
 * Enhanced for PET-12: Homepage Owner Search
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
  
  // PET-12: Homepage Search Elements
  readonly searchForm: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly searchResultsContainer: Locator;
  readonly searchResults: Locator;
  readonly searchError: Locator;
  readonly searchLoading: Locator;
  readonly advancedSearchLink: Locator;
  readonly addOwnerLink: Locator;
  
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
    
    // PET-12: Search Elements
    this.searchForm = page.locator('[data-pw="homepage-search-form"]');
    this.searchInput = page.locator('[data-pw="homepage-search-input"]');
    this.searchButton = page.locator('[data-pw="homepage-search-button"]');
    this.searchResultsContainer = page.locator('[data-pw="search-results-container"]');
    this.searchResults = page.locator('[data-pw="search-results"]');
    this.searchError = page.locator('[data-pw="search-error"]');
    this.searchLoading = page.locator('[data-pw="search-loading"]');
    this.advancedSearchLink = page.locator('[data-pw="advanced-search-link"]');
    this.addOwnerLink = page.locator('[data-pw="add-owner-link"]');
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

  // PET-12: Homepage Search Methods
  
  /**
   * Perform quick search from homepage
   */
  async searchForOwner(searchTerm: string): Promise<void> {
    await this.searchInput.fill(searchTerm);
    await this.searchButton.click();
  }

  /**
   * Perform AJAX search (type and wait)
   */
  async performAjaxSearch(searchTerm: string): Promise<void> {
    await this.searchInput.fill(searchTerm);
    await this.page.waitForTimeout(500); // Wait for AJAX debounce
  }

  /**
   * Wait for search results to appear
   */
  async waitForSearchResults(): Promise<void> {
    await this.searchResultsContainer.waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Get search result items
   */
  async getSearchResults(): Promise<string[]> {
    const results = await this.searchResults.locator('[data-pw="search-result-item"]').allTextContents();
    return results;
  }

  /**
   * Click on search result by index
   */
  async clickSearchResult(index: number): Promise<void> {
    await this.searchResults.locator('[data-pw="search-result-item"]').nth(index).click();
  }

  /**
   * Check if search has errors
   */
  async hasSearchError(): Promise<boolean> {
    return await this.searchError.isVisible();
  }

  /**
   * Get search error message
   */
  async getSearchErrorMessage(): Promise<string> {
    return await this.searchError.textContent() || '';
  }

  /**
   * Check if search is loading
   */
  async isSearchLoading(): Promise<boolean> {
    return await this.searchLoading.isVisible();
  }

  /**
   * Navigate to advanced search
   */
  async navigateToAdvancedSearch(): Promise<void> {
    await this.advancedSearchLink.click();
  }

  /**
   * Navigate to add new owner
   */
  async navigateToAddOwner(): Promise<void> {
    await this.addOwnerLink.click();
  }

  /**
   * Clear search input
   */
  async clearSearch(): Promise<void> {
    await this.searchInput.clear();
  }

  /**
   * Hide search results by clicking outside
   */
  async hideSearchResults(): Promise<void> {
    await this.page.locator('body').click({ position: { x: 50, y: 50 } });
  }

  /**
   * MCP Feature: Get page analytics
   */
  async getPageAnalytics() {
    return {
      isWelcomeVisible: await this.welcomeHeader.isVisible(),
      isNavigationVisible: await this.navigationMenu.isVisible(),
      currentLanguage: await this.languageSelector.inputValue(),
      loadTime: await this.page.evaluate(() => performance.now()),
      isSearchFormVisible: await this.searchForm.isVisible()
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
