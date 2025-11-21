# KI-SEN-DEV-Dokumentation

## Rolle

**Senior Developer (SEN-DEV)**  
Verantwortlich für technische Qualität, Architektur und Weiterentwicklung des Projekts. Aufgaben: Code-Reviews, technische Beratung, Einhaltung von Best Practices, Unterstützung bei Architekturentscheidungen, Einarbeitung neuer Entwickler.

---

## Projekt Techstack

- **Backend:**  
  - Java 17+  
  - Spring Boot (MVC, Data JPA, Security, Validation)  
  - REST-APIs  
  - PostgreSQL (Produktion), H2 (lokal/testweise)  
  - **JIRA-API Integration** (REST-Integration mit MCP Server)
  - **MCP Server** (Node.js/Express auf Port 3001 für JIRA-Integration)

- **Frontend:**  
  - Thymeleaf (serverseitiges Templating)  
  - Bootstrap (UI)  
  - Vanilla JavaScript (z.B. Sprachumschaltung)  
  - Mehrsprachigkeit (i18n) mit messages_*.properties, Umschaltung per API

- **Integration & APIs:**
  - **MCP JIRA Server** (localhost:3001) - Template-basierte Ticket-Erstellung
  - **Epic-Story-Verlinkung** über Custom Fields (customfield_10103, customfield_10101)
  - **Template-Engine** für strukturierte JIRA-Tickets
  - **Automatisierte Ticket-Workflows** mit Express.js REST API

- **Testing:**  
  - JUnit (Unit-/Integrationstests)  
  - Playwright (E2E-Tests + JIRA-API-Tests)
  - **JIRA-Integration-Tests** für Epic-Story-Workflows

- **Deployment:**  
  - Docker-Support  
  - CI/CD mit Maven und GitHub Actions
  - **MCP Server** parallel deployment (Node.js)

---

## Best Practices & Architektur

### **Core Spring Boot Architektur:**
- Konstruktor-Injektion für alle Spring Beans
- Service-Layer für Geschäftslogik, Controller nur für Routing/DTOs
- Repository-Pattern für Datenzugriff
- Bean Validation (`@Valid`, `@NotBlank`, `@Email`, etc.)
- Zentrales Exception Handling mit `@ControllerAdvice`

### **Frontend & UI:**
- Mehrsprachigkeit: Alle Labels/Meldungen in messages_*.properties, Umschaltung per API und LocalStorage
- Kein AJAX für Formulare/CRUD, alles klassisch per Seitenwechsel
- Thymeleaf-Templates mit Bootstrap für responsive Design

### **MCP JIRA Integration Architecture (NEU!):**

#### **MCP Server Architektur:**
- **Node.js/Express Server** auf Port 3001
- **Template Engine** für strukturierte JIRA-Ticket-Erstellung
- **Epic-Story-Workflow-Management** mit Custom Field Mapping
- **REST API** mit vollständiger Error Handling

#### **Custom Field Mappings:**
```javascript
// JIRA Custom Field IDs (KRITISCH für korrekte Funktionalität)
const CUSTOM_FIELDS = {
  EPIC_NAME: 'customfield_10103',      // Epic Name Field
  EPIC_LINK: 'customfield_10101',      // Epic Link für Stories
  SPRINT: 'customfield_10105'          // Sprint Field (optional)
};
```

#### **Template-System Architecture:**
```javascript
// Template-Engine Pattern
const TICKET_TEMPLATES = {
  'epic': { issueType: 'Epic', customfield_10103: '[EPIC_NAME]' },
  'petclinic-epic': { issueType: 'Epic', ...epicStructure },
  'petclinic-feature': { issueType: 'Story', epicLink: '[EPIC_KEY]' }
};
```

#### **API Endpoint Design:**
- **POST** `/jira/create-ticket` - Direct JIRA ticket creation
- **POST** `/create-from-template` - Template-based creation
- **GET** `/templates` - Available templates listing
- **GET** `/health` - Server status check

### **Epic-Story-Workflow Best Practices:**

