# 🏗️ PetClinic Test-Strategie - Testpyramide

## 📊 Testpyramide Übersicht

```
           /\
          /  \      🎭 E2E Tests (10-20%)
         /____\     
        /      \    🔗 Integration Tests (20-30%)
       /        \   
      /__________\  🧪 Unit Tests (50-70%)
```

## 🧪 **Level 1: Unit Tests (50-70%)**

### Java Backend Unit Tests

#### Owner Service Tests
```java
// src/test/java/org/springframework/samples/petclinic/owner/OwnerServiceTest.java
@ExtendWith(MockitoExtension.class)
class OwnerServiceTest {
    
    @Test
    void shouldCreateOwnerSuccessfully() {
        // GIVEN
        Owner owner = new Owner();
        owner.setFirstName("John");
        owner.setLastName("Doe");
        owner.setEmail("john@example.com");
        
        // WHEN & THEN
        assertThat(owner.getFirstName()).isEqualTo("John");
        assertThat(owner.getEmail()).isEqualTo("john@example.com");
    }
    
    @Test
    void shouldValidateOwnerEmail() {
        // Email validation tests
    }
    
    @Test
    void shouldThrowExceptionForInvalidOwner() {
        // Exception handling tests
    }
}
```

#### Controller Unit Tests
```java
// src/test/java/org/springframework/samples/petclinic/owner/OwnerControllerTest.java
@WebMvcTest(OwnerController.class)
class OwnerControllerTest {
    
    @MockBean
    private OwnerService ownerService;
    
    @Test
    void shouldDisplayOwnersList() throws Exception {
        mockMvc.perform(get("/owners"))
               .andExpect(status().isOk())
               .andExpect(view().name("owners/ownersList"));
    }
}
```

#### Repository Tests
```java
// src/test/java/org/springframework/samples/petclinic/owner/OwnerRepositoryTest.java
@DataJpaTest
class OwnerRepositoryTest {
    
    @Test
    void shouldFindOwnerByLastName() {
        // Repository query tests
    }
    
    @Test
    void shouldCountOwnersCorrectly() {
        // Aggregation tests
    }
}
```

### Frontend Unit Tests (JavaScript/TypeScript)

#### Page Object Unit Tests
```typescript
// playwright/tests/unit/page-objects/owner-page.test.ts
import { test, expect } from '@playwright/test';
import { OwnerPage } from '../../pages/OwnerPage';

test.describe('OwnerPage Unit Tests', () => {
  test('should validate form data before submission', async ({ page }) => {
    const ownerPage = new OwnerPage(page);
    
    const isValid = ownerPage.validateOwnerData({
      firstName: '',
      lastName: 'Doe',
      email: 'invalid-email'
    });
    
    expect(isValid).toBe(false);
  });
});
```

---

## 🔗 **Level 2: Integration Tests (20-30%)**

### Backend Integration Tests

#### REST API Integration
```java
// src/test/java/org/springframework/samples/petclinic/integration/OwnerRestIntegrationTest.java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestPropertySource(locations = "classpath:application-test.properties")
class OwnerRestIntegrationTest {
    
    @Autowired
    private TestRestTemplate restTemplate;
    
    @Test
    void shouldCreateAndRetrieveOwner() {
        // POST /api/owners
        Owner owner = new Owner("John", "Doe", "john@example.com");
        ResponseEntity<Owner> createResponse = restTemplate.postForEntity("/api/owners", owner, Owner.class);
        
        assertThat(createResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        
        // GET /api/owners/{id}
        Long ownerId = createResponse.getBody().getId();
        ResponseEntity<Owner> getResponse = restTemplate.getForEntity("/api/owners/" + ownerId, Owner.class);
        
        assertThat(getResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(getResponse.getBody().getFirstName()).isEqualTo("John");
    }
}
```

#### Database Integration Tests
```java
// src/test/java/org/springframework/samples/petclinic/integration/DatabaseIntegrationTest.java
@SpringBootTest
@Transactional
class DatabaseIntegrationTest {
    
    @Test
    void shouldPersistOwnerWithPets() {
        // Test complete entity relationships
    }
    
    @Test
    void shouldHandleCascadeOperations() {
        // Test cascade delete/update
    }
}
```

### Frontend-Backend Integration

