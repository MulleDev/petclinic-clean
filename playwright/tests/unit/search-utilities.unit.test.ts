import { test, expect } from '@playwright/test';
import { 
  validateSearchTerm, 
  formatPaginationInfo, 
  getVisiblePageNumbers,
  buildSearchUrl,
  parseSearchUrl,
  validateSearchResponse,
  createMockSearchResponse
} from '../../helpers/search-utilities';

test.describe('Search Utilities Unit Tests', () => {
  
  test.describe('validateSearchTerm', () => {
    test('should return false for terms shorter than 2 characters', () => {
      expect(validateSearchTerm('')).toBe(false);
      expect(validateSearchTerm('a')).toBe(false);
      expect(validateSearchTerm(' ')).toBe(false);
    });

    test('should return true for valid search terms', () => {
      expect(validateSearchTerm('ab')).toBe(true);
      expect(validateSearchTerm('John')).toBe(true);
      expect(validateSearchTerm('Smith')).toBe(true);
      expect(validateSearchTerm('Test User')).toBe(true);
    });

    test('should return false for null or undefined', () => {
      expect(validateSearchTerm(null as any)).toBe(false);
      expect(validateSearchTerm(undefined as any)).toBe(false);
    });

    test('should trim whitespace and validate', () => {
      expect(validateSearchTerm('  ab  ')).toBe(true);
      expect(validateSearchTerm('  a  ')).toBe(false);
    });

    test('should return false for terms longer than 100 characters', () => {
      const longTerm = 'a'.repeat(101);
      expect(validateSearchTerm(longTerm)).toBe(false);
      
      const maxTerm = 'a'.repeat(100);
      expect(validateSearchTerm(maxTerm)).toBe(true);
    });
  });

  test.describe('formatPaginationInfo', () => {
    test('should format pagination info correctly for first page', () => {
      const result = formatPaginationInfo(0, 5, 100, 20);
      
      expect(result.currentPage).toBe(1); // 1-based
      expect(result.totalPages).toBe(5);
      expect(result.totalElements).toBe(100);
      expect(result.startElement).toBe(1);
      expect(result.endElement).toBe(20);
      expect(result.hasNext).toBe(true);
      expect(result.hasPrevious).toBe(false);
      expect(result.displayText).toBe('1-20 von 100 Ergebnissen');
    });

    test('should format pagination info correctly for middle page', () => {
      const result = formatPaginationInfo(2, 5, 100, 20);
      
      expect(result.currentPage).toBe(3); // 1-based
      expect(result.startElement).toBe(41);
      expect(result.endElement).toBe(60);
      expect(result.hasNext).toBe(true);
      expect(result.hasPrevious).toBe(true);
    });

    test('should format pagination info correctly for last page', () => {
      const result = formatPaginationInfo(4, 5, 95, 20);
      
      expect(result.currentPage).toBe(5); // 1-based
      expect(result.startElement).toBe(81);
      expect(result.endElement).toBe(95);
      expect(result.hasNext).toBe(false);
      expect(result.hasPrevious).toBe(true);
      expect(result.displayText).toBe('81-95 von 95 Ergebnissen');
    });
  });

  test.describe('getVisiblePageNumbers', () => {
    test('should return all pages when total pages <= maxVisible', () => {
      expect(getVisiblePageNumbers(1, 3, 5)).toEqual([1, 2, 3]);
      expect(getVisiblePageNumbers(2, 5, 5)).toEqual([1, 2, 3, 4, 5]);
    });

    test('should return correct range for pages in the middle', () => {
      expect(getVisiblePageNumbers(5, 10, 5)).toEqual([3, 4, 5, 6, 7]);
      expect(getVisiblePageNumbers(6, 10, 5)).toEqual([4, 5, 6, 7, 8]);
    });

    test('should handle first pages correctly', () => {
      expect(getVisiblePageNumbers(1, 10, 5)).toEqual([1, 2, 3, 4, 5]);
      expect(getVisiblePageNumbers(2, 10, 5)).toEqual([1, 2, 3, 4, 5]);
    });

    test('should handle last pages correctly', () => {
      expect(getVisiblePageNumbers(10, 10, 5)).toEqual([6, 7, 8, 9, 10]);
      expect(getVisiblePageNumbers(9, 10, 5)).toEqual([6, 7, 8, 9, 10]);
    });
  });

  test.describe('buildSearchUrl', () => {
    test('should build URL with search term only', () => {
      expect(buildSearchUrl('John')).toBe('/owners/search?q=John');
    });

    test('should build URL with all parameters', () => {
      expect(buildSearchUrl('Smith', 2, 10)).toBe('/owners/search?q=Smith&page=2&size=10');
    });

    test('should handle empty search term', () => {
      expect(buildSearchUrl('', 1, 20)).toBe('/owners/search?page=1');
    });

    test('should omit default values', () => {
      expect(buildSearchUrl('Test', 0, 20)).toBe('/owners/search?q=Test');
    });

    test('should trim search term', () => {
      expect(buildSearchUrl('  John  ')).toBe('/owners/search?q=John');
    });
  });

  test.describe('parseSearchUrl', () => {
    test('should parse URL with all parameters', () => {
      const result = parseSearchUrl('http://localhost/owners/search?q=John&page=2&size=10');
      
      expect(result.searchTerm).toBe('John');
      expect(result.page).toBe(2);
      expect(result.size).toBe(10);
    });

    test('should use defaults for missing parameters', () => {
      const result = parseSearchUrl('http://localhost/owners/search');
      
      expect(result.searchTerm).toBe('');
      expect(result.page).toBe(0);
      expect(result.size).toBe(20);
    });

    test('should parse partial parameters', () => {
      const result = parseSearchUrl('http://localhost/owners/search?q=Smith');
      
      expect(result.searchTerm).toBe('Smith');
      expect(result.page).toBe(0);
      expect(result.size).toBe(20);
    });
  });

  test.describe('validateSearchResponse', () => {
    test('should validate correct response format', () => {
      const validResponse = {
        owners: [
          { id: 1, firstName: 'John', lastName: 'Smith' }
        ],
        pageInfo: {
          currentPage: 0,
          totalPages: 1,
          totalElements: 1,
          hasNext: false,
          hasPrevious: false
        }
      };

      expect(validateSearchResponse(validResponse)).toBe(true);
    });

    test('should reject invalid response formats', () => {
      expect(validateSearchResponse(null)).toBe(false);
      expect(validateSearchResponse({})).toBe(false);
      expect(validateSearchResponse({ owners: 'not an array' })).toBe(false);
      expect(validateSearchResponse({ 
        owners: [], 
        pageInfo: { currentPage: 'not a number' }
      })).toBe(false);
    });
  });

  test.describe('createMockSearchResponse', () => {
    test('should create correct mock response for first page', () => {
      const owners = Array.from({ length: 50 }, (_, i) => ({ id: i + 1, name: `Owner${i}` }));
      const response = createMockSearchResponse(owners, 0, 20);

      expect(response.owners).toHaveLength(20);
      expect(response.pageInfo.currentPage).toBe(0);
      expect(response.pageInfo.totalPages).toBe(3);
      expect(response.pageInfo.totalElements).toBe(50);
      expect(response.pageInfo.hasNext).toBe(true);
      expect(response.pageInfo.hasPrevious).toBe(false);
    });

    test('should create correct mock response for last page', () => {
      const owners = Array.from({ length: 45 }, (_, i) => ({ id: i + 1, name: `Owner${i}` }));
      const response = createMockSearchResponse(owners, 2, 20);

      expect(response.owners).toHaveLength(5); // Last page has 5 items
      expect(response.pageInfo.currentPage).toBe(2);
      expect(response.pageInfo.totalPages).toBe(3);
      expect(response.pageInfo.hasNext).toBe(false);
      expect(response.pageInfo.hasPrevious).toBe(true);
    });
  });
});
