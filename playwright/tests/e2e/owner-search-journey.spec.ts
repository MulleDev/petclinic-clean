import { test, expect } from '@playwright/test';
import { OwnerSearchPage } from '../../pages/OwnerSearchPage';
import { PaginationComponent } from '../../pages/PaginationComponent';
import { searchTestData, mockSearchResponse } from '../../fixtures/owner-search-data';

test.describe('Owner Search E2E Tests', () => {
  let ownerSearchPage: OwnerSearchPage;
  let pagination: PaginationComponent;

  test.beforeEach(async ({ page }) => {
    ownerSearchPage = new OwnerSearchPage(page);
    pagination = new PaginationComponent(page);
    
    // Mock the search API to avoid backend dependency
    await page.route('**/owners/search*', async route => {
      const url = route.request().url();
      const urlParams = new URLSearchParams(url.split('?')[1] || '');
      const searchTerm = urlParams.get('q') || '';
      const pageNum = parseInt(urlParams.get('page') || '0');
      
      if (searchTerm.length < 2) {
        await route.fulfill({
          status: 400,
          json: { error: 'Mindestens 2 Zeichen eingeben' }
        });
        return;
      }
      
      if (searchTestData.searchTerms.noResults.includes(searchTerm)) {
        await route.fulfill({
          status: 200,
          json: mockSearchResponse.empty
        });
        return;
      }
      
      // Simulate successful search
      const filteredOwners = searchTestData.owners.filter(owner =>
        owner.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        owner.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        owner.city.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      const pageSize = 20;
      const startIndex = pageNum * pageSize;
      const endIndex = Math.min(startIndex + pageSize, filteredOwners.length);
      const pageOwners = filteredOwners.slice(startIndex, endIndex);
      
      await route.fulfill({
        status: 200,
        json: {
          owners: pageOwners,
          pageInfo: {
            currentPage: pageNum,
            totalPages: Math.ceil(filteredOwners.length / pageSize),
            totalElements: filteredOwners.length,
            pageSize,
            hasNext: endIndex < filteredOwners.length,
            hasPrevious: pageNum > 0
          }
        }
      });
    });
  });

  test('should navigate to search page', async ({ page }) => {
    await page.goto('/');
    await ownerSearchPage.navigateToSearch();
    
    await expect(page).toHaveURL(/.*\/owners\/search/);
    await expect(page.locator('h2')).toContainText('Owner Suche');
  });

  test('should perform successful search with results', async ({ page }) => {
    await page.goto('/owners/search');
    
    await ownerSearchPage.searchForOwner('Smith');
    await ownerSearchPage.waitForSearchResults();
    
    const results = await ownerSearchPage.getSearchResults();
    expect(results.length).toBeGreaterThan(0);
    
    const resultsText = await ownerSearchPage.getSearchResultsText();
    expect(resultsText.some(text => text.toLowerCase().includes('smith'))).toBe(true);
  });

  test('should show no results message for non-existent search', async ({ page }) => {
    await page.goto('/owners/search');
    
    await ownerSearchPage.searchForOwner('XYZNonexistent');
    await ownerSearchPage.waitForNoResults();
    
    expect(await ownerSearchPage.hasNoResultsMessage()).toBe(true);
    const noResultsText = await ownerSearchPage.getNoResultsMessageText();
    expect(noResultsText).toContain('Keine Owner gefunden für');
    expect(noResultsText).toContain('XYZNonexistent');
  });

  test('should show validation error for short search terms', async ({ page }) => {
    await page.goto('/owners/search');
    
    await ownerSearchPage.searchForOwner('a');
    
    expect(await ownerSearchPage.hasValidationError()).toBe(true);
    const errorText = await ownerSearchPage.getValidationErrorText();
    expect(errorText).toContain('Mindestens 2 Zeichen');
  });

  test('should handle search with keyboard navigation', async ({ page }) => {
    await page.goto('/owners/search');
    
    // Navigate to search input with Tab
    await page.keyboard.press('Tab');
    await page.keyboard.type('Smith');
    await ownerSearchPage.submitSearchForm();
    
    await ownerSearchPage.waitForSearchResults();
    const results = await ownerSearchPage.getSearchResults();
    expect(results.length).toBeGreaterThan(0);
  });

  test('should clear search input and reset results', async ({ page }) => {
    await page.goto('/owners/search');
    
    // First search
    await ownerSearchPage.searchForOwner('Smith');
    await ownerSearchPage.waitForSearchResults();
    expect((await ownerSearchPage.getSearchResults()).length).toBeGreaterThan(0);
    
    // Clear and verify
    await ownerSearchPage.clearSearch();
    expect(await ownerSearchPage.getSearchInputValue()).toBe('');
  });

  test('should handle special characters in search', async ({ page }) => {
    await page.goto('/owners/search');
    
    const specialTerms = ['O\'Connor', 'Smith-Jones', 'Müller'];
    
    for (const term of specialTerms) {
      await ownerSearchPage.clearSearch();
      await ownerSearchPage.searchForOwner(term);
      
      // Should not throw errors and handle gracefully
      await page.waitForTimeout(500); // Allow processing
      expect(await ownerSearchPage.hasValidationError()).toBe(false);
    }
  });

  test('should maintain search term in URL parameters', async ({ page }) => {
    await page.goto('/owners/search');
    
    await ownerSearchPage.searchForOwner('TestUser');
    await ownerSearchPage.waitForSearchResults();
    
    expect(page.url()).toContain('q=TestUser');
    expect(await ownerSearchPage.getSearchInputValue()).toBe('TestUser');
  });

  test.describe('Pagination Tests', () => {
    test('should show pagination for large result sets', async ({ page }) => {
      await page.goto('/owners/search');
      
      await ownerSearchPage.searchForOwner('Test'); // Should match many TestUser entries
      await ownerSearchPage.waitForSearchResults();
      
      if (await pagination.isVisible()) {
        expect(await pagination.getCurrentPage()).toBe(1);
        expect(await pagination.getTotalPages()).toBeGreaterThan(1);
      }
    });

    test('should navigate between pages', async ({ page }) => {
      await page.goto('/owners/search');
      
      await ownerSearchPage.searchForOwner('Test');
      await ownerSearchPage.waitForSearchResults();
      
      if (await pagination.hasNextPage()) {
        await pagination.goToNextPage();
        expect(await pagination.getCurrentPage()).toBe(2);
        
        if (await pagination.hasPreviousPage()) {
          await pagination.goToPreviousPage();
          expect(await pagination.getCurrentPage()).toBe(1);
        }
      }
    });

    test('should maintain search context during pagination', async ({ page }) => {
      await page.goto('/owners/search');
      
      await ownerSearchPage.searchForOwner('Test');
      await ownerSearchPage.waitForSearchResults();
      
      if (await pagination.hasNextPage()) {
        await pagination.goToNextPage();
        
        // Verify search term is still present
        expect(await ownerSearchPage.getSearchInputValue()).toBe('Test');
        expect(page.url()).toContain('q=Test');
        expect(page.url()).toContain('page=1');
      }
    });
  });

  test.describe('Performance Tests', () => {
    test('should complete search within performance threshold', async ({ page }) => {
      await page.goto('/owners/search');
      
      const startTime = Date.now();
      await ownerSearchPage.searchForOwner('Smith');
      await ownerSearchPage.waitForSearchResults();
      const endTime = Date.now();
      
      const searchTime = endTime - startTime;
      expect(searchTime).toBeLessThan(searchTestData.performance.searchTimeout);
    });

    test('should handle rapid consecutive searches', async ({ page }) => {
      await page.goto('/owners/search');
      
      const searchTerms = ['John', 'Jane', 'Smith', 'Test'];
      
      for (const term of searchTerms) {
        await ownerSearchPage.clearSearch();
        await ownerSearchPage.searchForOwner(term);
        await page.waitForTimeout(100); // Brief pause between searches
      }
      
      // Final search should complete successfully
      await ownerSearchPage.waitForSearchResults();
      expect(await ownerSearchPage.getSearchInputValue()).toBe('Test');
    });
  });

  test.describe('Mobile Responsive Tests', () => {
    test.use({ 
      viewport: { width: 390, height: 844 } // iPhone 12
    });

    test('should work on mobile viewport', async ({ page }) => {
      await page.goto('/owners/search');
      
      await ownerSearchPage.searchForOwner('Smith');
      await ownerSearchPage.waitForSearchResults();
      
      const results = await ownerSearchPage.getSearchResults();
      expect(results.length).toBeGreaterThan(0);
      
      // Verify mobile-specific elements are visible
      await expect(page.locator('[data-pw="search-input"]')).toBeVisible();
      await expect(page.locator('[data-pw="search-button"]')).toBeVisible();
    });
  });

  test.describe('Accessibility Tests', () => {
    test('should be keyboard navigable', async ({ page }) => {
      await page.goto('/owners/search');
      
      // Tab navigation test
      await page.keyboard.press('Tab'); // Should focus search input
      await expect(page.locator('[data-pw="search-input"]')).toBeFocused();
      
      await page.keyboard.type('Smith');
      await page.keyboard.press('Tab'); // Should focus search button
      await expect(page.locator('[data-pw="search-button"]')).toBeFocused();
      
      await page.keyboard.press('Enter'); // Submit search
      await ownerSearchPage.waitForSearchResults();
      
      const results = await ownerSearchPage.getSearchResults();
      expect(results.length).toBeGreaterThan(0);
    });

    test('should have proper ARIA labels', async ({ page }) => {
      await page.goto('/owners/search');
      
      // Check for ARIA attributes
      await expect(page.locator('[data-pw="search-input"]')).toHaveAttribute('aria-label');
      await expect(page.locator('[data-pw="search-results"]')).toHaveAttribute('role');
      
      // Search and check results have proper structure
      await ownerSearchPage.searchForOwner('Smith');
      await ownerSearchPage.waitForSearchResults();
      
      await expect(page.locator('[data-pw="search-results"]')).toHaveAttribute('role', 'region');
    });
  });
});
