# Jira-Integration: Projektdaten und API-Konfiguration

## Jira-Instanz
- **URL:** http://localhost:8081/

## Projektschlüssel
- **Standard-Projektschlüssel:** PET
- **Hinweis:** Das Skript unterstützt mehrere Projekte. Der Projektschlüssel ist über die Umgebungsvariable `JIRA_PROJECT_KEY` oder die `.env`-Datei konfigurierbar.

## Pflichtfelder für Ticket-Erstellung

| Feldname         | Typ         | Pflichtfeld | Beschreibung                | Beispielwert      |
|------------------|-------------|-------------|-----------------------------|-------------------|
| summary          | String      | Ja          | Titel des Tickets           | "Bug im Login"    |
| description      | String      | Ja          | Beschreibung                | "..."             |
| issuetype        | String      | Ja          | Ticket-Typ (Story, Bug, ...) | "Story"           |
| components       | Array       | Nein        | Komponenten im Projekt      | ["Backend"]       |
| customfield_10010| String      | Nein        | z.B. Akzeptanzkriterien     | "..."             |

> Die vollständige Liste der Custom Fields ist im Jira-Adminbereich einsehbar.

## Konfiguration
- Die Konfiguration erfolgt über die `.env`-Datei oder Umgebungsvariablen.
- Beispiel `.env`:
  ```env
  JIRA_URL=http://localhost:8081
  JIRA_PROJECT_KEY=PET
  JIRA_BOT_USER=jira-bot
  JIRA_BOT_PASSWORD=***
  ```

## Verantwortlichkeit
- Die Pflege dieser Datei und der Konfiguration übernimmt das DevOps-Team.

---

## Swagger/OpenAPI-Dokumentation
- Die REST-API zur Jira-Ticket-Erstellung ist mit Swagger (OpenAPI) dokumentiert.
- Nach dem Start der Anwendung ist die interaktive API-Dokumentation erreichbar unter:
  - [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- Die OpenAPI-Spezifikation ist verfügbar unter:
  - [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)
- Über das Swagger-UI können Endpunkte getestet und Beispielanfragen generiert werden.
- Voraussetzung: Die Abhängigkeit `springdoc-openapi-starter-webmvc-ui` ist in der `pom.xml` enthalten.

*Letzte Aktualisierung: 2025-06-22*
