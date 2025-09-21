import { FullConfig } from '@playwright/test';

/**
 * Global Teardown für MCP Playwright Integration
 * Cleanup nach Test-Ausführung
 */
async function globalTeardown(config: FullConfig) {
  console.log('🧹 MCP Playwright Cleanup startet...');
  
  try {
    // Test-Ergebnisse an MCP Server senden für Analyse
    const testResultsPath = './test-results/test-results.json';
    
    // Wenn Test-Ergebnisse vorhanden sind, analysieren
    try {
      const fs = await import('fs');
      if (fs.existsSync(testResultsPath)) {
        const testResults = JSON.parse(fs.readFileSync(testResultsPath, 'utf8'));
        
        // Test Intelligence für zukünftige Optimierungen
        await fetch('http://localhost:3001/playwright/analyze-test-intelligence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            testResults,
            analysisType: 'post-execution',
            timestamp: new Date().toISOString()
          })
        });
        
        console.log('📊 Test-Ergebnisse an MCP Server gesendet');
      }
    } catch (analysisError) {
      console.log('ℹ️  Test-Analyse übersprungen');
    }
    
    console.log('✅ MCP Playwright Cleanup abgeschlossen');
    
  } catch (error) {
    console.warn('⚠️  Cleanup Fehler:', error);
  }
}

export default globalTeardown;
