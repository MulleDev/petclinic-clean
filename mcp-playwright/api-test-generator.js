const axios = require('axios');

class ApiTestGenerator {
  constructor(baseUrl = 'http://localhost:8080') {
    this.baseUrl = baseUrl;
  }

  // Generiere API Tests aus OpenAPI/Swagger
  async generateApiTestsFromSwagger(swaggerUrl = '/v3/api-docs') {
    try {
      const response = await axios.get(`${this.baseUrl}${swaggerUrl}`);
      const apiSpec = response.data;
      
      return this.generateTestsFromSpec(apiSpec);
    } catch (error) {
      console.error('Swagger-Spec konnte nicht geladen werden:', error.message);
      return this.generateBasicApiTests();
    }
  }

  generateTestsFromSpec(apiSpec) {
    const tests = [];
    
    Object.entries(apiSpec.paths || {}).forEach(([path, methods]) => {
      Object.entries(methods).forEach(([method, spec]) => {
        tests.push(this.generateTestForEndpoint(path, method, spec));
      });
    });
    
    return tests.join('\n\n');
  }

  generateTestForEndpoint(path, method, spec) {
    const testName = `${method.toUpperCase()} ${path}`;
    const endpoint = path.replace(/{(\w+)}/g, '1'); // Replace path params with '1'
    
    return `
test('${testName}', async ({ request }) => {
  ${this.generateRequestCode(method, endpoint, spec)}
  
  ${this.generateAssertions(spec)}
});`;
  }

  generateRequestCode(method, endpoint, spec) {
    switch (method.toLowerCase()) {
      case 'get':
        return `const response = await request.get('${endpoint}');`;
      
      case 'post':
        return `
  const testData = ${this.generateTestData(spec)};
  const response = await request.post('${endpoint}', {
    data: testData
  });`;
      
      case 'put':
        return `
  const updateData = ${this.generateTestData(spec)};
  const response = await request.put('${endpoint}', {
    data: updateData
  });`;
      
      case 'delete':
        return `const response = await request.delete('${endpoint}');`;
      
      default:
        return `const response = await request.${method}('${endpoint}');`;
    }
  }

  generateTestData(spec) {
    // Generiere Testdaten basierend auf Schema
    if (spec.requestBody?.content?.['application/json']?.schema) {
      return this.generateDataFromSchema(spec.requestBody.content['application/json'].schema);
    }
    
    return '{}';
  }

  generateDataFromSchema(schema) {
    if (schema.properties) {
      const data = {};
      Object.entries(schema.properties).forEach(([key, prop]) => {
        data[key] = this.generateValueForProperty(key, prop);
      });
      return JSON.stringify(data, null, 2);
    }
    
    return '{}';
  }

  generateValueForProperty(key, prop) {
    if (key.includes('name')) return `"Test ${key}"`;
    if (key.includes('email')) return '"test@example.com"';
    if (key.includes('phone') || key.includes('telephone')) return '"123-456-7890"';
    if (key.includes('address')) return '"123 Test Street"';
    if (key.includes('city')) return '"Test City"';
    if (key.includes('description')) return '"Test description"';
    if (key.includes('date')) return '"2024-01-01"';
    
    switch (prop.type) {
      case 'string': return '"test value"';
      case 'integer': return 1;
      case 'number': return 1.0;
      case 'boolean': return true;
      default: return '"test"';
    }
  }

  generateAssertions(spec) {
    const successCode = this.getSuccessStatusCode(spec);
    
    return `
  expect(response.status()).toBe(${successCode});
  
  if (response.status() === 200 || response.status() === 201) {
    const responseData = await response.json();
    expect(responseData).toBeDefined();
    
    ${this.generateResponseValidation(spec)}
  }`;
  }

  getSuccessStatusCode(spec) {
    if (spec.responses) {
      if (spec.responses['201']) return 201;
      if (spec.responses['200']) return 200;
      if (spec.responses['204']) return 204;
    }
    return 200;
  }

  generateResponseValidation(spec) {
    if (spec.responses?.['200']?.content?.['application/json']?.schema) {
      const schema = spec.responses['200'].content['application/json'].schema;
      return this.generateSchemaValidation(schema);
    }
    return '// Response validation';
  }

  generateSchemaValidation(schema) {
    if (schema.type === 'array') {
      return `
    expect(Array.isArray(responseData)).toBeTruthy();
    if (responseData.length > 0) {
      ${this.generateObjectValidation(schema.items)}
    }`;
    } else if (schema.type === 'object') {
      return this.generateObjectValidation(schema);
    }
    
    return '';
  }

  generateObjectValidation(schema) {
    if (!schema.properties) return '';
    
    return Object.keys(schema.properties)
      .map(key => `expect(responseData).toHaveProperty('${key}');`)
      .join('\n    ');
  }

