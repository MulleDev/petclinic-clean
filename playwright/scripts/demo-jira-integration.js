const axios = require('axios');

/**
 * Demo Script für JIRA Integration
 * Zeigt wie Tests automatisch JIRA Tickets erstellen
 */

async function demoJiraIntegration() {
  console.log('🚀 Demo: Playwright Tests mit JIRA Integration\n');

  // Simuliere verschiedene Test-Szenarien
  const testResults = [
    {
      name: 'GET /owners - Liste der Besitzer abrufen',
      status: 'passed',
      duration: 245,
      file: 'tests/api/petclinic-api.spec.ts'
    },
    {
      name: 'POST /owners - Neuen Besitzer erstellen',
      status: 'passed',
      duration: 189,
      file: 'tests/api/petclinic-api.spec.ts'
    },
    {
      name: 'GET /pettypes - Pet Types abrufen',
      status: 'failed',
      duration: 2345,
      error: 'Request timeout after 2000ms',
      file: 'tests/api/petclinic-api.spec.ts'
    },
    {
      name: 'API Performance Test',
      status: 'passed',
      duration: 1567,
      file: 'tests/api/petclinic-api.spec.ts'
    }
  ];

  console.log('📊 Test Execution Summary:');
  console.log(`   Total Tests: ${testResults.length}`);
  console.log(`   ✅ Passed: ${testResults.filter(t => t.status === 'passed').length}`);
  console.log(`   ❌ Failed: ${testResults.filter(t => t.status === 'failed').length}`);
  console.log(`   🎯 Pass Rate: ${(testResults.filter(t => t.status === 'passed').length / testResults.length * 100).toFixed(1)}%\n`);

  // Zeige was in JIRA erstellt werden würde
  console.log('📋 JIRA Integration Preview:\n');

  // Test Suite Report
  console.log('1️⃣ Test Suite Report Ticket:');
  console.log('   Title: "Playwright Test Report - 2025-08-04 12:43:15"');
  console.log('   Type: Task');
  console.log('   Priority: Medium');
  console.log('   Description: Vollständiger Test-Bericht mit allen Details\n');

  // Failure Tickets
  const failedTests = testResults.filter(t => t.status === 'failed');
  if (failedTests.length > 0) {
    console.log('2️⃣ Test Failure Tickets:');
    failedTests.forEach((test, index) => {
      console.log(`   🐛 Ticket ${index + 1}:`);
      console.log(`      Title: "Test Failure: ${test.name}"`);
      console.log(`      Type: Bug`);
      console.log(`      Priority: High`);
      console.log(`      Error: "${test.error}"`);
      console.log(`      File: ${test.file}\n`);
    });
  }

  console.log('🔗 JIRA URLs (when ready):');
  console.log('   📋 JIRA Dashboard: http://localhost:8081');
  console.log('   🔧 JIRA Setup: http://localhost:8081/secure/SetupMode!default.jspa');
  console.log('   🎫 Tickets: http://localhost:8081/projects/TEST/issues\n');

  console.log('📝 Next Steps:');
  console.log('   1. Complete JIRA setup at http://localhost:8081');
  console.log('   2. Create TEST project in JIRA');
  console.log('   3. Run: npm test (tests will auto-create JIRA tickets)');
  console.log('   4. View tickets in JIRA dashboard\n');

  console.log('🎯 Features der JIRA Integration:');
  console.log('   ✅ Automatische Test-Reports');
  console.log('   🐛 Failure Tracking');
  console.log('   📊 Performance Monitoring');
  console.log('   🔄 Flaky Test Detection');
  console.log('   📈 Trend Analysis\n');

  // Versuche MCP Server zu erreichen
  try {
    const response = await axios.get('http://localhost:3000/health');
    console.log('✅ JIRA MCP Server: Online');
    console.log(`   Status: ${response.data.message}`);
  } catch (error) {
    console.log('❌ JIRA MCP Server: Offline');
  }

  // Teste JIRA Erreichbarkeit
  try {
    const jiraResponse = await axios.get('http://localhost:8081/status');
    console.log('🏥 JIRA Server: Online');
    console.log(`   Status: ${jiraResponse.data.state}`);
    if (jiraResponse.data.state === 'FIRST_RUN') {
      console.log('   ⚠️  JIRA needs initial setup');
    }
  } catch (error) {
    console.log('❌ JIRA Server: Offline');
  }
}

// Run demo
demoJiraIntegration().catch(console.error);
