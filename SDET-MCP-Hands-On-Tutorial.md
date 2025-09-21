# SDET MCP Hands-On Tutorial
*Praktische Übungen zur MCP Server Nutzung im PetClinic-Projekt*

## 🎯 Lernziele
Nach diesem Tutorial können Sie:
- MCP Server in Ihren täglichen SDET-Workflow integrieren
- Automatische Bug-Reports aus fehlgeschlagenen Tests erstellen
- Intelligente Test-Orchestrierung nutzen
- Performance- und Flaky-Test-Probleme systematisch angehen

## 📋 Setup & Vorbereitung

### 1. Environment Check
```powershell
# Terminal 1: Backend starten
cd c:\Users\Dennis\Projekte\VSProjekte\PetClinic
mvn spring-boot:run

# Terminal 2: MCP Jira Server
cd mcp-jira
npm start

# Terminal 3: MCP Playwright Server  
cd mcp-playwright
npm start

# Terminal 4: Für Tests und API-Calls
cd playwright
```

### 2. Connectivity Test
```powershell
# Alle Services prüfen
curl http://localhost:8080/health          # PetClinic Backend
curl http://localhost:3000/health          # MCP Jira
curl http://localhost:3001/health          # MCP Playwright

# Erwartete Antworten: HTTP 200 + JSON Response
```

## 🛠️ Übung 1: Automatische Bug-Report-Erstellung

### Szenario
Ein Playwright-Test schlägt fehl und Sie möchten automatisch ein strukturiertes Jira-Ticket erstellen.

### Schritt 1: Test-Failure simulieren
```typescript
// Erstellen Sie: playwright/tests/demo-failure.spec.ts
import { test, expect } from '@playwright/test';

test('Demo: Failing test for MCP integration', async ({ page }) => {
  await page.goto('http://localhost:8080');
  
  // Dieser Test schlägt absichtlich fehl
  await expect(page.locator('[data-testid="non-existent"]')).toBeVisible();
});
```

### Schritt 2: Test ausführen und Fehler erfassen
```powershell
# Test ausführen (wird fehlschlagen)
npx playwright test demo-failure.spec.ts

# Fehlerdetails notieren:
# - Fehlermeldung
# - Screenshot-Pfad
# - Browser-Info
```

### Schritt 3: Automatisches Jira-Ticket via MCP
```powershell
# Bug-Ticket erstellen
curl -X POST http://localhost:3000/create-from-template `
  -H "Content-Type: application/json" `
  -d '{
    "templateId": "petclinic-bug",
    "replacements": {
      "modul": "Demo Test Module",
      "beschreibung": "Locator not found - element missing",
      "schritt1": "Navigate to localhost:8080",
      "schritt2": "Look for element with data-testid=non-existent",
      "schritt3": "Element should be visible",
      "erwartet": "Element is visible and test passes",
      "tatsaechlich": "locator.toBeVisible: Target closed",
      "fehlermeldung": "Error: locator.toBeVisible: Target closed",
      "browser": "Chromium 120.0.6099.199"
    }
  }'
```

### Schritt 4: Ticket-Erstellung verifizieren
```powershell
# Jira öffnen und neues Ticket prüfen
Start-Process "http://localhost:8081/browse/PET"
```

**✅ Erwartetes Ergebnis:** Strukturiertes Bug-Ticket mit allen relevanten Details

## 🎭 Übung 2: Remote Test-Ausführung via MCP

### Szenario
Tests remote über MCP-API ausführen und Ergebnisse automatisch dokumentieren.

### Schritt 1: Test-Suite via MCP starten
```powershell
# Alle Owner-Tests ausführen
curl -X POST http://localhost:3001/playwright/run-suite/owner-management

# Response enthält Run-ID, z.B. {"runId": "run-abc123"}
```

### Schritt 2: Test-Status überwachen
```powershell
# Status abfragen (Run-ID aus Schritt 1 verwenden)
curl http://localhost:3001/playwright/status/run-abc123

# Kontinuierliches Monitoring
while ($true) {
  $status = curl http://localhost:3001/playwright/status/run-abc123 | ConvertFrom-Json
  Write-Host "Status: $($status.status) - Progress: $($status.progress)%"
  if ($status.status -eq "completed") { break }
  Start-Sleep 5
}
```