#### **1. Epic Creation Pattern:**
```javascript
const epicPayload = {
  fields: {
    project: { key: 'PET' },
    summary: 'Epic Title',
    issuetype: { name: 'Epic' },
    customfield_10103: 'Epic Name'  // REQUIRED for Epic validation
  }
};
```

#### **2. Story-Epic-Linking Pattern:**
```javascript
const storyPayload = {
  fields: {
    project: { key: 'PET' },
    summary: 'Story Title',
    issuetype: { name: 'Story' },
    customfield_10101: 'PET-5'  // Epic Link Reference
  }
};
```

### **Quality Assurance:**
- Automatisierte Formatierung mit spring-javaformat
- Automatisierte Tests: Unit, Integration, E2E
- **JIRA-Integration-Tests** für Epic-Story-Workflows
- **Template-Validation** für JIRA-Ticket-Struktur

---

## Einarbeitungstipps für neue SEN-DEVs

### **Core PetClinic Architecture:**
- **Wichtige Klassen:** `src/main/java/org/springframework/samples/petclinic/owner`, `pet`, `vet`, `system`
- **Templates:** `src/main/resources/templates`
- **Internationalisierung:** `src/main/resources/messages_*.properties`

### **Testing Architecture:**
- **Unit/Integration:** JUnit-Tests in `src/test/java`
- **E2E-Tests:** `playwright/tests` für UI-Workflows
- **JIRA-Integration-Tests:** `playwright/tests` für Epic-Story-Validation

### **MCP JIRA Server Setup (KRITISCH):**

#### **Server-Start (Development):**
```bash
# Terminal 1: PetClinic App
./mvnw spring-javaformat:apply
./mvnw spring-boot:run

# Terminal 2: MCP JIRA Server
cd mcp-jira
node index.js
# Server läuft auf http://localhost:3001
```

#### **JIRA-Integration Validation:**
```bash
# Health Check
curl http://localhost:3001/health

# Template Verification
curl http://localhost:3001/templates

# Epic Creation Test
curl -X POST http://localhost:3001/jira/create-ticket \
  -H "Content-Type: application/json" \
  -d '{"issueType":"Epic","summary":"Test Epic","epicName":"Test"}'
```

### **Debugging & Troubleshooting:**

#### **Common Issues:**
1. **Custom Field Errors:** Verifiziere JIRA Custom Field IDs
   - `customfield_10103` (Epic Name) 
   - `customfield_10101` (Epic Link)

2. **Template Processing Loops:** Check Template-Variable-Replacement
   - Prüfe `oldString`/`newString` Replacement-Logic
   - Validate Template-Placeholder-Syntax

3. **JIRA Authentication:** Basic Auth admin/admin
   - Bei 401/403: JIRA Container neu starten
   - `docker restart petclinic-jira-1`

#### **Performance Monitoring:**
- **MCP Server Payload Limit:** 50MB (erhöht von Standard 100KB)
- **Template Processing:** Optimiert gegen Endlosschleifen
- **Epic-Story-Queries:** JQL Performance für große Projekte

### **Code-Review Guidelines:**

#### **JIRA-Integration Code:**
```javascript
// ✅ GOOD: Explicit Custom Field Mapping
const issuePayload = {
  fields: {
    customfield_10103: epicName,  // Epic Name - explicit
    customfield_10101: epicLink   // Epic Link - explicit
  }
};

// ❌ BAD: Hardcoded oder unklare Field References
const payload = { epicField: epicName }; // Unclear mapping
```

#### **Template-Engine Code:**
```javascript
// ✅ GOOD: Safe Replacement mit Cycle-Detection
function replaceTemplatePlaceholders(template, replacements) {
  let result = template;
  let iterations = 0;
  const MAX_ITERATIONS = 10;
  
  for (const [key, value] of Object.entries(replacements)) {
    if (iterations++ > MAX_ITERATIONS) break;
    result = result.replace(new RegExp(`\\[${key}\\]`, 'g'), value);
  }
  return result;
}
```

### **Architecture Decision Records (ADR):**

