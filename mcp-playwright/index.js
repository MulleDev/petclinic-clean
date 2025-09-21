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

// === EINFACHE NEUE FEATURES ===

// Test Intelligence Endpoints
app.post('/playwright/analyze-test-intelligence', async (req, res) => {
  const { testResults = [], analysisType = 'full' } = req.body;
  
  try {
    const analysis = testIntelligence.analyzeTestHistory(testResults);
    
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

// Interactive Test Builder
app.post('/playwright/start-test-builder', async (req, res) => {
  const { testType, feature } = req.body;
  
  try {
    const session = interactiveTestBuilder.startSession(testType, feature);
    
    res.json({
      success: true,
      sessionId: session.sessionId,
      currentStep: session.currentStep
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Analytics Dashboard
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

// HTML Dashboard Route
app.get('/dashboard', async (req, res) => {
  try {
    const dashboardData = testAnalytics.getDashboardData();
    
    const htmlContent = `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MCP Playwright Analytics Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }
        .dashboard { 
            max-width: 1400px; 
            margin: 0 auto; 
            padding: 20px; 
        }
        .header {
            text-align: center;
            color: white;
            margin-bottom: 30px;
        }
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        .header .subtitle {
            font-size: 1.1rem;
            opacity: 0.9;
        }
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .metric-card {
            background: white;
            border-radius: 12px;
            padding: 25px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            backdrop-filter: blur(10px);
            transition: transform 0.3s ease;
        }
        .metric-card:hover {
            transform: translateY(-5px);
        }
        .metric-card h3 {
            color: #4a5568;
            font-size: 1.1rem;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
        }
        .metric-value {
            font-size: 2.5rem;
            font-weight: bold;
            color: #2d3748;
            margin-bottom: 10px;
        }
        .metric-trend {
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 600;
        }
        .trend-increasing { background: #c6f6d5; color: #22543d; }
        .trend-decreasing { background: #fed7d7; color: #742a2a; }
        .trend-stable { background: #bee3f8; color: #2c5282; }
        .charts-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
        }
        .chart-card {
            background: white;
            border-radius: 12px;
            padding: 25px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        }
        .chart-card h3 {
            color: #4a5568;
            margin-bottom: 20px;
            font-size: 1.2rem;
        }
        .test-runs {
            background: white;
            border-radius: 12px;
            padding: 25px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }
        .test-run {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #edf2f7;
        }
        .test-run:last-child {
            border-bottom: none;
        }
        .status-badge {
            padding: 4px 12px;
            border-radius: 15px;
            font-size: 0.8rem;
            font-weight: 600;
        }
        .status-passed { background: #c6f6d5; color: #22543d; }
        .status-failed { background: #fed7d7; color: #742a2a; }
        .status-skipped { background: #faf089; color: #744210; }
        .coverage-heatmap {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            margin-top: 15px;
        }
        .coverage-item {
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            color: white;
            font-weight: 600;
        }
        .coverage-low { background: #f56565; }
        .coverage-medium { background: #ed8936; }
        .coverage-high { background: #48bb78; }
        .coverage-critical { background: #e53e3e; }
        .alerts {
            background: #fed7d7;
            border: 1px solid #feb2b2;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
        }
        .alert {
            color: #742a2a;
            margin-bottom: 10px;
        }
        .alert:last-child {
            margin-bottom: 0;
        }
        .flaky-tests {
            background: white;
            border-radius: 12px;
            padding: 25px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        }
        .flaky-test {
            background: #fff5f5;
            border: 1px solid #fed7d7;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 10px;
        }
        .flaky-test h4 {
            color: #742a2a;
            margin-bottom: 8px;
        }
        .progress-bar {
            width: 100%;
            height: 8px;
            background: #edf2f7;
            border-radius: 4px;
            overflow: hidden;
            margin: 10px 0;
        }
        .progress-fill {
            height: 100%;
            transition: width 0.3s ease;
        }
        .progress-success { background: #48bb78; }
        .progress-warning { background: #ed8936; }
        .progress-error { background: #f56565; }
        .icon {
            margin-right: 8px;
            font-size: 1.2rem;
        }
        .refresh-btn {
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 50%;
            width: 60px;
            height: 60px;
            font-size: 1.5rem;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            transition: all 0.3s ease;
        }
        .refresh-btn:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }
        @media (max-width: 768px) {
            .charts-section {
                grid-template-columns: 1fr;
            }
            .metrics-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="dashboard">
        <div class="header">
            <h1>🎭 MCP Playwright Analytics</h1>
            <div class="subtitle">
                Real-time Test Performance Dashboard • PetClinic
            </div>
        </div>

        <!-- Alerts Section -->
        ${dashboardData.alerts && dashboardData.alerts.length > 0 ? `
        <div class="alerts">
            ${dashboardData.alerts.map(alert => `
                <div class="alert">
                    <strong>${alert.type.toUpperCase()}:</strong> ${alert.message}
                    <br><small>💡 ${alert.recommendation}</small>
                </div>
            `).join('')}
        </div>
        ` : ''}

        <!-- Key Metrics Grid -->
        <div class="metrics-grid">
            <div class="metric-card">
                <h3><span class="icon">📊</span>Total Tests</h3>
                <div class="metric-value">${dashboardData.executionDashboard.overview.totalTests}</div>
                <div class="metric-trend trend-${dashboardData.executionDashboard.overview.trend}">
                    ${dashboardData.executionDashboard.overview.trend === 'increasing' ? '📈' : 
                      dashboardData.executionDashboard.overview.trend === 'decreasing' ? '📉' : '➡️'} 
                    ${dashboardData.executionDashboard.overview.trend}
                </div>
            </div>

            <div class="metric-card">
                <h3><span class="icon">✅</span>Pass Rate</h3>
                <div class="metric-value">${Math.round(dashboardData.executionDashboard.overview.passRate)}%</div>
                <div class="progress-bar">
                    <div class="progress-fill progress-success" style="width: ${dashboardData.executionDashboard.overview.passRate}%"></div>
                </div>
            </div>

            <div class="metric-card">
                <h3><span class="icon">⏱️</span>Avg Duration</h3>
                <div class="metric-value">${Math.round(dashboardData.executionDashboard.overview.avgDuration)}ms</div>
                <div class="metric-trend trend-stable">
                    ⚡ Performance
                </div>
            </div>

            <div class="metric-card">
                <h3><span class="icon">🔥</span>Flaky Tests</h3>
                <div class="metric-value">${dashboardData.flakinessReport.totalFlakyTests}</div>
                <div class="metric-trend ${dashboardData.flakinessReport.totalFlakyTests > 3 ? 'trend-decreasing' : 'trend-stable'}">
                    ${dashboardData.flakinessReport.totalFlakyTests > 3 ? '⚠️ High' : '✅ Low'} Risk
                </div>
            </div>
        </div>

        <!-- Charts Section -->
        <div class="charts-section">
            <div class="chart-card">
                <h3>🎯 Coverage Heatmap</h3>
                <div class="coverage-heatmap">
                    ${dashboardData.coverageHeatmap.map(item => `
                        <div class="coverage-item coverage-${item.priority}">
                            <div>${item.file}</div>
                            <div>${item.coverage}%</div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="chart-card">
                <h3>📈 Performance Metrics</h3>
                <div style="margin-bottom: 15px;">
                    <strong>Response Time:</strong> ${Math.round(dashboardData.performanceTrends.avgResponseTime)}ms
                    <div class="progress-bar">
                        <div class="progress-fill progress-warning" style="width: ${Math.min(100, dashboardData.performanceTrends.avgResponseTime / 10)}%"></div>
                    </div>
                </div>
                <div style="margin-bottom: 15px;">
                    <strong>Error Rate:</strong> ${Math.round(dashboardData.performanceTrends.errorRate * 100)}%
                    <div class="progress-bar">
                        <div class="progress-fill progress-error" style="width: ${dashboardData.performanceTrends.errorRate * 100}%"></div>
                    </div>
                </div>
                <div>
                    <strong>Throughput:</strong> ${Math.round(dashboardData.performanceTrends.throughput)} tests/hour
                </div>
            </div>
        </div>

        <!-- Recent Test Runs -->
        <div class="test-runs">
            <h3>🏃‍♂️ Recent Test Runs</h3>
            ${dashboardData.executionDashboard.recentRuns.map(run => `
                <div class="test-run">
                    <div>
                        <strong>${run.suite}</strong> on ${run.browser}
                        <br><small>${new Date(run.timestamp).toLocaleString()}</small>
                    </div>
                    <div>
                        <span class="status-badge status-${run.status}">${run.status.toUpperCase()}</span>
                        <span style="margin-left: 10px; color: #666;">${Math.round(run.duration)}ms</span>
                    </div>
                </div>
            `).join('')}
        </div>

        <!-- Flaky Tests Section -->
        ${dashboardData.flakinessReport.topFlakyTests.length > 0 ? `
        <div class="flaky-tests">
            <h3>⚠️ Flaky Tests</h3>
            ${dashboardData.flakinessReport.topFlakyTests.map(test => `
                <div class="flaky-test">
                    <h4>${test.name}</h4>
                    <div>Failure Rate: <strong>${test.failureRate}%</strong></div>
                    <div>Last Failure: ${new Date(test.lastFailure).toLocaleString()}</div>
                    <div style="margin-top: 10px;">
                        <strong>Suggested Fixes:</strong>
                        <ul style="margin-left: 20px; margin-top: 5px;">
                            ${test.suggestedFixes.map(fix => `<li>${fix}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `).join('')}
        </div>
        ` : ''}
    </div>

    <button class="refresh-btn" onclick="location.reload()" title="Refresh Dashboard">
        🔄
    </button>

    <script>
        // Auto-refresh every 30 seconds
        setInterval(() => {
            location.reload();
        }, 30000);

        // Add some interactive effects
        document.querySelectorAll('.metric-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.boxShadow = '0 12px 40px rgba(0,0,0,0.15)';
            });
            card.addEventListener('mouseleave', () => {
                card.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)';
            });
        });
    </script>
</body>
</html>`;

    res.send(htmlContent);
    
  } catch (error) {
    res.status(500).send(`
      <html>
        <body style="font-family: Arial; padding: 40px; text-align: center;">
          <h1 style="color: #e53e3e;">Dashboard Error</h1>
          <p>Error loading dashboard: ${error.message}</p>
          <button onclick="location.reload()" style="padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">Retry</button>
        </body>
      </html>
    `);
  }
});

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