  // Generiere Standard API Tests für PetClinic
  generateBasicApiTests() {
    return `
import { test, expect } from '@playwright/test';

test.describe('PetClinic API Tests', () => {
  const baseURL = 'http://localhost:8080';

  test('GET /api/owners - Alle Besitzer abrufen', async ({ request }) => {
    const response = await request.get('/api/owners');
    
    expect(response.status()).toBe(200);
    
    const owners = await response.json();
    expect(Array.isArray(owners)).toBeTruthy();
    
    if (owners.length > 0) {
      expect(owners[0]).toHaveProperty('id');
      expect(owners[0]).toHaveProperty('firstName');
      expect(owners[0]).toHaveProperty('lastName');
    }
  });

  test('POST /api/owners - Neuen Besitzer erstellen', async ({ request }) => {
    const newOwner = {
      firstName: 'API',
      lastName: 'Test',
      address: '123 API Street',
      city: 'Test City',
      telephone: '123-456-7890'
    };
    
    const response = await request.post('/api/owners', {
      data: newOwner
    });
    
    expect(response.status()).toBe(201);
    
    const createdOwner = await response.json();
    expect(createdOwner.id).toBeDefined();
    expect(createdOwner.firstName).toBe(newOwner.firstName);
  });

  test('GET /api/pettypes - Alle PetTypes abrufen', async ({ request }) => {
    const response = await request.get('/api/pettypes');
    
    expect(response.status()).toBe(200);
    
    const petTypes = await response.json();
    expect(Array.isArray(petTypes)).toBeTruthy();
    
    if (petTypes.length > 0) {
      expect(petTypes[0]).toHaveProperty('id');
      expect(petTypes[0]).toHaveProperty('name');
    }
  });

  test('POST /api/pettypes - Neuen PetType erstellen', async ({ request }) => {
    const newPetType = {
      name: 'API Test Type',
      description: 'Created via API test'
    };
    
    const response = await request.post('/api/pettypes', {
      data: newPetType
    });
    
    expect(response.status()).toBe(201);
    
    const createdPetType = await response.json();
    expect(createdPetType.id).toBeDefined();
    expect(createdPetType.name).toBe(newPetType.name);
  });

  test('GET /api/owners/{id}/pets - Haustiere eines Besitzers', async ({ request }) => {
    // Erst einen Besitzer finden
    const ownersResponse = await request.get('/api/owners');
    const owners = await ownersResponse.json();
    
    if (owners.length > 0) {
      const ownerId = owners[0].id;
      const petsResponse = await request.get(\`/api/owners/\${ownerId}/pets\`);
      
      expect(petsResponse.status()).toBe(200);
      
      const pets = await petsResponse.json();
      expect(Array.isArray(pets)).toBeTruthy();
    }
  });

  test('API Health Check', async ({ request }) => {
    const response = await request.get('/actuator/health');
    
    expect(response.status()).toBe(200);
    
    const health = await response.json();
    expect(health.status).toBe('UP');
  });
});`;
  }

  // Generiere Contract Tests
  generateContractTests() {
    return `
import { test, expect } from '@playwright/test';

test.describe('API Contract Tests', () => {
  test('Owner API Contract', async ({ request }) => {
    const response = await request.get('/api/owners');
    const owners = await response.json();
    
    if (owners.length > 0) {
      const owner = owners[0];
      
      // Verifica Contract
      expect(typeof owner.id).toBe('number');
      expect(typeof owner.firstName).toBe('string');
      expect(typeof owner.lastName).toBe('string');
      expect(typeof owner.address).toBe('string');
      expect(typeof owner.city).toBe('string');
      expect(typeof owner.telephone).toBe('string');
      
      // Optional fields
      if (owner.email) {
        expect(typeof owner.email).toBe('string');
        expect(owner.email).toMatch(/\\S+@\\S+\\.\\S+/);
      }
    }
  });

  test('PetType API Contract', async ({ request }) => {
    const response = await request.get('/api/pettypes');
    const petTypes = await response.json();
    
    if (petTypes.length > 0) {
      const petType = petTypes[0];
      
      expect(typeof petType.id).toBe('number');
      expect(typeof petType.name).toBe('string');
      
      if (petType.description) {
        expect(typeof petType.description).toBe('string');
      }
    }
  });
});`;
  }

  // Generiere Performance Tests
  generatePerformanceTests() {
    return `
import { test, expect } from '@playwright/test';

test.describe('API Performance Tests', () => {
  test('Owners API Response Time', async ({ request }) => {
    const startTime = Date.now();
    
    const response = await request.get('/api/owners');
    
    const responseTime = Date.now() - startTime;
    
    expect(response.status()).toBe(200);
    expect(responseTime).toBeLessThan(1000); // < 1 Sekunde
  });

  test('Bulk Operations Performance', async ({ request }) => {
    const operations = [];
    
    // 10 parallele Requests
    for (let i = 0; i < 10; i++) {
      operations.push(request.get('/api/owners'));
    }
    
    const startTime = Date.now();
    const responses = await Promise.all(operations);
    const totalTime = Date.now() - startTime;
    
    responses.forEach(response => {
      expect(response.status()).toBe(200);
    });
    
    expect(totalTime).toBeLessThan(5000); // < 5 Sekunden für alle
  });
});`;
  }
}

module.exports = ApiTestGenerator;
