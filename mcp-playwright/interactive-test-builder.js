const { v4: uuidv4 } = require('uuid');

class InteractiveTestBuilder {
  constructor() {
    this.sessions = new Map();
    this.templates = this.initializeTemplates();
  }

  initializeTemplates() {
    return {
      'e2e-crud': {
        name: 'E2E CRUD Operations',
        steps: [
          { id: 'entity', question: 'Welche Entität soll getestet werden?', type: 'select', options: ['owners', 'pets', 'pet-types', 'visits'] },
          { id: 'operations', question: 'Welche Operationen?', type: 'multiselect', options: ['create', 'read', 'update', 'delete'] },
          { id: 'validations', question: 'Welche Validierungen?', type: 'multiselect', options: ['required-fields', 'format-validation', 'business-rules'] },
          { id: 'edge-cases', question: 'Edge Cases einschließen?', type: 'boolean' }
        ]
      },
      'visual-regression': {
        name: 'Visual Regression Testing',
        steps: [
          { id: 'pages', question: 'Welche Seiten testen?', type: 'multiselect', options: ['homepage', 'owners', 'pets', 'pet-types', 'visits'] },
          { id: 'components', question: 'Spezifische Komponenten?', type: 'text', placeholder: 'z.B. navigation, table, form' },
          { id: 'viewports', question: 'Viewports?', type: 'multiselect', options: ['desktop', 'tablet', 'mobile'] },
          { id: 'states', question: 'UI States?', type: 'multiselect', options: ['empty', 'loading', 'error', 'filled'] }
        ]
      },
      'api-contract': {
        name: 'API Contract Testing',
        steps: [
          { id: 'endpoints', question: 'Welche Endpoints?', type: 'multiselect', options: ['/api/owners', '/api/pets', '/api/pettypes', '/api/visits'] },
          { id: 'methods', question: 'HTTP Methods?', type: 'multiselect', options: ['GET', 'POST', 'PUT', 'DELETE'] },
          { id: 'validation', question: 'Schema Validation?', type: 'boolean' },
          { id: 'error-handling', question: 'Error Handling testen?', type: 'boolean' }
        ]
      },
      'user-journey': {
        name: 'User Journey Testing',
        steps: [
          { id: 'persona', question: 'Welche Benutzer-Rolle?', type: 'select', options: ['veterinarian', 'admin', 'receptionist'] },
          { id: 'goal', question: 'Was ist das Ziel?', type: 'text', placeholder: 'z.B. Neuen Owner mit Pet registrieren' },
          { id: 'happy-path', question: 'Happy Path Steps definieren?', type: 'boolean' },
          { id: 'error-scenarios', question: 'Error Scenarios?', type: 'boolean' }
        ]
      }
    };
  }

  // Starte neue Test-Builder Session
  startSession(testType, feature) {
    const sessionId = uuidv4();
    const template = this.templates[testType];
    
    if (!template) {
      throw new Error(`Test type '${testType}' not supported`);
    }

    const session = {
      id: sessionId,
      testType,
      feature,
      template,
      currentStep: 0,
      answers: {},
      startTime: new Date().toISOString()
    };

    this.sessions.set(sessionId, session);

    return {
      sessionId,
      currentStep: this.getCurrentStep(session)
    };
  }

  // Verarbeite Antwort und gehe zum nächsten Schritt
  processStep(sessionId, answer) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Speichere Antwort
    const currentStepConfig = session.template.steps[session.currentStep];
    session.answers[currentStepConfig.id] = answer;

    // Gehe zum nächsten Schritt
    session.currentStep++;

    if (session.currentStep >= session.template.steps.length) {
      // Session abgeschlossen
      const generatedTest = this.generateCompleteTest(session);
      this.sessions.delete(sessionId);
      
      return {
        complete: true,
        generatedTest,
        summary: this.generateSummary(session)
      };
    }