### Schritt 3: Ergebnisse abrufen und dokumentieren
```powershell
# Detaillierte Ergebnisse
curl http://localhost:3001/playwright/results/run-abc123

# Automatisches Summary-Ticket erstellen
curl -X POST http://localhost:3000/create-smart-ticket `
  -H "Content-Type: application/json" `
  -d '{
    "title": "Test Run Summary - Owner Management Suite",
    "description": "Automated test execution completed. Results attached.",
    "context": {
      "petclinic": true,
      "testSuite": "owner-management",
      "automated": true
    }
  }'
```

**✅ Erwartetes Ergebnis:** Test-Ausführung mit automatischer Dokumentation

## 🔍 Übung 3: Flaky Test Detection und Management

### Szenario
Instabile Tests identifizieren und systematisch angehen.

### Schritt 1: Flaky Tests identifizieren
```powershell
# Aktuelle Flaky Tests anzeigen
curl http://localhost:3001/playwright/flaky-tests

# Historische Trend-Analyse
curl "http://localhost:3001/playwright/flaky-trends?days=7"
```

### Schritt 2: Flaky Test Investigation Ticket
```powershell
# Investigation-Ticket für instabilen Test
curl -X POST http://localhost:3000/create-from-template `
  -H "Content-Type: application/json" `
  -d '{
    "templateId": "flaky-test-investigation",
    "replacements": {
      "testName": "owner-creation-with-validation",
      "failureRate": "15%",
      "lastFailures": "3 out of 20 runs",
      "symptoms": "Intermittent timeout on form submission",
      "environment": "Chrome + Windows 11"
    }
  }'
```

### Schritt 3: Automatisierte Flaky Test Analyse
```typescript
// playwright/tests/flaky-analysis.spec.ts
import { test } from '@playwright/test';

test.describe('Flaky Test Analysis', () => {
  test('Run potentially flaky test multiple times', async ({ page }) => {
    // Test 10x ausführen und Ergebnisse sammeln
    const results = [];
    
    for (let i = 0; i < 10; i++) {
      try {
        await page.goto('http://localhost:8080/owners/new');
        await page.fill('[name="firstName"]', `Test${i}`);
        await page.fill('[name="lastName"]', `User${i}`);
        await page.click('button[type="submit"]');
        
        results.push({ run: i, status: 'passed' });
      } catch (error) {
        results.push({ run: i, status: 'failed', error: error.message });
      }
    }
    
    // Ergebnisse an MCP senden
    const analysisData = {
      testName: 'owner-creation-stability',
      runs: results,
      failureRate: results.filter(r => r.status === 'failed').length / results.length
    };
    
    console.log('Flaky Test Analysis:', JSON.stringify(analysisData, null, 2));
  });
});
```

```powershell
# Flaky-Analyse ausführen
npx playwright test flaky-analysis.spec.ts
```

**✅ Erwartetes Ergebnis:** Systematische Analyse instabiler Tests mit Dokumentation

## 📊 Übung 4: Performance Monitoring Integration

### Szenario
Langsame Tests identifizieren und Performance-Probleme dokumentieren.

### Schritt 1: Performance Baseline erstellen
```typescript
// playwright/tests/performance-baseline.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Performance Baseline Tests', () => {
  test('Owner page load performance', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('http://localhost:8080/owners');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Performance-Daten an MCP senden
    if (loadTime > 3000) {
      const perfIssue = {
        templateId: "performance-investigation",
        replacements: {
          testName: "Owner page load",
          actualTime: `${loadTime}ms`,
          threshold: "3000ms",
          browser: "Chromium",
          url: "/owners"
        }
      };
      
      // Automatisches Performance-Ticket
      console.log('Performance Issue detected:', JSON.stringify(perfIssue));
    }
    
    expect(loadTime).toBeLessThan(5000); // Failsafe threshold
  });
});
```