#### API Contract Tests (Playwright)
```typescript
// playwright/tests/integration/api-contract.spec.ts
import { test, expect } from '@playwright/test';

test.describe('API Contract Tests', () => {
  test('should validate owner API schema', async ({ request }) => {
    const response = await request.get('/api/owners');
    
    expect(response.status()).toBe(200);
    
    const owners = await response.json();
    expect(Array.isArray(owners)).toBeTruthy();
    
    if (owners.length > 0) {
      expect(owners[0]).toHaveProperty('id');
      expect(owners[0]).toHaveProperty('firstName');
      expect(owners[0]).toHaveProperty('lastName');
      expect(owners[0]).toHaveProperty('email');
    }
  });
});
```

---

## 🎭 **Level 3: End-to-End Tests (10-20%)**

### Critical User Journeys

#### Owner Management Flow
```typescript
// playwright/tests/e2e/owner-management.spec.ts
import { test, expect } from '@playwright/test';
import { OwnerPage } from '../pages/OwnerPage';
import { Navigation } from '../pages/Navigation';

test.describe('Owner Management E2E', () => {
  test('complete owner lifecycle', async ({ page }) => {
    const navigation = new Navigation(page);
    const ownerPage = new OwnerPage(page);
    
    // Navigate to owners
    await navigation.gotoOwners();
    
    // Add new owner
    await ownerPage.addOwner({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      address: '123 Main St',
      city: 'Springfield',
      telephone: '555-1234'
    });
    
    // Verify owner was created
    await expect(page.locator('text=John Doe')).toBeVisible();
    
    // Edit owner
    await ownerPage.editOwner('John Doe', {
      telephone: '555-5678'
    });
    
    // Verify changes
    await expect(page.locator('text=555-5678')).toBeVisible();
    
    // Add pet to owner
    await ownerPage.addPetToOwner('John Doe', {
      name: 'Buddy',
      type: 'dog',
      birthDate: '2020-01-15'
    });
    
    // Verify pet was added
    await expect(page.locator('text=Buddy')).toBeVisible();
  });
});
```

### Cross-Browser E2E Tests
```typescript
// playwright/tests/e2e/cross-browser.spec.ts
test.describe('Cross-Browser Compatibility', () => {
  ['chromium', 'firefox', 'webkit'].forEach(browserName => {
    test(`should work in ${browserName}`, async ({ page }) => {
      // Test critical paths in all browsers
    });
  });
});
```

---

## 📱 **Mobile & Responsive Tests**

### Mobile-Specific Tests
```typescript
// playwright/tests/mobile/mobile-owner-management.spec.ts
import { test, expect, devices } from '@playwright/test';

test.use({ ...devices['iPhone 12'] });

test.describe('Mobile Owner Management', () => {
  test('should handle touch interactions', async ({ page }) => {
    await page.goto('/owners');
    
    // Test mobile navigation
    await page.locator('[data-pw="mobile-menu"]').tap();
    await expect(page.locator('.mobile-nav')).toBeVisible();
    
    // Test swipe gestures for owner list
    await page.locator('.owner-card').first().swipe('left');
    await expect(page.locator('.delete-button')).toBeVisible();
  });
  
  test('should adapt form layout for mobile', async ({ page }) => {
    await page.goto('/owners/new');
    
    // Verify mobile-optimized form layout
    await expect(page.locator('.form-container')).toHaveCSS('flex-direction', 'column');
    
    // Test touch-friendly input interactions
    await page.locator('#firstName').tap();
    await page.keyboard.type('John');
  });
});
```

---

## 🌐 **Performance Tests**

### Load Testing
```typescript
// playwright/tests/performance/load-tests.spec.ts
test.describe('Performance Tests', () => {
  test('should handle concurrent owner creation', async ({ browser }) => {
    const contexts = await Promise.all(
      Array.from({ length: 10 }, () => browser.newContext())
    );
    
    const pages = await Promise.all(
      contexts.map(context => context.newPage())
    );
    
    // Simulate 10 concurrent users creating owners
    const promises = pages.map(async (page, index) => {
      await page.goto('/owners/new');
      return page.locator('#submit').click();
    });
    
    const startTime = Date.now();
    await Promise.all(promises);
    const endTime = Date.now();
    
    expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
  });
  
  test('should maintain performance with large datasets', async ({ page }) => {
    // Test with 1000+ owners
    await page.goto('/owners?size=1000');
    
    const startTime = Date.now();
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds
  });
});
```

---

## 👁️ **Visual Regression Tests**

