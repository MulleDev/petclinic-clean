# Jira-Ticket Spezifikation: Automatisierter Pet E2E Test

## Ticket-Details
- **Typ:** Test Automation Task
- **Komponente:** Testautomation
- **Priorität:** Medium
- **Labels:** e2e-test, pet-management, playwright, crud-operations

## User Story
Als QA-Engineer möchte ich einen automatisierten End-to-End Test für das Pet-Management, der die komplette CRUD-Funktionalität (Create, Read, Delete) validiert, um sicherzustellen, dass die Pet-Verwaltung korrekt funktioniert.

## Beschreibung
Entwicklung eines Playwright-Tests, der folgende Schritte automatisiert durchführt:
1. Ein neues Pet (Haustier) anlegen
2. Überprüfung der korrekten Anzeige in der UI
3. Löschung des angelegten Pets
4. Validierung der erfolgreichen Entfernung

## Akzeptanzkriterien

### AC1: Pet Creation Test
- [ ] Test navigiert zur "Add Pet" Seite
- [ ] Füllt alle Pflichtfelder aus (Name, Typ, Geburtsdatum, Owner)
- [ ] Speichert das Pet erfolgreich
- [ ] Validiert Success-Message/Toast

### AC2: Pet UI Validation Test  
- [ ] Navigiert zur Pet-Liste oder Owner-Detail-Seite
- [ ] Überprüft, dass das neue Pet korrekt angezeigt wird
- [ ] Validiert alle Pet-Daten (Name, Typ, Geburtsdatum)
- [ ] Prüft korrekte Zuordnung zum Owner

### AC3: Pet Deletion Test
- [ ] Navigiert zur Pet-Detail-Seite
- [ ] Führt Lösch-Aktion aus
- [ ] Bestätigt Lösch-Dialog
- [ ] Validiert Success-Message

### AC4: Cleanup Validation
- [ ] Überprüft, dass Pet nicht mehr in der Liste erscheint
- [ ] Validiert, dass keine Datenbank-Reste vorhanden sind
- [ ] Stellt sicher, dass Owner weiterhin existiert

## Technische Spezifikation

### Test-Framework
- **Framework:** Playwright mit TypeScript
- **Datei:** `tests/e2e/pet-crud.spec.ts`
- **Page Objects:** `pages/PetPage.ts`, `pages/OwnerPage.ts`

### Test-Daten
```typescript
const testPetData = {
  name: "TestPet_" + Date.now(),
  type: "Dog", // oder aus verfügbaren Pet Types
  birthDate: "2023-01-15",
  ownerName: "George Franklin" // existierender Owner
};
```

### Test-Struktur
```typescript
describe('Pet CRUD Operations', () => {
  test('should create, display and delete pet successfully', async ({ page }) => {
    // Setup
    // Create Pet
    // Validate Display  
    // Delete Pet
    // Validate Cleanup
  });
});
```

## Definition of Done
- [ ] Test implementiert und funktionsfähig
- [ ] Alle Akzeptanzkriterien erfüllt
- [ ] Test läuft stabil in CI/CD Pipeline
- [ ] Page Objects erstellt/erweitert
- [ ] Test-Dokumentation erstellt
- [ ] Code Review abgeschlossen
- [ ] Test in Test-Suite integriert

## Testfall-Details

### Vorbedingungen
- PetClinic Anwendung läuft auf localhost:8080
- Testdatenbank ist verfügbar
- Mindestens ein Owner existiert in der Datenbank
- Pet Types sind konfiguriert

### Testschritte (detailliert)

#### Phase 1: Pet Creation
1. Navigate to Owner detail page
2. Click "Add New Pet" button
3. Fill pet form:
   - Name: `TestPet_${timestamp}`
   - Type: Select first available type
   - Birth Date: Valid past date
4. Submit form
5. Assert success message
6. Store pet ID for cleanup

#### Phase 2: UI Validation
1. Refresh page or navigate back to owner
2. Locate pet in pets list
3. Validate pet name is displayed
4. Validate pet type is correct
5. Validate birth date formatting
6. Click on pet to view details
7. Validate all details in pet view

#### Phase 3: Pet Deletion
1. From pet details, click "Delete Pet"
2. Confirm deletion in dialog
3. Assert success message
4. Validate redirect to owner page
5. Assert pet no longer in list

## Risiken & Mitigation
- **Timing Issues:** Explicit waits für DOM-Updates
- **Test Data Conflicts:** Unique naming mit Timestamps
- **Database State:** Proper cleanup in afterEach
- **Flaky Tests:** Retry-Mechanismus implementieren

## Geschätzte Complexity Points
**5 Story Points** (Medium complexity)

## Dependencies
- Existing Pet Management functionality
- Playwright test framework setup
- Page Object Models for Pet/Owner pages
- Test data management utilities

---

## MCP Jira Integration (für zukünftige Nutzung)

Sobald die Jira-Lizenz erneuert ist, kann das Ticket mit folgendem API-Call erstellt werden:

```bash
curl -X POST http://localhost:3001/create-from-template \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "test-automation", 
    "replacements": {
      "test_beschreibung": "Automatisierter End-to-End Test für Pet-Management: Pet anlegen, UI-Validierung und Löschung"
    },
    "customFields": {
      "priority": "Medium",
      "labels": ["e2e-test", "pet-management", "playwright", "crud-operations"],
      "component": "Testautomation"
    }
  }'
```

---
**Erstellt:** 13. November 2025  
**BA:** KI Business Analyst  
**Status:** Spezifikation bereit für Implementation