const express = require('express');
const axios = require('axios');
const cors = require('cors');

// UTF-8 Encoding für Node.js sicherstellen
process.env.NODE_OPTIONS = '--max-old-space-size=4096';
if (process.stdout.isTTY) {
  process.stdout.setEncoding('utf8');
}

const app = express();

// Lösche alle Tickets im PET Projekt
app.delete('/delete-all-tickets', async (req, res) => {
  try {
    console.log('🗑️ Lösche alle Tickets im PET Projekt...');
    
    // Hole alle Tickets
    const searchResponse = await axios.get(
      `${JIRA_BASE_URL}/rest/api/2/search?jql=project=PET`,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${JIRA_USERNAME}:${JIRA_PASSWORD}`).toString('base64')}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const tickets = searchResponse.data.issues;
    console.log(`📊 Gefunden: ${tickets.length} Tickets`);
    
    if (tickets.length === 0) {
      return res.json({ 
        success: true, 
        message: 'Keine Tickets zum Löschen gefunden',
        deleted: 0
      });
    }
    
    // Lösche alle Tickets
    const deletePromises = tickets.map(async (ticket) => {
      try {
        await axios.delete(
          `${JIRA_BASE_URL}/rest/api/2/issue/${ticket.key}`,
          {
            headers: {
              'Authorization': `Basic ${Buffer.from(`${JIRA_USERNAME}:${JIRA_PASSWORD}`).toString('base64')}`,
              'Content-Type': 'application/json'
            }
          }
        );
        console.log(`✅ Ticket ${ticket.key} gelöscht`);
        return ticket.key;
      } catch (error) {
        console.log(`❌ Fehler beim Löschen von ${ticket.key}: ${error.message}`);
        return null;
      }
    });
    
    const deletedTickets = await Promise.all(deletePromises);
    const successfulDeletions = deletedTickets.filter(key => key !== null);
    
    res.json({
      success: true,
      message: `${successfulDeletions.length} von ${tickets.length} Tickets erfolgreich gelöscht`,
      deleted: successfulDeletions.length,
      total: tickets.length,
      deletedTickets: successfulDeletions
    });
    
  } catch (error) {
    console.error('❌ Fehler beim Löschen der Tickets:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Lösche spezifisches Ticket
app.delete('/delete-ticket/:key', async (req, res) => {
  try {
    const ticketKey = req.params.key;
    console.log(`🗑️ Lösche Ticket: ${ticketKey}`);
    
    await axios.delete(
      `${JIRA_BASE_URL}/rest/api/2/issue/${ticketKey}`,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${JIRA_USERNAME}:${JIRA_PASSWORD}`).toString('base64')}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log(`✅ Ticket ${ticketKey} erfolgreich gelöscht`);
    res.json({
      success: true,
      message: `Ticket ${ticketKey} erfolgreich gelöscht`
    });
    
  } catch (error) {
    console.error(`❌ Fehler beim Löschen von Ticket ${req.params.key}:`, error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 3001;

// Jira-Konfiguration
const JIRA_BASE_URL = process.env.JIRA_BASE_URL || 'http://localhost:8081';
const JIRA_USERNAME = process.env.JIRA_USERNAME || 'admin';
const JIRA_PASSWORD = process.env.JIRA_PASSWORD || 'admin';

// Basic Auth für Jira
const jiraAuth = {
  username: JIRA_USERNAME,
  password: JIRA_PASSWORD
};

app.use(cors());
app.use(express.json({ 
  limit: '50mb',
  type: 'application/json'
})); 
app.use(express.urlencoded({ 
  limit: '50mb', 
  extended: true,
  parameterLimit: 1000
}));

// UTF-8 Content-Type Header middleware
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// Template-Definitionen für verschiedene Ticket-Typen
const TICKET_TEMPLATES = {
  'bug-report': {
    name: 'Bug Report',
    issueType: 'Bug',
    priority: 'High',
    summary: '[TITEL]',
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
    summary: '[TITEL]',
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
    summary: '[TITEL]',
    description: `**Beschreibung:** [Beschreibe die Aufgabe]

**Ziel:** [Was soll erreicht werden?]

**To-Do:**
- [ ] [Schritt 1]
- [ ] [Schritt 2]
- [ ] [Schritt 3]

**Definition of Done:**
- [ ] Implementierung abgeschlossen
- [ ] Tests erfolgreich`,
    labels: ['task']
  },

  'petclinic-bug': {
    name: 'PetClinic Bug Report',
    issueType: 'Bug',
    priority: 'High',
    summary: '[TITEL]',
    description: `**Bug Report**

**Betroffenes Modul:** [Owner/Pet/Vet/Visit Management]

**Schritte zur Reproduktion:**
1. [SCHRITT1]
2. [SCHRITT2]
3. [SCHRITT3]

**Erwartetes Verhalten:** [ERWARTET]

**Tatsächliches Verhalten:** [TATSAECHLICH]

**Fehlermeldung:**
\`\`\`
[FEHLERMELDUNG]
\`\`\`

**Umgebung:**
- URL: http://localhost:8080
- Browser: [BROWSER]`,
    labels: ['petclinic', 'bug']
  },

  'petclinic-feature': {
    name: 'PetClinic Feature',
    issueType: 'Story',
    priority: 'Medium',
    summary: '[TITEL]',
    description: `**🎯 PetClinic Feature Request**

**📍 Betroffenes Modul:**
- [ ] Besitzer-Verwaltung (Owner Management)
- [ ] Haustier-Verwaltung (Pet Management)
- [ ] Tierarzt-Verwaltung (Vet Management)
- [ ] Besuch-Verwaltung (Visit Management)
- [ ] Startseite/Navigation
- [ ] Neues Modul: [Spezifizieren]

**👤 User Story:**
**User Story:**
Als **[User-Rolle]** möchte ich **[Funktionalität]**, damit **[Nutzen]**.

**Akzeptanzkriterien:**
- [ ] Frontend implementiert
- [ ] Backend-API erstellt
- [ ] Tests geschrieben

**Technische Details:**
- Controllers: [Liste]
- Services: [Liste]`,
    labels: ['petclinic', 'feature']
  },

  'test-automation': {
    name: 'Test Automation',
    issueType: 'Aufgabe',
    priority: 'Medium',
    summary: '[TITEL]',
    description: `**Test Automation**

**Beschreibung:** [TEST_BESCHREIBUNG]

**Ziel:** [Was soll getestet werden?]

**Test Schritte:**
1. [Test Schritt 1]
2. [Test Schritt 2]

**Framework:**
- [ ] Playwright E2E
- [ ] Unit Tests`,
    labels: ['testing', 'automation']
  },

  // === PLAYWRIGHT-SPEZIFISCHE TEMPLATES ===
  
  'playwright-test-failure': {
    name: 'Playwright Test Failure',
    issueType: 'Bug',
    priority: 'High',
    summary: '[TITEL]',
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
    summary: '[TITEL]',
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
    summary: '[TITEL]',
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
    summary: '[TITEL]',
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
    summary: '[TITEL]',
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
    summary: '[TITEL]',
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
  },

  'epic': {
    name: 'Epic',
    issueType: 'Epic',
    priority: 'Medium',
    summary: '[TITEL]',
    description: `**🎯 Epic Übersicht**

**📋 Epic Beschreibung:**
[Detaillierte Beschreibung des Epics und seiner Ziele]

**💼 Business Value:**
[Warum ist dieses Epic wichtig? Welchen Geschäftswert bringt es?]

**🎯 Ziele:**
- [Ziel 1]
- [Ziel 2]
- [Ziel 3]

**👥 Stakeholder:**
- Product Owner: [NAME]
- Tech Lead: [NAME]
- Business Analyst: [NAME]

**📅 Timeline:**
- Start: [START_DATE]
- Ende: [END_DATE]
- Milestones: [MAJOR_MILESTONES]

**🔍 Akzeptanzkriterien:**
- [ ] Kriterium 1
- [ ] Kriterium 2
- [ ] Kriterium 3

**📊 Success Metrics:**
- [Metric 1]: [Target Value]
- [Metric 2]: [Target Value]
- [Metric 3]: [Target Value]

**🚧 Annahmen und Risiken:**
**Annahmen:**
- [Annahme 1]
- [Annahme 2]

**Risiken:**
- [Risiko 1] - Mitigation: [Plan]
- [Risiko 2] - Mitigation: [Plan]

**🏁 Definition of Done:**
- [ ] Alle Stories abgeschlossen
- [ ] Akzeptanzkriterien erfüllt
- [ ] Testing abgeschlossen
- [ ] Documentation aktualisiert
- [ ] Stakeholder Sign-off`,
    labels: ['epic', 'planning', 'strategy']
  },

  'petclinic-epic': {
    name: 'PetClinic Epic',
    issueType: 'Epic',
    priority: 'Medium',
    summary: 'PetClinic Epic: [FEATURE_NAME]',
    description: `**🏥 PetClinic Epic**

**🎯 Feature Übersicht:**
[Beschreibung des neuen PetClinic Features]

**👨‍⚕️ Benutzer Story:**
Als [Benutzertyp] möchte ich [Funktionalität], damit [Nutzen].

**🐾 PetClinic Context:**
- Affected Areas: [Owners/Pets/Vets/Visits]
- Database Changes: [Yes/No - Details]
- UI Changes: [Pages affected]
- API Changes: [New endpoints/Modified endpoints]

**🛠️ Technische Komponenten:**
- Backend (Spring Boot): [Components]
- Frontend (Thymeleaf): [Templates]
- Database (H2/MySQL/PostgreSQL): [Tables]
- Tests: [Unit/Integration/E2E]

**📋 User Stories (Children):**
- [ ] Story 1: [As a... I want... So that...]
- [ ] Story 2: [As a... I want... So that...]
- [ ] Story 3: [As a... I want... So that...]

**🧪 Testing Strategy:**
- [ ] Unit Tests für neue Services
- [ ] Integration Tests für Repository Layer
- [ ] Controller Tests für Web Layer
- [ ] End-to-End Tests mit Playwright

**📊 Akzeptanzkriterien:**
- [ ] Feature funktional vollständig
- [ ] Responsive Design (Mobile/Desktop)
- [ ] Accessibility Standards erfüllt
- [ ] Performance acceptable (<2s Ladezeit)
- [ ] Cross-browser Kompatibilität

**🚀 Deployment Kriterien:**
- [ ] Code Review abgeschlossen
- [ ] Alle Tests bestanden
- [ ] Documentation aktualisiert
- [ ] Database Migration getestet`,
    labels: ['petclinic', 'epic', 'feature', 'spring-boot']
  },

  'subtask': {
    name: 'Sub-Task',
    issueType: 'Sub-task',
    priority: 'Medium',
    summary: '[TITEL]',
    description: `**🔧 Sub-Task Details**

**🎯 Aufgabe:**
[Beschreibung der spezifischen Aufgabe]

**📋 Parent Story/Task:**
[Verweis auf übergeordnete Story/Task - PARENT_KEY]

**🛠️ Arbeitsschritte:**
1. [Schritt 1]
2. [Schritt 2] 
3. [Schritt 3]

**📝 Technische Details:**
- Component: [Affected Component]
- Files: [Files to modify]
- Dependencies: [Any dependencies]

**✅ Akzeptanzkriterien:**
- [ ] Implementierung abgeschlossen
- [ ] Unit Tests geschrieben
- [ ] Code Review durchgeführt
- [ ] Integration erfolgreich

**⏰ Geschätzter Aufwand:** [X] Stunden

**🔗 Abhängigkeiten:**
- Blockt: [Other tasks]
- Abhängig von: [Prerequisites]`,
    labels: ['subtask', 'development']
  },

  'petclinic-subtask': {
    name: 'PetClinic Sub-Task',
    issueType: 'Sub-task',
    priority: 'Medium',
    summary: 'PetClinic Sub-Task: [COMPONENT] - [TASK_NAME]',
    description: `**🏥 PetClinic Sub-Task**

**🎯 Aufgabe:**
[Spezifische Aufgabe im PetClinic Kontext]

**📋 Parent Story:**
[Übergeordnete PetClinic Story - PARENT_KEY]

**🐾 PetClinic Bereich:**
- [ ] Owners Management
- [ ] Pets Management  
- [ ] Veterinarians
- [ ] Visits
- [ ] General/Infrastructure

**🛠️ Technische Implementierung:**
**Backend (Spring Boot):**
- [ ] Entity/Model Änderungen
- [ ] Repository Layer
- [ ] Service Layer
- [ ] Controller Layer
- [ ] Validation

**Frontend (Thymeleaf):**
- [ ] Template Änderungen
- [ ] CSS/JavaScript
- [ ] Form Handling
- [ ] Error Handling

**Database:**
- [ ] Schema Änderungen
- [ ] Data Migration
- [ ] Test Data

**🧪 Testing:**
- [ ] Unit Tests (Service Layer)
- [ ] Integration Tests (Repository)
- [ ] Web Layer Tests (Controller)
- [ ] End-to-End Tests (Playwright)

**📝 Implementierungs-Details:**
- Dateien: [List of files to modify]
- Methoden: [New/Modified methods]
- Endpoints: [New/Modified REST endpoints]

**✅ Definition of Done:**
- [ ] Code implementiert
- [ ] Tests geschrieben und bestanden
- [ ] Code Review abgeschlossen
- [ ] Dokumentation aktualisiert
- [ ] Manuelle Tests durchgeführt

**⏰ Aufwand:** [X] Stunden`,
    labels: ['petclinic', 'subtask', 'spring-boot', 'development']
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
      title,
      description: userDescription,
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
    
    // Standard-Replacements erstellen aus title und description
    const standardReplacements = {
      ...replacements,
      TITEL: title || '',
      TITLE: title || '',
      'KURZE BESCHREIBUNG': title || '',
      'KURZE_BESCHREIBUNG': title || '',
      BESCHREIBUNG: userDescription || '',
      DESCRIPTION: userDescription || '',
      'PROBLEM_BESCHREIBUNG': userDescription || '',
      'TEST_BESCHREIBUNG': userDescription || '',
      'FEATURE_BESCHREIBUNG': userDescription || ''
    };
    
    // Template-Variablen ersetzen (nur einmal!)
    let summary = template.summary;
    let description = template.description;
    
    // Alle Replacements in einem Durchgang
    Object.keys(standardReplacements).forEach(key => {
      const placeholderBrackets = `[${key.toUpperCase()}]`;
      const placeholderPlain = key.toUpperCase();
      const value = standardReplacements[key] || '';
      
      // Nur ersetzen wenn der Wert nicht leer ist, um Endlosschleifen zu vermeiden
      if (value && value.trim()) {
        // Mit eckigen Klammern
        summary = summary.replace(new RegExp(`\\[${key.toUpperCase()}\\]`, 'g'), value);
        description = description.replace(new RegExp(`\\[${key.toUpperCase()}\\]`, 'g'), value);
      }
    });
    
    // Nicht ersetzte Platzhalter entfernen
    summary = summary.replace(/\[[\w\s_-]+\]/g, '');
    description = description.replace(/\[[\w\s_-]+\]/g, '');
    
    // Fallback: Wenn Summary leer oder nur Template-Name ist, verwende den Titel direkt
    if (!summary.trim() || summary.trim() === template.name || summary.includes('undefined')) {
      summary = title || 'Neues Ticket';
    }
    
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
    const response = await axios.post(`http://localhost:${PORT}/jira/create-ticket`, ticketData);
    
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
    
    const response = await axios.post(`http://localhost:${PORT}/jira/create-ticket`, ticketData);
    
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
      labels = [],          // Labels (Array)
      parentKey = null,     // Parent-Key für Sub-Tasks (erforderlich für Sub-Tasks)
      epicName = null       // Epic Name für Epic Tickets (erforderlich für Epics)
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

    // Für Sub-Tasks: Parent-Key hinzufügen
    if (issueType === 'Sub-task' && parentKey) {
      issuePayload.fields.parent = { key: parentKey };
    } else if (issueType === 'Sub-task' && !parentKey) {
      return res.status(400).json({ 
        error: 'Sub-Tasks benötigen einen Parent-Key (parentKey Parameter)' 
      });
    }

    // Für Epics: Epic Name hinzufügen (customfield_10104)
    if (issueType === 'Epic') {
      const epicNameValue = epicName || summary; // Verwende epicName oder fallback auf summary
      issuePayload.fields.customfield_10104 = epicNameValue;
    }

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

// Alle Tickets im PET Projekt auflisten
app.get('/list-all-tickets', async (req, res) => {
  try {
    console.log('📋 Liste alle Tickets im PET Projekt...');
    
    const searchResponse = await axios.get(
      `${JIRA_BASE_URL}/rest/api/2/search?jql=project=PET&maxResults=100`,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${JIRA_USERNAME}:${JIRA_PASSWORD}`).toString('base64')}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const tickets = searchResponse.data.issues;
    console.log(`📊 Gefunden: ${tickets.length} Tickets`);
    
    const ticketList = tickets.map(ticket => ({
      key: ticket.key,
      summary: ticket.fields.summary,
      issueType: ticket.fields.issuetype.name,
      status: ticket.fields.status.name,
      priority: ticket.fields.priority ? ticket.fields.priority.name : 'None',
      assignee: ticket.fields.assignee ? ticket.fields.assignee.displayName : 'Unassigned',
      created: ticket.fields.created,
      description: ticket.fields.description ? ticket.fields.description.substring(0, 200) + '...' : 'No description',
      url: `${JIRA_BASE_URL}/browse/${ticket.key}`
    }));
    
    res.json({
      success: true,
      total: tickets.length,
      tickets: ticketList
    });
    
  } catch (error) {
    console.error('❌ Fehler beim Auflisten der Tickets:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Einzelnes Ticket abrufen
app.get('/ticket/:ticketKey', async (req, res) => {
  try {
    const { ticketKey } = req.params;
    console.log(`📋 Lade Ticket: ${ticketKey}`);
    
    const response = await axios.get(
      `${JIRA_BASE_URL}/rest/api/2/issue/${ticketKey}`,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${JIRA_USERNAME}:${JIRA_PASSWORD}`).toString('base64')}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const issue = response.data;
    
    // Formatiere die Antwort für bessere Lesbarkeit
    const formattedTicket = {
      key: issue.key,
      summary: issue.fields.summary,
      description: issue.fields.description || '',
      issueType: issue.fields.issuetype.name,
      status: issue.fields.status.name,
      priority: issue.fields.priority?.name || 'Unassigned',
      assignee: issue.fields.assignee?.displayName || 'Unassigned',
      reporter: issue.fields.reporter?.displayName || 'Unknown',
      created: issue.fields.created,
      updated: issue.fields.updated,
      labels: issue.fields.labels || [],
      project: issue.fields.project.key,
      url: `${JIRA_BASE_URL}/browse/${issue.key}`,
      transitions: [], // Wird in separatem Call geholt falls nötig
      comments: issue.fields.comment?.comments?.length || 0,
      watchers: issue.fields.watches?.watchCount || 0
    };
    
    console.log(`✅ Ticket ${ticketKey} erfolgreich geladen`);
    res.json({
      success: true,
      ticket: formattedTicket
    });
    
  } catch (error) {
    console.error(`❌ Fehler beim Laden von Ticket ${req.params.ticketKey}:`, error.message);
    
    if (error.response?.status === 404) {
      res.status(404).json({
        success: false,
        error: `Ticket ${req.params.ticketKey} nicht gefunden`
      });
    } else {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
});

// Lösche alle Tickets im PET Projekt
app.delete('/delete-all-tickets', async (req, res) => {
  try {
    console.log('🗑️ Lösche alle Tickets im PET Projekt...');
    
    // Hole alle Tickets
    const searchResponse = await axios.get(
      `${JIRA_BASE_URL}/rest/api/2/search?jql=project=PET`,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${JIRA_USERNAME}:${JIRA_PASSWORD}`).toString('base64')}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const tickets = searchResponse.data.issues;
    console.log(`📊 Gefunden: ${tickets.length} Tickets`);
    
    if (tickets.length === 0) {
      return res.json({ 
        success: true, 
        message: 'Keine Tickets zum Löschen gefunden',
        deleted: 0
      });
    }
    
    // Lösche alle Tickets
    const deletePromises = tickets.map(async (ticket) => {
      try {
        await axios.delete(
          `${JIRA_BASE_URL}/rest/api/2/issue/${ticket.key}`,
          {
            headers: {
              'Authorization': `Basic ${Buffer.from(`${JIRA_USERNAME}:${JIRA_PASSWORD}`).toString('base64')}`,
              'Content-Type': 'application/json'
            }
          }
        );
        console.log(`✅ Ticket ${ticket.key} gelöscht`);
        return ticket.key;
      } catch (error) {
        console.log(`❌ Fehler beim Löschen von ${ticket.key}: ${error.message}`);
        return null;
      }
    });
    
    const deletedTickets = await Promise.all(deletePromises);
    const successfulDeletions = deletedTickets.filter(key => key !== null);
    
    res.json({
      success: true,
      message: `${successfulDeletions.length} von ${tickets.length} Tickets erfolgreich gelöscht`,
      deleted: successfulDeletions.length,
      total: tickets.length,
      deletedTickets: successfulDeletions
    });
    
  } catch (error) {
    console.error('❌ Fehler beim Löschen der Tickets:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Lösche spezifisches Ticket
app.delete('/delete-ticket/:key', async (req, res) => {
  try {
    const ticketKey = req.params.key;
    console.log(`🗑️ Lösche Ticket: ${ticketKey}`);
    
    await axios.delete(
      `${JIRA_BASE_URL}/rest/api/2/issue/${ticketKey}`,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${JIRA_USERNAME}:${JIRA_PASSWORD}`).toString('base64')}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log(`✅ Ticket ${ticketKey} erfolgreich gelöscht`);
    res.json({
      success: true,
      message: `Ticket ${ticketKey} erfolgreich gelöscht`
    });
    
  } catch (error) {
    console.error(`❌ Fehler beim Löschen von Ticket ${req.params.key}:`, error.message);
    res.status(500).json({
      success: false,
      error: error.message
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

    const result = await axios.post(`http://localhost:${PORT}/jira/create-ticket`, {
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

// Error handling
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// =============================================
// 💬 JIRA COMMENT FUNCTIONALITY
// =============================================

// Kommentar zu Ticket hinzufügen
app.post('/jira/add-comment', async (req, res) => {
  try {
    const { ticketKey, comment, visibility = 'public', author = 'admin' } = req.body;

    // Validation
    if (!ticketKey) {
      return res.status(400).json({
        success: false,
        error: 'ticketKey ist erforderlich'
      });
    }

    if (!comment || comment.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'comment darf nicht leer sein'
      });
    }

    // Ticket-Key Format validieren (PET-XXX)
    if (!/^PET-\d+$/.test(ticketKey)) {
      return res.status(400).json({
        success: false,
        error: 'Ungültiges Ticket-Key Format. Erwartet: PET-XXX'
      });
    }

    console.log(`💬 Füge Kommentar zu ${ticketKey} hinzu...`);

    // Comment Body für JIRA formatieren mit UTF-8 Normalisierung
    let commentBody = Buffer.from(comment, 'utf8').toString('utf8');
    
    // Füge Author-Info hinzu wenn nicht admin
    if (author && author !== 'admin') {
      commentBody = `*Von ${author}:*\n\n${commentBody}`;
    }

    // Füge Timestamp hinzu
    const timestamp = new Date().toLocaleString('de-DE');
    commentBody += `\n\n_Erstellt: ${timestamp}_`;

    // JIRA Comment Payload mit UTF-8 sicherer Übertragung
    const commentPayload = {
      body: commentBody
    };

    // Visibility nur setzen wenn nicht public
    if (visibility !== 'public') {
      commentPayload.visibility = {
        type: 'group',
        value: visibility === 'developers' ? 'jira-developers' : 'jira-users'
      };
    }

    // JIRA API Call mit UTF-8 Encoding
    const response = await axios.post(
      `${JIRA_BASE_URL}/rest/api/2/issue/${ticketKey}/comment`,
      commentPayload,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${JIRA_USERNAME}:${JIRA_PASSWORD}`).toString('base64')}`,
          'Content-Type': 'application/json; charset=utf-8',
          'Accept': 'application/json; charset=utf-8'
        },
        responseType: 'json',
        responseEncoding: 'utf8'
      }
    );

    console.log(`✅ Kommentar zu ${ticketKey} hinzugefügt (ID: ${response.data.id})`);

    res.json({
      success: true,
      message: `Kommentar erfolgreich zu ${ticketKey} hinzugefügt`,
      comment: {
        id: response.data.id,
        created: response.data.created,
        author: response.data.author?.displayName || author,
        body: comment,
        ticketKey: ticketKey,
        visibility: visibility,
        jiraUrl: `${JIRA_BASE_URL}/browse/${ticketKey}`
      }
    });

  } catch (error) {
    console.error(`❌ Fehler beim Kommentieren von ${req.body.ticketKey}:`, error.message);
    
    // Spezifische Fehlerbehandlung
    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        error: `Ticket ${req.body.ticketKey} nicht gefunden`
      });
    }

    if (error.response?.status === 401) {
      return res.status(401).json({
        success: false,
        error: 'JIRA Authentifizierung fehlgeschlagen'
      });
    }

    res.status(500).json({
      success: false,
      error: error.message,
      details: error.response?.data || 'Unbekannter Fehler'
    });
  }
});

// Kommentare eines Tickets abrufen
app.get('/jira/comments/:ticketKey', async (req, res) => {
  try {
    const { ticketKey } = req.params;

    console.log(`📖 Lade Kommentare für ${ticketKey}...`);

    const response = await axios.get(
      `${JIRA_BASE_URL}/rest/api/2/issue/${ticketKey}/comment`,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${JIRA_USERNAME}:${JIRA_PASSWORD}`).toString('base64')}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const comments = response.data.comments.map(comment => ({
      id: comment.id,
      author: comment.author?.displayName || 'Unknown',
      created: comment.created,
      updated: comment.updated,
      body: comment.body,
      visibility: comment.visibility?.value || 'public'
    }));

    console.log(`✅ ${comments.length} Kommentare für ${ticketKey} geladen`);

    res.json({
      success: true,
      ticketKey: ticketKey,
      totalComments: comments.length,
      comments: comments,
      jiraUrl: `${JIRA_BASE_URL}/browse/${ticketKey}`
    });

  } catch (error) {
    console.error(`❌ Fehler beim Laden der Kommentare für ${req.params.ticketKey}:`, error.message);
    
    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        error: `Ticket ${req.params.ticketKey} nicht gefunden`
      });
    }

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Server starten
const server = app.listen(PORT, () => {
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
  console.log(`   POST /jira/add-comment - Kommentar zu Ticket hinzufügen`);
  console.log(`   GET  /jira/comments/:key - Kommentare eines Tickets abrufen`);
  console.log(`   PUT  /jira/update-ticket/:key - Ticket komplett aktualisieren`);
  console.log(`   PATCH /jira/update-ticket/:key - Ticket partiell aktualisieren`);
  console.log(`   POST /jira/transition/:key - Status-Transition durchführen`);
  console.log(`   GET  /jira/transitions/:key - Verfügbare Transitions abrufen`);
  console.log(`   DELETE /delete-all-tickets - Alle Tickets löschen`);
  console.log(`   DELETE /delete-ticket/:key - Spezifisches Ticket löschen`);
  console.log(`\n📝 Verfügbare Templates: ${Object.keys(TICKET_TEMPLATES).join(', ')}`);
});

// =============================================
// 🔄 JIRA TICKET UPDATE FUNCTIONALITY
// =============================================

// Ticket aktualisieren (PUT - komplettes Update)
app.put('/jira/update-ticket/:ticketKey', async (req, res) => {
  try {
    const { ticketKey } = req.params;
    const { 
      summary, 
      description, 
      priority, 
      assignee, 
      labels,
      status,
      comment 
    } = req.body;

    console.log(`🔄 Aktualisiere Ticket: ${ticketKey}`);

    // Jira Update Payload erstellen
    const updatePayload = {
      fields: {}
    };

    // Nur Felder aktualisieren, die übermittelt wurden
    if (summary) updatePayload.fields.summary = summary;
    if (description) updatePayload.fields.description = description;
    if (priority) updatePayload.fields.priority = { name: priority };
    if (assignee) updatePayload.fields.assignee = { name: assignee };
    if (labels) updatePayload.fields.labels = labels;

    // Status-Update über Transition (falls angegeben)
    let transitionId = null;
    if (status) {
      // Verfügbare Transitions abrufen
      const transitionsResponse = await axios.get(
        `${JIRA_BASE_URL}/rest/api/2/issue/${ticketKey}/transitions`,
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(`${JIRA_USERNAME}:${JIRA_PASSWORD}`).toString('base64')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const availableTransitions = transitionsResponse.data.transitions;
      const targetTransition = availableTransitions.find(t => 
        t.to.name.toLowerCase() === status.toLowerCase()
      );

      if (targetTransition) {
        transitionId = targetTransition.id;
      } else {
        console.warn(`⚠️ Status "${status}" nicht als Transition verfügbar für ${ticketKey}`);
      }
    }

    // Ticket-Update durchführen
    const response = await axios.put(
      `${JIRA_BASE_URL}/rest/api/2/issue/${ticketKey}`,
      updatePayload,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${JIRA_USERNAME}:${JIRA_PASSWORD}`).toString('base64')}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Status-Transition durchführen (falls nötig)
    if (transitionId) {
      await axios.post(
        `${JIRA_BASE_URL}/rest/api/2/issue/${ticketKey}/transitions`,
        {
          transition: { id: transitionId }
        },
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(`${JIRA_USERNAME}:${JIRA_PASSWORD}`).toString('base64')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log(`✅ Status von ${ticketKey} auf "${status}" geändert`);
    }

    // Optionaler Kommentar hinzufügen
    if (comment) {
      const timestamp = new Date().toLocaleString('de-DE');
      const commentBody = `*Update-Kommentar:*\n\n${comment}\n\n_Erstellt: ${timestamp}_`;
      
      await axios.post(
        `${JIRA_BASE_URL}/rest/api/2/issue/${ticketKey}/comment`,
        { body: commentBody },
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(`${JIRA_USERNAME}:${JIRA_PASSWORD}`).toString('base64')}`,
            'Content-Type': 'application/json; charset=utf-8'
          }
        }
      );
    }

    console.log(`✅ Ticket ${ticketKey} erfolgreich aktualisiert`);

    res.json({
      success: true,
      message: `Ticket ${ticketKey} erfolgreich aktualisiert`,
      ticketKey: ticketKey,
      updatedFields: Object.keys(updatePayload.fields),
      statusChanged: !!transitionId,
      newStatus: status,
      jiraUrl: `${JIRA_BASE_URL}/browse/${ticketKey}`
    });

  } catch (error) {
    console.error(`❌ Fehler beim Aktualisieren von ${req.params.ticketKey}:`, error.message);
    
    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        error: `Ticket ${req.params.ticketKey} nicht gefunden`
      });
    }

    if (error.response?.status === 400) {
      return res.status(400).json({
        success: false,
        error: 'Ungültige Update-Daten',
        details: error.response?.data
      });
    }

    res.status(500).json({
      success: false,
      error: error.message,
      details: error.response?.data || 'Unbekannter Fehler'
    });
  }
});

// Partial Update (PATCH - nur spezifische Felder)
app.patch('/jira/update-ticket/:ticketKey', async (req, res) => {
  try {
    const { ticketKey } = req.params;
    const updates = req.body;

    console.log(`🔄 Partial Update für Ticket: ${ticketKey}`);

    // Dynamisches Update-Payload basierend auf übermittelten Feldern
    const updatePayload = { fields: {} };

    // Mapping von Request-Feldern zu Jira-Feldern
    const fieldMapping = {
      'summary': 'summary',
      'description': 'description',
      'priority': (value) => ({ name: value }),
      'assignee': (value) => ({ name: value }),
      'labels': 'labels'
    };

    Object.keys(updates).forEach(key => {
      if (fieldMapping[key]) {
        const mapping = fieldMapping[key];
        updatePayload.fields[key] = typeof mapping === 'function' 
          ? mapping(updates[key]) 
          : updates[key];
      }
    });

    if (Object.keys(updatePayload.fields).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Keine gültigen Update-Felder übermittelt',
        supportedFields: Object.keys(fieldMapping)
      });
    }

    // Update durchführen
    await axios.put(
      `${JIRA_BASE_URL}/rest/api/2/issue/${ticketKey}`,
      updatePayload,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${JIRA_USERNAME}:${JIRA_PASSWORD}`).toString('base64')}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`✅ Partial Update für ${ticketKey} erfolgreich`);

    res.json({
      success: true,
      message: `Ticket ${ticketKey} partiell aktualisiert`,
      ticketKey: ticketKey,
      updatedFields: Object.keys(updatePayload.fields),
      jiraUrl: `${JIRA_BASE_URL}/browse/${ticketKey}`
    });

  } catch (error) {
    console.error(`❌ Fehler beim partiellen Update von ${req.params.ticketKey}:`, error.message);
    
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.response?.data || 'Unbekannter Fehler'
    });
  }
});

// Status-Transition (spezifischer Endpoint)
app.post('/jira/transition/:ticketKey', async (req, res) => {
  try {
    const { ticketKey } = req.params;
    const { status, comment } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status ist erforderlich für Transition'
      });
    }

    console.log(`🔄 Ändere Status von ${ticketKey} auf "${status}"`);

    // Verfügbare Transitions abrufen
    const transitionsResponse = await axios.get(
      `${JIRA_BASE_URL}/rest/api/2/issue/${ticketKey}/transitions`,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${JIRA_USERNAME}:${JIRA_PASSWORD}`).toString('base64')}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const availableTransitions = transitionsResponse.data.transitions;
    const targetTransition = availableTransitions.find(t => 
      t.to.name.toLowerCase() === status.toLowerCase()
    );

    if (!targetTransition) {
      return res.status(400).json({
        success: false,
        error: `Status "${status}" ist nicht als Transition verfügbar`,
        availableTransitions: availableTransitions.map(t => ({
          id: t.id,
          name: t.name,
          to: t.to.name
        }))
      });
    }

    // Transition-Payload
    const transitionPayload = {
      transition: { id: targetTransition.id }
    };

    // Optional: Kommentar bei Transition hinzufügen
    if (comment) {
      const timestamp = new Date().toLocaleString('de-DE');
      transitionPayload.update = {
        comment: [{
          add: {
            body: `*Status-Änderung zu "${status}":*\n\n${comment}\n\n_Erstellt: ${timestamp}_`
          }
        }]
      };
    }

    // Transition durchführen
    await axios.post(
      `${JIRA_BASE_URL}/rest/api/2/issue/${ticketKey}/transitions`,
      transitionPayload,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${JIRA_USERNAME}:${JIRA_PASSWORD}`).toString('base64')}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`✅ Status von ${ticketKey} erfolgreich auf "${status}" geändert`);

    res.json({
      success: true,
      message: `Status von ${ticketKey} erfolgreich auf "${status}" geändert`,
      ticketKey: ticketKey,
      oldStatus: 'Unknown', // TODO: Könnte aus vorherigem GET geholt werden
      newStatus: status,
      transitionId: targetTransition.id,
      jiraUrl: `${JIRA_BASE_URL}/browse/${ticketKey}`
    });

  } catch (error) {
    console.error(`❌ Fehler bei Status-Transition von ${req.params.ticketKey}:`, error.message);
    
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.response?.data || 'Unbekannter Fehler'
    });
  }
});

// Verfügbare Transitions für ein Ticket abrufen
app.get('/jira/transitions/:ticketKey', async (req, res) => {
  try {
    const { ticketKey } = req.params;

    console.log(`🔍 Lade verfügbare Transitions für ${ticketKey}`);

    const response = await axios.get(
      `${JIRA_BASE_URL}/rest/api/2/issue/${ticketKey}/transitions`,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${JIRA_USERNAME}:${JIRA_PASSWORD}`).toString('base64')}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const transitions = response.data.transitions.map(transition => ({
      id: transition.id,
      name: transition.name,
      to: {
        id: transition.to.id,
        name: transition.to.name,
        description: transition.to.description
      }
    }));

    res.json({
      success: true,
      ticketKey: ticketKey,
      transitions: transitions,
      count: transitions.length
    });

  } catch (error) {
    console.error(`❌ Fehler beim Laden der Transitions für ${req.params.ticketKey}:`, error.message);
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

server.on('error', (error) => {
  console.error('❌ Server Error:', error);
});

module.exports = app;
