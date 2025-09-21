const express = require('express');
const cors = require('cors');
const axios = require('axios');
const WebSocket = require('ws');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Neue Module
const TestDataManager = require('./test-data-manager');
const VisualTestGenerator = require('./visual-test-generator');
const ApiTestGenerator = require('./api-test-generator');
const TestIntelligence = require('./test-intelligence');
const InteractiveTestBuilder = require('./interactive-test-builder');
const CrossPlatformTestGenerator = require('./cross-platform-generator');
const TestAnalytics = require('./test-analytics');

const app = express();
const PORT = process.env.PLAYWRIGHT_PORT || 3001;
const WS_PORT = process.env.WEBSOCKET_PORT || 3002;
const JIRA_MCP_URL = process.env.JIRA_MCP_URL || 'http://localhost:3000';

// Initialize new modules
const testDataManager = new TestDataManager();
const visualTestGenerator = new VisualTestGenerator();
const apiTestGenerator = new ApiTestGenerator();
const testIntelligence = new TestIntelligence();
const interactiveTestBuilder = new InteractiveTestBuilder();
const crossPlatformGenerator = new CrossPlatformTestGenerator();
const testAnalytics = new TestAnalytics();

// Middleware
app.use(cors());
app.use(express.json());

// WebSocket Server für Real-time Updates
const wss = new WebSocket.Server({ port: WS_PORT });

// In-Memory Storage für Test-Läufe
const activeRuns = new Map();
const testHistory = new Map();
const flakyTests = new Set();

// Utility Functions
function generateRunId() {
  return uuidv4();
}

function broadcastUpdate(data) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

