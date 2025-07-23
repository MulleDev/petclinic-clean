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
  - Jira-API (REST-Integration)

- **Frontend:**  
  - Thymeleaf (serverseitiges Templating)  
  - Bootstrap (UI)  
  - Vanilla JavaScript (z.B. Sprachumschaltung)  
  - Mehrsprachigkeit (i18n) mit messages_*.properties, Umschaltung per API

- **Testing:**  
  - JUnit (Unit-/Integrationstests)  
  - Playwright (E2E-Tests)

- **Deployment:**  
  - Heroku (Cloud)  
  - Docker-Support  
  - CI/CD mit Maven und GitHub Actions

---

## Best Practices & Architektur

- Konstruktor-Injektion für alle Spring Beans
- Service-Layer für Geschäftslogik, Controller nur für Routing/DTOs
- Repository-Pattern für Datenzugriff
- Bean Validation (`@Valid`, `@NotBlank`, `@Email`, etc.)
- Zentrales Exception Handling mit `@ControllerAdvice`
- Mehrsprachigkeit: Alle Labels/Meldungen in messages_*.properties, Umschaltung per API und LocalStorage
- Kein AJAX für Formulare/CRUD, alles klassisch per Seitenwechsel
- Automatisierte Formatierung mit spring-javaformat
- Automatisierte Tests: Unit, Integration, E2E

---

## Einarbeitungstipps für neue SEN-DEVs

- Wichtige Klassen: `src/main/java/org/springframework/samples/petclinic/owner`, `pet`, `vet`, `system`
- Templates: `src/main/resources/templates`
- Playwright-Tests: `playwright/tests`
- Coding-Guidelines und Architekturentscheidungen beachten
- Bestehende Tests als Referenz für neue Features nutzen
- Bei Fragen zur Architektur/Best Practices: Rücksprache mit Lead/SEN-DEV

---

## Automatische Wissenssicherung

Wichtige technische Hinweise, Best Practices oder projektspezifische Besonderheiten, die für einen neuen Senior Developer relevant sind, werden von GitHub Copilot automatisch in dieser Datei ergänzt, sobald sie auffallen. So bleibt das Wissen aktuell und vollständig.

---

**Willkommen im Team!**
