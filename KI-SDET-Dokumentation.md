# KI-SDET Onboarding & Projektüberblick

## Rolle von GitHub Copilot als SDET

- Unterstützt das Team als KI-basierter SDET (Software Development Engineer in Test)
- Erstellt, pflegt und optimiert automatisierte Tests (Playwright, API, Integration)
- Erkennt und dokumentiert Best Practices, Workarounds und wichtige Projekterkenntnisse
- Hält die SDET-Dokumentation aktuell und sorgt für Wissenstransfer
- Gibt Empfehlungen zur Testarchitektur, Modularisierung und Testdatenstrategie
- Unterstützt bei Fehleranalyse, Debugging und Testdatenmanagement
- Ziel: Hohe Testabdeckung, robuste Testautomatisierung und effizientes Onboarding neuer SDETs

Willkommen im PetClinic-Projekt! Diese Datei richtet sich an neue SDETs (Software Development Engineer in Test) und enthält alle wichtigen Informationen rund um Testautomatisierung, Testarchitektur und SDET-Workflow im Projekt.

## Rolle des SDET
- Verantwortlich für die Qualitätssicherung durch automatisierte Tests (UI, API, Integration)
- Entwicklung, Pflege und Erweiterung von Playwright-Tests (UI & API)
- Unterstützung bei Testdatenmanagement, Testinfrastruktur und CI/CD
- Enge Zusammenarbeit mit Entwicklern, PO und QA

## Testautomatisierung im Projekt
### 1. Playwright
- **UI-Tests**: Abdeckung aller Kern-Workflows (CRUD, Navigation, Sprache, etc.)
- **API-Tests**: Jira-Integration, REST-Endpoints
- **Teststruktur**: Page Object Model (POM) für Wiederverwendbarkeit und Wartbarkeit
- **Testdaten**: Fixtures (JSON/TS) für Übersetzungen, API-Requests etc.
- **Selektoren**: Robuste `data-pw`- und `data-i18n`-Attribute, keine brittle XPath/CSS
- **Konfiguration**: `playwright.config.ts` (baseURL: lokal!), Tests laufen gegen lokale Instanz
- **Reports**: HTML-Report nach jedem Lauf (`npx playwright show-report`)

### 2. Testarchitektur
- **POM**: Alle UI-Interaktionen in `playwright/pages/` kapseln (z.B. `OwnerPage.ts`)
- **Hilfsmethoden**: Zentrale Utilities in `playwright/helpers/`
- **Fixtures**: Testdaten in `playwright/fixtures/` auslagern
- **Tests**: Klar benannte Spezifikationen in `playwright/tests/`

### 3. Testausführung
- **Lokal**: `npx playwright test` (alle), `npx playwright test <file>` (einzeln)
- **CI/CD**: Tests werden im Build automatisch ausgeführt
- **Testdaten**: Owner mit ID 1 muss existieren (wird ggf. im Setup angelegt)

### 4. Jira-Integration
- **API-Tests**: Anlegen, Abfragen, Kommentieren von Jira-Issues
- **Backend**: Spring Boot REST-API, Testdaten und Endpunkte in `playwright/tests/`
- **Fehleranalyse**: Bei 500/400-Fehlern Backend-Logs prüfen, Testdaten und DB-Status checken

### 5. Best Practices
- **Tests modular halten** (POM, Fixtures, Hilfsmethoden)
- **Selektoren robust wählen** (`data-pw`, `data-i18n`)
- **Tests regelmäßig laufen lassen** (lokal & CI)
- **Fehlerausgaben im Test nutzen** (Status, Body loggen)
- **Dokumentation aktuell halten** (diese Datei, Testfälle, POMs)

## Einstieg für neue SDETs
1. Projekt klonen und lokal aufsetzen (siehe README)
2. Sicherstellen, dass das Backend auf `localhost:8080` läuft
3. Playwright-Tests lokal ausführen
4. Testdaten/Fixtures prüfen und ggf. anpassen
5. Bei Fragen: Siehe diese Datei, POMs, oder frage das Team

## Nützliche Dateien & Orte
- `playwright/tests/` – Testfälle (UI, API, Sprache, Jira)
- `playwright/pages/` – Page Objects (UI-Interaktionen)
- `playwright/fixtures/` – Testdaten (JSON/TS)
- `playwright/helpers/` – Utilities
- `playwright.config.ts` – Playwright-Konfiguration
- `src/main/resources/messages_*.properties` – Übersetzungen

## Kontakt & Support
- Bei Fragen zu Testarchitektur, Playwright oder SDET-Workflow: Team Lead SDET oder erfahrene SDETs ansprechen
- Jira-Fehler: Backend-Logs prüfen, ggf. Entwickler kontaktieren

---
**Willkommen im Team! Viel Erfolg beim Testen und Automatisieren!**
