// JIRA MCP Server - Kompakte Version (Längenbeschränkung beachtet)
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// JIRA Configuration - Alternative Anmeldedaten versuchen
const JIRA_CONFIG = {
  baseURL: 'http://localhost:8081',
  projectKey: 'PET',
  auth: {
    username: 'admin',
    password: 'admin'  // Häufiger Default-Password
  }
};

// Middleware
app.use(cors());
app.use(express.json());

// Kompakte Template-Definitionen (JIRA-Längenbeschränkung beachten)
const TICKET_TEMPLATES = {
  'bug-report': {
    name: 'Bug Report',
    issueType: 'Bug',
    priority: 'High',
    summary: '[TITEL]',
    description: `**Problem:** [Beschreibung]

**Schritte:**
1. [Schritt1]
2. [Schritt2]

**Erwartet:** [Verhalten]
**Tatsächlich:** [Fehler]`,
    labels: ['bug']
  },

  'feature-request': {
    name: 'Feature Request', 
    issueType: 'Story',
    priority: 'Medium',
    summary: '[TITEL]',
    description: `**User Story:**
Als [Rolle] möchte ich [Funktion], damit [Nutzen].

**Akzeptanzkriterien:**
- [ ] [Kriterium 1]
- [ ] [Kriterium 2]`,
    labels: ['feature']
  },

  'task': {
    name: 'Aufgabe/Task',
    issueType: 'Aufgabe', 
    priority: 'Medium',
    summary: '[TITEL]',
    description: `**Beschreibung:** [Aufgabe]

**Ziel:** [Was erreichen?]

**To-Do:**
- [ ] [Schritt 1]
- [ ] [Schritt 2]`,
    labels: ['task']
  },

  'petclinic-bug': {
    name: 'PetClinic Bug Report',
    issueType: 'Bug',
    priority: 'High', 
    summary: '[TITEL]',
    description: `**Modul:** [Owner/Pet/Vet/Visit]

**Schritte:**
1. [Schritt1]
2. [Schritt2]

**Erwartet:** [Verhalten]
**Tatsächlich:** [Fehler]`,
    labels: ['petclinic', 'bug']
  },

  'petclinic-feature': {
    name: 'PetClinic Feature',
    issueType: 'Story',
    priority: 'Medium',
    summary: '[TITEL]', 
    description: `**Modul:** [Owner/Pet/Vet/Visit]

**User Story:**
Als [Rolle] möchte ich [Funktion], damit [Nutzen].

**Akzeptanzkriterien:**
- [ ] Frontend
- [ ] Backend`,
    labels: ['petclinic', 'feature']
  },

  'epic': {
    name: 'Epic',
    issueType: 'Epic',
    priority: 'Medium',
    summary: '[TITEL]',
    description: `**Epic:** [Beschreibung]

**Business Value:** [Warum wichtig?]

**Ziele:**
- [Ziel 1]
- [Ziel 2]`,
    labels: ['epic']
  },

  'subtask': {
    name: 'Sub-Task',
    issueType: 'Sub-task',
    priority: 'Medium',
    summary: '[TITEL]',
    description: `**Aufgabe:** [Beschreibung]

**Parent:** [PARENT_KEY]

**Schritte:**
- [ ] [Schritt 1]
- [ ] [Schritt 2]`,
    labels: ['subtask']
  },

  'test': {
    name: 'Test Automation',
    issueType: 'Aufgabe',
    priority: 'Medium',
    summary: '[TITEL]',
    description: `**Test:** [Was testen?]

**Framework:**
- [ ] Playwright E2E
- [ ] Unit Tests

**Ziel:** [Test Ziel]`,
    labels: ['testing']
  }
};

// Standard-Replacements für Template-Parameter
const standardReplacements = {
  'titel': 'TITEL',
  'title': 'TITEL',
  'name': 'TITEL',
  'summary': 'TITEL',
  'beschreibung': 'BESCHREIBUNG',
  'description': 'BESCHREIBUNG',
  'aufgabe': 'AUFGABE',
  'task': 'AUFGABE',
  'ziel': 'ZIEL',
  'goal': 'ZIEL'
};

// Template-Parameter verarbeiten
function processTemplate(template, params) {
  let { summary, description } = template;
  
  // Standard-Titel-Replacement
  if (params.title || params.titel) {
    const title = params.title || params.titel;
    summary = summary.replace(/\[TITEL\]/g, title);
    description = description.replace(/\[TITEL\]/g, title);
  }
  
  // Alle Parameter-Replacements
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      const upperKey = key.toUpperCase();
      const pattern = new RegExp(`\\[${upperKey}\\]`, 'g');
      summary = summary.replace(pattern, value);
      description = description.replace(pattern, value);
      
      // Standard-Mappings
      if (standardReplacements[key.toLowerCase()]) {
        const standardKey = standardReplacements[key.toLowerCase()];
        const standardPattern = new RegExp(`\\[${standardKey}\\]`, 'g');
        summary = summary.replace(standardPattern, value);
        description = description.replace(standardPattern, value);
      }
    }
  });
  
  return { ...template, summary, description };
}

