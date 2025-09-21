# 🚀 Playwright Tests mit JIRA Integration - Setup Anleitung

## ✅ Was wurde implementiert

### 1. JIRA Integration
- **MCP JIRA Server**: Läuft auf http://localhost:3000
- **Playwright Reporter**: Automatische JIRA Ticket-Erstellung
- **JIRA Templates**: Vorgefertigte Templates für verschiedene Ticket-Typen
- **Automatische Reports**: Test-Suite Reports und Failure Tracking

### 2. Features der Integration
- ✅ **Automatische Test-Reports** in JIRA
- 🐛 **Test Failure Tickets** mit Details
- 📊 **Performance Monitoring**
- 🔄 **Flaky Test Detection**
- 📈 **Trend Analysis**

### 3. Implementierte Komponenten
```
playwright/
├── helpers/
│   ├── jira-reporter.js          # Vollständiger JIRA Reporter
│   └── jira-reporter-simple.js   # Vereinfachter Reporter
├── scripts/
│   └── demo-jira-integration.js  # Demo Script
└── tests/api/
    └── petclinic-api.spec.ts     # Beispiel API Tests
```

## 🔧 Setup und Verwendung

### Schnellstart (Alle Services starten)
```powershell
# Windows Batch
.\start-tests-with-jira.bat

# Oder PowerShell
.\start-tests-with-jira.ps1
```

### Manuelle Schritte

#### 1. JIRA Setup
```powershell
# JIRA Container starten
docker-compose -f docker-compose-jira.yml up -d

# JIRA Setup: http://localhost:8081
# - Database: External PostgreSQL
# - Host: jira-postgres
# - Database: jira
# - Username: jira
# - Password: jira123
# - Admin User: admin/admin123
```

#### 2. MCP JIRA Server starten
```powershell
cd mcp-jira
npm install
npm start
# Server läuft auf http://localhost:3000
```

#### 3. PetClinic starten
```powershell
.\mvnw.cmd spring-boot:run
# App läuft auf http://localhost:8080
```

#### 4. Tests mit JIRA Integration ausführen
```powershell
cd playwright
npm install

# JIRA Reporter aktivieren (in playwright.config.ts)
# reporter: ['./helpers/jira-reporter-simple.js']

# Tests ausführen
npm test
# oder spezifisch:
npx playwright test tests/api/petclinic-api.spec.ts
```

## 📊 JIRA Integration Features

### Automatische Ticket-Erstellung
1. **Test Suite Report** (nach jedem Test-Lauf)
   - Gesamtzusammenfassung
   - Pass/Fail Rate
   - Execution Time
   - Browser Info

2. **Test Failure Tickets** (bei fehlgeschlagenen Tests)
   - Test Details
   - Error Messages
   - Stack Trace
   - Reproduction Steps

3. **Flaky Test Tickets** (bei instabilen Tests)
   - Retry Information
   - Investigation Notes

### JIRA Templates verfügbar
- `playwright-test-failure`: Test Failure Reports
- `playwright-suite-report`: Suite Execution Reports
- `flaky-test-investigation`: Flaky Test Analysis
- `performance-investigation`: Performance Issues
- `test-enhancement`: Test Improvement Requests

## 🎯 Demo und Test

### Demo Script ausführen
```powershell
cd playwright
node scripts/demo-jira-integration.js
```

### Beispiel Output:
```
🚀 Demo: Playwright Tests mit JIRA Integration

📊 Test Execution Summary:
   Total Tests: 4
   ✅ Passed: 3
   ❌ Failed: 1
   🎯 Pass Rate: 75.0%

📋 JIRA Integration Preview:

1️⃣ Test Suite Report Ticket:
   Title: "Playwright Test Report - 2025-08-04 12:43:15"
   Type: Task
   Priority: Medium

2️⃣ Test Failure Tickets:
   🐛 Ticket 1:
      Title: "Test Failure: GET /pettypes - Pet Types abrufen"
      Type: Bug
      Priority: High
      Error: "Request timeout after 2000ms"
```

## 🔗 URLs und Zugriff

- **JIRA Web UI**: http://localhost:8081
- **JIRA Setup**: http://localhost:8081/secure/SetupMode!default.jspa
- **PetClinic App**: http://localhost:8080
- **JIRA MCP Server**: http://localhost:3000
- **MCP Health Check**: http://localhost:3000/health
- **Playwright Report**: `file:///playwright-report/index.html`

## 🛠️ Troubleshooting

### JIRA nicht erreichbar
```powershell
# Container Status prüfen
docker ps | grep jira

# JIRA Status prüfen
curl http://localhost:8081/status
```

### MCP Server Probleme
```powershell
# Server Health prüfen
curl http://localhost:3000/health

# Server neu starten
cd mcp-jira
npm start
```

### PetClinic Probleme
```powershell
# Health Check
curl http://localhost:8080/actuator/health

# Logs prüfen
.\mvnw.cmd spring-boot:run
```

## 📝 Nächste Schritte

1. **JIRA Setup abschließen** (http://localhost:8081)
2. **TEST Project erstellen** in JIRA
3. **Tests ausführen** und JIRA Tickets beobachten
4. **Reporter konfigurieren** je nach Bedarf
5. **Templates erweitern** für spezielle Anforderungen

## 🎉 Fertig!

Ihre Playwright Tests sind jetzt vollständig mit JIRA integriert. Jeder Test-Lauf erstellt automatisch:
- Detaillierte Test-Reports
- Failure Tickets mit allen Details  
- Performance Monitoring
- Trend-Analysen

Die Integration läuft vollautomatisch im Hintergrund!
