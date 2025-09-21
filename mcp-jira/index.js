const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Jira-Konfiguration
const JIRA_BASE_URL = 'http://localhost:8081';
const JIRA_USERNAME = 'admin';
const JIRA_PASSWORD = 'admin';

// Basic Auth für Jira
const jiraAuth = {
  username: JIRA_USERNAME,
  password: JIRA_PASSWORD
};

app.use(cors());
app.use(express.json());

// Template-Definitionen für verschiedene Ticket-Typen
const TICKET_TEMPLATES = {
  'bug-report': {
    name: 'Bug Report',
    issueType: 'Bug',
    priority: 'High',
    summary: 'Bug: [KURZE BESCHREIBUNG]',
    description: `**🐛 Problem Beschreibung:**
[Beschreibe das Problem kurz und präzise]

**📝 Schritte zur Reproduktion:**
1. Gehe zu [URL/Seite]
2. Klicke auf [Element]
3. Führe [Aktion] aus
4. Beobachte [Verhalten]

**✅ Erwartetes Verhalten:**
[Was sollte normalerweise passieren?]

**❌ Tatsächliches Verhalten:**
[Was passiert stattdessen?]

**🌐 Umgebung:**
- Browser: [Chrome/Firefox/Safari/Edge + Version]
- Betriebssystem: [Windows/Mac/Linux]
- Bildschirmauflösung: [z.B. 1920x1080]

**📷 Screenshots/Videos:**
[Füge Screenshots oder Videos hinzu, falls vorhanden]

**🔍 Zusätzliche Informationen:**
[Weitere relevante Details, Fehlermeldungen, Console-Logs, etc.]`,
    labels: ['bug', 'needs-investigation']
  },

  'feature-request': {
    name: 'Feature Request',
    issueType: 'Story',
    priority: 'Medium',
    summary: 'Feature: [FEATURE NAME]',
    description: `**🎯 User Story:**
Als **[Benutzertyp]** möchte ich **[gewünschte Funktionalität]**, damit **[Nutzen/Grund]**.

**📋 Akzeptanzkriterien:**
- [ ] [Kriterium 1]
- [ ] [Kriterium 2]
- [ ] [Kriterium 3]
- [ ] Tests geschrieben
- [ ] Dokumentation aktualisiert

**🎨 Design/UI Anforderungen:**
[Beschreibung der visuellen Anforderungen oder Mockups]

**⚙️ Technische Anforderungen:**
[Technische Details, APIs, Datenbank-Änderungen, etc.]

**🔗 Abhängigkeiten:**
[Andere Tickets oder externe Abhängigkeiten]

**📝 Zusätzliche Notizen:**
[Weitere wichtige Informationen]`,
    labels: ['feature', 'user-story']
  },

  'task': {
    name: 'Aufgabe/Task',
    issueType: 'Aufgabe',
    priority: 'Medium',
    summary: 'Task: [AUFGABEN BESCHREIBUNG]',
    description: `**📋 Aufgaben Beschreibung:**
[Beschreibe die Aufgabe detailliert]

**🎯 Ziel:**
[Was soll erreicht werden?]

**📝 To-Do Liste:**
- [ ] [Schritt 1]
- [ ] [Schritt 2]
- [ ] [Schritt 3]
- [ ] [Schritt 4]

**📚 Referenzen:**
[Links zu Dokumentation, ähnlichen Tickets, etc.]

**⏰ Geschätzte Zeit:**
[z.B. 2 Stunden, 1 Tag, etc.]

**✅ Definition of Done:**
- [ ] Implementierung abgeschlossen
- [ ] Code Review durchgeführt
- [ ] Tests erfolgreich
- [ ] Dokumentation aktualisiert`,
    labels: ['task']
  },

  'petclinic-bug': {
    name: 'PetClinic Bug Report',
    issueType: 'Bug',
    priority: 'High',
    summary: 'PetClinic Bug: [MODUL] - [BESCHREIBUNG]',
    description: `**🐛 PetClinic Bug Report**

**📍 Betroffenes Modul:**
- [ ] Besitzer-Verwaltung (Owner Management)
- [ ] Haustier-Verwaltung (Pet Management)
- [ ] Tierarzt-Verwaltung (Vet Management)
- [ ] Besuch-Verwaltung (Visit Management)
- [ ] Startseite/Navigation
- [ ] Sonstiges: [Spezifizieren]

**📝 Schritte zur Reproduktion:**
1. [SCHRITT1]
2. [SCHRITT2]
3. [SCHRITT3]

**✅ Erwartetes Verhalten:**
[ERWARTET]

**❌ Tatsächliches Verhalten:**
[TATSAECHLICH]

**🔍 Fehlermeldung (falls vorhanden):**
\`\`\`
[FEHLERMELDUNG]
\`\`\`

**🌐 Test-Umgebung:**
- URL: http://localhost:8080
- Browser: [BROWSER]
- Java Version: [JAVA_VERSION]
- Spring Boot Version: [SPRING_VERSION]

**📷 Screenshots:**
[Screenshots hinzufügen]`,
    labels: ['petclinic', 'bug']
  },

  'petclinic-feature': {
    name: 'PetClinic Feature',
    issueType: 'Story',
    priority: 'Medium',
    summary: 'PetClinic Feature: [FEATURE NAME]',
    description: `**🎯 PetClinic Feature Request**

**📍 Betroffenes Modul:**
- [ ] Besitzer-Verwaltung (Owner Management)
- [ ] Haustier-Verwaltung (Pet Management)
- [ ] Tierarzt-Verwaltung (Vet Management)
- [ ] Besuch-Verwaltung (Visit Management)
- [ ] Startseite/Navigation
- [ ] Neues Modul: [Spezifizieren]

**👤 User Story:**
Als **[Tierbesitzer/Tierarzt/Admin]** möchte ich **[Funktionalität]**, damit **[Nutzen]**.

**📋 Akzeptanzkriterien:**
- [ ] Frontend-Implementierung
- [ ] Backend-API erstellt
- [ ] Datenbank-Schema angepasst
- [ ] Validierung implementiert
- [ ] Unit Tests geschrieben
- [ ] Integration Tests erstellt
- [ ] Playwright E2E Tests hinzugefügt
- [ ] Dokumentation aktualisiert

**🎨 UI/UX Anforderungen:**
[Beschreibung der Benutzeroberfläche]

**⚙️ Technische Details:**
- Controllers: 
- Services: 
- Repositories: 
- DTOs: 
- Frontend Templates: 

**🔗 Abhängigkeiten:**
[Andere PetClinic Features oder externe Libraries]`,
    labels: ['petclinic', 'feature']
  },

  'test-automation': {
    name: 'Test Automation',
    issueType: 'Aufgabe',
    priority: 'Medium',
    summary: 'Test Automation: [TEST_BESCHREIBUNG]',
    description: `**🧪 Test Automation Aufgabe**

**📋 Test Beschreibung:**
[TEST_BESCHREIBUNG]

**🎯 Test Ziel:**
[Was soll getestet werden?]

**📝 Test Schritte:**
1. [Test Schritt 1]
2. [Test Schritt 2]
3. [Test Schritt 3]

**✅ Akzeptanzkriterien:**
- [ ] Tests implementiert
- [ ] Tests laufen erfolgreich
- [ ] Code Coverage ausreichend
- [ ] Tests dokumentiert

**🔧 Test Framework:**
- [ ] Playwright E2E Tests
- [ ] Unit Tests
- [ ] Integration Tests
- [ ] API Tests

**📚 Referenzen:**
[Links zu Requirements, User Stories, etc.]`,
    labels: ['testing', 'automation']
  },

  // === PLAYWRIGHT-SPEZIFISCHE TEMPLATES ===
  
  'playwright-test-failure': {
    name: 'Playwright Test Failure',
    issueType: 'Bug',
    priority: 'High',
    summary: 'Test Failure: [TEST_NAME] - [BROWSER]',
    description: `**🧪 Playwright Test Failure Report**

**📋 Test Details:**
- Test Name: [TEST_NAME]
- Test File: [TEST_FILE]
- Browser: [BROWSER]
- Execution Time: [EXECUTION_TIME]
- Run ID: [RUN_ID]

**❌ Failure Details:**
\`\`\`
[ERROR_MESSAGE]
\`\`\`

**📷 Screenshot:**
[SCREENSHOT]

**🔄 Reproduktion:**
1. Führe Test aus: \`npx playwright test [TEST_FILE]\`
2. Verwende Browser: [BROWSER]
3. Prüfe auf: [ERROR_CONDITION]

**🌐 Test-Umgebung:**
- Node.js Version: [NODE_VERSION]
- Playwright Version: [PLAYWRIGHT_VERSION]
- Test URL: [TEST_URL]
- PetClinic Version: [PETCLINIC_VERSION]

**📊 Test-History:**
- Letzte 5 Läufe: [RECENT_RESULTS]
- Flaky-Status: [FLAKY_STATUS]
- Erfolgsrate: [SUCCESS_RATE]

**🔍 Mögliche Ursachen:**
- [ ] UI-Änderung (Selector nicht mehr gültig)
- [ ] Race Condition / Timing Issue
- [ ] Daten-Problem (Test-Setup fehlerhaft)
- [ ] Browser-spezifisches Problem
- [ ] Infrastruktur-Problem

**🛠️ Nächste Schritte:**
- [ ] Test-Analyse durchführen
- [ ] Selector/Locator prüfen
- [ ] Test-Daten validieren
- [ ] Fix implementieren
- [ ] Test erneut ausführen`,
    labels: ['playwright', 'test-failure', 'automation', 'bug']
  },

  'playwright-suite-report': {
    name: 'Playwright Suite Report',
    issueType: 'Aufgabe',
    priority: 'Medium',
    summary: 'Test Suite Report: [SUITE_NAME] - [PASS_RATE]% Pass Rate',
    description: `**📊 Playwright Test Suite Execution Report**

**📋 Suite Details:**
- Suite Name: [SUITE_NAME]
- Execution Date: [EXECUTION_DATE]
- Run ID: [RUN_ID]
- Total Tests: [TOTAL_TESTS]
- Passed: ✅ [PASSED_TESTS]
- Failed: ❌ [FAILED_TESTS]
- Skipped: ⏭️ [SKIPPED_TESTS]
- Pass Rate: [PASS_RATE]%

**⏱️ Performance Metrics:**
- Total Duration: [TOTAL_DURATION]
- Average Test Time: [AVG_TEST_TIME]
- Slowest Test: [SLOWEST_TEST] ([SLOWEST_DURATION])
- Fastest Test: [FASTEST_TEST] ([FASTEST_DURATION])

**❌ Failed Tests:**
[FAILED_TEST_LIST]

**🐛 Test Failures by Category:**
- Selector Issues: [SELECTOR_FAILURES]
- Timing Issues: [TIMING_FAILURES]
- Data Issues: [DATA_FAILURES]
- Browser Issues: [BROWSER_FAILURES]

**📈 Trends:**
- Pass Rate Trend: [TREND_DIRECTION]
- Performance Trend: [PERF_TREND]
- Flaky Tests: [FLAKY_COUNT]

**🎯 Recommendations:**
[RECOMMENDATIONS]

**🏷️ Tags:** [SUITE_LABELS]`,
    labels: ['playwright', 'test-report', 'automation', 'metrics']
  },

  'flaky-test-investigation': {
    name: 'Flaky Test Investigation',
    issueType: 'Aufgabe',
    priority: 'High',
    summary: 'Flaky Test: [TEST_NAME] - [FAILURE_RATE]% Failure Rate',
    description: `**🔄 Flaky Test Investigation**

**📋 Test Information:**
- Test Name: [TEST_NAME]
- Test File: [TEST_FILE]
- Current Failure Rate: [FAILURE_RATE]%
- Detection Date: [DETECTION_DATE]

**📊 Failure Analysis:**
- Total Runs (last 30 days): [TOTAL_RUNS]
- Failed Runs: [FAILED_RUNS]
- Success Runs: [SUCCESS_RUNS]
- Pattern: [FAILURE_PATTERN]

**🕰️ Recent Failures:**
[RECENT_FAILURES]

**🔍 Common Error Messages:**
[COMMON_ERRORS]

**🎯 Suspected Root Causes:**
- [ ] Race Condition
- [ ] Timing Issues
- [ ] Network Instability
- [ ] Data Dependencies
- [ ] Browser-specific Issues
- [ ] Selector Instability
- [ ] Test Environment Issues

**🛠️ Investigation Steps:**
- [ ] Analyze failure patterns
- [ ] Review test implementation
- [ ] Check for race conditions
- [ ] Validate test data setup
- [ ] Review selector stability
- [ ] Test in different environments

**💡 Potential Solutions:**
- [ ] Add explicit waits
- [ ] Improve selectors
- [ ] Fix test data issues
- [ ] Add retry logic
- [ ] Split complex test
- [ ] Improve test isolation

**✅ Definition of Done:**
- [ ] Root cause identified
- [ ] Fix implemented
- [ ] Test runs stable (>95% success rate)
- [ ] Documentation updated`,
    labels: ['playwright', 'flaky-test', 'investigation', 'quality']
  },

  'performance-investigation': {
    name: 'Performance Investigation',
    issueType: 'Aufgabe',
    priority: 'Medium',
    summary: 'Performance Issue: [SLOW_TESTS] slow tests detected',
    description: `**⚡ Performance Investigation**

**📊 Performance Summary:**
- Slow Tests Count: [SLOW_TEST_COUNT]
- Average Duration: [AVG_DURATION]
- Threshold: >30 seconds

**🐌 Slow Tests:**
[SLOW_TESTS]

**📈 Performance Trends:**
- Trend: [PERFORMANCE_TREND]
- Baseline: [BASELINE_DURATION]
- Current: [CURRENT_DURATION]
- Degradation: [DEGRADATION_PERCENT]%

**🔍 Analysis:**
- [ ] Page Load Times
- [ ] Network Requests
- [ ] DOM Interactions
- [ ] Test Setup/Teardown
- [ ] Browser Performance

**🎯 Optimization Targets:**
- [ ] Reduce network waits
- [ ] Optimize selectors
- [ ] Improve test data setup
- [ ] Parallel execution
- [ ] Browser configuration

**✅ Success Criteria:**
- All tests under 30 seconds
- Suite execution time reduced by 20%
- No performance regressions`,
    labels: ['playwright', 'performance', 'optimization']
  },

  'test-enhancement': {
    name: 'Test Enhancement',
    issueType: 'Story',
    priority: 'Medium',
    summary: 'Enhance Tests: [FEATURE_AREA] - [ENHANCEMENT_TYPE]',
    description: `**🚀 Test Enhancement Request**

**📋 Enhancement Details:**
- Feature Area: [FEATURE_AREA]
- Enhancement Type: [ENHANCEMENT_TYPE]
- Current Coverage: [CURRENT_COVERAGE]%
- Target Coverage: [TARGET_COVERAGE]%

**🎯 Goals:**
[ENHANCEMENT_GOALS]

**📝 Planned Improvements:**
- [ ] Add missing test cases
- [ ] Improve test reliability
- [ ] Add edge case testing
- [ ] Enhance assertions
- [ ] Add visual testing
- [ ] Improve test data management

**🧪 New Test Cases:**
[NEW_TEST_CASES]

**📊 Success Metrics:**
- Coverage increase: [COVERAGE_INCREASE]%
- Reliability improvement: [RELIABILITY_TARGET]%
- Execution time: [TIME_TARGET]

**✅ Acceptance Criteria:**
- [ ] All new tests implemented
- [ ] Tests pass consistently
- [ ] Coverage targets met
- [ ] Documentation updated`,
    labels: ['playwright', 'enhancement', 'testing', 'coverage']
  },

  'test-automation': {
    name: 'Test Automation',
    issueType: 'Aufgabe',
    priority: 'Medium',
    summary: 'Test: [TEST BESCHREIBUNG]',
    description: `**🧪 Test Automation Task**

**🎯 Test Ziel:**
[Was soll getestet werden?]

**📝 Test Typ:**
- [ ] Unit Tests
- [ ] Integration Tests
- [ ] End-to-End Tests (Playwright)
- [ ] Performance Tests
- [ ] Security Tests

**📋 Test Szenarien:**
1. **Happy Path:** [Normale Benutzerinteraktion]
2. **Edge Cases:** [Grenzfälle]
3. **Error Handling:** [Fehlerbehandlung]
4. **Negative Tests:** [Ungültige Eingaben]

**🔧 Implementierungs-Details:**
- Test Framework: [JUnit, Playwright, etc.]
- Test Dateien: 
- Mock/Fixtures benötigt: 
- Test Data: 

**✅ Definition of Done:**
- [ ] Tests implementiert
- [ ] Tests laufen grün
- [ ] Code Coverage akzeptabel
- [ ] Tests in CI/CD Pipeline integriert`,
    labels: ['testing', 'automation']
  }
};

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'MCP Jira Server ist bereit' });
});

