import { test, expect } from '@playwright/test';

/**
 * Essential PetClinic API Tests
 * Core functionality tests only
 */
test.describe('PetClinic API Tests', () => {
  const apiBaseUrl = 'http://localhost:8080/api';

  test.describe('Owners API @api', () => {
    test('GET /owners - should return list of owners', async ({ request }) => {
      const response = await request.get(`${apiBaseUrl}/owners`);
      
      expect(response.status()).toBe(200);
      
      const owners = await response.json();
      expect(Array.isArray(owners)).toBeTruthy();
      
      if (owners.length > 0) {
        const owner = owners[0];
        expect(owner).toHaveProperty('id');
        expect(owner).toHaveProperty('firstName');
        expect(owner).toHaveProperty('lastName');
      }
    });

    test('GET /owners/{id} - should return specific owner', async ({ request }) => {
      // First get list to find a valid ID
      const listResponse = await request.get(`${apiBaseUrl}/owners`);
      const owners = await listResponse.json();
      
      if (owners.length > 0) {
        const ownerId = owners[0].id;
        const response = await request.get(`${apiBaseUrl}/owners/${ownerId}`);
        
        expect(response.status()).toBe(200);
        
        const owner = await response.json();
        expect(owner.id).toBe(ownerId);
        expect(owner).toHaveProperty('firstName');
        expect(owner).toHaveProperty('lastName');
      }
    });
  });

  test.describe('Pet Types API @api', () => {
    test('GET /pet-types - should return list of pet types', async ({ request }) => {
      const response = await request.get(`${apiBaseUrl}/pet-types`);
      
      expect(response.status()).toBe(200);
      
      const petTypes = await response.json();
      expect(Array.isArray(petTypes)).toBeTruthy();
      
      if (petTypes.length > 0) {
        const petType = petTypes[0];
        expect(petType).toHaveProperty('id');
        expect(petType).toHaveProperty('name');
      }
    });
  });

  test.describe('API Error Handling @error-handling', () => {
    test('should handle non-existent owner gracefully', async ({ request }) => {
      const response = await request.get(`${apiBaseUrl}/owners/99999`);
      
      expect([404, 400]).toContain(response.status());
    });
  });
});
