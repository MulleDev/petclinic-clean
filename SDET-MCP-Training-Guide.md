# SDET MCP Server Training Guide
*Leitfaden für Software Development Engineers in Test zur effektiven Nutzung der MCP Server Integration*

## 🎯 Übersicht

Als SDET haben Sie Zugang zu zwei leistungsstarken MCP (Model Context Protocol) Servern, die Ihre Testautomatisierung erheblich verbessern:

1. **MCP Jira Server** (`localhost:3000`) - Automatische Jira-Ticket-Erstellung
2. **MCP Playwright Server** (`localhost:3001`) - Intelligente Test-Ausführung mit Jira-Integration

## 🚀 Quick Start Checklist

### Voraussetzungen
- [ ] Node.js installiert
- [ ] PetClinic Backend läuft auf `localhost:8080`
- [ ] Jira läuft auf `localhost:8081`
- [ ] Grundkenntnisse in Playwright und API-Testing

### Setup
```powershell
# 1. MCP Jira Server starten
cd c:\Users\Dennis\Projekte\VSProjekte\PetClinic\mcp-jira
npm install
npm start

# 2. MCP Playwright Server starten (neues Terminal)
cd c:\Users\Dennis\Projekte\VSProjekte\PetClinic\mcp-playwright
npm install
npm start
```

## 📋 MCP Jira Server - SDET Workflows

### 1. Health Check & Setup Validierung
```powershell
# Server Status prüfen
curl http://localhost:3000/health

# Verfügbare Templates anzeigen
curl http://localhost:3000/templates
```

### 2. Bug Reports automatisch erstellen
**Use Case:** Test schlägt fehl → Automatisches Bug-Ticket

```json
POST http://localhost:3000/create-from-template
Content-Type: application/json

{
  "templateId": "petclinic-bug",
  "replacements": {
    "modul": "Owner Management",
    "beschreibung": "Add Owner form validation failing",
    "schritt1": "Navigate to /owners/new",
    "schritt2": "Enter invalid email format",
    "schritt3": "Click Save",
    "erwartet": "Validation error message displayed",
    "tatsaechlich": "Form submits with invalid data",
    "fehlermeldung": "ValidationException: Invalid email format",
    "browser": "Chrome 120.0.0.0"
  }
}
```

### 3. Test-Automation Tickets
**Use Case:** Neue Testfälle dokumentieren

```json
POST http://localhost:3000/create-from-template
Content-Type: application/json

{
  "templateId": "test-automation",
  "replacements": {
    "feature": "Email Validation",
    "testfall": "Verify email format validation on owner creation",
    "priority": "High",
    "complexity": "Medium"
  }
}
```

### 4. Performance Investigation
**Use Case:** Langsame Tests identifiziert

```json
POST http://localhost:3000/create-smart-ticket
Content-Type: application/json

{
  "title": "Performance: Slow test execution in owner-tests.spec.ts",
  "description": "Test suite taking >30s, expected <10s. Investigation needed.",
  "context": {
    "petclinic": true,
    "performance": true,
    "testSuite": "owner-tests.spec.ts"
  }
}
```

## 🎭 MCP Playwright Server - Erweiterte Test-Automation

### 1. Remote Test-Ausführung
```powershell
# Alle Tests ausführen
curl -X POST http://localhost:3001/playwright/run-tests

# Spezifische Test-Suite
curl -X POST http://localhost:3001/playwright/run-suite/owner-management

# Einzelner Test
curl -X POST "http://localhost:3001/playwright/run-single/add new owner"
```

### 2. Test-Monitoring
```powershell
# Aktive Test-Läufe
curl http://localhost:3001/playwright/active-runs

# Status eines spezifischen Laufs
curl http://localhost:3001/playwright/status/run-123

# Ergebnisse abrufen
curl http://localhost:3001/playwright/results/run-123
```

### 3. Flaky Test Detection
```powershell
# Instabile Tests identifizieren
curl http://localhost:3001/playwright/flaky-tests

# Automatisches Bug-Ticket für Flaky Test
curl -X POST http://localhost:3001/playwright/create-bug-ticket \
  -H "Content-Type: application/json" \
  -d '{"testName": "owner-creation-test", "failureReason": "timeout"}'
```

## 💡 SDET Best Practices mit MCP

### 1. Automatisierte Failure-Analyse
**Workflow:** Test Failed → MCP analysiert → Jira-Ticket → Team-Benachrichtigung

```javascript
// In Ihrem Playwright-Test
test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status === 'failed') {
    // Screenshot für Fehleranalyse
    const screenshot = await page.screenshot();
    
    // Automatisches Jira-Ticket via MCP
    const ticketData = {
      templateId: "playwright-test-failure",
      replacements: {
        testName: testInfo.title,
        error: testInfo.error?.message || 'Unknown error',
        screenshot: screenshot.toString('base64')
      }
    };
    
    await fetch('http://localhost:3000/create-from-template', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ticketData)
    });
  }
});
```