function logTestEvent(runId, event, data = {}) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${runId}] ${event}:`, data);
  
  broadcastUpdate({
    type: 'test-event',
    runId,
    event,
    data,
    timestamp
  });
}

// Jira Integration Functions
async function createJiraTicketFromFailure(testResult) {
  try {
    const response = await axios.post(`${JIRA_MCP_URL}/create-from-template`, {
      templateId: 'playwright-test-failure',
      replacements: {
        test_name: testResult.testName || 'Unknown Test',
        test_file: testResult.testFile || 'Unknown File',
        browser: testResult.browser || 'chromium',
        error_message: testResult.error || 'No error message available',
        screenshot: testResult.screenshot || 'Kein Screenshot verfügbar',
        execution_time: formatDuration(testResult.duration) || 'Unbekannt',
        node_version: process.version,
        playwright_version: getPlaywrightVersion(),
        test_url: testResult.testUrl || 'http://localhost:8080',
        recent_results: 'Wird analysiert...',
        flaky_status: flakyTests.has(testResult.testName) ? 'FLAKY' : 'STABLE',
        run_id: testResult.runId || 'Unknown',
        petclinic_version: '3.5.0',
        success_rate: calculateSuccessRate(testResult.testName),
        error_condition: extractErrorCondition(testResult.error)
      }
    });
    
    logTestEvent(testResult.runId, 'jira-ticket-created', {
      ticket: response.data.key,
      testName: testResult.testName
    });
    
    return response.data;
  } catch (error) {
    console.error('Fehler beim Erstellen des Jira-Tickets:', error.message);
    return null;
  }
}

function extractErrorCondition(errorMessage) {
  if (!errorMessage) return 'Unbekannter Fehler';
  
  // Extrahiere häufige Playwright-Fehler-Patterns
  if (errorMessage.includes('Timeout')) return 'Element-Timeout';
  if (errorMessage.includes('not found')) return 'Element nicht gefunden';
  if (errorMessage.includes('not visible')) return 'Element nicht sichtbar';
  if (errorMessage.includes('not attached')) return 'Element nicht im DOM';
  if (errorMessage.includes('network')) return 'Netzwerk-Fehler';
  
  return 'Allgemeiner Test-Fehler';
}

function calculateSuccessRate(testName) {
  const recentRuns = Array.from(testHistory.values())
    .filter(run => run.timestamp > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) // Letzte 7 Tage
    .flatMap(run => run.results?.tests || [])
    .filter(test => test.testName === testName);
  
  if (recentRuns.length === 0) return 'Neue Tests';
  
  const successfulRuns = recentRuns.filter(test => test.status === 'passed').length;
  const successRate = ((successfulRuns / recentRuns.length) * 100).toFixed(1);
  
  return `${successRate}% (${successfulRuns}/${recentRuns.length})`;
}

async function createSuiteReport(suiteResult) {
  try {
    const passRate = ((suiteResult.passed / suiteResult.total) * 100).toFixed(1);
    
    const response = await axios.post(`${JIRA_MCP_URL}/create-from-template`, {
      templateId: 'playwright-suite-report',
      replacements: {
        suite_name: suiteResult.suiteName,
        execution_date: new Date().toLocaleString('de-DE'),
        total_tests: suiteResult.total.toString(),
        passed_tests: suiteResult.passed.toString(),
        failed_tests: suiteResult.failed.toString(),
        skipped_tests: suiteResult.skipped.toString(),
        pass_rate: passRate,
        total_duration: formatDuration(suiteResult.duration),
        avg_test_time: formatDuration(suiteResult.avgTestTime),
        slowest_test: suiteResult.slowestTest || 'Nicht verfügbar',
        failed_test_list: suiteResult.failedTests.join('\n- ') || 'Keine',
        suite_labels: suiteResult.labels?.join(', ') || 'playwright, automation'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Fehler beim Erstellen des Suite-Reports:', error.message);
    return null;
  }
}

function getPlaywrightVersion() {
  try {
    const packagePath = path.join(__dirname, 'node_modules', '@playwright', 'test', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    return packageJson.version;
  } catch {
    return 'Unbekannt';
  }
}

function formatDuration(ms) {
  if (!ms) return 'Unbekannt';
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  return minutes > 0 ? `${minutes}m ${seconds % 60}s` : `${seconds}s`;
}

// Test Execution Functions
async function runPlaywrightTests(options) {
  const { suite, browser, headless = true, parallel = true, runId } = options;
  
  const playwrightPath = path.join(__dirname, '..', 'playwright');
  const configPath = path.join(playwrightPath, 'playwright.config.ts');
  
  let command = 'npx';
  let args = ['playwright', 'test'];
  
  // Browser-spezifische Optionen
  if (browser && browser !== 'all') {
    args.push('--project', browser);
  }
  
  // Headless/Headed Modus
  if (!headless) {
    args.push('--headed');
  }
  
  // Suite-spezifische Tests
  if (suite && suite !== 'all') {
    // Erkenne verschiedene Suite-Patterns
    if (suite === 'pet-types') {
      args.push('tests/**/pet-type*.spec.ts');
    } else if (suite === 'owners') {
      args.push('tests/**/owner*.spec.ts');
    } else if (suite === 'pets') {
      args.push('tests/**/pet*.spec.ts');
    } else if (suite === 'visits') {
      args.push('tests/**/visit*.spec.ts');
    } else {
      args.push(`tests/**/*${suite}*.spec.ts`);
    }
  }
  
  // Parallelisierung
  if (!parallel) {
    args.push('--workers', '1');
  }
  
  // JSON Reporter für maschinelle Auswertung
  args.push('--reporter', 'json');
  
  logTestEvent(runId, 'test-execution-started', { command, args, options });
  
  return new Promise((resolve) => {
    const testProcess = spawn(command, args, {
      cwd: playwrightPath,
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true // Wichtig für Windows
    });
    
    let output = '';
    let errorOutput = '';
    
    testProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    testProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    testProcess.on('close', (code) => {
      const endTime = new Date();
      
      try {
        const results = parseTestResults(output, runId, options);
        
        logTestEvent(runId, 'test-execution-completed', {
          exitCode: code,
          results: results.summary
        });
        
        // Verarbeite Ergebnisse
        processTestResults(results, runId);
        
        resolve({
          success: code === 0,
          exitCode: code,
          results,
          output,
          errorOutput
        });
      } catch (error) {
        console.error('Fehler beim Parsen der Test-Ergebnisse:', error);
        resolve({
          success: false,
          exitCode: code,
          error: error.message,
          output,
          errorOutput
        });
      }
    });
    
    testProcess.on('error', (error) => {
      console.error('Fehler beim Starten des Test-Prozesses:', error);
      resolve({
        success: false,
        error: error.message,
        output,
        errorOutput
      });
    });
    
    // Speichere Prozess-Referenz
    activeRuns.set(runId, {
      process: testProcess,
      startTime: new Date(),
      options,
      status: 'running'
    });
  });
}

function parseTestResults(jsonOutput, runId, options) {
  try {
    // Versuche JSON-Output zu parsen
    const results = JSON.parse(jsonOutput);
    
    const summary = {
      total: results.stats?.total || 0,
      passed: results.stats?.passed || 0,
      failed: results.stats?.failed || 0,
      skipped: results.stats?.skipped || 0,
      duration: results.stats?.duration || 0
    };
    
    const testResults = [];
    
    if (results.suites) {
      results.suites.forEach(suite => {
        suite.specs?.forEach(spec => {
          spec.tests?.forEach(test => {
            test.results?.forEach(result => {
              testResults.push({
                runId,
                testName: `${spec.title} - ${test.title}`,
                testFile: spec.file,
                status: result.status,
                duration: result.duration,
                error: result.error?.message,
                browser: options.browser || 'chromium',
                screenshot: result.attachments?.find(a => a.name === 'screenshot')?.path
              });
            });
          });
        });
      });
    }
    
    return {
      summary,
      tests: testResults,
      raw: results
    };
  } catch (error) {
    console.warn('Konnte JSON-Output nicht parsen, verwende Fallback:', error.message);
    
    // Fallback: Einfache Text-Analyse
    const lines = jsonOutput.split('\n');
    const passedMatch = jsonOutput.match(/(\d+) passed/);
    const failedMatch = jsonOutput.match(/(\d+) failed/);
    
    return {
      summary: {
        total: (passedMatch ? parseInt(passedMatch[1]) : 0) + (failedMatch ? parseInt(failedMatch[1]) : 0),
        passed: passedMatch ? parseInt(passedMatch[1]) : 0,
        failed: failedMatch ? parseInt(failedMatch[1]) : 0,
        skipped: 0,
        duration: 0
      },
      tests: [],
      raw: { fallback: true, output: jsonOutput }
    };
  }
}

async function processTestResults(results, runId) {
  const { summary, tests } = results;
  
  // Verarbeite failed Tests
  const failedTests = tests.filter(test => test.status === 'failed');
  
  for (const failedTest of failedTests) {
    // Prüfe auf Flaky Tests
    analyzeTestStability(failedTest.testName);
    
    // Erstelle Jira-Ticket für Failure
    await createJiraTicketFromFailure(failedTest);
  }
  
  // Erstelle Suite-Report wenn alle Tests abgeschlossen
  if (summary.total > 0) {
    const suiteResult = {
      suiteName: activeRuns.get(runId)?.options?.suite || 'All Tests',
      total: summary.total,
      passed: summary.passed,
      failed: summary.failed,
      skipped: summary.skipped,
      duration: summary.duration,
      avgTestTime: summary.duration / summary.total,
      slowestTest: findSlowestTest(tests),
      failedTests: failedTests.map(t => t.testName),
      labels: ['playwright', 'automation']
    };
    
    await createSuiteReport(suiteResult);
  }
  
  // Speichere in History
  testHistory.set(runId, {
    timestamp: new Date(),
    results,
    options: activeRuns.get(runId)?.options
  });
  
  // Update Active Run Status
  if (activeRuns.has(runId)) {
    activeRuns.get(runId).status = 'completed';
    activeRuns.get(runId).results = results;
  }
}

function analyzeTestStability(testName) {
  // Einfache Flaky-Test-Detection
  const recentRuns = Array.from(testHistory.values())
    .filter(run => run.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000)) // Letzte 24h
    .flatMap(run => run.results.tests)
    .filter(test => test.testName === testName);
  
  if (recentRuns.length >= 3) {
    const failureRate = recentRuns.filter(test => test.status === 'failed').length / recentRuns.length;
    
    if (failureRate > 0.2 && failureRate < 0.8) { // 20-80% Failure-Rate = Flaky
      flakyTests.add(testName);
      logTestEvent('system', 'flaky-test-detected', { testName, failureRate });
    }
  }
}

function findSlowestTest(tests) {
  return tests.reduce((slowest, test) => {
    return (!slowest || test.duration > slowest.duration) ? test : slowest;
  }, null)?.testName;
}

// REST API Endpoints

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'MCP Playwright Server',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    activeRuns: activeRuns.size,
    flakyTests: flakyTests.size
  });
});

// Test-Ausführung
app.post('/playwright/run-tests', async (req, res) => {
  const { suite, browser, headless, parallel } = req.body;
  const runId = generateRunId();
  
  try {
    logTestEvent(runId, 'test-run-requested', req.body);
    
    // Starte Tests asynchron
    runPlaywrightTests({
      suite,
      browser,
      headless: headless !== false,
      parallel: parallel !== false,
      runId
    });
    
    res.json({
      success: true,
      runId,
      status: 'started',
      message: 'Tests gestartet',
      websocket: `ws://localhost:${WS_PORT}` // Für Real-time Updates
    });
    
  } catch (error) {
    console.error('Fehler beim Starten der Tests:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Spezifische Suite ausführen
app.post('/playwright/run-suite/:suite', async (req, res) => {
  const { suite } = req.params;
  const { browser, headless, parallel } = req.body;
  const runId = generateRunId();
  
  try {
    runPlaywrightTests({
      suite,
      browser,
      headless: headless !== false,
      parallel: parallel !== false,
      runId
    });
    
    res.json({
      success: true,
      runId,
      suite,
      status: 'started'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test-Status abrufen
app.get('/playwright/status/:runId', (req, res) => {
  const { runId } = req.params;
  const run = activeRuns.get(runId);
  
  if (!run) {
    // Prüfe History
    const historyEntry = testHistory.get(runId);
    if (historyEntry) {
      return res.json({
        runId,
        status: 'completed',
        results: historyEntry.results.summary,
        timestamp: historyEntry.timestamp
      });
    }
    
    return res.status(404).json({
      success: false,
      error: 'Test-Lauf nicht gefunden'
    });
  }
  
  res.json({
    runId,
    status: run.status,
    startTime: run.startTime,
    options: run.options,
    results: run.results?.summary
  });
});

// Test-Ergebnisse abrufen
app.get('/playwright/results/:runId', (req, res) => {
  const { runId } = req.params;
  
  // Prüfe aktive Läufe
  const activeRun = activeRuns.get(runId);
  if (activeRun?.results) {
    return res.json({
      runId,
      status: 'completed',
      results: activeRun.results
    });
  }
  
  // Prüfe History
  const historyEntry = testHistory.get(runId);
  if (historyEntry) {
    return res.json({
      runId,
      status: 'completed',
      results: historyEntry.results,
      timestamp: historyEntry.timestamp
    });
  }
  
  res.status(404).json({
    success: false,
    error: 'Test-Ergebnisse nicht gefunden'
  });
});

// Aktive Test-Läufe
app.get('/playwright/active-runs', (req, res) => {
  const runs = Array.from(activeRuns.entries()).map(([runId, run]) => ({
    runId,
    status: run.status,
    startTime: run.startTime,
    options: run.options,
    summary: run.results?.summary
  }));
  
  res.json({
    activeRuns: runs,
    total: runs.length
  });
});

// Flaky Tests abrufen
app.get('/playwright/flaky-tests', (req, res) => {
  res.json({
    flakyTests: Array.from(flakyTests),
    total: flakyTests.size
  });
});

// Test-History
app.get('/playwright/history', (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const history = Array.from(testHistory.entries())
    .map(([runId, entry]) => ({
      runId,
      timestamp: entry.timestamp,
      summary: entry.results.summary,
      options: entry.options
    }))
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, limit);
  
  res.json({
    history,
    total: testHistory.size
  });
});

// Manuelles Bug-Ticket erstellen
app.post('/playwright/create-bug-ticket', async (req, res) => {
  const { testName, error, browser, screenshot } = req.body;
  
  try {
    const ticket = await createJiraTicketFromFailure({
      testName,
      error,
      browser,
      screenshot,
      runId: 'manual'
    });
    
    res.json({
      success: true,
      ticket
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// === ERWEITERTE POM & TEST GENERATION ENDPOINTS ===

// POM Enhancement - Analysiere bestehende POMs
app.post('/playwright/enhance-pom', async (req, res) => {
  const { file, pomFile, enhancementType } = req.body;
  const targetFile = file || pomFile;
  
  try {
    const pomPath = path.resolve(targetFile);
    
    if (!fs.existsSync(pomPath)) {
      return res.status(404).json({
        success: false,
        error: `POM file nicht gefunden: ${targetFile}`
      });
    }
    
    const pomContent = fs.readFileSync(pomPath, 'utf8');
    const enhancement = await analyzePomAndSuggestEnhancements(pomContent, enhancementType);
    
    res.json({
      success: true,
      pomFile: targetFile,
      currentStructure: enhancement.analysis,
      suggestions: enhancement.suggestions,
      enhancedCode: enhancement.enhancedCode
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test-Generierung für bestehende Features
app.post('/playwright/generate-test-for-feature', async (req, res) => {
  const { feature, story, acceptanceCriteria, existingPoms } = req.body;
  
  try {
    const generatedTest = await generateTestFromFeature({
      feature,
      story,
      acceptanceCriteria,
      existingPoms
    });
    
    res.json({
      success: true,
      feature,
      generatedTest,
      testFile: `${feature}.spec.ts`,
      requiredPoms: existingPoms
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Testdaten-Generierung für PetClinic Features
app.post('/playwright/generate-testdata', async (req, res) => {
  const { feature, count = 5, realistic = true } = req.body;
  
  try {
    const testData = await generatePetClinicTestData(feature, count, realistic);
    
    res.json({
      success: true,
      feature,
      testData: testData.data,
      setupScript: testData.setupScript,
      cleanupScript: testData.cleanupScript,
      usage: testData.usage
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test-Qualitäts-Analyse
app.post('/playwright/analyze-test-quality', async (req, res) => {
  const { testFile } = req.body;
  
  try {
    const testPath = path.join(__dirname, '..', 'playwright', 'tests', testFile);
    
    if (!fs.existsSync(testPath)) {
      return res.status(404).json({
        success: false,
        error: `Test file nicht gefunden: ${testFile}`
      });
    }
    
    const testContent = fs.readFileSync(testPath, 'utf8');
    const analysis = await analyzeTestQuality(testContent);
    
    res.json({
      success: true,
      testFile,
      qualityScore: analysis.score,
      issues: analysis.issues,
      suggestions: analysis.suggestions,
      metrics: analysis.metrics
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POM-basierte Test-Abdeckungs-Analyse
app.get('/playwright/coverage-analysis', async (req, res) => {
  try {
    const coverage = await analyzePomTestCoverage();
    
    res.json({
      success: true,
      coverage: coverage.current,
      missingTests: coverage.missing,
      recommendations: coverage.recommendations,
      pomUsage: coverage.pomUsage
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// === HELPER FUNCTIONS ===

async function analyzePomAndSuggestEnhancements(pomContent, enhancementType) {
  // Analysiere bestehende POM-Struktur
  const analysis = {
    hasDataPwSelectors: pomContent.includes('[data-pw='),
    hasPrivateGetters: pomContent.includes('private get'),
    hasTypeScript: pomContent.includes(': Page'),
    locatorCount: (pomContent.match(/locator\(/g) || []).length,
    methodCount: (pomContent.match(/async \w+\(/g) || []).length
  };
  
  const suggestions = [];
  let enhancedCode = '';
  
  // Basierend auf Enhancement-Type
  switch (enhancementType) {
    case 'add-missing-methods':
      suggestions.push({
        type: 'bulk-operations',
        description: 'Bulk-Operationen für Test-Setup hinzufügen',
        code: generateBulkOperationsCode(pomContent)
      });
      
      suggestions.push({
        type: 'validation-helpers',
        description: 'Erweiterte Validierungs-Methoden',
        code: generateValidationHelpersCode(pomContent)
      });
      
      suggestions.push({
        type: 'waiting-strategy',
        description: 'Verbesserte Warteschleifen',
        code: generateWaitingStrategyCode(pomContent)
      });
      break;
      
    case 'improve-selectors':
      suggestions.push({
        type: 'selector-analysis',
        description: 'Selector-Verbesserungen',
        analysis: analyzeSelectorQuality(pomContent)
      });
      break;
      
    case 'add-bulk-operations':
      suggestions.push({
        type: 'bulk-methods',
        description: 'Bulk-Operationen',
        code: generateBulkOperationsCode(pomContent)
      });
      break;
  }
  
  return {
    analysis,
    suggestions,
    enhancedCode
  };
}

function generateBulkOperationsCode(pomContent) {
  // Erkenne POM-Typ basierend auf Inhalt
  if (pomContent.includes('PetTypePage')) {
    return `
  // Bulk-Operationen für PetTypes
  async addMultiplePetTypes(petTypes: Array<{name: string, desc: string}>) {
    for (const petType of petTypes) {
      await this.addPetType(petType.name, petType.desc);
      await this.waitForTableUpdate();
    }
  }
  
  async deleteAllTestPetTypes() {
    const testRows = this.page.locator('#petTypesTbody tr').filter({ hasText: 'Test' });
    const count = await testRows.count();
    
    for (let i = 0; i < count; i++) {
      const row = testRows.first();
      const deleteButton = row.locator('[data-pw^="delete-pet-type-"]');
      await deleteButton.click();
      // Warte auf Bestätigung falls vorhanden
      await this.page.waitForTimeout(500);
    }
  }`;
  } else if (pomContent.includes('OwnerPage')) {
    return `
  // Bulk-Operationen für Owners
  async addMultipleOwners(owners: Array<{firstName: string, lastName: string, address: string, city: string, telephone: string}>) {
    for (const owner of owners) {
      await this.gotoAddOwner();
      await this.addOwner(owner);
      await this.page.waitForURL(/\\/owners\\/\\d+/);
    }
  }`;
  }
  
  return '// Bulk-Operationen würden hier hinzugefügt';
}

function generateValidationHelpersCode(pomContent) {
  return `
  // Erweiterte Validierungs-Methoden
  async expectFormValidation(field: string, message: string) {
    const errorSelector = \`[data-pw="\${field}-error"]\`;
    await expect(this.page.locator(errorSelector)).toContainText(message);
  }
  
  async expectSuccessMessage(message?: string) {
    const successLocator = this.page.locator('[data-pw="success-message"]');
    await expect(successLocator).toBeVisible();
    if (message) {
      await expect(successLocator).toContainText(message);
    }
  }
  
  async expectLoadingComplete() {
    await expect(this.page.locator('[data-pw="loading"]')).not.toBeVisible();
    await this.page.waitForLoadState('networkidle');
  }`;
}

function generateWaitingStrategyCode(pomContent) {
  if (pomContent.includes('PetTypePage')) {
    return `
  // Verbesserte Warteschleifen für PetType-Tabelle
  private async waitForTableUpdate() {
    await this.page.waitForLoadState('networkidle');
    await expect(this.page.locator('#petTypesTbody')).toBeVisible();
  }
  
  async waitForPetTypeVisible(name: string) {
    await expect(this.rowByName(name)).toBeVisible();
  }`;
  }
  
  return `
  // Verbesserte Warteschleifen
  private async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
    await expect(this.page.locator('main')).toBeVisible();
  }`;
}

function analyzeSelectorQuality(pomContent) {
  const issues = [];
  const improvements = [];
  
  // Erkenne ID-Selektoren (weniger robust)
  if (pomContent.includes('#')) {
    issues.push({
      type: 'id-selectors',
      message: 'ID-Selektoren gefunden - können instabil sein',
      suggestion: 'Verwende data-pw Attribute für bessere Stabilität'
    });
  }
  
  // Prüfe auf data-pw Konsistenz
  const dataPwCount = (pomContent.match(/data-pw="/g) || []).length;
  const totalLocators = (pomContent.match(/locator\(/g) || []).length;
  
  if (dataPwCount < totalLocators * 0.8) {
    improvements.push({
      type: 'data-pw-coverage',
      message: `Nur ${dataPwCount}/${totalLocators} Locators verwenden data-pw`,
      suggestion: 'Erhöhe data-pw Nutzung für bessere Test-Stabilität'
    });
  }
  
  return { issues, improvements };
}

async function generateTestFromFeature({ feature, story, acceptanceCriteria, existingPoms }) {
  const testTemplate = `import { test, expect } from '@playwright/test';
${existingPoms.map(pom => `import { ${pom} } from '../pages/${pom}';`).join('\n')}

test.describe('${feature.charAt(0).toUpperCase() + feature.slice(1)} Management', () => {
  ${existingPoms.map(pom => `let ${pom.toLowerCase()}: ${pom};`).join('\n  ')}

  test.beforeEach(async ({ page }) => {
    ${existingPoms.map(pom => `${pom.toLowerCase()} = new ${pom}(page);`).join('\n    ')}
    await page.goto('/');
  });

  ${acceptanceCriteria.map((criteria, index) => `
  test('${criteria}', async ({ page }) => {
    // TODO: Implementiere Test für: ${criteria}
    // User Story: ${story}
    
    // GIVEN: Setup-Bedingungen
    
    // WHEN: Aktion ausführen
    
    // THEN: Ergebnis validieren
    await expect(page).toHaveURL(/\\//); // Placeholder
  });`).join('\n')}
});`;

  return testTemplate;
}

async function generatePetClinicTestData(feature, count, realistic) {
  const data = {};
  let setupScript = '';
  let cleanupScript = '';
  
  switch (feature) {
    case 'pet-types':
      data.petTypes = Array.from({ length: count }, (_, i) => ({
        name: realistic ? 
          ['Kaninchen', 'Reptil', 'Vogel', 'Fisch', 'Hamster', 'Schildkröte'][i] || `TestType_${i}` :
          `TestType_${Date.now()}_${i}`,
        desc: realistic ?
          ['Kleine Säugetiere', 'Kaltblütige Tiere', 'Gefiederte Tiere', 'Wassertiere', 'Kleine Nagetiere', 'Panzer-Reptilien'][i] || `Test Description ${i}` :
          `Test Description ${i}`
      }));
      
      setupScript = `
// Setup PetTypes für Tests
const petTypePage = new PetTypePage(page);
await petTypePage.goto();

for (const petType of testData.petTypes) {
  await petTypePage.addPetType(petType.name, petType.desc);
}`;
      
      cleanupScript = `
// Cleanup PetTypes nach Tests
const petTypePage = new PetTypePage(page);
await petTypePage.goto();

for (const petType of testData.petTypes) {
  try {
    await petTypePage.deletePetType(petType.name);
  } catch (e) {
    console.log(\`PetType \${petType.name} bereits gelöscht oder nicht vorhanden\`);
  }
}`;
      break;
      
    case 'owners':
      data.owners = Array.from({ length: count }, (_, i) => ({
        firstName: realistic ? ['Maria', 'Hans', 'Anna', 'Peter', 'Lisa'][i] || `TestOwner${i}` : `TestFirstName${i}`,
        lastName: realistic ? ['Schmidt', 'Müller', 'Weber', 'Wagner', 'Becker'][i] || `TestLast${i}` : `TestLastName${i}`,
        address: realistic ? ['Hauptstraße 123', 'Gartenweg 45', 'Musterstraße 67'][i % 3] : `Test Address ${i}`,
        city: realistic ? ['Berlin', 'München', 'Hamburg'][i % 3] : `TestCity${i}`,
        telephone: realistic ? `030-${String(Math.floor(Math.random() * 90000000) + 10000000)}` : `123-456-78${i.toString().padStart(2, '0')}`
      }));
      break;
  }
  
  return {
    data,
    setupScript,
    cleanupScript,
    usage: `
// Verwendung in Tests:
test.beforeEach(async ({ page }) => {
  ${setupScript}
});

test.afterEach(async ({ page }) => {
  ${cleanupScript}
});`
  };
}

async function analyzeTestQuality(testContent) {
  const issues = [];
  const suggestions = [];
  let score = 10;
  
  // Prüfe auf Hard-coded Waits
  if (testContent.includes('waitForTimeout')) {
    issues.push({
      type: 'hard-coded-waits',
      message: 'Hard-coded waits (waitForTimeout) gefunden',
      suggestion: 'Verwende expect().toBeVisible() oder andere explizite Waits'
    });
    score -= 2;
  }
  
  // Prüfe auf Assertions
  const assertionCount = (testContent.match(/expect\(/g) || []).length;
  const testCount = (testContent.match(/test\(/g) || []).length;
  
  if (assertionCount < testCount) {
    issues.push({
      type: 'missing-assertions',
      message: 'Tests ohne Assertions gefunden',
      suggestion: 'Jeder Test sollte mindestens eine Assertion haben'
    });
    score -= 3;
  }
  
  // Prüfe auf Page Object Nutzung
  if (!testContent.includes('new ') || !testContent.includes('Page')) {
    suggestions.push({
      type: 'page-objects',
      message: 'Keine Page Objects erkannt',
      suggestion: 'Verwende Page Objects für bessere Wartbarkeit'
    });
    score -= 2;
  }
  
  // Positive Aspekte
  if (testContent.includes('test.beforeEach')) {
    score += 1;
  }
  
  if (testContent.includes('data-pw=')) {
    score += 1;
  }
  
  return {
    score: Math.max(0, Math.min(10, score)),
    issues,
    suggestions,
    metrics: {
      testCount,
      assertionCount,
      assertionsPerTest: assertionCount / testCount
    }
  };
}

async function analyzePomTestCoverage() {
  const pomDir = path.join(__dirname, '..', 'playwright', 'pages');
  const testDir = path.join(__dirname, '..', 'playwright', 'tests');
  
  const coverage = {
    current: {},
    missing: [],
    recommendations: [],
    pomUsage: {}
  };
  
  try {
    // Lese alle POM-Dateien
    const pomFiles = fs.readdirSync(pomDir).filter(f => f.endsWith('.ts'));
    
    for (const pomFile of pomFiles) {
      const pomName = pomFile.replace('.ts', '');
      
      // Suche nach Tests, die diese POM verwenden
      const testFiles = fs.readdirSync(testDir).filter(f => f.endsWith('.spec.ts'));
      const usingTests = [];
      
      for (const testFile of testFiles) {
        const testContent = fs.readFileSync(path.join(testDir, testFile), 'utf8');
        if (testContent.includes(pomName)) {
          usingTests.push(testFile);
        }
      }
      
      coverage.pomUsage[pomName] = {
        testFiles: usingTests,
        coverage: usingTests.length > 0 ? 'covered' : 'not-covered'
      };
      
      if (usingTests.length === 0) {
        coverage.missing.push({
          pom: pomName,
          reason: 'Keine Tests verwenden diese POM',
          priority: pomName.includes('Page') ? 'High' : 'Medium'
        });
      }
    }
    
    // Generiere Empfehlungen
    coverage.recommendations = coverage.missing.map(item => ({
      action: `Erstelle Tests für ${item.pom}`,
      priority: item.priority,
      effort: 'Medium'
    }));
    
  } catch (error) {
    console.error('Fehler bei Coverage-Analyse:', error);
  }
  
  return coverage;
}
app.listen(PORT, () => {
  console.log(`🎭 MCP Playwright Server läuft auf Port ${PORT}`);
  console.log(`📡 WebSocket Server läuft auf Port ${WS_PORT}`);
  console.log(`🔗 Jira MCP Integration: ${JIRA_MCP_URL}`);
  console.log(`📊 Health Check: http://localhost:${PORT}/health`);
});

// WebSocket Connection Handler
wss.on('connection', (ws) => {
  console.log('🔌 WebSocket Client verbunden');
  
  ws.send(JSON.stringify({
    type: 'connection',
    message: 'Verbindung zum MCP Playwright Server hergestellt',
    timestamp: new Date().toISOString()
  }));
  
  ws.on('close', () => {
    console.log('🔌 WebSocket Client getrennt');
  });
});

// === ALLE NEUEN ERWEITERTEN FEATURES ===

// AI-POWERED TEST INTELLIGENCE
app.post('/playwright/analyze-test-intelligence', async (req, res) => {
  const { testResults, analysisType = 'full' } = req.body;
  
  try {
    let analysis;
    
    switch (analysisType) {
      case 'flaky':
        analysis = testIntelligence.analyzeTestHistory(testResults);
        break;
      case 'predictive':
        analysis = testIntelligence.predictTestFailures(testResults);
        break;
      case 'optimization':
        analysis = testIntelligence.optimizeTest(testResults.testContent, testResults.optimizationType);
        break;
      default:
        analysis = {
          history: testIntelligence.analyzeTestHistory(testResults),
          predictions: testIntelligence.predictTestFailures(testResults),
          recommendations: testIntelligence.generateRecommendations(testResults)
        };
    }
    
    res.json({
      success: true,
      analysisType,
      analysis,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/playwright/heal-broken-test', async (req, res) => {
  const { testFile, errorDetails } = req.body;
  
  try {
    const healingResult = await testIntelligence.healBrokenTest(testFile, errorDetails);
    
    res.json({
      success: true,
      healingResult,
      autoFixAvailable: healingResult.autoFixApplied,
      recommendations: healingResult.suggestedFixes
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// INTERACTIVE TEST BUILDER
app.post('/playwright/start-test-builder', async (req, res) => {
  const { testType, feature } = req.body;
  
  try {
    const session = interactiveTestBuilder.startSession(testType, feature);
    
    res.json({
      success: true,
      sessionId: session.sessionId,
      currentStep: session.currentStep,
      testType,
      feature
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/playwright/test-builder-step', async (req, res) => {
  const { sessionId, answer } = req.body;
  
  try {
    const result = interactiveTestBuilder.processStep(sessionId, answer);
    
    if (result.complete) {
      res.json({
        success: true,
        complete: true,
        generatedTest: result.generatedTest,
        summary: result.summary,
        recommendations: [
          'Teste den generierten Code in deiner Umgebung',
          'Passe Selektoren an deine POM-Struktur an',
          'Erweitere um zusätzliche Assertions'
        ]
      });
    } else {
      res.json({
        success: true,
        complete: false,
        currentStep: result.currentStep
      });
    }
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// CROSS-PLATFORM TEST GENERATION
app.post('/playwright/generate-cross-platform', async (req, res) => {
  const { baseTest, platforms = ['desktop', 'tablet', 'mobile'], browsers = ['chromium', 'firefox', 'webkit'] } = req.body;
  
  try {
    const testMatrix = crossPlatformGenerator.generateTestMatrix(baseTest, platforms, browsers);
    const playwrightConfig = crossPlatformGenerator.generatePlaywrightConfig(testMatrix);
    
    res.json({
      success: true,
      testMatrix,
      playwrightConfig,
      totalTests: testMatrix.totalTests,
      recommendations: [
        'Teste kritische Flows auf allen Plattformen',
        'Fokussiere auf Mobile-First für neue Features',
        'Verwende Visual Regression für UI-Konsistenz'
      ]
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/playwright/generate-responsive-tests', async (req, res) => {
  const { components } = req.body;
  
  try {
    const responsiveTests = crossPlatformGenerator.generateResponsiveTests(components);
    
    res.json({
      success: true,
      responsiveTests,
      componentsCount: components.length,
      recommendation: {
        testFile: 'tests/responsive/components-responsive.spec.ts',
        runCommand: 'npx playwright test tests/responsive/ --project=desktop --project=mobile'
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// TEST ANALYTICS DASHBOARD
app.get('/playwright/analytics/dashboard', async (req, res) => {
  try {
    const dashboardData = testAnalytics.getDashboardData();
    
    res.json({
      success: true,
      dashboard: dashboardData,
      lastUpdated: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/playwright/analytics/real-time', async (req, res) => {
  try {
    const realTimeMetrics = testAnalytics.collectRealTimeMetrics();
    
    res.json({
      success: true,
      metrics: realTimeMetrics,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/playwright/analytics/coverage-heatmap', async (req, res) => {
  try {
    const heatmap = testAnalytics.generateCoverageHeatmap();
    
    res.json({
      success: true,
      heatmap,
      visualization: {
        type: 'heatmap',
        colorScale: ['#ff0000', '#ffff00', '#00ff00'],
        title: 'Test Coverage Heatmap'
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/playwright/analytics/flakiness-report', async (req, res) => {
  try {
    const flakinessReport = testAnalytics.generateFlakinessReport();
    
    res.json({
      success: true,
      report: flakinessReport,
      actionRequired: flakinessReport.totalFlakyTests > 5,
      priority: flakinessReport.flakinessRate > 0.1 ? 'high' : 'medium'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/playwright/analytics/performance-trends', async (req, res) => {
  const { timeRange = '7d' } = req.query;
  
  try {
    const trends = testAnalytics.analyzePerformanceTrends(timeRange);
    
    res.json({
      success: true,
      trends,
      timeRange,
      insights: [
        'Test execution time stable over last week',
        'Consider parallelization for slower suites',
        'Monitor mobile performance closely'
      ]
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/playwright/analytics/team-performance', async (req, res) => {
  try {
    const teamAnalytics = testAnalytics.generateTeamAnalytics();
    
    res.json({
      success: true,
      teamAnalytics,
      recommendations: [
        'Increase code review participation',
        'Share testing best practices',
        'Implement pair testing sessions'
      ]
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ERWEITERTE POM & SELECTOR ANALYSIS
app.post('/playwright/analyze-selectors', async (req, res) => {
  const { pomFile, analysisType = 'full' } = req.body;
  
  try {
    // Lade POM Datei und analysiere Selektoren
    const pomPath = path.resolve(pomFile);
    const pomContent = fs.readFileSync(pomPath, 'utf8');
    
    const selectorAnalysis = {
      robust_selectors: [],
      fragile_selectors: [],
      missing_selectors: [],
      optimization_suggestions: []
    };
    
    // Analysiere data-pw Selektoren
    const dataPwMatches = pomContent.match(/\[data-pw="[^"]+"\]/g) || [];
    selectorAnalysis.robust_selectors = dataPwMatches.map(selector => ({
      selector,
      type: 'data-pw',
      robustness: 'high'
    }));
    
    // Analysiere ID-Selektoren (potentiell fragil)
    const idMatches = pomContent.match(/#[a-zA-Z][a-zA-Z0-9-_]*/g) || [];
    selectorAnalysis.fragile_selectors = idMatches.map(selector => ({
      selector,
      type: 'id',
      robustness: 'medium',
      suggestion: 'Consider using data-pw attribute instead of ' + selector
    }));
    
    // Empfehlungen für fehlende Selektoren
    selectorAnalysis.missing_selectors = [
      {
        element: 'Loading Spinner',
        suggestion: 'private get loadingSpinner() { return this.page.locator(\\'[data-pw="loading"]\\'); }',
        usage: 'Für bessere Warteschleifen'
      },
      {
        element: 'Error Messages',
        suggestion: 'private get errorMessage() { return this.page.locator(\\'[data-pw="error-message"]\\'); }',
        usage: 'Für Validierungs-Tests'
      }
    ];
    
    res.json({
      success: true,
      pomFile,
      selectorAnalysis,
      summary: {
        totalSelectors: dataPwMatches.length + idMatches.length,
        robustSelectors: dataPwMatches.length,
        fragileSelectors: idMatches.length,
        robustnessScore: dataPwMatches.length / (dataPwMatches.length + idMatches.length) * 100
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// BULK OPERATIONS & BATCH PROCESSING
app.post('/playwright/batch-generate', async (req, res) => {
  const { operations } = req.body;
  
  try {
    const results = [];
    
    for (const operation of operations) {
      let result;
      
      switch (operation.type) {
        case 'testdata':
          result = await testDataManager.generatePetTypeData(operation.count);
          break;
        case 'visual':
          result = visualTestGenerator.generateVisualTest(operation.feature, operation.url);
          break;
        case 'api':
          result = apiTestGenerator.generateBasicApiTests();
          break;
        case 'cross-platform':
          result = crossPlatformGenerator.generateTestMatrix(operation.baseTest, operation.platforms);
          break;
      }
      
      results.push({
        operation: operation.type,
        success: true,
        result
      });
    }
    
    res.json({
      success: true,
      batchResults: results,
      totalOperations: operations.length,
      completedAt: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// EXPORT & IMPORT FUNCTIONALITY
app.get('/playwright/export/:format', async (req, res) => {
  const { format } = req.params;
  const { dataType = 'all' } = req.query;
  
  try {
    let exportData;
    
    switch (dataType) {
      case 'analytics':
        exportData = testAnalytics.exportMetrics(format);
        break;
      case 'tests':
        exportData = await this.exportAllTests(format);
        break;
      case 'poms':
        exportData = await this.exportAllPOMs(format);
        break;
      default:
        exportData = {
          analytics: testAnalytics.getDashboardData(),
          timestamp: new Date().toISOString()
        };
    }
    
    res.setHeader('Content-Type', this.getContentType(format));
    res.setHeader('Content-Disposition', \`attachment; filename="playwright-export.\${format}"\`);
    res.send(exportData);
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// REAL-TIME WEBSOCKET UPDATES für Analytics
wss.on('connection', (ws) => {
  console.log('🔌 WebSocket Client verbunden');
  
  // Sende initiale Dashboard-Daten
  ws.send(JSON.stringify({
    type: 'dashboard-init',
    data: testAnalytics.getDashboardData(),
    timestamp: new Date().toISOString()
  }));
  
  // Sende Real-time Updates alle 5 Sekunden
  const analyticsInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(testAnalytics.getWebSocketUpdates()));
    }
  }, 5000);
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      if (data.type === 'request-analytics') {
        ws.send(JSON.stringify({
          type: 'analytics-response',
          data: testAnalytics.getDashboardData()
        }));
      }
      
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });
  
  ws.on('close', () => {
    console.log('🔌 WebSocket Client getrennt');
    clearInterval(analyticsInterval);
  });
});

// HELPER FUNCTIONS
function getContentType(format) {
  const types = {
    'json': 'application/json',
    'csv': 'text/csv',
    'excel': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  };
  return types[format] || 'application/json';
}

// Graceful Shutdown
app.post('/playwright/generate-testdata', async (req, res) => {
  const { feature, count = 5 } = req.body;
  
  try {
    let testData;
    let setupScript;
    let cleanupScript;
    
    switch (feature) {
      case 'pet-types':
        testData = testDataManager.generatePetTypeData(count);
        setupScript = testDataManager.generateSetupScript('pet-types', testData);
        cleanupScript = testDataManager.generateCleanupScript('pet-types', testData);
        break;
        
      case 'owners':
        testData = testDataManager.generateOwnerData(count);
        setupScript = testDataManager.generateSetupScript('owners', testData);
        cleanupScript = testDataManager.generateCleanupScript('owners', testData);
        break;
        
      default:
        return res.status(400).json({
          success: false,
          error: `Feature '${feature}' nicht unterstützt. Verfügbar: pet-types, owners`
        });
    }
    
    // Speichere als Fixture
    const fixturePath = await testDataManager.saveTestDataFixture(feature, testData);
    
    res.json({
      success: true,
      feature,
      count: testData.length,
      testData,
      setupScript,
      cleanupScript,
      fixturePath
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Visual Test Generation
app.post('/playwright/generate-visual-tests', async (req, res) => {
  const { feature, pageUrl = '/', components = [] } = req.body;
  
  try {
    const visualTest = visualTestGenerator.generateVisualTest(feature, pageUrl, components);
    const configFile = visualTestGenerator.generateVisualTestConfig();
    
    res.json({
      success: true,
      feature,
      visualTest,
      configFile,
      recommendation: {
        testFile: `tests/visual/${feature}-visual.spec.ts`,
        configFile: 'playwright.visual.config.ts',
        runCommand: `npx playwright test --config=playwright.visual.config.ts tests/visual/${feature}-visual.spec.ts`
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Screenshot Analysis & Test Generation
app.post('/playwright/analyze-screenshot', async (req, res) => {
  const { screenshotPath, description = '', feature } = req.body;
  
  try {
    const generatedTest = await visualTestGenerator.analyzeScreenshotAndGenerateTest(
      screenshotPath, 
      description
    );
    
    res.json({
      success: true,
      screenshotPath,
      description,
      generatedTest,
      suggestions: [
        'Führe den generierten Test aus um Baseline-Screenshots zu erstellen',
        'Passe die Component-Selektoren an deine spezifische Struktur an',
        'Erweitere die States für umfassendere Visual Coverage'
      ]
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// API Test Generation
app.post('/playwright/generate-api-tests', async (req, res) => {
  const { swaggerUrl, testType = 'basic' } = req.body;
  
  try {
    let apiTests;
    
    switch (testType) {
      case 'swagger':
        apiTests = await apiTestGenerator.generateApiTestsFromSwagger(swaggerUrl);
        break;
      case 'contract':
        apiTests = apiTestGenerator.generateContractTests();
        break;
      case 'performance':
        apiTests = apiTestGenerator.generatePerformanceTests();
        break;
      default:
        apiTests = apiTestGenerator.generateBasicApiTests();
    }
    
    res.json({
      success: true,
      testType,
      apiTests,
      recommendation: {
        testFile: `tests/api/${testType}-api.spec.ts`,
        runCommand: `npx playwright test tests/api/${testType}-api.spec.ts`
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test Coverage Analysis
app.get('/playwright/analyze-coverage', async (req, res) => {
  try {
    const testFiles = await findAllTestFiles();
    const pageObjects = await findAllPageObjects();
    
    const coverage = {
      tests: {
        total: testFiles.length,
        e2e: testFiles.filter(f => f.includes('.spec.ts')).length,
        visual: testFiles.filter(f => f.includes('visual')).length,
        api: testFiles.filter(f => f.includes('api')).length
      },
      pageObjects: {
        total: pageObjects.length,
        withTests: pageObjects.filter(po => hasCorrespondingTest(po)).length
      },
      suggestions: generateCoverageSuggestions(testFiles, pageObjects)
    };
    
    res.json({
      success: true,
      coverage,
      missingTests: identifyMissingTests(pageObjects, testFiles),
      recommendations: [
        'Erstelle Visual Tests für kritische User Flows',
        'Ergänze API Contract Tests für Backend-Validierung',
        'Implementiere Performance Tests für Lastszenarien'
      ]
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Bulk Test Generation
app.post('/playwright/generate-test-suite', async (req, res) => {
  const { features, includeVisual = true, includeApi = true, includeE2e = true } = req.body;
  
  try {
    const generatedSuite = {
      features: [],
      totalTests: 0,
      files: []
    };
    
    for (const feature of features) {
      const featureSuite = {
        name: feature,
        tests: []
      };
      
      if (includeE2e) {
        // Generiere E2E Tests basierend auf bestehenden POMs
        const e2eTest = await generateE2eTestForFeature(feature);
        featureSuite.tests.push({
          type: 'e2e',
          file: `tests/e2e/${feature}.spec.ts`,
          content: e2eTest
        });
      }
      
      if (includeVisual) {
        const visualTest = visualTestGenerator.generateVisualTest(feature, `/${feature}`);
        featureSuite.tests.push({
          type: 'visual',
          file: `tests/visual/${feature}-visual.spec.ts`,
          content: visualTest
        });
      }
      
      if (includeApi) {
        const apiTest = apiTestGenerator.generateBasicApiTests();
        featureSuite.tests.push({
          type: 'api',
          file: `tests/api/${feature}-api.spec.ts`,
          content: apiTest
        });
      }
      
      generatedSuite.features.push(featureSuite);
      generatedSuite.totalTests += featureSuite.tests.length;
      generatedSuite.files.push(...featureSuite.tests.map(t => t.file));
    }
    
    res.json({
      success: true,
      generatedSuite,
      setupInstructions: [
        '1. Erstelle die vorgeschlagenen Test-Dateien',
        '2. Passe Selektoren an deine POM-Struktur an',
        '3. Führe Tests aus: npx playwright test',
        '4. Überprüfe und committe die generierten Tests'
      ]
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Helper Functions
async function findAllTestFiles() {
  const testsDir = path.join(__dirname, '..', 'playwright', 'tests');
  if (!fs.existsSync(testsDir)) return [];
  
  const files = [];
  function scanDir(dir) {
    const items = fs.readdirSync(dir);
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      if (fs.statSync(fullPath).isDirectory()) {
        scanDir(fullPath);
      } else if (item.endsWith('.spec.ts') || item.endsWith('.test.ts')) {
        files.push(fullPath);
      }
    });
  }
  
  scanDir(testsDir);
  return files;
}

async function findAllPageObjects() {
  const pagesDir = path.join(__dirname, '..', 'playwright', 'pages');
  if (!fs.existsSync(pagesDir)) return [];
  
  return fs.readdirSync(pagesDir)
    .filter(file => file.endsWith('.ts'))
    .map(file => path.join(pagesDir, file));
}

function hasCorrespondingTest(pageObjectPath) {
  const baseName = path.basename(pageObjectPath, '.ts');
  const testName = baseName.replace('Page', '').toLowerCase();
  // Simple heuristic - könnte erweitert werden
  return fs.existsSync(path.join(__dirname, '..', 'playwright', 'tests', `${testName}.spec.ts`));
}

function generateCoverageSuggestions(testFiles, pageObjects) {
  const suggestions = [];
  
  if (testFiles.length === 0) {
    suggestions.push('Erstelle erste Test-Dateien für grundlegende Funktionalitäten');
  }
  
  if (pageObjects.length > testFiles.length) {
    suggestions.push('Einige Page Objects haben keine entsprechenden Tests');
  }
  
  const hasVisualTests = testFiles.some(f => f.includes('visual'));
  if (!hasVisualTests) {
    suggestions.push('Visual Regression Tests fehlen komplett');
  }
  
  const hasApiTests = testFiles.some(f => f.includes('api'));
  if (!hasApiTests) {
    suggestions.push('API Tests für Backend-Validierung implementieren');
  }
  
  return suggestions;
}

function identifyMissingTests(pageObjects, testFiles) {
  return pageObjects
    .filter(po => !hasCorrespondingTest(po))
    .map(po => ({
      pageObject: path.basename(po),
      suggestedTestFile: `tests/${path.basename(po, '.ts').replace('Page', '').toLowerCase()}.spec.ts`
    }));
}

async function generateE2eTestForFeature(feature) {
  // Basis E2E Test Template - könnte erweitert werden
  return `
import { test, expect } from '@playwright/test';
import { ${feature.charAt(0).toUpperCase() + feature.slice(1)}Page } from '../pages/${feature.charAt(0).toUpperCase() + feature.slice(1)}Page';

test.describe('${feature} - E2E Tests', () => {
  test('${feature} grundlegende Funktionalität', async ({ page }) => {
    // TODO: Implementiere spezifische Tests für ${feature}
    await page.goto('/');
    await expect(page).toHaveTitle(/PetClinic/);
  });
});`;
}

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('🛑 MCP Playwright Server wird beendet...');
  
  // Beende aktive Test-Prozesse
  activeRuns.forEach((run, runId) => {
    if (run.process && !run.process.killed) {
      console.log(`⏹️ Beende Test-Lauf ${runId}`);
      run.process.kill();
    }
  });
  
  process.exit(0);
});
