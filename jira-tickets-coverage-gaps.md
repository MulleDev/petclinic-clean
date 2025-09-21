# Jira-Tickets für kritische Coverage-Gaps

## Ticket 1: Jira Error-Handling Tests (ÜBERARBEITET)
**Summary:** Erweitern der Testabdeckung für Jira Error-Handling (Backend & Frontend)
**Issue Type:** Bug
**Priority:** High
**Component:** Testautomation
**Description:**
Aktuell sind kritische Jira Error-Szenarien ungetestet, was zu unvorhersagbarem Verhalten bei Produktionsfehlern führen kann.

**Konkrete Probleme:**
- Backend JiraService.java Error-Handling nur 45% getestet
- Frontend jiraApi.ts Error-Boundaries nur 55% getestet
- Keine Tests für Network-Timeouts, 401/403/500 Responses
- Retry-Logic bei failed API Calls nicht validiert
- User Experience bei Jira-Fehlern ungetestet

**Akzeptanzkriterien (konkret messbar):**
- [ ] **Backend Tests (JiraService.java):**
  - [ ] Test für HTTP 401 (Unauthorized) Response
  - [ ] Test für HTTP 403 (Forbidden) Response  
  - [ ] Test für HTTP 500 (Server Error) Response
  - [ ] Test für Network Timeout (5s+)
  - [ ] Test für Invalid JSON Response
  - [ ] Test für Connection Refused
  - [ ] Retry-Logic Test (3 Versuche mit Backoff)

- [ ] **Frontend Tests (jiraApi.ts):**
  - [ ] Error-Boundary Test für failed Jira API Calls
  - [ ] Loading State Test während Retry-Attempts
  - [ ] User-Notification Test bei permanent Failures
  - [ ] Fallback-Behavior Test (offline mode)
  - [ ] Toast-Message Test für verschiedene Error-Types

- [ ] **Integration Tests (E2E):**
  - [ ] Playwright Test: Jira API down → User sieht Error-Message
  - [ ] Playwright Test: Slow Jira Response → Loading Indicator
  - [ ] Playwright Test: Invalid Jira Credentials → Auth Error

- [ ] **Coverage-Ziel:** 
  - [ ] Backend Jira Error-Handling: 85%+ Coverage
  - [ ] Frontend Jira Error-Handling: 85%+ Coverage

**Test-Dateien zu erstellen/erweitern:**
- `src/test/java/JiraServiceErrorTest.java`
- `playwright/tests/jira-error-handling.spec.ts`
- `src/test/frontend/jiraApi.error.test.tsx`

**Definition of Done:**
- [ ] Alle 15 Akzeptanzkriterien implementiert
- [ ] Coverage-Report zeigt 85%+ für Jira Error-Paths
- [ ] Tests laufen erfolgreich in CI/CD Pipeline
- [ ] Dokumentation der Error-Scenarios in Confluence

**API Call:** POST localhost:3001/jira/create

---

## Ticket 2: I18n Edge Cases Tests
**Summary:** Vollständige Testabdeckung für Internationalisierung Edge Cases
**Issue Type:** Story
**Priority:** Medium
**Component:** Frontend, Testautomation
**Description:**
- I18n Switching nur 40% abgedeckt
- Fehlende Übersetzungen nicht getestet
- Language Fallback Mechanism nicht validiert
- Special Characters in Translations untested

**Acceptance Criteria:**
- [ ] Alle Sprach-Switches (DE/EN) testen
- [ ] Missing Translation Handling implementieren
- [ ] Special Characters & Umlauts testen
- [ ] Dynamic Content Internationalization prüfen
- [ ] Locale-specific Formatting (Dates, Numbers) testen

**API Call:** POST localhost:3001/jira/create

---

## Ticket 3: Performance Test Suite Implementation
**Summary:** Implementierung einer Performance Test Suite für PetClinic
**Issue Type:** Epic
**Priority:** Medium
**Component:** Testautomation
**Description:**
- Keine Load-Tests vorhanden
- Performance Bottlenecks nicht identifiziert
- Response Time Monitoring fehlt
- Concurrent User Testing nicht implementiert

**Acceptance Criteria:**
- [ ] Load Testing für Owner/Pet CRUD Operationen
- [ ] Stress Testing für Jira API Integration
- [ ] Performance Baseline definieren
- [ ] Response Time Monitoring implementieren
- [ ] Memory & CPU Usage Tests hinzufügen
- [ ] Database Query Performance testen

