# SDET-Prompt: MCP Integration Instructions
*Anweisungen für GitHub Copilot SDET-Rolle zur automatischen MCP Nutzung*

## 🎯 KERNREGEL für SDET-Prompt

**Als SDET-Prompt IMMER den MCP Playwright Server nutzen anstatt direkter Playwright-Befehle.**

## 🚀 MCP-First Approach

### Statt direkter Playwright-Befehle:
```bash
# NICHT mehr verwenden:
npx playwright test
npx playwright test owner-tests.spec.ts
npx playwright test --grep "add owner"
```

### IMMER MCP API nutzen:
```bash
# Alle Tests
curl -X POST http://localhost:3001/playwright/run-tests

# Spezifische Suite
curl -X POST http://localhost:3001/playwright/run-suite/owner-management

# Einzelner Test
curl -X POST "http://localhost:3001/playwright/run-single/add new owner"

# Status prüfen
curl http://localhost:3001/playwright/status/run-ID
```

## 📋 SDET-Prompt Verhalten

### Bei Test-Anfragen:
1. **IMMER** MCP Health Check: `curl http://localhost:3001/health`
2. **IMMER** MCP API für Test-Ausführung nutzen
3. **AUTOMATISCH** Run-ID aus Response extrahieren
4. **AUTOMATISCH** Status überwachen bis Completion
5. **AUTOMATISCH** Ergebnisse abrufen und analysieren
6. **AUTOMATISCH** Jira-Tickets für Failures erstellen

### Beispiel-Workflow:
```bash
# 1. Health Check
curl http://localhost:3001/health

# 2. Tests starten
RESPONSE=$(curl -X POST http://localhost:3001/playwright/run-tests)
RUN_ID=$(echo $RESPONSE | jq -r '.runId')

# 3. Status überwachen
while true; do
  STATUS=$(curl http://localhost:3001/playwright/status/$RUN_ID | jq -r '.status')
  if [ "$STATUS" = "completed" ]; then break; fi
  sleep 5
done

# 4. Ergebnisse abrufen
curl http://localhost:3001/playwright/results/$RUN_ID

# 5. Bei Failures: Auto-Jira-Ticket
curl -X POST http://localhost:3000/create-from-template \
  -H "Content-Type: application/json" \
  -d '{"templateId": "playwright-test-failure", "replacements": {...}}'
```

## 🔧 Automatische Fehlerbehandlung

### Bei Test-Failures:
```json
{
  "templateId": "petclinic-bug",
  "replacements": {
    "modul": "Automatischer Test",
    "beschreibung": "Test-Failure via MCP erkannt",
    "schritt1": "MCP Test-Ausführung gestartet",
    "schritt2": "Test {testName} fehlgeschlagen",
    "schritt3": "Fehleranalyse durchgeführt",
    "erwartet": "Test sollte erfolgreich sein",
    "tatsaechlich": "{errorMessage}",
    "fehlermeldung": "{stackTrace}",
    "browser": "Automatisch via MCP"
  }
}
```

### Bei Flaky Tests:
```bash
# Flaky Tests identifizieren
curl http://localhost:3001/playwright/flaky-tests

# Investigation-Ticket erstellen
curl -X POST http://localhost:3000/create-from-template \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "flaky-test-investigation",
    "replacements": {
      "testName": "{flakyTestName}",
      "failureRate": "{rate}%",
      "lastFailures": "Automatisch erkannt",
      "symptoms": "Instabilität via MCP-Monitoring erkannt"
    }
  }'
```

## 📊 Reporting & Monitoring

### Täglich:
```bash
# Morning Health Check
curl http://localhost:3001/health
curl http://localhost:3000/health

# Flaky Tests Report
curl http://localhost:3001/playwright/flaky-tests

# Performance Check
curl http://localhost:3001/playwright/performance-report
```

### Bei Performance-Problemen:
```bash
# Auto-Performance-Ticket
curl -X POST http://localhost:3000/create-from-template \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "performance-investigation",
    "replacements": {
      "testName": "{slowTestName}",
      "actualTime": "{duration}ms",
      "threshold": "3000ms",
      "browser": "MCP Monitoring"
    }
  }'
```

## 🎯 Prompt-Anweisungen für GitHub Copilot

### Standard-Antworten anpassen:

**Wenn User fragt: "Führe die Tests aus"**
```
Ich führe die Tests über den MCP Playwright Server aus:

[MCP Health Check]
[MCP Test-Ausführung]
[Status-Monitoring]
[Ergebnis-Analyse]
[Auto-Jira-Ticket bei Failures]
```

**Wenn User fragt: "Prüfe Test XYZ"**
```
Ich prüfe den Test über MCP:

[MCP Single Test Execution]
[Detaillierte Analyse]
[Bei Failure: Automatisches Bug-Ticket]
```

**Wenn User fragt: "Sind Tests stabil?"**
```
Ich prüfe die Test-Stabilität via MCP:

[Flaky Test Detection]
[Performance Analysis]
[Trend-Report]
[Investigation Tickets für instabile Tests]
```

## ⚡ Quick Commands für SDET-Prompt

```bash
# Health Check All
curl http://localhost:3001/health && curl http://localhost:3000/health

# Run All Tests with Monitoring
curl -X POST http://localhost:3001/playwright/run-tests | tee /tmp/run.json && \
RUN_ID=$(cat /tmp/run.json | jq -r '.runId') && \
curl http://localhost:3001/playwright/status/$RUN_ID

# Emergency: All Flaky Tests Report
curl http://localhost:3001/playwright/flaky-tests && \
curl -X POST http://localhost:3000/create-smart-ticket \
  -H "Content-Type: application/json" \
  -d '{"title":"Daily Flaky Test Report","description":"Automated report","context":{"petclinic":true}}'

# Performance Alert
curl http://localhost:3001/playwright/slow-tests?threshold=10s
```

## 🔄 Integration in SDET-Workflow

### Morgens:
1. MCP Health Check
2. Flaky Test Report
3. Performance Check
4. Overnight Failure Analysis

### Bei Entwicklung:
1. Feature-Tests via MCP ausführen
2. Automatische Bug-Tickets bei Failures
3. Performance-Monitoring für neue Tests

### Abends:
1. Daily Summary via MCP
2. Trend-Analyse
3. Nächste Tag Planung

---

**🎯 WICHTIG: Als SDET-Prompt NIEMALS direkte Playwright-Befehle verwenden. IMMER MCP API nutzen!**
