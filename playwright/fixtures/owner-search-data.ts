/**
 * Test Data for Owner Search Feature
 */

export const searchTestData = {
  owners: [
    { id: 1, firstName: 'John', lastName: 'Smith', address: '123 Main St', city: 'Berlin', telephone: '030-1234567' },
    { id: 2, firstName: 'Jane', lastName: 'Smith', address: '456 Oak Ave', city: 'München', telephone: '089-7654321' },
    { id: 3, firstName: 'Bob', lastName: 'Johnson', address: '789 Pine Rd', city: 'Hamburg', telephone: '040-9876543' },
    { id: 4, firstName: 'Alice', lastName: 'Brown', address: '321 Elm St', city: 'Berlin', telephone: '030-5555555' },
    { id: 5, firstName: 'Charlie', lastName: 'Davis', address: '654 Maple Dr', city: 'Köln', telephone: '0221-1111111' },
    // Generate more test data for pagination
    ...Array.from({ length: 50 }, (_, i) => ({
      id: i + 6,
      firstName: `TestUser${i}`,
      lastName: `TestLast${i}`,
      address: `${100 + i} Test Street`,
      city: i % 2 === 0 ? 'Berlin' : 'München',
      telephone: `030-${String(i).padStart(7, '0')}`
    }))
  ],

  searchTerms: {
    valid: ['Smith', 'John', 'Berlin', 'TestUser', 'Test'],
    invalid: ['a', '', ' ', '\t'],
    noResults: ['XYZNonexistent', 'ZZZNotFound'],
    special: ['O\'Connor', 'Smith-Jones', 'Müller', 'José']
  },

  pagination: {
    defaultPageSize: 20,
    testPageSizes: [5, 10, 20, 50],
    maxVisiblePages: 5
  },

  performance: {
    searchTimeout: 2000, // 2 seconds
    baseline: { owners: 100, expectedTime: 1000 },
    stress: { owners: 1000, expectedTime: 5000 }
  },

  validation: {
    minSearchLength: 2,
    maxSearchLength: 100
  }
};

export const mockSearchResponse = {
  success: {
    owners: searchTestData.owners.slice(0, 5),
    pageInfo: {
      currentPage: 0,
      totalPages: 3,
      totalElements: 55,
      pageSize: 20,
      hasNext: true,
      hasPrevious: false
    }
  },
  
  empty: {
    owners: [],
    pageInfo: {
      currentPage: 0,
      totalPages: 0,
      totalElements: 0,
      pageSize: 20,
      hasNext: false,
      hasPrevious: false
    }
  },

  error: {
    status: 500,
    message: 'Suche momentan nicht verfügbar'
  },

  timeout: {
    status: 408,
    message: 'Suche dauert zu lange, bitte spezifizieren Sie den Suchbegriff'
  }
};
