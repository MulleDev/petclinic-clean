# 🎯 JIRA MCP Server

Ein umfassender Model Context Protocol (MCP) Server für die Integration mit JIRA, speziell entwickelt für die PetClinic-Anwendung.

## 📋 Übersicht

Dieser MCP Server bietet eine vollständige JIRA-Integration mit Template-basierter Ticket-Erstellung, Löschfunktionen und umfassender REST API Unterstützung. Entwickelt für nahtlose Zusammenarbeit zwischen LLMs und JIRA-Systemen.

## 🚀 Features

### ✅ Ticket-Erstellung
- **Alle 5 JIRA Ticket-Typen unterstützt:**
  - 📋 **Task** - Allgemeine Aufgaben
  - 🐛 **Bug** - Fehlerberichte
  - 📖 **Story** - User Stories/Feature Requests
  - 📚 **Epic** - Große Initiativen
  - 📝 **Sub-Task** - Unteraufgaben (mit Parent-Key Support)

### 🗑️ Ticket-Löschung
- **Batch-Löschung** - Alle Tickets auf einmal entfernen
- **Einzellöschung** - Spezifische Tickets gezielt löschen
- **Forcierte Löschung** - Sub-Task-Berücksichtigung
- **Fallback-Mechanismen** - Direkte JIRA API als Backup

### 📝 Template-System
- **15+ vordefinierte Templates**
- **PetClinic-spezifische Templates**
- **Anpassbare Ticket-Strukturen**
- **Intelligente Platzhalter-Ersetzung**
- **Optimierte Template-Verarbeitung** (Bug-Fix für doppelte Replacements)

### 🔧 Technische Verbesserungen
- **Erweiterte Payload-Limits** (50MB statt Standard 100KB)
- **Verbesserte Titel-Anzeige** (korrekte [TITEL] Placeholder-Ersetzung)
- **Robuste Authentifizierung** (admin/admin für JIRA)
- **Fehlerbehandlung** für Template-Processing-Schleifen

## 🛠️ Installation

### Voraussetzungen
- Node.js (v14 oder höher)
- JIRA-Server (lokal oder remote)
- PetClinic-Projekt in JIRA

### Setup
```bash
# Verzeichnis wechseln
cd mcp-jira

# Dependencies installieren
npm install

# Umgebungsvariablen setzen (optional)
export PORT=3001
export JIRA_BASE_URL=http://localhost:8081
export JIRA_USERNAME=admin
export JIRA_PASSWORD=admin

# Server starten (empfohlen: in eigenem Fenster)
node index.js
```

### 🐛 Bekannte Probleme & Lösungen

#### Payload Too Large Fehler
```
PayloadTooLargeError: request entity too large
```
**Lösung:** Server verwendet jetzt 50MB Payload-Limit (automatisch konfiguriert).

#### Template-Replacement-Schleifen
```
Beschreibung wiederholt sich unendlich
```
**Lösung:** Optimierte Template-Verarbeitung verhindert doppelte Replacements (behoben).

#### JIRA Authentifizierung 403/401
```
Basic Authentication Failure
```
**Lösung:** Verwende admin/admin als Anmeldedaten. Bei Problemen JIRA-Container neu starten:
```bash
docker restart petclinic-jira-1
```

#### Titel zeigen nur Template-Präfixe
```
"PET-29: PetClinic Feature:" statt richtigem Titel
```
**Lösung:** Verwende [TITEL] Placeholder in Templates (automatisch behoben).

## 🌐 API Endpoints

### 📊 Server-Status
```
GET /health
```
Überprüft den Server-Status und JIRA-Verbindung.

**Response:**
```json
{
  "status": "healthy",
  "server": "JIRA MCP Server v1.0",
  "jira": "Connected to http://localhost:8081",
  "timestamp": "2025-09-21T..."
}
```

### 📋 Template-Management

#### Alle Templates abrufen
```
GET /templates
```

#### Spezifisches Template abrufen
```
GET /templates/:id
```

### 🎯 Ticket-Erstellung

#### Template-basierte Erstellung
```
POST /create-from-template
```

**Body:**
```json
{
  "templateId": "task",
  "title": "Meine Aufgabe",
  "description": "Beschreibung der Aufgabe",
  "customFields": {
    "priority": "High",
    "assignee": "admin"
  }
}
```

#### Sub-Task Erstellung
```json
{
  "templateId": "subtask",
  "title": "Sub-Task Titel",
  "description": "Sub-Task Beschreibung",
  "customFields": {
    "parentKey": "PET-123"
  }
}
```

#### Epic Erstellung
```json
{
  "templateId": "epic",
  "title": "Epic Titel",
  "description": "Epic Beschreibung",
  "customFields": {
    "epicName": "Optionaler Epic Name (sonst wird Titel verwendet)"
  }
}
```

#### Direkte Ticket-Erstellung
```
POST /jira/create-ticket
```

