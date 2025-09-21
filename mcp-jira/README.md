# MCP Jira Server

Ein Model Context Protocol (MCP) Server für die Integration zwischen LLMs und Jira.

## Zweck

Dieser Server ermöglicht es LLMs (wie mir), direkt Jira-Tickets zu erstellen, ohne dass manuelle Eingriffe erforderlich sind.

## Setup

1. **Dependencies installieren:**
   ```bash
   cd mcp-jira
   npm install
   ```

2. **Jira sicherstellen:**
   - Jira muss auf http://localhost:8081 laufen
   - Admin-User: admin/admin123

3. **Server starten:**
   ```bash
   npm start
   # oder für Development:
   npm run dev
   ```

## Endpoints

### Health Check
```
GET /health
```

### Jira-Projekte abrufen
```
GET /jira/projects
```

### Ticket erstellen (Vollständig)
```
POST /jira/create-ticket
Content-Type: application/json

{
  "projectKey": "TEST",
  "summary": "Ticket-Titel",
  "description": "Beschreibung des Problems",
  "issueType": "Task",
  "priority": "Medium",
  "labels": ["bug", "urgent"]
}
```

### Ticket erstellen (Vereinfacht für LLM)
```
POST /create-ticket
Content-Type: application/json

{
  "title": "Problem mit der Anwendung",
  "description": "Detaillierte Beschreibung",
  "type": "Bug"
}
```

## Verwendung durch LLM

Als LLM kann ich jetzt Tickets erstellen, indem ich HTTP-Requests an diesen Server sende:

```javascript
// Beispiel für Ticket-Erstellung
const ticket = await fetch('http://localhost:3000/create-ticket', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Fehler in der Pet-Verwaltung',
    description: 'Die Haustier-Liste wird nicht korrekt angezeigt',
    type: 'Bug'
  })
});
```

## Konfiguration

Die Jira-Verbindungsdetails sind in `index.js` konfiguriert:
- Base URL: http://localhost:8081
- Username: admin
- Password: admin123

## Features

- ✅ Einfache Ticket-Erstellung
- ✅ Projekt- und Issue-Type-Abfrage
- ✅ Error Handling
- ✅ CORS-Support
- ✅ Logging
- ✅ Health Check

## Nächste Schritte

1. Server starten und testen
2. Erste Tickets über die API erstellen
3. Bei Bedarf weitere Jira-Features hinzufügen