// Verfügbare Templates anzeigen
app.get('/templates', (req, res) => {
  const templateList = Object.keys(TICKET_TEMPLATES).map(key => ({
    id: key,
    name: TICKET_TEMPLATES[key].name,
    issueType: TICKET_TEMPLATES[key].issueType,
    priority: TICKET_TEMPLATES[key].priority
  }));
  
  res.json({
    message: 'Verfügbare Ticket-Templates',
    templates: templateList
  });
});

// Spezifisches Template anzeigen
app.get('/templates/:templateId', (req, res) => {
  const { templateId } = req.params;
  const template = TICKET_TEMPLATES[templateId];
  
  if (!template) {
    return res.status(404).json({ 
      error: 'Template nicht gefunden',
      availableTemplates: Object.keys(TICKET_TEMPLATES)
    });
  }
  
  res.json(template);
});

// Ticket aus Template erstellen
app.post('/create-from-template', async (req, res) => {
  try {
    const { 
      templateId, 
      replacements = {}, 
      projectKey = 'PET',
      customFields = {} 
    } = req.body;
    
    const template = TICKET_TEMPLATES[templateId];
    if (!template) {
      return res.status(400).json({ 
        error: 'Template nicht gefunden',
        availableTemplates: Object.keys(TICKET_TEMPLATES)
      });
    }
    
    // Template-Variablen ersetzen
    let summary = template.summary;
    let description = template.description;
    
    Object.keys(replacements).forEach(key => {
      const placeholder = `[${key.toUpperCase()}]`;
      const value = replacements[key] || '';
      summary = summary.replace(new RegExp(placeholder, 'g'), value);
      description = description.replace(new RegExp(placeholder, 'g'), value);
    });
    
    // Nicht ersetzte Platzhalter entfernen
    summary = summary.replace(/\[[\w\s]+\]/g, '');
    description = description.replace(/\[[\w\s]+\]/g, '');
    
    // Summary auf maximal 250 Zeichen begrenzen
    if (summary.length > 250) {
      summary = summary.substring(0, 247) + '...';
    }
    
    // Ticket-Payload erstellen
    const ticketData = {
      projectKey,
      summary,
      description,
      issueType: template.issueType,
      priority: template.priority,
      labels: template.labels || [],
      ...customFields
    };
    
    // Ticket über bestehende API erstellen
    const response = await axios.post('http://localhost:3000/jira/create-ticket', ticketData);
    
    res.json({
      ...response.data,
      templateUsed: templateId,
      templateName: template.name
    });
    
  } catch (error) {
    console.error('Fehler beim Erstellen aus Template:', error.message);
    res.status(500).json({ 
      error: 'Fehler beim Erstellen des Tickets aus Template',
      details: error.response?.data || error.message
    });
  }
});

