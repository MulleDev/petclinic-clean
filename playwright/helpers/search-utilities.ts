/**
 * Search Utilities for Owner Search Feature Tests
 */

/**
 * Validates search term according to business rules
 * @param searchTerm - The search term to validate
 * @returns true if valid, false otherwise
 */
export function validateSearchTerm(searchTerm: string): boolean {
  if (!searchTerm || typeof searchTerm !== 'string') {
    return false;
  }
  
  const trimmed = searchTerm.trim();
  return trimmed.length >= 2 && trimmed.length <= 100;
}

/**
 * Formats pagination information for display
 * @param currentPage - Current page number (0-based)
 * @param totalPages - Total number of pages
 * @param totalElements - Total number of elements
 * @param pageSize - Number of elements per page
 * @returns Formatted pagination info object
 */
export function formatPaginationInfo(
  currentPage: number,
  totalPages: number,
  totalElements: number,
  pageSize: number = 20
) {
  const startElement = currentPage * pageSize + 1;
  const endElement = Math.min((currentPage + 1) * pageSize, totalElements);
  
  return {
    currentPage: currentPage + 1, // Convert to 1-based for display
    totalPages,
    totalElements,
    pageSize,
    startElement,
    endElement,
    hasNext: currentPage < totalPages - 1,
    hasPrevious: currentPage > 0,
    displayText: `${startElement}-${endElement} von ${totalElements} Ergebnissen`
  };
}

/**
 * Generates visible page numbers for pagination display
 * @param currentPage - Current page (1-based)
 * @param totalPages - Total number of pages
 * @param maxVisible - Maximum visible page numbers (default: 5)
 * @returns Array of visible page numbers
 */
export function getVisiblePageNumbers(
  currentPage: number,
  totalPages: number,
  maxVisible: number = 5
): number[] {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const half = Math.floor(maxVisible / 2);
  let start = Math.max(1, currentPage - half);
  let end = Math.min(totalPages, start + maxVisible - 1);

  // Adjust start if we're near the end
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

/**
 * Builds search URL with parameters
 * @param searchTerm - Search term
 * @param page - Page number (0-based)
 * @param size - Page size
 * @returns Complete search URL
 */
export function buildSearchUrl(
  searchTerm: string,
  page: number = 0,
  size: number = 20
): string {
  const params = new URLSearchParams();
  
  if (searchTerm.trim()) {
    params.set('q', searchTerm.trim());
  }
  
  if (page > 0) {
    params.set('page', page.toString());
  }
  
  if (size !== 20) {
    params.set('size', size.toString());
  }
  
  const queryString = params.toString();
  return `/owners/search${queryString ? '?' + queryString : ''}`;
}

/**
 * Extracts search parameters from URL
 * @param url - URL to parse
 * @returns Search parameters object
 */
export function parseSearchUrl(url: string): {
  searchTerm: string;
  page: number;
  size: number;
} {
  const urlObj = new URL(url, 'http://localhost');
  const params = urlObj.searchParams;
  
  return {
    searchTerm: params.get('q') || '',
    page: parseInt(params.get('page') || '0'),
    size: parseInt(params.get('size') || '20')
  };
}

/**
 * Simulates user typing with realistic delays
 * @param page - Playwright page object
 * @param selector - Element selector
 * @param text - Text to type
 * @param delay - Delay between keystrokes (default: 50ms)
 */
export async function typeWithDelay(
  page: any,
  selector: string,
  text: string,
  delay: number = 50
): Promise<void> {
  await page.click(selector);
  await page.keyboard.type(text, { delay });
}

/**
 * Waits for search results to load with timeout
 * @param page - Playwright page object
 * @param timeout - Timeout in milliseconds (default: 5000)
 */
export async function waitForSearchResults(
  page: any,
  timeout: number = 5000
): Promise<void> {
  try {
    await page.waitForSelector('[data-pw="search-results"], [data-pw="no-results-message"]', {
      timeout
    });
  } catch (error) {
    throw new Error(`Search results did not load within ${timeout}ms`);
  }
}

/**
 * Generates unique test search terms
 * @param prefix - Prefix for search terms
 * @param count - Number of terms to generate
 * @returns Array of unique search terms
 */
export function generateTestSearchTerms(prefix: string = 'Test', count: number = 10): string[] {
  const timestamp = Date.now();
  return Array.from({ length: count }, (_, i) => 
    `${prefix}${timestamp}${i.toString().padStart(3, '0')}`
  );
}

/**
 * Validates search response format
 * @param response - API response to validate
 * @returns true if valid format, false otherwise
 */
export function validateSearchResponse(response: any): boolean {
  if (!response || typeof response !== 'object') {
    return false;
  }
  
  return (
    Array.isArray(response.owners) &&
    response.pageInfo &&
    typeof response.pageInfo.currentPage === 'number' &&
    typeof response.pageInfo.totalPages === 'number' &&
    typeof response.pageInfo.totalElements === 'number' &&
    typeof response.pageInfo.hasNext === 'boolean' &&
    typeof response.pageInfo.hasPrevious === 'boolean'
  );
}

/**
 * Creates mock search response for testing
 * @param owners - Array of owner objects
 * @param currentPage - Current page (0-based)
 * @param pageSize - Page size
 * @returns Mock search response
 */
export function createMockSearchResponse(
  owners: any[],
  currentPage: number = 0,
  pageSize: number = 20
) {
  const totalElements = owners.length;
  const totalPages = Math.ceil(totalElements / pageSize);
  const startIndex = currentPage * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalElements);
  const pageOwners = owners.slice(startIndex, endIndex);

  return {
    owners: pageOwners,
    pageInfo: {
      currentPage,
      totalPages,
      totalElements,
      pageSize,
      hasNext: currentPage < totalPages - 1,
      hasPrevious: currentPage > 0
    }
  };
}