### Schritt 2: Performance Report generieren
```powershell
# Performance Tests ausführen
npx playwright test performance-baseline.spec.ts

# Wenn Performance-Probleme gefunden werden:
curl -X POST http://localhost:3000/create-from-template `
  -H "Content-Type: application/json" `
  -d '{
    "templateId": "performance-investigation",
    "replacements": {
      "testName": "Owner page load performance",
      "actualTime": "4500ms",
      "threshold": "3000ms",
      "browser": "Chromium 120",
      "url": "/owners"
    }
  }'
```

**✅ Erwartetes Ergebnis:** Automatische Performance-Überwachung mit Alerting

## 🔄 Übung 5: CI/CD Integration Simulation

### Szenario
MCP-Integration in einen automatisierten Build-Prozess einbinden.

### Schritt 1: Build-Script mit MCP erstellen
```powershell
# build-with-mcp.ps1
Write-Host "Starting MCP-integrated build process..."

# 1. MCP Server starten
Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "start" -WorkingDirectory "mcp-jira"
Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "start" -WorkingDirectory "mcp-playwright"

Start-Sleep 10  # Server-Startup warten

# 2. Tests via MCP ausführen
$testResult = curl -X POST http://localhost:3001/playwright/run-tests | ConvertFrom-Json

# 3. Build-Summary Ticket erstellen
$summaryData = @{
  title = "Daily Build Summary - $(Get-Date -Format 'yyyy-MM-dd')"
  description = "Automated build completed. Test results: $($testResult.passed) passed, $($testResult.failed) failed"
  context = @{
    petclinic = $true
    automated = $true
    buildNumber = $env:BUILD_NUMBER
  }
} | ConvertTo-Json

curl -X POST http://localhost:3000/create-smart-ticket `
  -H "Content-Type: application/json" `
  -d $summaryData

Write-Host "Build process completed with MCP integration"
```

### Schritt 2: Build ausführen
```powershell
# Build-Script ausführen
.\build-with-mcp.ps1
```

**✅ Erwartetes Ergebnis:** Vollständig automatisierter Build mit MCP-Integration

## 🎯 Abschluss-Challenge: End-to-End MCP Workflow

### Aufgabe
Erstellen Sie einen kompletten SDET-Workflow, der:
1. Tests ausführt
2. Failures automatisch analysiert
3. Tickets erstellt
4. Performance überwacht
5. Wöchentliche Reports generiert

### Lösung
```typescript
// playwright/tests/complete-mcp-workflow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Complete MCP SDET Workflow', () => {
  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status === 'failed') {
      // Automatisches Bug-Ticket bei Failure
      const bugData = {
        templateId: "petclinic-bug",
        replacements: {
          modul: "Automated Test",
          beschreibung: testInfo.title,
          tatsaechlich: testInfo.error?.message || 'Test failed',
          browser: "Chromium"
        }
      };
      
      console.log('Auto-creating bug ticket:', JSON.stringify(bugData));
    }
  });
  
  test('Complete workflow test', async ({ page }) => {
    // Ihre Test-Logik hier
    await page.goto('http://localhost:8080');
    await expect(page.locator('h2')).toContainText('Welcome');
  });
});
```

## 📚 Nächste Schritte

### 1. Erweiterte MCP Features
- Visual Regression Testing Integration
- Cross-Platform Test Orchestration
- AI-powered Error Analysis

### 2. Team Integration
- MCP Training für andere Team-Mitglieder
- Shared Test-Templates entwickeln
- Best Practices dokumentieren

### 3. Continuous Improvement
- MCP Performance Monitoring
- Feedback-Loop etablieren
- Custom Templates für Ihr Team

---

**🎉 Herzlichen Glückwunsch!** Sie haben erfolgreich die MCP Server Integration gemeistert und können nun:
- ✅ Automatische Bug-Reports erstellen
- ✅ Remote Test-Orchestrierung nutzen
- ✅ Flaky Tests systematisch analysieren
- ✅ Performance-Monitoring implementieren
- ✅ CI/CD Integration aufbauen

**Next Level:** Erweitern Sie Ihre MCP-Workflows mit eigenen Templates und Automatisierungen!