// Intelligente Template-Auswahl basierend auf Kontext
app.post('/create-smart-ticket', async (req, res) => {
  try {
    const { 
      title, 
      description, 
      context = {},
      projectKey = 'PET'
    } = req.body;
    
    // Intelligente Template-Erkennung
    let templateId = 'task'; // Default
    let detectedType = 'Aufgabe';
    
    const titleLower = title.toLowerCase();
    const descLower = description.toLowerCase();
    
    if (titleLower.includes('bug') || titleLower.includes('fehler') || 
        descLower.includes('fehlermeldung') || descLower.includes('funktioniert nicht')) {
      templateId = context.petclinic ? 'petclinic-bug' : 'bug-report';
      detectedType = 'Bug';
    } else if (titleLower.includes('feature') || titleLower.includes('neu') || 
               descLower.includes('möchte ich') || descLower.includes('user story')) {
      templateId = context.petclinic ? 'petclinic-feature' : 'feature-request';
      detectedType = 'Story';
    } else if (titleLower.includes('test') || descLower.includes('playwright') || 
               descLower.includes('automation')) {
      templateId = 'test-automation';
      detectedType = 'Aufgabe';
    }
    
    // Template abrufen und anpassen
    const template = TICKET_TEMPLATES[templateId];
    
    const ticketData = {
      projectKey,
      summary: title,
      description: description + '\n\n---\n*Erstellt mit Auto-Template: ' + template.name + '*',
      issueType: detectedType,
      priority: template.priority,
      labels: [...(template.labels || []), 'auto-created']
    };
    
    const response = await axios.post('http://localhost:3000/jira/create-ticket', ticketData);
    
    res.json({
      ...response.data,
      detectedTemplate: templateId,
      detectedType: detectedType,
      templateName: template.name
    });
    
  } catch (error) {
    console.error('Fehler beim Smart-Ticket erstellen:', error.message);
    res.status(500).json({ 
      error: 'Fehler beim Erstellen des Smart-Tickets',
      details: error.response?.data || error.message
    });
  }
});

