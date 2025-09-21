import { FullConfig } from '@playwright/test';
import { mcpClient } from '../helpers/mcp-client';

/**
 * Global Setup für MCP Playwright Integration
 * Initialisiert Test-Umgebung und MCP Server Verbindung
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 MCP Playwright Setup startet...');
  
  try {
    // 1. MCP Server Verbindung testen
    const health = await fetch('http://localhost:3001/health');
    if (!health.ok) {
      console.warn('⚠️  MCP Server nicht erreichbar - Tests laufen im Standard-Modus');
      return;
    }
    
    console.log('✅ MCP Server verbunden');
    
    // 2. Test-Datenbank vorbereiten
    console.log('📊 Testdaten werden vorbereitet...');
    await mcpClient.generateTestData('owners', 3);
    await mcpClient.generateTestData('pets', 5);
    await mcpClient.generateTestData('petTypes', 2);
    
    // 3. Visual Testing Baseline erstellen
    console.log('📸 Visual Testing Baseline wird erstellt...');
    await mcpClient.generateVisualTests({
      url: 'http://localhost:8080',
      viewports: ['desktop', 'tablet', 'mobile'],
      testName: 'homepage-baseline'
    });
    
    console.log('✅ MCP Playwright Setup abgeschlossen');
    
  } catch (error) {
    console.warn('⚠️  MCP Setup Fehler:', error);
    console.log('🔄 Tests laufen im Standard-Modus');
  }
}

export default globalSetup;
