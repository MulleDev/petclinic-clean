import { test, expect } from '@playwright/test';
import { OwnerSearchPage } from '../../pages/OwnerSearchPage';
import { PaginationComponent } from '../../pages/PaginationComponent';
import { searchTestData } from '../../fixtures/owner-search-data';

test.describe('Owner Search Performance Tests', () => {
  let ownerSearchPage: OwnerSearchPage;
  let pagination: PaginationComponent;

  test.beforeEach(async ({ page }) => {
    ownerSearchPage = new OwnerSearchPage(page);
    pagination = new PaginationComponent(page);
  });

  test('should complete basic search within performance threshold', async ({ page }) => {
    await page.goto('/owners/search');
    
    const startTime = performance.now();
    await ownerSearchPage.searchForOwner('Smith');
    await ownerSearchPage.waitForSearchResults();
    const endTime = performance.now();
    
    const searchTime = endTime - startTime;
    expect(searchTime).toBeLessThan(searchTestData.performance.baseline.expectedTime);
    
    console.log(`Search completed in ${searchTime.toFixed(2)}ms`);
  });

  test('should handle large result sets efficiently', async ({ page }) => {
    await page.goto('/owners/search');
    
    // Mock large dataset response
    await page.route('**/owners/search*', async route => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        firstName: `User${i}`,
        lastName: `Test${i}`,
        city: 'TestCity',
        address: `${i} Test Street`,
        telephone: `555-${String(i).padStart(4, '0')}`
      }));
      
      await route.fulfill({
        status: 200,
        json: {
          owners: largeDataset.slice(0, 20),
          pageInfo: {
            currentPage: 0,
            totalPages: 50,
            totalElements: 1000,
            pageSize: 20,
            hasNext: true,
            hasPrevious: false
          }
        }
      });
    });
    
    const startTime = performance.now();
    await ownerSearchPage.searchForOwner('Test');
    await ownerSearchPage.waitForSearchResults();
    const endTime = performance.now();
    
    const searchTime = endTime - startTime;
    expect(searchTime).toBeLessThan(searchTestData.performance.stress.expectedTime);
    
    // Verify results are displayed
    const results = await ownerSearchPage.getSearchResults();
    expect(results.length).toBe(20);
    
    console.log(`Large dataset search completed in ${searchTime.toFixed(2)}ms`);
  });

  test('should handle pagination navigation efficiently', async ({ page }) => {
    await page.goto('/owners/search');
    
    // Mock paginated response
    await page.route('**/owners/search*', async route => {
      const url = route.request().url();
      const pageNum = parseInt(new URLSearchParams(url.split('?')[1] || '').get('page') || '0');
      
      const mockOwners = Array.from({ length: 20 }, (_, i) => ({
        id: pageNum * 20 + i + 1,
        firstName: `Page${pageNum}User${i}`,
        lastName: 'TestUser',
        city: 'TestCity'
      }));
      
      await route.fulfill({
        status: 200,
        json: {
          owners: mockOwners,
          pageInfo: {
            currentPage: pageNum,
            totalPages: 10,
            totalElements: 200,
            pageSize: 20,
            hasNext: pageNum < 9,
            hasPrevious: pageNum > 0
          }
        }
      });
    });
    
    await ownerSearchPage.searchForOwner('Test');
    await ownerSearchPage.waitForSearchResults();
    
    // Test pagination performance
    const paginationTimes: number[] = [];
    
    for (let i = 2; i <= 5; i++) {
      const startTime = performance.now();
      await pagination.goToPage(i);
      await ownerSearchPage.waitForSearchResults();
      const endTime = performance.now();
      
      const navigationTime = endTime - startTime;
      paginationTimes.push(navigationTime);
      expect(navigationTime).toBeLessThan(1000); // 1 second threshold
      
      expect(await pagination.getCurrentPage()).toBe(i);
    }
    
    const avgPaginationTime = paginationTimes.reduce((a, b) => a + b, 0) / paginationTimes.length;
    console.log(`Average pagination time: ${avgPaginationTime.toFixed(2)}ms`);
  });

  test('should handle rapid consecutive searches without memory leaks', async ({ page }) => {
    await page.goto('/owners/search');
    
    const searchTerms = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    const searchTimes: number[] = [];
    
    for (const term of searchTerms) {
      const startTime = performance.now();
      await ownerSearchPage.clearSearch();
      await ownerSearchPage.searchForOwner(`Test${term}`);
      await page.waitForTimeout(100); // Brief pause
      const endTime = performance.now();
      
      searchTimes.push(endTime - startTime);
    }
    
    // Verify consistent performance (no significant degradation)
    const firstHalf = searchTimes.slice(0, 5);
    const secondHalf = searchTimes.slice(5);
    
    const firstHalfAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    // Second half should not be significantly slower (allow 50% tolerance)
    expect(secondHalfAvg).toBeLessThan(firstHalfAvg * 1.5);
    
    console.log(`First half avg: ${firstHalfAvg.toFixed(2)}ms, Second half avg: ${secondHalfAvg.toFixed(2)}ms`);
  });

  test('should handle network delays gracefully', async ({ page }) => {
    await page.goto('/owners/search');
    
    // Mock slow API response
    await page.route('**/owners/search*', async route => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      await route.fulfill({
        status: 200,
        json: {
          owners: searchTestData.owners.slice(0, 5),
          pageInfo: {
            currentPage: 0,
            totalPages: 1,
            totalElements: 5,
            pageSize: 20,
            hasNext: false,
            hasPrevious: false
          }
        }
      });
    });
    
    const startTime = performance.now();
    await ownerSearchPage.searchForOwner('Slow');
    
    // Verify loading state is shown
    expect(await ownerSearchPage.isLoading()).toBe(true);
    
    await ownerSearchPage.waitForSearchResults();
    const endTime = performance.now();
    
    const totalTime = endTime - startTime;
    expect(totalTime).toBeGreaterThan(1400); // Should include the delay
    expect(totalTime).toBeLessThan(3000); // But not exceed reasonable threshold
    
    // Verify loading state is hidden after results
    expect(await ownerSearchPage.isLoading()).toBe(false);
    
    console.log(`Slow search completed in ${totalTime.toFixed(2)}ms`);
  });

  test('should maintain performance with complex search queries', async ({ page }) => {
    await page.goto('/owners/search');
    
    const complexSearchTerms = [
      'John Smith Berlin',
      'Jane Doe München',
      'Test User Hamburg',
      'Special Characters: äöü ß',
      'Numbers 123 456',
      'Mixed Case TeSt UsEr'
    ];
    
    for (const searchTerm of complexSearchTerms) {
      const startTime = performance.now();
      await ownerSearchPage.clearSearch();
      await ownerSearchPage.searchForOwner(searchTerm);
      await page.waitForTimeout(200); // Allow processing
      const endTime = performance.now();
      
      const searchTime = endTime - startTime;
      expect(searchTime).toBeLessThan(2000); // 2 second threshold for complex queries
      
      console.log(`Complex search "${searchTerm}" completed in ${searchTime.toFixed(2)}ms`);
    }
  });

  test('should perform well on slower devices (CPU throttling)', async ({ page, context }) => {
    // Simulate slower device
    const client = await context.newCDPSession(page);
    await client.send('Emulation.setCPUThrottlingRate', { rate: 4 }); // 4x slower
    
    await page.goto('/owners/search');
    
    const startTime = performance.now();
    await ownerSearchPage.searchForOwner('Performance');
    await ownerSearchPage.waitForSearchResults();
    const endTime = performance.now();
    
    const searchTime = endTime - startTime;
    // Allow more time for throttled CPU, but still reasonable
    expect(searchTime).toBeLessThan(5000); // 5 seconds on slow device
    
    console.log(`Throttled CPU search completed in ${searchTime.toFixed(2)}ms`);
    
    // Restore normal CPU
    await client.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  });
});