// JIRA API Helper Functions
const jiraApi = {
  async createIssue(issueData) {
    try {
      const response = await axios.post(
        `${JIRA_CONFIG.baseURL}/rest/api/2/issue`,
        issueData,
        {
          auth: JIRA_CONFIG.auth,
          headers: { 'Content-Type': 'application/json' }
        }
      );
      return response.data;
    } catch (error) {
      console.error('JIRA API Error:', error.response?.data || error.message);
      throw error;
    }
  },

  async deleteIssue(issueKey) {
    try {
      await axios.delete(
        `${JIRA_CONFIG.baseURL}/rest/api/2/issue/${issueKey}`,
        { auth: JIRA_CONFIG.auth }
      );
      return { success: true, message: `Issue ${issueKey} gelöscht` };
    } catch (error) {
      console.error('Delete Error:', error.response?.data || error.message);
      throw error;
    }
  }
};

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'MCP Jira Server ist bereit' });
});

// Template Liste
app.get('/templates', (req, res) => {
  const templates = Object.entries(TICKET_TEMPLATES).map(([id, template]) => ({
    id,
    name: template.name,
    issueType: template.issueType,
    priority: template.priority
  }));
  
  res.json({
    message: 'Verfügbare Ticket-Templates',
    templates
  });
});

// Ticket von Template erstellen  
app.post('/create-from-template', async (req, res) => {
  try {
    const { templateId, ...params } = req.body;
    
    if (!templateId || !TICKET_TEMPLATES[templateId]) {
      return res.status(400).json({ 
        error: 'Template ID erforderlich', 
        availableTemplates: Object.keys(TICKET_TEMPLATES) 
      });
    }

    const template = TICKET_TEMPLATES[templateId];
    const processedTemplate = processTemplate(template, params);
    
    // JIRA Issue Data
    const issueData = {
      fields: {
        project: { key: JIRA_CONFIG.projectKey },
        summary: processedTemplate.summary,
        description: processedTemplate.description,
        issuetype: { name: processedTemplate.issueType },
        priority: { name: processedTemplate.priority },
        labels: processedTemplate.labels
      }
    };

    // Sub-Task Parent-Key Validation
    if (processedTemplate.issueType === 'Sub-task' && params.parentKey) {
      issueData.fields.parent = { key: params.parentKey };
    }

    const result = await jiraApi.createIssue(issueData);
    res.json(result.key);
    
  } catch (error) {
    console.error('Template Creation Error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Fehler beim Erstellen des Tickets',
      details: error.response?.data || error.message 
    });
  }
});

// Ticket löschen
app.delete('/delete/:issueKey', async (req, res) => {
  try {
    const { issueKey } = req.params;
    const result = await jiraApi.deleteIssue(issueKey);
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      error: 'Fehler beim Löschen',
      details: error.response?.data || error.message 
    });
  }
});

// Batch Delete
app.post('/batch-delete', async (req, res) => {
  try {
    const { issueKeys } = req.body;
    
    if (!Array.isArray(issueKeys) || issueKeys.length === 0) {
      return res.status(400).json({ error: 'issueKeys Array erforderlich' });
    }

    const results = [];
    for (const issueKey of issueKeys) {
      try {
        await jiraApi.deleteIssue(issueKey);
        results.push({ issueKey, status: 'deleted' });
      } catch (error) {
        results.push({ 
          issueKey, 
          status: 'error', 
          error: error.response?.data || error.message 
        });
      }
    }

    res.json({
      message: `Batch Delete abgeschlossen`,
      total: issueKeys.length,
      successful: results.filter(r => r.status === 'deleted').length,
      failed: results.filter(r => r.status === 'error').length,
      results
    });
    
  } catch (error) {
    res.status(500).json({ 
      error: 'Batch Delete Fehler',
      details: error.message 
    });
  }
});

// Server starten
app.listen(PORT, () => {
  console.log(`🚀 JIRA MCP Server läuft auf Port ${PORT}`);
  console.log(`📝 ${Object.keys(TICKET_TEMPLATES).length} Templates verfügbar`);
  console.log(`🔗 JIRA: ${JIRA_CONFIG.baseURL}`);
  console.log(`📊 Projekt: ${JIRA_CONFIG.projectKey}`);
  console.log(`✅ Server bereit für Ticket-Erstellung!`);
});