### Component Visual Tests
```typescript
// playwright/tests/visual/component-visual.spec.ts
test.describe('Visual Regression Tests', () => {
  test('owner form visual consistency', async ({ page }) => {
    await page.goto('/owners/new');
    
    // Test different form states
    await expect(page.locator('.owner-form')).toHaveScreenshot('owner-form-empty.png');
    
    // Fill form and test filled state
    await page.fill('#firstName', 'John');
    await page.fill('#lastName', 'Doe');
    await expect(page.locator('.owner-form')).toHaveScreenshot('owner-form-filled.png');
    
    // Test validation error state
    await page.fill('#email', 'invalid-email');
    await page.click('#submit');
    await expect(page.locator('.owner-form')).toHaveScreenshot('owner-form-validation-error.png');
  });
  
  test('responsive design consistency', async ({ page }) => {
    await page.goto('/owners');
    
    // Test different viewport sizes
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page).toHaveScreenshot('owners-desktop.png');
    
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page).toHaveScreenshot('owners-tablet.png');
    
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page).toHaveScreenshot('owners-mobile.png');
  });
});
```

---

## 🔒 **Security Tests**

### Authentication & Authorization
```typescript
// playwright/tests/security/auth-tests.spec.ts
test.describe('Security Tests', () => {
  test('should prevent unauthorized access', async ({ page }) => {
    // Test without authentication
    await page.goto('/admin/owners');
    await expect(page).toHaveURL(/login/);
  });
  
  test('should validate CSRF protection', async ({ page }) => {
    // Test CSRF token validation
  });
  
  test('should prevent XSS attacks', async ({ page }) => {
    // Test XSS prevention in forms
    await page.goto('/owners/new');
    await page.fill('#firstName', '<script>alert("xss")</script>');
    await page.click('#submit');
    
    // Should not execute script
    await expect(page.locator('text=<script>')).toBeVisible();
  });
});
```

---

## 🌍 **Internationalization Tests**

### Multi-Language Support
```typescript
// playwright/tests/i18n/language-tests.spec.ts
test.describe('Internationalization Tests', () => {
  ['en', 'de', 'es', 'fr'].forEach(locale => {
    test(`should display correct text in ${locale}`, async ({ page }) => {
      await page.goto(`/owners?lang=${locale}`);
      
      const expectedTexts = {
        'en': 'Owners',
        'de': 'Besitzer', 
        'es': 'Propietarios',
        'fr': 'Propriétaires'
      };
      
      await expect(page.locator('h1')).toContainText(expectedTexts[locale]);
    });
  });
});
```

---

## 📊 **Test Execution Strategy**

### Pipeline Integration
```yaml
# .github/workflows/test-pyramid.yml
name: Test Pyramid Execution

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - name: Run Java Unit Tests
        run: ./mvnw test
      
      - name: Run Frontend Unit Tests  
        run: npm run test:unit

  integration-tests:
    needs: unit-tests
    runs-on: ubuntu-latest
    steps:
      - name: Start PetClinic App
        run: ./mvnw spring-boot:run &
      
      - name: Run Integration Tests
        run: npx playwright test tests/integration/

  e2e-tests:
    needs: integration-tests
    runs-on: ubuntu-latest
    strategy:
      matrix:
        browser: [chromium, firefox, webkit]
    steps:
      - name: Run E2E Tests
        run: npx playwright test tests/e2e/ --project=${{ matrix.browser }}

  visual-tests:
    needs: e2e-tests
    runs-on: ubuntu-latest
    steps:
      - name: Run Visual Tests
        run: npx playwright test tests/visual/
```

---

## 🎯 **Test-Typen Verteilung für PetClinic**

### Empfohlene Aufteilung:

#### **Unit Tests (60%)**
- ✅ **60 Java Unit Tests** für Services, Controllers, Repositories
- ✅ **20 Frontend Unit Tests** für Page Objects, Utils
- ✅ **Schnelle Ausführung** (< 30 Sekunden)
- ✅ **Hohe Coverage** (80%+ Code Coverage)

#### **Integration Tests (30%)**
- ✅ **25 API Integration Tests** für REST Endpoints
- ✅ **15 Database Integration Tests** für Data Layer
- ✅ **10 Frontend-Backend Tests** für Contract Testing
- ✅ **Mittlere Ausführung** (2-5 Minuten)

#### **E2E Tests (10%)**
- ✅ **8 Critical User Journey Tests**
- ✅ **4 Cross-Browser Tests**
- ✅ **3 Mobile Tests**
- ✅ **Langsame Ausführung** (10-20 Minuten)

---

## 🚀 **Nächste Schritte**

1. **Welche Test-Ebene soll ich zuerst implementieren?**
2. **Soll ich spezifische Tests für bestimmte Features erstellen?**
3. **Brauchst du Hilfe bei der Pipeline-Konfiguration?**

**Was ist für dich am wichtigsten: Unit Tests, Integration Tests oder E2E Tests?**
