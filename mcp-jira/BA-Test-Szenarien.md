# Test-Szenarien für BA-MCP-Jira Integration

## Szenario 1: Bug Report
**User Input:** "Die E-Mail-Validierung bei den Owners funktioniert nicht richtig"

**BA Response mit MCP:**
```
Ich analysiere das Problem und erstelle ein strukturiertes Bug-Ticket:

const ticket = await fetch('http://localhost:3000/create-from-template', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    templateId: 'petclinic-bug',
    replacements: {
      modul: 'Besitzer-Verwaltung',
      beschreibung: 'E-Mail-Validierung funktioniert nicht',
      schritt1: 'Gehe zu "Owner hinzufügen"',
      schritt2: 'Gib ungültige E-Mail ein (z.B. test@)',
      schritt3: 'Klicke auf Speichern',
      erwartet: 'Fehlermeldung für ungültige E-Mail',
      tatsaechlich: 'Owner wird ohne Validierung gespeichert',
      fehlermeldung: 'Keine Console-Fehler sichtbar',
      browser: 'Chrome 125'
    }
  })
});

✅ Jira-Ticket erstellt: PET-5
🔗 URL: http://localhost:8081/browse/PET-5
📋 Template: PetClinic Bug Report
🏷️ Typ: Bug
🏷️ Priorität: High
```

## Szenario 2: Feature Request
**User Input:** "Wir brauchen eine Funktion, um Haustiere nach Alter zu filtern"

**BA Response mit MCP:**
```
Ich erstelle eine User Story für dieses Feature:

const ticket = await fetch('http://localhost:3000/create-from-template', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    templateId: 'petclinic-feature',
    replacements: {
      'feature name': 'Haustier-Altersfilter',
      'funktionalität': 'Haustiere nach Altersbereich filtern können',
      'nutzen': 'schnell altersgerechte Behandlungen finden'
    }
  })
});

✅ Jira-Ticket erstellt: PET-6
🔗 URL: http://localhost:8081/browse/PET-6
📋 Template: PetClinic Feature
🏷️ Typ: Story
🏷️ Priorität: Medium
```

## Szenario 3: Smart Ticket (Automatische Erkennung)
**User Input:** "Es gibt einen Fehler beim Speichern von Besuchsterminen"

**BA Response mit Smart Detection:**
```
Ich verwende die intelligente Ticket-Erkennung:

const ticket = await fetch('http://localhost:3000/create-smart-ticket', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Fehler beim Speichern von Besuchsterminen',
    description: 'Beim Speichern von neuen Besuchsterminen tritt ein Fehler auf. Das System reagiert nicht und der Termin wird nicht gespeichert.',
    context: { petclinic: true }
  })
});

✅ Jira-Ticket erstellt: PET-7
🔗 URL: http://localhost:8081/browse/PET-7
📋 Template: PetClinic Bug Report (automatisch erkannt)
🏷️ Typ: Bug (automatisch erkannt)
🤖 Intelligent erstellt mit Auto-Template
```

## Anpassung für deinen BA-Prompt

### 1. Basis-Integration
Füge diese Zeile zu deinem BA-Prompt hinzu:
```
Du hast Zugang zu einem MCP Jira Server auf http://localhost:3000 für automatische, strukturierte Ticket-Erstellung. Verwende IMMER Templates für konsistente Dokumentation.
```

### 2. Erweiterte Integration
Für eine vollständige Integration kopiere den kompletten Prompt-Baustein aus `BA-Prompt-Integration.md`.

### 3. Workflow-spezifisch
Wenn dein BA-Prompt auf spezielle Workflows fokussiert ist (z.B. nur Requirements), passe die Template-Auswahl entsprechend an.

## Testing der Integration

1. **Health Check:** Teste zuerst ob der Server läuft
2. **Template Test:** Probiere ein einfaches Template aus
3. **Vollständiger Workflow:** Teste eine komplette User-Interaktion
4. **Edge Cases:** Teste mit unvollständigen Informationen

## Erfolgs-Indikatoren

✅ **BA erstellt automatisch strukturierte Tickets**
✅ **Konsistente Template-Verwendung** 
✅ **Vollständige Informations-Sammlung**
✅ **Korrekte Template-Auswahl je nach Kontext**
✅ **Ticket-Nummer und URL werden zurückgegeben**

## Mögliche Erweiterungen

- **Workflow-Integration:** Status-Updates direkt aus dem Chat
- **Dashboard-Views:** Ticket-Übersichten generieren
- **Automatische Priorisierung:** Basierend auf Keywords
- **Team-Benachrichtigungen:** Slack/Teams bei kritischen Tickets
