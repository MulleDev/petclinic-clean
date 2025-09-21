/**
 * MCP Test Generation Script
 * Verbindet sich mit dem MCP Server um neue Tests zu generieren
 */

const fs = require('fs');
const path = require('path');

const MCP_SERVER_URL = 'http://localhost:3001';

async function generateTestSuite() {
  console.log('🤖 MCP Test Generation gestartet...');
  
  try {
    // 1. MCP Server Health Check
    const healthResponse = await fetch(`${MCP_SERVER_URL}/health`);
    if (!healthResponse.ok) {
      throw new Error('MCP Server nicht erreichbar');
    }
    console.log('✅ MCP Server verbunden');

    // 2. Interactive Test Builder für verschiedene Features
    const features = [
      { type: 'e2e', feature: 'pet-management' },
      { type: 'e2e', feature: 'veterinarian-management' },
      { type: 'user-journey', feature: 'new-owner-registration' }
    ];

    for (const config of features) {
      console.log(`📝 Generiere ${config.type} Tests für ${config.feature}...`);
      
      const response = await fetch(`${MCP_SERVER_URL}/playwright/start-test-builder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      if (response.ok) {
        const testCode = await response.text();
        const fileName = `${config.feature}-${config.type}.spec.ts`;
        const filePath = path.join(__dirname, '..', 'tests', 'e2e', fileName);
        
        // Schreibe generierten Test
        fs.writeFileSync(filePath, testCode);
        console.log(`✅ ${fileName} erstellt`);
      }
    }

    // 3. Cross-Platform Tests generieren
    console.log('📱 Cross-Platform Tests werden generiert...');
    const crossPlatformResponse = await fetch(`${MCP_SERVER_URL}/playwright/generate-cross-platform`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        platforms: ['desktop', 'tablet', 'mobile'],
        testType: 'responsive',
        feature: 'homepage'
      })
    });

    if (crossPlatformResponse.ok) {
      const crossPlatformCode = await crossPlatformResponse.text();
      fs.writeFileSync(
        path.join(__dirname, '..', 'tests', 'mobile', 'responsive-homepage.spec.ts'),
        crossPlatformCode
      );
      console.log('✅ Cross-Platform Tests erstellt');
    }

    // 4. API Tests aus Swagger generieren
    console.log('🌐 API Tests werden aus Swagger generiert...');
    const apiResponse = await fetch(`${MCP_SERVER_URL}/playwright/generate-api-tests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        swaggerUrl: 'http://localhost:8080/v3/api-docs',
        testType: 'contract'
      })
    });

    if (apiResponse.ok) {
      const apiCode = await apiResponse.text();
      fs.writeFileSync(
        path.join(__dirname, '..', 'tests', 'api', 'swagger-generated.spec.ts'),
        apiCode
      );
      console.log('✅ API Tests aus Swagger erstellt');
    }

    console.log('🎉 MCP Test Generation abgeschlossen!');
    console.log('📂 Neue Tests wurden in den entsprechenden Ordnern erstellt');
    console.log('🚀 Führe "npm test" aus, um die Tests zu starten');

  } catch (error) {
    console.error('❌ Fehler bei Test Generation:', error.message);
    console.log('💡 Stelle sicher, dass der MCP Server läuft: npm run mcp:start');
  }
}

// Script ausführen wenn direkt aufgerufen
if (require.main === module) {
  generateTestSuite();
}

module.exports = { generateTestSuite };