// Jira-Projekt und Issue-Typen abrufen
app.get('/jira/projects', async (req, res) => {
  try {
    const response = await axios.get(`${JIRA_BASE_URL}/rest/api/2/project`, {
      auth: jiraAuth
    });
    res.json(response.data);
  } catch (error) {
    console.error('Fehler beim Abrufen der Projekte:', error.message);
    res.status(500).json({ 
      error: 'Fehler beim Abrufen der Jira-Projekte',
      details: error.response?.data || error.message
    });
  }
});

// Issue-Typen für ein Projekt abrufen
app.get('/jira/project/:projectKey/issuetypes', async (req, res) => {
  try {
    const { projectKey } = req.params;
    const response = await axios.get(`${JIRA_BASE_URL}/rest/api/2/project/${projectKey}`, {
      auth: jiraAuth
    });
    res.json(response.data.issueTypes);
  } catch (error) {
    console.error('Fehler beim Abrufen der Issue-Typen:', error.message);
    res.status(500).json({ 
      error: 'Fehler beim Abrufen der Issue-Typen',
      details: error.response?.data || error.message
    });
  }
});

// Ticket erstellen - Hauptfunktion für das LLM
app.post('/jira/create-ticket', async (req, res) => {
  try {
    const {
      projectKey = 'PET',   // Standard-Projekt (PET existiert in Jira)
      summary,              // Ticket-Titel (erforderlich)
      description = '',     // Ticket-Beschreibung
      issueType = 'Task',   // Issue-Typ (Task, Bug, Story, etc.)
      priority = 'Medium',  // Priorität
      assignee = null,      // Zuweisen an User (optional)
      labels = []           // Labels (Array)
    } = req.body;

    // Validierung
    if (!summary) {
      return res.status(400).json({ 
        error: 'Summary ist erforderlich für die Ticket-Erstellung' 
      });
    }

    // Jira-Issue-Payload erstellen
    const issuePayload = {
      fields: {
        project: { key: projectKey },
        summary: summary,
        description: description,
        issuetype: { name: issueType },
        priority: { name: priority }
      }
    };

    // Optional: Assignee hinzufügen
    if (assignee) {
      issuePayload.fields.assignee = { name: assignee };
    }

    // Optional: Labels hinzufügen
    if (labels && labels.length > 0) {
      issuePayload.fields.labels = labels;
    }

    console.log('Erstelle Jira-Ticket:', JSON.stringify(issuePayload, null, 2));

    // Ticket in Jira erstellen
    const response = await axios.post(`${JIRA_BASE_URL}/rest/api/2/issue`, issuePayload, {
      auth: jiraAuth,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const ticketKey = response.data.key;
    const ticketUrl = `${JIRA_BASE_URL}/browse/${ticketKey}`;

    res.json({
      success: true,
      message: `Ticket erfolgreich erstellt: ${ticketKey}`,
      ticket: {
        key: ticketKey,
        url: ticketUrl,
        id: response.data.id,
        self: response.data.self
      }
    });

  } catch (error) {
    console.error('Fehler beim Erstellen des Tickets:', error.message);
    console.error('Error details:', error.response?.data);
    
    res.status(500).json({ 
      error: 'Fehler beim Erstellen des Jira-Tickets',
      details: error.response?.data || error.message
    });
  }
});

// Einfache Ticket-Erstellung für das LLM (vereinfacht)
app.post('/create-ticket', async (req, res) => {
  try {
    const { title, description, type = 'Task' } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Titel ist erforderlich' });
    }

    const result = await axios.post('http://localhost:3000/jira/create-ticket', {
      summary: title,
      description: description || '',
      issueType: type,
      projectKey: 'PET'  // PET-Projekt verwenden
    });

    res.json(result.data);
  } catch (error) {
    res.status(500).json({ 
      error: 'Fehler beim Erstellen des Tickets',
      details: error.response?.data || error.message
    });
  }
});

// Server starten
app.listen(PORT, () => {
  console.log(`🚀 MCP Jira Server läuft auf http://localhost:${PORT}`);
  console.log(`📋 Jira-Integration: ${JIRA_BASE_URL}`);
  console.log(`🔧 Endpoints:`);
  console.log(`   GET  /health - Server Status`);
  console.log(`   GET  /templates - Verfügbare Templates`);
  console.log(`   GET  /templates/:id - Spezifisches Template`);
  console.log(`   POST /create-from-template - Ticket aus Template erstellen`);
  console.log(`   POST /create-smart-ticket - Intelligente Ticket-Erstellung`);
  console.log(`   GET  /jira/projects - Alle Jira-Projekte`);
  console.log(`   POST /jira/create-ticket - Neues Ticket erstellen`);
  console.log(`   POST /create-ticket - Vereinfachte Ticket-Erstellung`);
  console.log(`\n📝 Verfügbare Templates: ${Object.keys(TICKET_TEMPLATES).join(', ')}`);
});

module.exports = app;