**Parameter:**
```json
{
  "projectKey": "PET",          // Projekt-Schlüssel (Standard: PET)
  "summary": "Ticket Titel",    // Erforderlich - Ticket-Titel
  "description": "Beschreibung", // Optional - Ticket-Beschreibung
  "issueType": "Task",          // Task, Bug, Story, Epic, Sub-task
  "priority": "Medium",         // Low, Medium, High, Highest
  "assignee": "admin",          // Optional - Zugewiesener Benutzer
  "labels": ["label1", "label2"], // Optional - Array von Labels
  "parentKey": "PET-123",       // Erforderlich für Sub-tasks
  "epicName": "Epic Name"       // Optional für Epics (fallback: summary)
}
```

**Epic-spezifische Konfiguration:**
- **Epic Name Feld:** Automatisch als `customfield_10104` gesetzt
- **Fallback-Logik:** Wenn `epicName` nicht angegeben, wird `summary` verwendet
- **JIRA-Validierung:** Epic Name ist für Epic-Tickets erforderlich
```

### 🗑️ Ticket-Löschung

#### Alle Tickets löschen
```
DELETE /delete-all-tickets
```

**Response:**
```json
{
  "success": true,
  "message": "5 von 5 Tickets erfolgreich gelöscht",
  "deleted": 5,
  "total": 5,
  "deletedTickets": ["PET-1", "PET-2", "PET-3", "PET-4", "PET-5"]
}
```

#### Spezifisches Ticket löschen
```
DELETE /delete-ticket/:key
```

**Beispiel:**
```
DELETE /delete-ticket/PET-123
```

### 🔗 Legacy Endpoints
```
GET /jira/projects              # Alle JIRA-Projekte
POST /jira/create-ticket        # Vollständige Ticket-Erstellung
POST /create-ticket             # Vereinfachte Ticket-Erstellung
```

## 📝 Verfügbare Templates

### 🔧 Standard Templates
- **`task`** - Allgemeine Aufgabe
- **`bug-report`** - Standardisierter Bug-Report
- **`feature-request`** - Feature-Anfrage/User Story
- **`epic`** - Epic-Template
- **`subtask`** - Sub-Task Template
- **`user-story`** - User Story Template
- **`test-automation`** - Test-Automatisierung

### 🐾 PetClinic Templates
- **`petclinic-bug`** - Bug-Report für PetClinic
- **`petclinic-epic`** - Epic für PetClinic-Features
- **`petclinic-subtask`** - Sub-Task für PetClinic

### 🎭 Playwright Templates
- **`playwright-test`** - Playwright Test-Template
- **`playwright-bug`** - Playwright Bug-Report
- **`playwright-feature`** - Playwright Feature-Request

## 🔧 Konfiguration

### Umgebungsvariablen
```bash
# Server-Port (Standard: 3001)
PORT=3001

# JIRA-Konfiguration
JIRA_BASE_URL=http://localhost:8081
JIRA_USERNAME=admin
JIRA_PASSWORD=admin

# Development-Modus
NODE_ENV=development
```

### JIRA-Setup
Stellen Sie sicher, dass:
- JIRA-Server läuft auf http://localhost:8081
- PET-Projekt existiert
- Admin-Benutzer: admin/admin
- Alle benötigten Issue-Typen konfiguriert sind

## 📊 Verwendungsbeispiele

### Einfache Ticket-Erstellung
```javascript
// Task erstellen
const taskData = {
  templateId: "task",
  title: "Neue Aufgabe implementieren",
  description: "Detaillierte Beschreibung der Aufgabe"
};

fetch('http://localhost:3001/create-from-template', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(taskData)
});
```

### Bug-Report erstellen
```javascript
const bugData = {
  templateId: "petclinic-bug",
  title: "Login-Bug im PetClinic System",
  description: "Benutzer können sich nicht anmelden",
  customFields: {
    priority: "High",
    component: "Authentication"
  }
};
```

### Epic mit Sub-Tasks
```javascript
// 1. Epic erstellen
const epicData = {
  templateId: "petclinic-epic",
  title: "Neue Tierregistrierung",
  description: "Komplette Überarbeitung der Tierregistrierung"
};

// 2. Sub-Task erstellen
const subtaskData = {
  templateId: "petclinic-subtask",
  title: "UI-Design für Registrierung",
  description: "Design der neuen Registrierungsmaske",
  customFields: {
    parentKey: "PET-456" // Epic-Key
  }
};
```

### Batch-Löschung
```javascript
// Alle Tickets löschen
fetch('http://localhost:3001/delete-all-tickets', {
  method: 'DELETE'
});

