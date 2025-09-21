# SDET Fixtures Analyse & Cleanup

## Aktuelle Fixtures Analyse (Stand: $(date))

### ✅ AKTIV VERWENDETE FIXTURES:
- `playwright/fixtures/owner-test-data.json` - Verwendet in owner-*.spec.ts
- `playwright/fixtures/pet-test-data.json` - Verwendet in pet-*.spec.ts  
- `playwright/fixtures/vet-test-data.json` - Verwendet in vet-*.spec.ts
- `playwright/fixtures/translations-de.json` - I18n Tests (Deutsch)
- `playwright/fixtures/translations-en.json` - I18n Tests (English)
- `playwright/fixtures/api-mock-responses.json` - API Error Testing

### ⚠️ VERWAISTE FIXTURES (ZU PRÜFEN):
- `playwright/fixtures/legacy-owner-data.json` → LÖSCHEN
- `playwright/fixtures/old-translations.json` → LÖSCHEN  
- `playwright/fixtures/temp-test-data.json` → LÖSCHEN
- `playwright/fixtures/backup-fixtures.json` → LÖSCHEN
- `playwright/fixtures/experimental-data.json` → LÖSCHEN
- `playwright/fixtures/debug-owner-data.json` → LÖSCHEN

### 📁 NEUE FIXTURES FÜR PETTYPE TESTS:
- `playwright/fixtures/pettype-test-data.json` → ERSTELLEN
- `playwright/fixtures/pettype-validation-cases.json` → ERSTELLEN
- `playwright/fixtures/pettype-error-scenarios.json` → ERSTELLEN

## Cleanup Aktionen:
1. Verwaiste Fixtures löschen
2. Neue PetType Fixtures erstellen  
3. Dokumentation aktualisieren
4. Tests auf neue Fixtures migrieren

Status: IN PROGRESS