// PetClinic-spezifische MCP-Erweiterungen

// 1. Automatische Bug-Report-Erstellung für Frontend-Fehler
app.post('/jira/create-frontend-bug', async (req, res) => {
  const { component, error, userAgent, steps } = req.body;
  
  const ticket = {
    summary: `Frontend Bug: ${component} - ${error.slice(0, 50)}...`,
    description: `**Fehler:** ${error}
    
**Komponente:** ${component}
**Browser:** ${userAgent}
**Schritte zur Reproduktion:**
${steps}

**Labels:** frontend, ${component.toLowerCase()}`,
    issueType: 'Bug',
    priority: 'High',
    labels: ['frontend', component.toLowerCase()]
  };
  
  // Ticket erstellen...
});

// 2. User Story Generator für neue Features
app.post('/jira/create-user-story', async (req, res) => {
  const { feature, userType, benefit } = req.body;
  
  const ticket = {
    summary: `Feature: ${feature}`,
    description: `**User Story:**
Als ${userType} möchte ich ${feature}, damit ${benefit}.

**Akzeptanzkriterien:**
- [ ] UI-Design erstellt
- [ ] Backend-API implementiert
- [ ] Frontend-Integration
- [ ] Tests geschrieben
- [ ] Dokumentation aktualisiert`,
    issueType: 'Story',
    priority: 'Medium',
    labels: ['feature', 'user-story']
  };
  
  // Ticket erstellen...
});

// 3. Automatisches Ticket für Playwright-Test-Failures
app.post('/jira/create-test-failure', async (req, res) => {
  const { testName, errorMessage, screenshot } = req.body;
  
  const ticket = {
    summary: `Test Failure: ${testName}`,
    description: `**Fehlgeschlagener Test:** ${testName}
    
**Fehlermeldung:**
\`\`\`
${errorMessage}
\`\`\`

**Screenshot:** ${screenshot}
**Labels:** test-failure, automation`,
    issueType: 'Bug',
    priority: 'Medium',
    labels: ['test-failure', 'automation']
  };
  
  // Ticket erstellen...
});

// 4. Performance-Issue-Tracker
app.post('/jira/create-performance-issue', async (req, res) => {
  const { page, loadTime, threshold } = req.body;
  
  if (loadTime > threshold) {
    const ticket = {
      summary: `Performance: ${page} lädt zu langsam (${loadTime}ms)`,
      description: `**Seite:** ${page}
**Ladezeit:** ${loadTime}ms
**Schwellenwert:** ${threshold}ms
**Überschreitung:** ${loadTime - threshold}ms

**Mögliche Ursachen:**
- Datenbankabfragen optimieren
- Caching implementieren
- Frontend-Bundle verkleinern`,
      issueType: 'Aufgabe',
      priority: 'Medium',
      labels: ['performance', 'optimization']
    };
    
    // Ticket erstellen...
  }
});

module.exports = {
  // Exportiere neue Funktionen
};
