# PetType Playwright Test Empfehlungen (SDET-Analyse)

## Aktuelle Coverage-Gaps und Empfohlene Tests

### 1. Description Field Tests (Kritisch - 0% Coverage)
```typescript
// playwright/tests/pettype-description.spec.ts
test.describe('PetType Description Field', () => {
  test('should save PetType with description', async ({ page }) => {
    // Test für description Feld das aktuell nicht getestet wird
  });
  
  test('should handle empty description gracefully', async ({ page }) => {
    // Leere description sollte erlaubt sein
  });
  
  test('should handle long description text', async ({ page }) => {
    // Max-Length validation für description
  });
});
```

### 2. Internationalization Tests (40% Coverage-Gap)
```typescript
// playwright/tests/pettype-i18n.spec.ts  
test.describe('PetType Internationalization', () => {
  test('should display PetType labels in German', async ({ page }) => {
    await page.locator('[data-pw="language-switcher"]').selectOption('de');
    await expect(page.locator('[data-i18n="pettype.name"]')).toHaveText('Tierart Name');
  });
  
  test('should display PetType labels in English', async ({ page }) => {
    await page.locator('[data-pw="language-switcher"]').selectOption('en');
    await expect(page.locator('[data-i18n="pettype.name"]')).toHaveText('Pet Type Name');
  });
});
```

### 3. Edge Cases & Input Validation
```typescript
// playwright/tests/pettype-edge-cases.spec.ts
test.describe('PetType Edge Cases', () => {
  test('should handle special characters in name', async ({ page }) => {
    // Test für Umlaute, Sonderzeichen
    await petTypePage.createPetType('Kätzchen-Rasse', 'Süße kleine Katzen');
  });
  
  test('should prevent duplicate PetType names', async ({ page }) => {
    // Duplicate validation
    await petTypePage.createPetType('Dog', 'First description');
    await petTypePage.createPetType('Dog', 'Second description');
    await expect(page.locator('[data-pw="error-message"]')).toBeVisible();
  });
  
  test('should handle maximum field lengths', async ({ page }) => {
    const longName = 'A'.repeat(256);
    const longDescription = 'B'.repeat(1000);
    // Test field length limits
  });
});
```

### 4. Error Scenarios & Recovery
```typescript
// playwright/tests/pettype-error-handling.spec.ts
test.describe('PetType Error Handling', () => {
  test('should show error when backend is unavailable', async ({ page }) => {
    // Mock backend failure
    await page.route('**/api/pettypes', route => route.fulfill({ status: 500 }));
    await petTypePage.attemptCreatePetType('Test', 'Description');
    await expect(page.locator('[data-pw="error-toast"]')).toBeVisible();
  });
  
  test('should recover from network timeout', async ({ page }) => {
    // Test timeout handling and retry mechanism
  });
  
  test('should handle authorization errors', async ({ page }) => {
    // Test 401/403 responses
  });
});
```

### 5. Performance & Load Tests
```typescript
// playwright/tests/pettype-performance.spec.ts
test.describe('PetType Performance', () => {
  test('should load PetType list quickly with many entries', async ({ page }) => {
    // Create 100+ PetTypes and measure load time
    const startTime = Date.now();
    await petTypePage.navigateToPetTypeList();
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(2000); // 2s max
  });
  
  test('should handle concurrent PetType creation', async ({ browser }) => {
    // Multiple browser contexts creating PetTypes simultaneously
  });
});
```

### 6. Integration mit Pet Management
```typescript
// playwright/tests/pettype-pet-integration.spec.ts
test.describe('PetType Integration Tests', () => {
  test('should be selectable when creating Pet', async ({ page }) => {
    // Create PetType, then use it in Pet creation
    await petTypePage.createPetType('Rabbit', 'Small furry animal');
    await petPage.navigateToCreatePet();
    await expect(page.locator('[data-pw="pettype-select"] option[value="Rabbit"]')).toBeVisible();
  });
  
  test('should prevent deletion of PetType in use', async ({ page }) => {
    // Create Pet with PetType, then try to delete PetType
    // Should show constraint violation error
  });
});
```

### 7. Database Consistency Tests
```typescript
// playwright/tests/pettype-database.spec.ts
test.describe('PetType Database Consistency', () => {
  test('should persist PetType after browser refresh', async ({ page }) => {
    await petTypePage.createPetType('Persistent Type', 'Test persistence');
    await page.reload();
    await expect(page.locator('[data-pw="pettype-name"]:has-text("Persistent Type")')).toBeVisible();
  });
  
  test('should maintain referential integrity', async ({ page }) => {
    // Test database constraints and foreign key relationships
  });
});
```

## Empfohlene Test-Architektur Updates

### Page Object Erweiterungen
```typescript
// playwright/pages/PetTypePage.ts - Erweiterte Methoden
export class PetTypePage {
  // Existing methods...
  
  async fillDescription(description: string) {
    await this.page.locator('[data-pw="pettype-description"]').fill(description);
  }
  
  async getErrorMessage() {
    return await this.page.locator('[data-pw="error-message"]').textContent();
  }
  
  async waitForLoadingComplete() {
    await this.page.locator('[data-pw="loading-spinner"]').waitFor({ state: 'hidden' });
  }
}
```

### Neue Helper-Klassen
```typescript
// playwright/helpers/PetTypeTestHelper.ts
export class PetTypeTestHelper {
  static async createTestPetTypes(page: Page, count: number) {
    // Bulk creation for performance tests
  }
  
  static async cleanupTestData(page: Page) {
    // Cleanup after tests
  }
}
```

## Coverage-Ziele nach Test-Erweiterung

- **Functional Coverage**: 95% (von aktuell 70%)
- **Error Scenarios**: 85% (von aktuell 30%)
- **I18n Coverage**: 90% (von aktuell 40%)
- **Performance Tests**: 80% (von aktuell 0%)
- **Integration Tests**: 85% (von aktuell 50%)

## Implementierungs-Priorität

1. **HIGH**: Description Field Tests (kritische Lücke)
2. **HIGH**: Error Handling Tests (Produktions-relevant)
3. **MEDIUM**: I18n Tests (User Experience)
4. **MEDIUM**: Edge Cases & Validation
5. **LOW**: Performance Tests (Nice-to-have)

## Geschätzte Implementierungszeit
- **Description Tests**: 2 Stunden
- **Error Handling**: 4 Stunden  
- **I18n Tests**: 3 Stunden
- **Edge Cases**: 5 Stunden
- **Performance Tests**: 6 Stunden

**Total: ~20 Stunden für vollständige PetType Test-Coverage**