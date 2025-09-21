# 💬 User Story: Jira Ticket Kommentierung

## 📋 Story Overview

**Als** Business Analyst/Developer
**möchte ich** Tickets in Jira kommentieren können
**damit** ich Fortschritte, Erkenntnisse und Feedback direkt am Ticket dokumentieren kann

## 🎯 Business Value

- **Kollaboration**: Verbesserte Kommunikation zwischen Team-Mitgliedern
- **Dokumentation**: Automatische Dokumentation von Entwicklungsfortschritten
- **Nachverfolgung**: Bessere Nachvollziehbarkeit von Entscheidungen und Änderungen
- **LLM-Integration**: Automatische Status-Updates durch KI-Systeme

## 🔧 Technical Requirements

### Backend (Jira MCP Server)

#### New Endpoint: POST /jira/add-comment
```json
{
  "ticketKey": "PET-42",
  "comment": "Test implementation started. Backend JiraService error handling tests created.",
  "visibility": "public|internal|developers",
  "author": "admin"
}
```

#### Response Format:
```json
{
  "success": true,
  "message": "Comment successfully added to PET-42",
  "comment": {
    "id": "12345",
    "created": "2025-09-21T14:30:00Z",
    "author": "admin",
    "body": "Test implementation started...",
    "ticketKey": "PET-42"
  }
}
```

### Frontend Integration

#### New Function: addJiraComment()
```javascript
async function addJiraComment(ticketKey, comment, visibility = 'public') {
  const response = await fetch(`${MCP_JIRA_URL}/jira/add-comment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ticketKey, comment, visibility })
  });
  return response.json();
}
```

## ✅ Acceptance Criteria

### Backend Implementation
1. **Endpoint Creation**: POST /jira/add-comment endpoint implementiert
2. **JIRA API Integration**: Korrekte Integration mit JIRA REST API /rest/api/2/issue/{key}/comment
3. **Validation**: Ticket-Key Validierung (Format: PET-XXX)
4. **Error Handling**: 404 für ungültige Tickets, 401 für Auth-Fehler
5. **Comment Formatting**: Unterstützung für Markdown und Plain Text
6. **Visibility Control**: public, internal, developers Visibility-Level
7. **Response Format**: Standardisierte JSON-Response mit Comment-Details

### Frontend Integration
8. **Comment Function**: addJiraComment() JavaScript-Funktion
9. **UI Integration**: Comment-Button in Ticket-Listen (optional)
10. **Toast Notifications**: Erfolgs-/Fehlermeldungen für User-Feedback
11. **Form Validation**: Leere Kommentare verhindern
12. **Character Limit**: Max. 2000 Zeichen pro Kommentar

### Testing & Documentation
13. **Unit Tests**: Backend Endpoint Tests (201, 400, 404 Response)
14. **E2E Tests**: Playwright Tests für Comment-Workflow
15. **API Documentation**: OpenAPI/Swagger Dokumentation
16. **Error Scenarios**: Tests für ungültige Tickets, Auth-Fehler

## 🧪 Test Scenarios

### Positive Tests
- **Valid Comment**: Kommentar zu existierendem Ticket hinzufügen
- **Markdown Support**: Kommentar mit Markdown-Formatierung
- **Visibility Levels**: public, internal, developers Kommentare
- **Long Comments**: Kommentare bis 2000 Zeichen

### Negative Tests
- **Invalid Ticket**: Kommentar zu nicht-existierendem Ticket
- **Empty Comment**: Leerer Kommentar-Body
- **Auth Failure**: Ungültige JIRA-Credentials
- **Network Error**: JIRA-Server nicht erreichbar

### Edge Cases
- **Special Characters**: Unicode, Emojis, Sonderzeichen
- **HTML Injection**: XSS-Prevention Tests
- **Concurrent Comments**: Mehrere Kommentare gleichzeitig

## 🔗 Integration Points

### MCP Server Integration
- **Port**: 3001 (Jira MCP Server)
- **Authentication**: Bestehende admin/admin Credentials
- **Error Handling**: Konsistent mit bestehenden Endpoints

### SDET Integration
- **Test Automation**: Integration in MCP Playwright Server (Port 3003)
- **Performance Testing**: Comment-Creation Performance Monitoring
- **Flaky Test Detection**: Automatische Comment-Test Validierung

## 📊 API Call Examples

### Basic Comment
```bash
curl -X POST http://localhost:3001/jira/add-comment \
  -H "Content-Type: application/json" \
  -d '{
    "ticketKey": "PET-42",
    "comment": "Backend implementation completed. All error handling tests passing.",
    "visibility": "public"
  }'
```

### Development Update
```bash
curl -X POST http://localhost:3001/jira/add-comment \
  -H "Content-Type: application/json" \
  -d '{
    "ticketKey": "PET-42",
    "comment": "**Progress Update:**\n- JiraServiceErrorTest.java created\n- HTTP 401/403/500 tests implemented\n- Coverage increased to 78%\n\n**Next Steps:**\n- Frontend error boundary tests\n- E2E test scenarios",
    "visibility": "developers"
  }'
```

### LLM Auto-Comment
```bash
curl -X POST http://localhost:3001/jira/add-comment \
  -H "Content-Type: application/json" \
  -d '{
    "ticketKey": "PET-42",
    "comment": "🤖 **Automated Status Update:**\nTest implementation completed by LLM.\n\n✅ **Completed:**\n- Backend error handling tests\n- Frontend error boundaries\n- E2E test scenarios\n\n📊 **Coverage:** 85.3% (Target: 85%+)\n🎯 **Status:** Ready for Review",
    "visibility": "public"
  }'
```

## 🔄 Implementation Plan

### Phase 1: Backend (2-3 Story Points)
1. **Endpoint Implementation**: POST /jira/add-comment
2. **JIRA API Integration**: Comment creation via REST API
3. **Validation & Error Handling**: Robuste Fehlerbehandlung
4. **Unit Tests**: Vollständige Backend-Tests

### Phase 2: Frontend Integration (1-2 Story Points)
5. **JavaScript Function**: addJiraComment() implementation
6. **UI Integration**: Comment-Button (optional)
7. **User Feedback**: Toast notifications
8. **Form Validation**: Input validation

### Phase 3: Testing & Documentation (1-2 Story Points)
9. **E2E Tests**: Playwright test scenarios
10. **API Documentation**: Swagger/OpenAPI docs
11. **Performance Testing**: Comment creation performance
12. **Integration Testing**: End-to-end workflow validation

## 🏷️ Labels & Components

- **Component**: Backend, Frontend, Testing
- **Labels**: jira-integration, collaboration, mcp-enhancement, user-story
- **Priority**: Medium
- **Story Points**: 4-7 (je nach UI-Umfang)

## 📝 Definition of Done

- ✅ Backend endpoint implementiert und getestet
- ✅ Frontend function verfügbar und dokumentiert
- ✅ Alle Acceptance Criteria erfüllt
- ✅ Unit Tests mit >85% Coverage
- ✅ E2E Tests implementiert und erfolgreich
- ✅ API Dokumentation vollständig
- ✅ Integration in bestehende MCP-Server
- ✅ Performance Tests bestanden
- ✅ Code Review abgeschlossen

---

**🎯 Diese Story erweitert die Jira MCP-Integration um kollaborative Kommentar-Funktionalität für bessere Team-Kommunikation und automatisierte LLM-Updates.**