#### **ADR-001: Epic-Link Custom Field Architecture**
- **Problem:** JIRA Epic-Story-Verlinkung benötigt spezifische Custom Fields
- **Decision:** Verwendung von customfield_10103 (Epic Name) + customfield_10101 (Epic Link)
- **Rationale:** Standard JIRA Software Field IDs für Scrum/Kanban Boards
- **Consequences:** Server-Konfiguration project-spezifisch, Custom Field IDs müssen validiert werden

#### **ADR-002: Template-Engine Anti-Pattern Prevention**
- **Problem:** Template-Replacement-Schleifen bei rekursiven Placeholdern
- **Decision:** Iteration-Limit + Safe-Replacement-Pattern implementiert
- **Rationale:** Verhindert Endlosschleifen bei Template-Processing
- **Consequences:** Max. 10 Replacement-Iterationen, Template-Design-Guidelines notwendig

### **Onboarding Checklist:**
- [ ] PetClinic lokal erfolgreich gestartet
- [ ] MCP JIRA Server setup und Health Check erfolgreich
- [ ] Template-System verstanden und getestet
- [ ] Epic-Story-Workflow einmal komplett durchgespielt
- [ ] Custom Field Mapping validiert
- [ ] Code-Review-Guidelines gelesen
- [ ] Testing-Patterns für JIRA-Integration verstanden

---

## Automatische Wissenssicherung

Wichtige technische Hinweise, Best Practices oder projektspezifische Besonderheiten, die für einen neuen Senior Developer relevant sind, werden von GitHub Copilot automatisch in dieser Datei ergänzt, sobald sie auffallen. So bleibt das Wissen aktuell und vollständig.

### **Aktuelle Updates (November 2025):**

#### **🎯 JIRA MCP Integration - Technical Deep Dive:**
- **Epic-Story-Hierarchie** vollständig implementiert mit Custom Field Mappings
- **Template-Engine** mit Anti-Loop-Protection und 50MB Payload Support
- **REST API Architecture** für JIRA-Integration mit Express.js/Node.js
- **Custom Field IDs** validiert und dokumentiert für Production-Readiness

#### **🔧 Technical Debt Resolved:**
- **Template-Processing-Loops** durch Iteration-Limit und Safe-Replacement behoben
- **Payload-Size-Limits** von 100KB auf 50MB erweitert für große Templates
- **Authentication-Robustness** für JIRA Basic Auth (admin/admin) verbessert
- **Error-Handling** für Epic-Name-Field-Validation implementiert

#### **📊 Performance Optimizations:**
- **Template-Replacement-Engine** optimiert gegen Endlosschleifen
- **Epic-Link-Queries** mit JQL für bessere Performance bei großen Projekten
- **Server-Health-Monitoring** für MCP JIRA Server implementiert

#### **🧪 Testing Strategy Updates:**
- **Epic-Story-Workflow-Tests** in Playwright integriert
- **Template-Validation-Tests** für alle JIRA-Templates implementiert
- **API-Integration-Tests** für Custom Field Mappings

---

**Letzte technische Aktualisierung:** 20. November 2025  
**Nächste Review:** Bei neuen JIRA-Integration-Features oder Template-System-Erweiterungen

---

## Technical Implementation Guide

### **MCP JIRA Server - Code Architecture:**

#### **Core Server Structure:**
```
mcp-jira/
├── index.js                 # Main server file (Port 3001)
├── package.json             # Node.js dependencies
├── README.md               # Integration documentation
└── server.log              # Runtime logs (auto-generated)
```

#### **Key Technical Components:**

##### **1. Template Engine Implementation:**
```javascript
// Template Processing mit Anti-Loop Protection
const TICKET_TEMPLATES = {
  'epic': {
    issueType: 'Epic',
    summary: '[TITEL]',
    description: 'Epic Template Body...',
    customfield_10103: '[EPIC_NAME]'  // Epic Name Field
  },
  'petclinic-feature': {
    issueType: 'Story', 
    summary: '[TITEL]',
    description: 'Story Template Body...'
    // Epic Link über customFields.epicLink hinzugefügt
  }
};
```

