# MCP Jira Server - Business Analyst Integration Guide

## Übersicht
Du hast Zugang zu einem MCP Jira Server, der es dir ermöglicht, automatisch strukturierte Jira-Tickets zu erstellen. Der Server läuft auf `http://localhost:3000` und ist mit dem PET-Projekt verbunden.

## Verfügbare API-Endpunkte

### 1. Health Check
```
GET http://localhost:3000/health
```
Prüft, ob der MCP Server funktioniert.

### 2. Template-Übersicht
```
GET http://localhost:3000/templates
```
Zeigt alle verfügbaren Ticket-Templates an.

### 3. Einfache Ticket-Erstellung
```
POST http://localhost:3000/create-ticket
Content-Type: application/json

{
  "title": "Ticket-Titel hier",
  "description": "Detaillierte Beschreibung",
  "type": "Bug|Story|Aufgabe"
}
```

### 4. Template-basierte Ticket-Erstellung (EMPFOHLEN)
```
POST http://localhost:3000/create-from-template
Content-Type: application/json

{
  "templateId": "petclinic-bug|petclinic-feature|test-automation",
  "replacements": {
    "schlüssel": "wert",
    "modul": "Haustier-Verwaltung",
    "beschreibung": "Bug-Beschreibung"
  }
}
```

### 5. Intelligente Ticket-Erstellung
```
POST http://localhost:3000/create-smart-ticket
Content-Type: application/json

{
  "title": "Feature: Neue Suchfunktion",
  "description": "Als Benutzer möchte ich...",
  "context": { "petclinic": true }
}
```

## Verfügbare Templates

### 1. PetClinic Bug Report (`petclinic-bug`)
**Verwendung:** Für Bugs in der PetClinic-Anwendung

**Platzhalter:**
- `[MODUL]` - Betroffenes Modul (z.B. "Haustier-Verwaltung")
- `[BESCHREIBUNG]` - Kurze Bug-Beschreibung
- `[SCHRITT1]`, `[SCHRITT2]`, `[SCHRITT3]` - Reproduktionsschritte
- `[ERWARTET]` - Erwartetes Verhalten
- `[TATSAECHLICH]` - Tatsächliches Verhalten
- `[FEHLERMELDUNG]` - Console-Fehlermeldung
- `[BROWSER]` - Browser-Info

**Beispiel:**
```json
{
  "templateId": "petclinic-bug",
  "replacements": {
    "modul": "Haustier-Verwaltung",
    "beschreibung": "Geburtsdatum wird falsch angezeigt",
    "schritt1": "Gehe zur Haustier-Liste",
    "schritt2": "Öffne Haustier-Details",
    "schritt3": "Prüfe Geburtsdatum",
    "erwartet": "Korrektes Datum anzeigen",
    "tatsaechlich": "Datum um einen Tag verschoben",
    "browser": "Chrome 125"
  }
}
```

### 2. PetClinic Feature Request (`petclinic-feature`)
**Verwendung:** Für neue Features in der PetClinic

**Platzhalter:**
- `[FEATURE NAME]` - Name des Features
- `[Funktionalität]` - Gewünschte Funktionalität
- `[Nutzen]` - Warum wird das Feature benötigt

**Beispiel:**
```json
{
  "templateId": "petclinic-feature",
  "replacements": {
    "feature name": "Erweiterte Suchfunktion",
    "funktionalität": "nach mehreren Kriterien gleichzeitig suchen",
    "nutzen": "schneller die richtigen Haustiere finden"
  }
}
```

### 3. Test Automation (`test-automation`)
**Verwendung:** Für Test-Automatisierung Tasks

**Platzhalter:**
- `[TEST BESCHREIBUNG]` - Was getestet werden soll

## BA-spezifische Workflows