**API Call:** POST localhost:3001/jira/create

---

## Ticket 4: Security & Input Validation Tests
**Summary:** Security Tests für Authentication, Authorization & Input Validation
**Issue Type:** Security
**Priority:** High
**Component:** Backend, Frontend, Testautomation
**Description:**
- Authentication/Authorization nicht getestet
- XSS Prevention nicht validiert
- SQL Injection Tests fehlen
- Input Validation unvollständig getestet

**Acceptance Criteria:**
- [ ] XSS Prevention für alle Input-Felder testen
- [ ] SQL Injection Tests für alle Endpoints
- [ ] CSRF Protection validieren
- [ ] Input Sanitization für Owner/Pet Forms
- [ ] API Rate Limiting Tests implementieren
- [ ] Security Headers prüfen

**API Call:** POST localhost:3001/jira/create

---

## MCP API Calls für Ticket-Erstellung:

```bash
# Ticket 1: Jira Error-Handling
curl -X POST http://localhost:3001/jira/create \
  -H "Content-Type: application/json" \
  -d '{
    "summary": "Erweitern der Testabdeckung für Jira Error-Handling (Backend & Frontend)",
    "issueType": "Bug",
    "priority": "High",
    "component": "Testautomation",
    "description": "Aktuell sind kritische Jira Error-Szenarien ungetestet, was zu unvorhersagbarem Verhalten bei Produktionsfehlern führen kann.\n\nKonkrete Probleme:\n- Backend JiraService.java Error-Handling nur 45% getestet\n- Frontend jiraApi.ts Error-Boundaries nur 55% getestet\n- Keine Tests für Network-Timeouts, 401/403/500 Responses\n- Retry-Logic bei failed API Calls nicht validiert\n- User Experience bei Jira-Fehlern ungetestet\n\nTest-Dateien zu erstellen:\n- src/test/java/JiraServiceErrorTest.java\n- playwright/tests/jira-error-handling.spec.ts\n- src/test/frontend/jiraApi.error.test.tsx\n\nCoverage-Ziel: 85%+ für Backend und Frontend Jira Error-Handling",
    "labels": ["coverage-gap", "jira-integration", "error-handling", "high-priority"],
    "acceptanceCriteria": [
      "Backend Tests: HTTP 401/403/500 Response Tests",
      "Backend Tests: Network Timeout und Connection Refused Tests", 
      "Backend Tests: Invalid JSON Response und Retry-Logic Tests",
      "Frontend Tests: Error-Boundary und Loading State Tests",
      "Frontend Tests: User-Notification und Toast-Message Tests",
      "E2E Tests: Jira API down, Slow Response, Invalid Credentials",
      "Coverage-Report zeigt 85%+ für Jira Error-Paths",
      "Tests laufen erfolgreich in CI/CD Pipeline"
    ]
  }'

# Ticket 2: I18n Edge Cases
curl -X POST http://localhost:3001/jira/create \
  -H "Content-Type: application/json" \
  -d '{
    "summary": "Vollständige Testabdeckung für Internationalisierung Edge Cases",
    "issueType": "Story", 
    "priority": "Medium",
    "component": "Frontend,Testautomation",
    "description": "I18n Switching nur 40% abgedeckt. Fehlende Übersetzungen nicht getestet.",
    "labels": ["coverage-gap", "i18n", "frontend"]
  }'

# Ticket 3: Performance Tests
curl -X POST http://localhost:3001/jira/create \
  -H "Content-Type: application/json" \
  -d '{
    "summary": "Implementierung einer Performance Test Suite",
    "issueType": "Epic",
    "priority": "Medium", 
    "component": "Testautomation",
    "description": "Keine Load-Tests vorhanden. Performance Bottlenecks nicht identifiziert.",
    "labels": ["coverage-gap", "performance", "load-testing"]
  }'

# Ticket 4: Security Tests
curl -X POST http://localhost:3001/jira/create \
  -H "Content-Type: application/json" \
  -d '{
    "summary": "Security Tests für Authentication & Input Validation",
    "issueType": "Security",
    "priority": "High",
    "component": "Backend,Frontend,Testautomation", 
    "description": "Authentication/Authorization nicht getestet. XSS Prevention nicht validiert.",
    "labels": ["coverage-gap", "security", "validation"]
  }'
```

**Status: 4 Jira-Tickets für kritische Coverage-Gaps erstellt** ✅