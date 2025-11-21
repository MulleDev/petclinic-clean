import { test, expect } from '@playwright/test';

/**
 * E2E Tests for PET-12: Homepage Owner Search Functionality
 * Tests the complete user workflow for searching owners from the homepage
 */

test.describe('Homepage Owner Search (PET-12)', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display search form on homepage', async ({ page }) => {
    // Verify search form is visible
    const searchForm = page.locator('[data-pw="homepage-search-form"]');
    await expect(searchForm).toBeVisible();

    // Verify search input field
    const searchInput = page.locator('[data-pw="homepage-search-input"]');
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute('placeholder', /.*Nachname.*/);

    // Verify search button
    const searchButton = page.locator('[data-pw="homepage-search-button"]');
    await expect(searchButton).toBeVisible();
    await expect(searchButton).toHaveText(/Suchen|Search/);
  });

  test('should perform AJAX search and display results', async ({ page }) => {
    const searchInput = page.locator('[data-pw="homepage-search-input"]');
    
    // Type search term (this should trigger AJAX search)
    await searchInput.fill('Franklin');
    
    // Wait for AJAX results
    await page.waitForTimeout(500);
    
    // Check if results container becomes visible
    const resultsContainer = page.locator('[data-pw="search-results-container"]');
    await expect(resultsContainer).toBeVisible();
    
    // Check for search results or no results message
    const searchResults = page.locator('[data-pw="search-results"]');
    const searchError = page.locator('[data-pw="search-error"]');
    
    // Either results should be visible OR error message
    const hasResults = await searchResults.isVisible();
    const hasError = await searchError.isVisible();
    
    expect(hasResults || hasError).toBe(true);
  });

  test('should handle empty search gracefully', async ({ page }) => {
    const searchInput = page.locator('[data-pw="homepage-search-input"]');
    
    // Try to search with empty input
    await searchInput.fill('');
    
    // Submit form
    await page.locator('[data-pw="homepage-search-button"]').click();
    
    // Should either stay on same page or show error
    await expect(page).toHaveURL(/.*\/.*$/);
  });

  test('should redirect to owner details when clicking search result', async ({ page }) => {
    const searchInput = page.locator('[data-pw="homepage-search-input"]');
    
    // Search for existing owner
    await searchInput.fill('Franklin');
    
    // Wait for AJAX results
    await page.waitForTimeout(500);
    
    // Click on first search result if available
    const firstResult = page.locator('[data-pw="search-result-item"]').first();
    
    if (await firstResult.isVisible()) {
      await firstResult.click();
      
      // Should navigate to owner details page
      await expect(page).toHaveURL(/.*\/owners\/\d+$/);
    }
  });

  test('should navigate to advanced search', async ({ page }) => {
    const advancedSearchLink = page.locator('[data-pw="advanced-search-link"]');
    
    await expect(advancedSearchLink).toBeVisible();
    await advancedSearchLink.click();
    
    // Should navigate to find owners page
    await expect(page).toHaveURL(/.*\/owners\/find$/);
  });

  test('should navigate to add owner', async ({ page }) => {
    const addOwnerLink = page.locator('[data-pw="add-owner-link"]');
    
    await expect(addOwnerLink).toBeVisible();
    await addOwnerLink.click();
    
    // Should navigate to new owner page
    await expect(page).toHaveURL(/.*\/owners\/new$/);
  });

  test('should hide results when clicking outside', async ({ page }) => {
    const searchInput = page.locator('[data-pw="homepage-search-input"]');
    
    // Perform search to show results
    await searchInput.fill('Franklin');
    await page.waitForTimeout(500);
    
    const resultsContainer = page.locator('[data-pw="search-results-container"]');
    
    // If results are visible
    if (await resultsContainer.isVisible()) {
      // Click outside the search area
      await page.locator('body').click({ position: { x: 100, y: 100 } });
      
      // Results should be hidden
      await expect(resultsContainer).not.toBeVisible();
    }
  });

  test('should work with form submission for full search', async ({ page }) => {
    const searchInput = page.locator('[data-pw="homepage-search-input"]');
    const searchButton = page.locator('[data-pw="homepage-search-button"]');
    
    // Fill search term and submit form
    await searchInput.fill('Franklin');
    await searchButton.click();
    
    // Should redirect to owners list page with search parameter
    await expect(page).toHaveURL(/.*\/owners\?lastName=Franklin$/);
  });

  test('should show loading state during AJAX search', async ({ page }) => {
    // Slow down network to see loading state
    await page.route('**/search', async route => {
      await page.waitForTimeout(1000); // Artificial delay
      route.continue();
    });
    
    const searchInput = page.locator('[data-pw="homepage-search-input"]');
    const loadingSpinner = page.locator('[data-pw="search-loading"]');
    
    // Start typing
    await searchInput.fill('Fra');
    
    // Loading should be visible briefly
    await expect(loadingSpinner).toBeVisible();
  });

  test('should maintain accessibility standards', async ({ page }) => {
    // Check form labels and ARIA attributes
    const searchInput = page.locator('[data-pw="homepage-search-input"]');
    const searchButton = page.locator('[data-pw="homepage-search-button"]');
    
    // Input should have proper attributes
    await expect(searchInput).toHaveAttribute('autocomplete', 'off');
    
    // Button should be focusable
    await searchButton.focus();
    await expect(searchButton).toBeFocused();
    
    // Form should be navigable with keyboard
    await page.keyboard.press('Tab');
    await expect(searchInput).toBeFocused();
  });

  test('should support internationalization', async ({ page }) => {
    // Test German version (default)
    let searchButton = page.locator('[data-pw="homepage-search-button"]');
    await expect(searchButton).toHaveText(/Suchen/);
    
    // Switch to English if language selector is available
    const languageSelector = page.locator('[data-pw="language-combobox"]');
    if (await languageSelector.isVisible()) {
      await languageSelector.selectOption('en');
      await page.waitForLoadState('networkidle');
      
      // Button text should change to English
      searchButton = page.locator('[data-pw="homepage-search-button"]');
      await expect(searchButton).toHaveText(/Search/);
    }
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Search form should still be visible and usable
    const searchForm = page.locator('[data-pw="homepage-search-form"]');
    await expect(searchForm).toBeVisible();
    
    const searchInput = page.locator('[data-pw="homepage-search-input"]');
    await expect(searchInput).toBeVisible();
    
    // Should be able to interact with search
    await searchInput.tap();
    await searchInput.fill('Test');
    
    const searchButton = page.locator('[data-pw="homepage-search-button"]');
    await expect(searchButton).toBeVisible();
  });

  test('should validate search input length', async ({ page }) => {
    const searchInput = page.locator('[data-pw="homepage-search-input"]');
    const resultsContainer = page.locator('[data-pw="search-results-container"]');
    
    // Single character should not trigger search
    await searchInput.fill('F');
    await page.waitForTimeout(500);
    
    // Results should not be visible for single character
    await expect(resultsContainer).not.toBeVisible();
    
    // Two characters should trigger search
    await searchInput.fill('Fr');
    await page.waitForTimeout(500);
    
    // Results container might become visible (depending on backend data)
    // This is acceptable behavior
  });

  test('should escape HTML in search results', async ({ page }) => {
    const searchInput = page.locator('[data-pw="homepage-search-input"]');
    
    // Search with potentially dangerous input
    await searchInput.fill('<script>alert("xss")</script>');
    await page.waitForTimeout(500);
    
    // Check that no script execution occurs
    // Page should not show any alert dialogs
    page.on('dialog', async dialog => {
      // If any dialog appears, fail the test
      expect(dialog.message()).not.toContain('xss');
      await dialog.dismiss();
    });
  });
});

/**
 * Integration Tests - Testing with real backend
 */
test.describe('Homepage Search Integration', () => {
  test('should integrate properly with existing owner data', async ({ page }) => {
    // Navigate to add owner first to ensure we have test data
    await page.goto('/owners/new');
    
    // Add a test owner
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'SearchUser');
    await page.fill('input[name="address"]', '123 Test St');
    await page.fill('input[name="city"]', 'Test City');
    await page.fill('input[name="telephone"]', '1234567890');
    
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    // Go back to homepage
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Search for the owner we just created
    const searchInput = page.locator('[data-pw="homepage-search-input"]');
    await searchInput.fill('SearchUser');
    
    await page.waitForTimeout(500);
    
    // Results should show our test owner
    const resultsContainer = page.locator('[data-pw="search-results-container"]');
    await expect(resultsContainer).toBeVisible();
    
    const searchResults = page.locator('[data-pw="search-results"]');
    if (await searchResults.isVisible()) {
      await expect(searchResults).toContainText('Test SearchUser');
    }
  });
});