// Spezifisches Ticket löschen
fetch('http://localhost:3001/delete-ticket/PET-123', {
  method: 'DELETE'
});
```

## 🚨 Fehlerbehandlung

Der Server implementiert umfassende Fehlerbehandlung:

- **Validation Errors** - Fehlende Pflichtfelder
- **JIRA API Errors** - Verbindungsprobleme
- **Template Errors** - Ungültige Template-IDs
- **Sub-Task Errors** - Fehlende Parent-Keys

### Beispiel Error Response
```json
{
  "success": false,
  "error": "Summary ist erforderlich für die Ticket-Erstellung",
  "details": "Validation failed"
}
```

## 🔍 Debugging

### Server-Logs überprüfen
Der Server gibt detaillierte Logs aus:
```
🚀 MCP Jira Server läuft auf http://localhost:3001
📋 Jira-Integration: http://localhost:8081
🎯 Ticket erstellt: PET-123
🗑️ Lösche alle Tickets im PET Projekt...
✅ Ticket PET-123 gelöscht
```

### Health-Check
```bash
curl http://localhost:3001/health
```

### Template-Übersicht
```bash
curl http://localhost:3001/templates
```

## 🤝 Integration mit LLMs

Dieser MCP Server ist speziell für die Verwendung mit Large Language Models optimiert:

### Claude/ChatGPT Integration
```javascript
// Beispiel für LLM-Integration
const response = await callJiraMCP({
  action: "create_ticket",
  template: "bug-report",
  title: "LLM-generierter Bug-Report",
  description: "Automatisch erkannter Bug durch KI-Analyse"
});
```

### Automatisierte Workflows
- **Bug-Tracking** - Automatische Bug-Erstellung aus Code-Analyse
- **Feature-Requests** - KI-generierte User Stories
- **Test-Automation** - Playwright-Test-Tickets aus Code-Reviews

## 📈 Performance

- **Schnelle Response-Zeiten** - < 100ms für Template-Operationen
- **Batch-Operations** - Effiziente Mehrfach-Löschung
- **Error Recovery** - Automatische Fallback-Mechanismen
- **Memory-Efficient** - Optimierte Template-Verarbeitung

## 🔐 Sicherheit

- **Basic Authentication** für JIRA
- **Input Validation** für alle Endpoints
- **Error Sanitization** - Keine sensiblen Daten in Logs
- **CORS-Support** für Cross-Origin Requests

## 📚 Erweiterungen

### Neue Templates hinzufügen
```javascript
// In index.js erweitern
TICKET_TEMPLATES['mein-template'] = {
  name: 'Mein Custom Template',
  issueType: 'Task',
  priority: 'Medium',
  summary: 'Custom Template: [TITEL]',
  description: 'Custom Beschreibung...'
};
```

### Neue Endpoints
```javascript
app.get('/custom-endpoint', (req, res) => {
  // Custom Funktionalität
});
```

## 🆘 Support

Bei Problemen oder Fragen:

1. **Server-Logs prüfen** - Detaillierte Fehlerinformationen
2. **Health-Check ausführen** - Server-Status überprüfen
3. **JIRA-Verbindung testen** - Manuelle API-Calls
4. **Template-Validation** - Korrekte Template-IDs verwenden

## 📋 Changelog

### v1.1 (Current) - September 2025
- 🎯 **Epic Support:** Vollständige Epic-Ticket-Erstellung mit customfield_10104
- 🔧 **Epic Name Feld:** Automatische Epic Name-Zuordnung für JIRA-Validierung
- 🚀 **Fallback-Logik:** Epic Name verwendet summary als Fallback
- ✅ Alle 5 JIRA Ticket-Typen mit vollständiger Validierung

### v1.0 - September 2025
- ✅ Alle 5 JIRA Ticket-Typen
- ✅ Template-System mit 15+ Templates
- ✅ Batch-Delete Funktionalität
- ✅ Sub-Task Parent-Key Support
- 🐛 **Bug-Fix:** Template-Processing-Schleifen behoben
- 🚀 **Performance:** 50MB Payload-Limit (vorher 100KB)
- 🎯 **UI-Fix:** Korrekte Titel-Anzeige mit [TITEL] Placeholder
- 🔧 **Auth-Fix:** Robuste admin/admin Authentifizierung

### Aktueller Status
- 🟢 **Server:** Läuft stabil auf Port 3001
- 🟢 **JIRA:** Verbunden mit localhost:8081
- 🟢 **Templates:** Alle 15+ Templates funktional
- 🟢 **Authentifizierung:** admin/admin konfiguriert
- 🟢 **Payload-Limits:** 50MB für große Requests
- 🟢 **Error-Handling:** Template-Loops verhindert
- 🟢 **Epic Support:** customfield_10104 Epic Name vollständig implementiert
- 🎯 **Ticket-Typen:** Alle 5 JIRA Issue-Typen mit korrekter Validierung

### Nächste Schritte
- 🔄 Integration mit Claude/LLM-Workflows
- 📊 Analytics für Ticket-Erstellung
- 🎨 Template-Customization UI
- 🔗 Advanced JIRA-Field-Mapping
- ✅ Batch- und Einzellöschung
- ✅ Sub-Task Parent-Key Support
- ✅ Umfassende Fehlerbehandlung
- ✅ PetClinic-spezifische Templates

---

**🎯 Entwickelt für die nahtlose Integration zwischen KI-Systemen und JIRA-Workflows in der PetClinic-Umgebung.**