    return {
      complete: false,
      currentStep: this.getCurrentStep(session)
    };
  }

  getCurrentStep(session) {
    const stepConfig = session.template.steps[session.currentStep];
    
    return {
      stepNumber: session.currentStep + 1,
      totalSteps: session.template.steps.length,
      title: stepConfig.question,
      type: stepConfig.type,
      options: stepConfig.options || [],
      placeholder: stepConfig.placeholder || '',
      progress: Math.round(((session.currentStep) / session.template.steps.length) * 100)
    };
  }

  // Generiere kompletten Test basierend auf Antworten
  generateCompleteTest(session) {
    switch (session.testType) {
      case 'e2e-crud':
        return this.generateCrudTest(session);
      case 'visual-regression':
        return this.generateVisualTest(session);
      case 'api-contract':
        return this.generateApiTest(session);
      case 'user-journey':
        return this.generateJourneyTest(session);
      default:
        throw new Error(`Unknown test type: ${session.testType}`);
    }
  }

  generateCrudTest(session) {
    const { entity, operations, validations, edgeCases } = session.answers;
    const entityCapitalized = entity.charAt(0).toUpperCase() + entity.slice(1);
    
    const imports = `import { test, expect } from '@playwright/test';
import { ${entityCapitalized}Page } from '../pages/${entityCapitalized}Page';
import { Navigation } from '../pages/Navigation';`;

    const setup = `
test.describe('${entityCapitalized} CRUD Operations', () => {
  let ${entity}Page: ${entityCapitalized}Page;
  let navigation: Navigation;

  test.beforeEach(async ({ page }) => {
    ${entity}Page = new ${entityCapitalized}Page(page);
    navigation = new Navigation(page);
    await page.goto('/');
  });`;

    let testCases = '';

    if (operations.includes('create')) {
      testCases += this.generateCreateTest(entity, validations);
    }
    
    if (operations.includes('read')) {
      testCases += this.generateReadTest(entity);
    }
    
    if (operations.includes('update')) {
      testCases += this.generateUpdateTest(entity, validations);
    }
    
    if (operations.includes('delete')) {
      testCases += this.generateDeleteTest(entity);
    }

    if (edgeCases) {
      testCases += this.generateEdgeCases(entity, validations);
    }

    return `${imports}${setup}${testCases}\n});`;
  }

  generateCreateTest(entity, validations) {
    const validationTests = validations.includes('required-fields') ? 
      this.generateValidationTest(entity, 'required') : '';
    
    return `
  test('Create new ${entity}', async ({ page }) => {
    await navigation.goto${entity.charAt(0).toUpperCase() + entity.slice(1)}s();
    await ${entity}Page.gotoAdd${entity.charAt(0).toUpperCase() + entity.slice(1)}();
    
    const testData = {
      // TODO: Define test data structure
    };
    
    await ${entity}Page.add${entity.charAt(0).toUpperCase() + entity.slice(1)}(testData);
    
    // Verify creation
    await expect(page).toHaveURL(/\\/${entity}s\\/\\d+/);
  });${validationTests}`;
  }

  generateVisualTest(session) {
    const { pages, components, viewports, states } = session.answers;
    
    let test = `import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {`;

    pages.forEach(page => {
      test += `
  test('${page} - Visual Test', async ({ page }) => {
    await page.goto('/${page}');
    await page.waitForLoadState('networkidle');
    
    // Hide dynamic elements
    await page.addStyleTag({
      content: \`.timestamp, .loading { visibility: hidden !important; }\`
    });`;

      viewports.forEach(viewport => {
        const size = this.getViewportSize(viewport);
        test += `
    
    // ${viewport} viewport
    await page.setViewportSize(${JSON.stringify(size)});
    await expect(page).toHaveScreenshot('${page}-${viewport}.png');`;
      });

      test += `
  });`;
    });

    test += `
});`;

    return test;
  }

  generateApiTest(session) {
    const { endpoints, methods, validation, errorHandling } = session.answers;
    
    let test = `import { test, expect } from '@playwright/test';

test.describe('API Contract Tests', () => {`;

    endpoints.forEach(endpoint => {
      methods.forEach(method => {
        test += `
  test('${method} ${endpoint}', async ({ request }) => {
    const response = await request.${method.toLowerCase()}('${endpoint}');
    
    expect(response.status()).toBe(${this.getExpectedStatus(method)});`;

        if (validation && method === 'GET') {
          test += `
    
    const data = await response.json();
    // TODO: Add schema validation`;
        }

        test += `
  });`;
      });
    });

    if (errorHandling) {
      test += `
  
  test('Error handling', async ({ request }) => {
    const response = await request.get('/api/nonexistent');
    expect(response.status()).toBe(404);
  });`;
    }

    test += `
});`;

    return test;
  }

  generateJourneyTest(session) {
    const { persona, goal, happyPath, errorScenarios } = session.answers;
    
    return `import { test, expect } from '@playwright/test';

test.describe('User Journey - ${persona}', () => {
  test('${goal} - Happy Path', async ({ page }) => {
    // TODO: Implement user journey steps
    await page.goto('/');
    
    // Step 1: Authentication (if needed)
    // Step 2: Navigate to feature
    // Step 3: Perform actions
    // Step 4: Verify result
    
    expect(true).toBe(true); // Replace with actual assertions
  });
  
  ${errorScenarios ? `
  test('${goal} - Error Scenarios', async ({ page }) => {
    // TODO: Implement error scenarios
    await page.goto('/');
    
    // Test validation errors
    // Test network failures
    // Test edge cases
  });` : ''}
});`;
  }

  // Helper Methods
  getViewportSize(viewport) {
    const sizes = {
      desktop: { width: 1920, height: 1080 },
      tablet: { width: 768, height: 1024 },
      mobile: { width: 375, height: 667 }
    };
    return sizes[viewport] || sizes.desktop;
  }

  getExpectedStatus(method) {
    const statusMap = {
      'GET': 200,
      'POST': 201,
      'PUT': 200,
      'DELETE': 204
    };
    return statusMap[method] || 200;
  }

  generateValidationTest(entity, type) {
    if (type === 'required') {
      return `
  
  test('${entity} - Required field validation', async ({ page }) => {
    await navigation.goto${entity.charAt(0).toUpperCase() + entity.slice(1)}s();
    await ${entity}Page.gotoAdd${entity.charAt(0).toUpperCase() + entity.slice(1)}();
    
    // Try to save without required fields
    await ${entity}Page.save();
    
    // Expect validation errors
    await expect(page.locator('[data-pw="error-message"]')).toBeVisible();
  });`;
    }
    return '';
  }

  generateEdgeCases(entity, validations) {
    return `
  
  test('${entity} - Edge Cases', async ({ page }) => {
    await navigation.goto${entity.charAt(0).toUpperCase() + entity.slice(1)}s();
    
    // Test with maximum length data
    const maxLengthData = {
      name: 'A'.repeat(255),
      // Add other max length fields
    };
    
    // Test with special characters
    const specialCharData = {
      name: 'Test@#$%^&*()',
      // Add other special char fields
    };
    
    // TODO: Implement edge case tests
  });`;
  }

  generateSummary(session) {
    return {
      testType: session.template.name,
      feature: session.feature,
      answers: session.answers,
      duration: new Date() - new Date(session.startTime),
      recommendations: this.generateRecommendations(session)
    };
  }

  generateRecommendations(session) {
    const recommendations = [];
    
    if (session.testType === 'e2e-crud') {
      recommendations.push('Erweitere Tests um API-Validierung');
      recommendations.push('Füge Performance-Metriken hinzu');
    }
    
    if (session.answers.validations?.length > 0) {
      recommendations.push('Implementiere negative Test-Cases');
    }
    
    return recommendations;
  }
}

module.exports = InteractiveTestBuilder;
