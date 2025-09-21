# MCP Playwright Server - Konzept & Implementierung

## Übersicht
Ein MCP Server, der Playwright-Tests automatisch ausführt, überwacht und die Ergebnisse direkt in Jira-Tickets umwandelt.

## Core Features

### 1. Test-Ausführung
- Tests über API starten
- Verschiedene Browser (Chrome, Firefox, Safari)
- Headless/Headed Modus
- Parallelisierung
- Specific Test-Suites oder einzelne Tests

### 2. Automatische Jira-Integration
- Failed Tests → Automatische Bug-Tickets
- Test-Reports → Jira-Kommentare
- Screenshots/Videos → Jira-Attachments
- Test-Coverage → Dashboard-Updates

### 3. Real-time Monitoring
- Live Test-Status
- Fortschritts-Updates
- Sofortige Benachrichtigungen bei Failures

### 4. Intelligente Failure-Analyse
- Screenshot-Vergleich
- Error-Kategorisierung
- Flaky-Test-Detection
- Root-Cause-Analysis

## Architektur

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   LLM/BA Chat   │ ←→ │ MCP Playwright   │ ←→ │ Playwright Tests│
│                 │    │     Server       │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ↓
                       ┌──────────────────┐
                       │   MCP Jira       │
                       │    Server        │
                       └──────────────────┘
                                │
                                ↓
                       ┌──────────────────┐
                       │      Jira        │
                       │    (PET-Projekt) │
                       └──────────────────┘
```

## API Endpoints

### Test-Ausführung
```
POST /playwright/run-tests
POST /playwright/run-suite/:suite
POST /playwright/run-single/:testName
GET  /playwright/status/:runId
GET  /playwright/results/:runId
```

### Monitoring
```
GET  /playwright/active-runs
GET  /playwright/history
GET  /playwright/flaky-tests
```

### Jira-Integration
```
POST /playwright/create-bug-ticket
POST /playwright/update-test-status
GET  /playwright/test-coverage
```

## Implementierung

### 1. Basis-Server (Express + Playwright)
```javascript
const express = require('express');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001; // Anderer Port als Jira-MCP

// Test-Ausführung
app.post('/playwright/run-tests', async (req, res) => {
  const { suite, browser, headless, parallel } = req.body;
  
  const runId = generateRunId();
  const testProcess = startPlaywrightTests({
    suite, browser, headless, parallel, runId
  });
  
  res.json({ runId, status: 'started' });
});
```

### 2. Automatische Bug-Ticket-Erstellung
```javascript
async function createBugTicketFromFailure(testResult) {
  const ticket = await fetch('http://localhost:3000/create-from-template', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      templateId: 'playwright-test-failure',
      replacements: {
        test_name: testResult.testName,
        error_message: testResult.error,
        browser: testResult.browser,
        screenshot: testResult.screenshot,
        test_file: testResult.file
      }
    })
  });
  
  return ticket.json();
}
```

### 3. Real-time Updates
```javascript
// WebSocket für Live-Updates
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 3002 });

