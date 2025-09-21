/**
 * MCP Playwright Integration
 * Verbindung zum MCP Server für AI-powered Test Generation
 */

export class MCPPlaywrightClient {
  private baseUrl: string;
  
  constructor(baseUrl = 'http://localhost:3001') {
    this.baseUrl = baseUrl;
  }

  /**
   * Generiert Tests mit dem Interactive Test Builder
   */
  async generateWithBuilder(testType: 'e2e' | 'visual' | 'api' | 'user-journey', feature: string) {
    const response = await fetch(`${this.baseUrl}/playwright/start-test-builder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ testType, feature })
    });
    return response.json();
  }

  /**
   * Cross-Platform Test Generation
   */
  async generateCrossPlatform(testConfig: {
    platforms: string[];
    testType: string;
    feature: string;
  }) {
    const response = await fetch(`${this.baseUrl}/playwright/generate-cross-platform`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testConfig)
    });
    return response.json();
  }

  /**
   * Visual Tests aus Screenshots generieren
   */
  async generateVisualTests(screenshotConfig: {
    url: string;
    viewports: string[];
    testName: string;
  }) {
    const response = await fetch(`${this.baseUrl}/playwright/generate-visual-tests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(screenshotConfig)
    });
    return response.json();
  }

  /**
   * API Tests aus Swagger generieren
   */
  async generateApiTests(swaggerConfig: {
    swaggerUrl: string;
    testType: 'contract' | 'performance' | 'error-handling';
  }) {
    const response = await fetch(`${this.baseUrl}/playwright/generate-api-tests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(swaggerConfig)
    });
    return response.json();
  }

  /**
   * Test Intelligence für Optimierung
   */
  async analyzeTestIntelligence(testResults: any[]) {
    const response = await fetch(`${this.baseUrl}/playwright/analyze-test-intelligence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ testResults, analysisType: 'optimization' })
    });
    return response.json();
  }

  /**
   * Testdaten generieren
   */
  async generateTestData(dataType: 'owners' | 'pets' | 'visits' | 'petTypes', count: number = 5) {
    const response = await fetch(`${this.baseUrl}/playwright/generate-testdata`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataType, count })
    });
    return response.json();
  }
}

// Export für globale Nutzung
export const mcpClient = new MCPPlaywrightClient();
