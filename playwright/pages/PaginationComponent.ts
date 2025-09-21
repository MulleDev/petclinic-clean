import { Page, Locator } from '@playwright/test';

export class PaginationComponent {
  private readonly page: Page;
  private readonly paginationContainer: Locator;
  private readonly previousButton: Locator;
  private readonly nextButton: Locator;
  private readonly firstPageButton: Locator;
  private readonly lastPageButton: Locator;
  private readonly pageInfo: Locator;

  constructor(page: Page) {
    this.page = page;
    this.paginationContainer = page.locator('[data-pw="pagination"]');
    this.previousButton = page.locator('[data-pw="pagination-previous"]');
    this.nextButton = page.locator('[data-pw="pagination-next"]');
    this.firstPageButton = page.locator('[data-pw="pagination-first"]');
    this.lastPageButton = page.locator('[data-pw="pagination-last"]');
    this.pageInfo = page.locator('[data-pw="page-info"]');
  }

  async getCurrentPage(): Promise<number> {
    const activeButton = this.page.locator('[data-pw^="pagination-page-"].active');
    const pageText = await activeButton.textContent();
    return parseInt(pageText || '1');
  }

  async getTotalPages(): Promise<number> {
    const pageButtons = this.page.locator('[data-pw^="pagination-page-"]');
    return await pageButtons.count();
  }

  async goToPage(pageNumber: number) {
    const pageButton = this.page.locator(`[data-pw="pagination-page-${pageNumber}"]`);
    await pageButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async goToNextPage() {
    await this.nextButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async goToPreviousPage() {
    await this.previousButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async goToFirstPage() {
    await this.firstPageButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async goToLastPage() {
    await this.lastPageButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async hasNextPage(): Promise<boolean> {
    return await this.nextButton.isEnabled();
  }

  async hasPreviousPage(): Promise<boolean> {
    return await this.previousButton.isEnabled();
  }

  async isVisible(): Promise<boolean> {
    return await this.paginationContainer.isVisible();
  }

  async getPageInfo(): Promise<string> {
    return await this.pageInfo.textContent() || '';
  }

  async getVisiblePageNumbers(): Promise<number[]> {
    const pageButtons = this.page.locator('[data-pw^="pagination-page-"]');
    const pageTexts = await pageButtons.allTextContents();
    return pageTexts.map(text => parseInt(text)).filter(num => !isNaN(num));
  }

  async isPageActive(pageNumber: number): Promise<boolean> {
    const pageButton = this.page.locator(`[data-pw="pagination-page-${pageNumber}"]`);
    return await pageButton.getAttribute('class').then(className => 
      className?.includes('active') || false
    );
  }
}