function broadcastTestUpdate(testUpdate) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(testUpdate));
    }
  });
}
```

## Neue Jira-Templates

### Playwright Test Failure Template
```javascript
'playwright-test-failure': {
  name: 'Playwright Test Failure',
  issueType: 'Bug',
  priority: 'High',
  summary: 'Test Failure: [TEST_NAME] - [BROWSER]',
  description: `**🧪 Test Failure Report**

**📋 Test Details:**
- Test Name: [TEST_NAME]
- Test File: [TEST_FILE]
- Browser: [BROWSER]
- Execution Time: [EXECUTION_TIME]

**❌ Failure Details:**
\`\`\`
[ERROR_MESSAGE]
\`\`\`

**📷 Screenshot:**
[SCREENSHOT]

**🔄 Reproduktion:**
1. Führe Test aus: \`npx playwright test [TEST_FILE]\`
2. Verwende Browser: [BROWSER]
3. Prüfe auf: [ERROR_CONDITION]

**🌐 Test-Umgebung:**
- Node.js Version: [NODE_VERSION]
- Playwright Version: [PLAYWRIGHT_VERSION]
- Test URL: [TEST_URL]

**📊 Test-History:**
- Letzte 5 Läufe: [RECENT_RESULTS]
- Flaky-Status: [FLAKY_STATUS]`,
  labels: ['playwright', 'test-failure', 'automation']
}
```

### Test Suite Report Template
```javascript
'playwright-suite-report': {
  name: 'Playwright Suite Report',
  issueType: 'Aufgabe',
  priority: 'Medium',
  summary: 'Test Suite Report: [SUITE_NAME] - [PASS_RATE]%',
  description: `**📊 Test Suite Execution Report**

**📋 Suite Details:**
- Suite Name: [SUITE_NAME]
- Execution Date: [EXECUTION_DATE]
- Total Tests: [TOTAL_TESTS]
- Passed: [PASSED_TESTS]
- Failed: [FAILED_TESTS]
- Skipped: [SKIPPED_TESTS]
- Pass Rate: [PASS_RATE]%

**⏱️ Performance:**
- Total Duration: [TOTAL_DURATION]
- Average Test Time: [AVG_TEST_TIME]
- Slowest Test: [SLOWEST_TEST]

**❌ Failed Tests:**
[FAILED_TEST_LIST]

**🏷️ Labels:** [SUITE_LABELS]`,
  labels: ['playwright', 'test-report', 'automation']
}
```

## Intelligente Features

### 1. Flaky Test Detection
```javascript
async function analyzeTestStability(testName) {
  const history = await getTestHistory(testName);
  const failureRate = calculateFailureRate(history);
  
  if (failureRate > 0.2) { // 20% Failure-Rate
    await createJiraTicket({
      templateId: 'flaky-test-investigation',
      replacements: {
        test_name: testName,
        failure_rate: `${failureRate * 100}%`,
        recent_failures: history.recentFailures
      }
    });
  }
}
```

### 2. Smart Bug Grouping
```javascript
async function groupSimilarFailures(newFailure) {
  const existingBugs = await searchJiraTickets({
    labels: ['playwright', 'test-failure'],
    status: 'Open'
  });
  
  const similarBug = findSimilarError(newFailure, existingBugs);
  
  if (similarBug) {
    await addCommentToTicket(similarBug.key, newFailure);
    return similarBug;
  } else {
    return await createNewBugTicket(newFailure);
  }
}
```

### 3. Performance Monitoring
```javascript
async function monitorTestPerformance(testResults) {
  const slowTests = testResults.filter(test => test.duration > 30000); // > 30s
  
  if (slowTests.length > 0) {
    await createJiraTicket({
      templateId: 'performance-investigation',
      replacements: {
        slow_tests: slowTests.map(t => t.name).join(', '),
        avg_duration: calculateAverage(slowTests.map(t => t.duration))
      }
    });
  }
}
```

## BA-Integration

### Chat-Commands für BA
```
/playwright run-suite owner-management
/playwright run-test "add new owner"
/playwright status
/playwright report last-24h
/playwright flaky-tests
/playwright coverage
```

### Automatische Workflows
```javascript
// Automatischer Test-Lauf nach Code-Changes
app.post('/playwright/trigger-ci', async (req, res) => {
  const { branch, changedFiles } = req.body;
  
  // Erkenne betroffene Test-Suites
  const affectedSuites = detectAffectedSuites(changedFiles);
  
  // Führe relevante Tests aus
  const results = await runTestSuites(affectedSuites);
  
  // Erstelle Jira-Updates
  await updateJiraWithResults(results);
  
  res.json({ results, jiraTickets: results.createdTickets });
});
```

## Dashboard Integration

### Test-Status-Dashboard
```javascript
app.get('/playwright/dashboard', async (req, res) => {
  const data = {
    currentRuns: await getActiveTestRuns(),
    todayStats: await getTodayTestStats(),
    flakyTests: await getFlakyTests(),
    coverage: await getTestCoverage(),
    recentFailures: await getRecentFailures()
  };
  
  res.json(data);
});
```

## Deployment & Setup

### 1. Package.json
```json
{
  "name": "mcp-playwright-server",
  "dependencies": {
    "express": "^4.18.2",
    "ws": "^8.14.2",
    "@playwright/test": "^1.40.0",
    "axios": "^1.6.0"
  },
  "scripts": {
    "start": "node index.js",
    "test": "playwright test"
  }
}
```

### 2. Docker Integration
```dockerfile
FROM mcr.microsoft.com/playwright:v1.40.0-focal

WORKDIR /app
COPY . .
RUN npm install

EXPOSE 3001 3002

CMD ["npm", "start"]
```

## Next Steps

### Phase 1 (Grundfunktionen)
- [ ] Basis-Server Setup
- [ ] Test-Ausführung API
- [ ] Jira-Integration für Failures
- [ ] Screenshot-Handling

### Phase 2 (Intelligence)
- [ ] Flaky-Test-Detection
- [ ] Performance-Monitoring
- [ ] Smart Bug-Grouping
- [ ] Real-time Updates

### Phase 3 (Advanced)
- [ ] Visual Regression Testing
- [ ] AI-powered Error Analysis
- [ ] Predictive Test Selection
- [ ] Auto-healing Tests

## Vorteile

✅ **Automatisierte Test-Überwachung**
✅ **Sofortige Bug-Dokumentation**
✅ **Intelligente Failure-Analyse**
✅ **Nahtlose Jira-Integration**
✅ **Real-time Status-Updates**
✅ **Performance-Insights**
✅ **Reduced Manual Overhead**
