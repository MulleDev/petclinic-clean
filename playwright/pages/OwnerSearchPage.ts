import { Page, Locator } from '@playwright/test';

export class OwnerSearchPage {
  private readonly page: Page;
  private readonly searchInput: Locator;
  private readonly searchButton: Locator;
  private readonly searchResults: Locator;
  private readonly noResultsMessage: Locator;
  private readonly validationError: Locator;
  private readonly loadingSpinner: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.locator('[data-pw="search-input"]');
    this.searchButton = page.locator('[data-pw="search-button"]');
    this.searchResults = page.locator('[data-pw="search-results"]');
    this.noResultsMessage = page.locator('[data-pw="no-results-message"]');
    this.validationError = page.locator('[data-pw="validation-error"]');
    this.loadingSpinner = page.locator('[data-pw="loading-spinner"]');
  }

  async navigateToSearch() {
    await this.page.click('[data-pw="nav-search-owners"]');
    await this.page.waitForURL('**/owners/search');
  }

  async searchForOwner(searchTerm: string) {
    await this.searchInput.fill(searchTerm);
    await this.searchButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async getSearchResults() {
    return await this.searchResults.locator('.owner-row').all();
  }

  async getSearchResultsCount(): Promise<number> {
    return await this.searchResults.locator('.owner-row').count();
  }

  async getSearchResultsText(): Promise<string[]> {
    const results = await this.getSearchResults();
    const textContents = await Promise.all(results.map(result => result.textContent()));
    return textContents.map(text => text || '');
  }

  async hasNoResultsMessage(): Promise<boolean> {
    return await this.noResultsMessage.isVisible();
  }

  async getNoResultsMessageText(): Promise<string> {
    return await this.noResultsMessage.textContent() || '';
  }

  async hasValidationError(): Promise<boolean> {
    return await this.validationError.isVisible();
  }

  async getValidationErrorText(): Promise<string> {
    return await this.validationError.textContent() || '';
  }

  async isLoading(): Promise<boolean> {
    return await this.loadingSpinner.isVisible();
  }

  async waitForSearchResults() {
    await this.searchResults.waitFor({ state: 'visible' });
  }

  async waitForNoResults() {
    await this.noResultsMessage.waitFor({ state: 'visible' });
  }

  async clearSearch() {
    await this.searchInput.clear();
  }

  async getSearchInputValue(): Promise<string> {
    return await this.searchInput.inputValue();
  }

  async submitSearchForm() {
    await this.page.keyboard.press('Enter');
    await this.page.waitForLoadState('networkidle');
  }
}