### Workflow 1: Bug Report erstellen
```javascript
// Verwende diese API-Call für Bug Reports
const bugTicket = await fetch('http://localhost:3000/create-from-template', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    templateId: 'petclinic-bug',
    replacements: {
      modul: 'Owner Management',
      beschreibung: 'E-Mail Validierung funktioniert nicht',
      schritt1: 'Öffne Owner-Formular',
      schritt2: 'Gib ungültige E-Mail ein',
      schritt3: 'Speichere den Owner',
      erwartet: 'Fehlermeldung sollte erscheinen',
      tatsaechlich: 'Owner wird ohne Validierung gespeichert',
      browser: 'Chrome 125'
    }
  })
});
```

### Workflow 2: User Story erstellen
```javascript
// Für Feature Requests/User Stories
const featureTicket = await fetch('http://localhost:3000/create-from-template', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    templateId: 'petclinic-feature',
    replacements: {
      'feature name': 'Owner E-Mail Benachrichtigungen',
      'funktionalität': 'automatische E-Mails bei Terminen erhalten',
      'nutzen': 'keine Termine verpassen'
    }
  })
});
```

### Workflow 3: Schnelle Ticket-Erstellung
```javascript
// Für einfache, schnelle Tickets
const quickTicket = await fetch('http://localhost:3000/create-smart-ticket', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Bug: Owner-Liste lädt nicht',
    description: 'Die Owner-Liste zeigt einen Fehler beim Laden der Daten.',
    context: { petclinic: true }
  })
});
```

## Prompt-Integration für BA

Füge diese Anweisung zu deinem BA-Prompt hinzu:

```
Du bist ein Business Analyst mit Zugang zu einem MCP Jira Server auf http://localhost:3000.

TICKET-ERSTELLUNG REGELN:
1. Verwende IMMER Templates für strukturierte Tickets
2. Für PetClinic-Bugs: `petclinic-bug` Template
3. Für PetClinic-Features: `petclinic-feature` Template
4. Für Test-Aufgaben: `test-automation` Template

TEMPLATE-VERWENDUNG:
- Identifiziere das passende Template
- Fülle die Platzhalter mit konkreten Werten
- Erstelle den API-Call mit fetch()
- Zeige das Ergebnis (Ticket-Nummer und URL)

BEISPIEL-WORKFLOW:
Wenn ein Bug gemeldet wird:
1. Sammle Informationen (Modul, Schritte, erwartetes/tatsächliches Verhalten)
2. Verwende `petclinic-bug` Template
3. Erstelle strukturiertes Ticket
4. Gib Ticket-Nummer zurück

ANTWORT-FORMAT:
"Ich erstelle ein Jira-Ticket für diesen [Bug/Feature/Task]:

[API-Call hier]

✅ Ticket erstellt: [TICKET-KEY] 
🔗 URL: [TICKET-URL]"
```

## Erweiterte Verwendung

### Custom Fields hinzufügen
```json
{
  "templateId": "petclinic-bug",
  "replacements": { ... },
  "customFields": {
    "priority": "Highest",
    "labels": ["critical", "production"],
    "assignee": "admin"
  }
}
```

### Verschiedene Projekte
```json
{
  "templateId": "petclinic-bug",
  "projectKey": "PET",  // Standard, kann geändert werden
  "replacements": { ... }
}
```

## Troubleshooting

### Server nicht erreichbar
```javascript
// Health Check
const health = await fetch('http://localhost:3000/health');
console.log(await health.json());
```

### Template nicht gefunden
```javascript
// Alle Templates anzeigen
const templates = await fetch('http://localhost:3000/templates');
console.log(await templates.json());
```

### Summary zu lang
- Summary wird automatisch auf 250 Zeichen begrenzt
- Verwende kurze, prägnante Beschreibungen

## Best Practices für BAs

1. **Strukturiert arbeiten:** Verwende immer Templates für Konsistenz
2. **Vollständige Informationen:** Fülle alle relevanten Platzhalter aus
3. **Kategorisierung:** Nutze passende Labels und Module
4. **Nachverfolgung:** Speichere Ticket-Nummern für Follow-ups
5. **Templates erweitern:** Neue Templates können bei Bedarf hinzugefügt werden

## Nächste Schritte

Der MCP Server kann erweitert werden mit:
- Workflow-Management (Status-Änderungen)
- Dashboard/Analytics
- Slack-Integration
- Playwright-Test-Integration