### 2. Intelligente Test-Suite-Planung
```powershell
# Wöchentlicher Report über Test-Performance
curl http://localhost:3001/playwright/report/last-7d

# Empfehlungen für Test-Optimierung
curl http://localhost:3001/playwright/optimization-suggestions
```

### 3. Integration in CI/CD Pipeline
```yaml
# .github/workflows/test-with-mcp.yml
- name: Run Tests with MCP Integration
  run: |
    # MCP Server starten
    npm run start:mcp-servers &
    
    # Tests ausführen
    curl -X POST http://localhost:3001/playwright/run-tests
    
    # Ergebnisse in Jira dokumentieren
    curl -X POST http://localhost:3000/create-smart-ticket \
      -d '{"title": "Daily Test Report", "context": {"automated": true}}'
```

## 🔧 Troubleshooting für SDETs

### Häufige Probleme

#### 1. MCP Server startet nicht
```powershell
# Port-Konflikte prüfen
netstat -an | findstr "3000\|3001"

# Logs prüfen
cd mcp-jira && npm run debug
cd mcp-playwright && npm run debug
```

#### 2. Jira-Connection fehlschlägt
```powershell
# Jira-Erreichbarkeit testen
curl http://localhost:8081/rest/api/2/myself

# MCP Jira Config prüfen
Get-Content mcp-jira\index.js | Select-String "JIRA"
```

#### 3. Playwright-Tests via MCP schlagen fehl
```powershell
# Lokale Playwright-Konfiguration validieren
npx playwright test --dry-run

# MCP Playwright Config prüfen
curl http://localhost:3001/playwright/config
```

## 📊 Reporting & Metriken

### 1. Test-Qualitäts-Dashboard
```javascript
// Automatisches Weekly Report
const weeklyReport = await fetch('http://localhost:3001/playwright/analytics/weekly');
const jiraTicket = await fetch('http://localhost:3000/create-smart-ticket', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: `Weekly Test Quality Report - CW${getCurrentWeek()}`,
    description: `Automated report: ${weeklyReport.summary}`,
    context: { report: true, weekly: true }
  })
});
```

### 2. Flaky Test Tracking
```powershell
# Flaky Tests der letzten 30 Tage
curl "http://localhost:3001/playwright/flaky-tests?days=30"

# Trend-Analyse
curl "http://localhost:3001/playwright/flaky-trends"
```

## 🎯 Advanced SDET Workflows

### 1. Test Data Management via MCP
```javascript
// Testdaten automatisch generieren und in Jira dokumentieren
const testDataRequest = {
  templateId: "test-data-request",
  replacements: {
    feature: "Owner Management",
    dataType: "Valid Owners with Pets",
    quantity: "50 records",
    purpose: "Performance Testing"
  }
};
```

### 2. Cross-Platform Test Orchestration
```powershell
# Tests auf verschiedenen Browsern via MCP
curl -X POST http://localhost:3001/playwright/run-cross-platform \
  -d '{"browsers": ["chromium", "firefox", "webkit"], "suite": "critical-path"}'
```

### 3. Visual Regression Integration
```powershell
# Visual Tests mit automatischem Jira-Report
curl -X POST http://localhost:3001/playwright/visual-regression \
  -d '{"baseline": "main", "current": "feature-branch"}'
```

## 📚 Weiterführende Ressourcen

### Dokumentation
- `mcp-jira/BA-Integration-Guide.md` - Jira-Templates und API-Details
- `mcp-playwright/Playwright-MCP-Concept.md` - Technisches Konzept
- `KI-SDET-Dokumentation.md` - SDET-spezifische Best Practices

### Quick Reference
```powershell
# MCP Health Checks
curl http://localhost:3000/health  # Jira Server
curl http://localhost:3001/health  # Playwright Server

# Emergency Restart
taskkill /f /im node.exe  # Alle Node-Prozesse beenden
cd mcp-jira && npm start  # Jira Server neu starten
cd mcp-playwright && npm start  # Playwright Server neu starten
```

## ✅ SDET Onboarding Checklist

- [ ] MCP Server Setup erfolgreich getestet
- [ ] Erstes Bug-Ticket via MCP erstellt
- [ ] Playwright-Tests via MCP ausgeführt
- [ ] Flaky Test Detection verstanden
- [ ] Automatische Reporting-Pipeline eingerichtet
- [ ] CI/CD Integration geplant
- [ ] Team über neue MCP-Capabilities informiert

---

**🚀 Sie sind jetzt bereit, die MCP Server für effiziente Testautomatisierung zu nutzen!**

*Bei Fragen: Siehe Troubleshooting-Sektion oder kontaktieren Sie das SDET-Team.*