##### **2. Custom Field Handler:**
```javascript
// Epic Name Field (customfield_10103)
if (issueType === 'Epic') {
  const epicNameValue = epicName || summary;
  issuePayload.fields.customfield_10103 = epicNameValue;
}

// Epic Link Field (customfield_10101) 
if (epicLink && ['Story', 'Task', 'Bug'].includes(issueType)) {
  issuePayload.fields.customfield_10101 = epicLink;
}
```

##### **3. Error Handling Pattern:**
```javascript
// Template-Replacement mit Cycle-Prevention
function processTemplate(template, replacements) {
  let result = template.description;
  let iterations = 0;
  const MAX_ITERATIONS = 10;
  
  Object.keys(replacements).forEach(key => {
    if (iterations++ > MAX_ITERATIONS) return;
    const placeholder = `[${key.toUpperCase()}]`;
    result = result.replace(new RegExp(placeholder, 'g'), replacements[key] || '');
  });
  
  // Clean unresolved placeholders
  result = result.replace(/\[[\w\s_-]+\]/g, '');
  return result;
}
```

##### **4. API Response Schema:**
```javascript
// Standardized Response Format
{
  success: true,
  message: `Ticket erfolgreich erstellt: ${ticketKey}`,
  ticket: {
    key: ticketKey,           // PET-X
    url: ticketUrl,           // JIRA browse URL
    id: response.data.id,     // Internal JIRA ID
    self: response.data.self, // REST API self-link
    epicLink: epicLink || null // Epic association
  }
}
```

### **Database Schema Considerations:**

#### **JIRA Custom Fields (Read-Only Integration):**
```sql
-- JIRA Internal Field Mapping (Reference Only)
-- customfield_10103: Epic Name (VARCHAR)
-- customfield_10101: Epic Link (VARCHAR, Epic Key Reference)  
-- customfield_10105: Sprint (ARRAY, Sprint References)

-- PetClinic nutzt diese Fields via REST API, keine direkte DB-Integration
```

### **Integration Testing Patterns:**

#### **Epic-Story-Workflow Test:**
```javascript
// playwright/tests/jira-epic-integration.spec.ts
test('Epic-Story workflow validation', async () => {
  // 1. Create Epic via MCP API
  const epicResponse = await fetch('http://localhost:3001/jira/create-ticket', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      issueType: 'Epic',
      summary: 'Test Epic',
      epicName: 'Test Epic Name'
    })
  });
  
  const epic = await epicResponse.json();
  expect(epic.success).toBe(true);
  
  // 2. Create Story with Epic Link
  const storyResponse = await fetch('http://localhost:3001/jira/create-ticket', {
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      issueType: 'Story',
      summary: 'Test Story',
      epicLink: epic.ticket.key
    })
  });
  
  const story = await storyResponse.json();
  expect(story.success).toBe(true);
  expect(story.ticket.epicLink).toBe(epic.ticket.key);
  
  // 3. Validate Epic-Story Link in JIRA
  const jiraStory = await fetch(`http://localhost:8081/rest/api/2/issue/${story.ticket.key}`, {
    headers: {
      'Authorization': 'Basic ' + Buffer.from('admin:admin').toString('base64')
    }
  });
  
  const storyData = await jiraStory.json();
  expect(storyData.fields.customfield_10101).toBe(epic.ticket.key);
});
```

### **Deployment & Monitoring:**

#### **Production Checklist:**
- [ ] **Custom Field IDs** für Production JIRA-Instanz validiert
- [ ] **Authentication** von admin/admin auf Production-Credentials umgestellt
- [ ] **CORS Configuration** für Production-Domain angepasst
- [ ] **Payload Limits** (50MB) für Production-Load getestet
- [ ] **Error Logging** für Production-Monitoring konfiguriert
- [ ] **Health Check Endpoint** in Load Balancer integriert

#### **Monitoring Endpoints:**
```bash
# Health Check
GET http://localhost:3001/health

# Template Validation
GET http://localhost:3001/templates

# Server Metrics (custom endpoint)
GET http://localhost:3001/metrics
```

---

**Willkommen im Team!**

*Diese Dokumentation umfasst jetzt vollständige JIRA MCP Integration mit Epic-Story-Workflows, Custom Field Mappings und Production-Ready Deployment Guidelines für Senior Developer.*


