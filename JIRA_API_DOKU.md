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
- Die Konfiguration erfolgt über die `application.properties` (empfohlen für Spring Boot) oder Umgebungsvariablen.
- Beispiel `application.properties`-Einträge:
  ```properties
  jira.url=http://localhost:8081
  jira.project-key=PET
  jira.bot-user=jira-bot
  jira.bot-password=***
  ```
- Alternativ können Umgebungsvariablen verwendet werden (z. B. für Container-Betrieb).

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

## Fehlerbehandlung und Benachrichtigung
- Kritische Fehler (z. B. wenn die Jira-Ticket-Erstellung mehrfach fehlschlägt) werden per Logging dokumentiert.
- Es erfolgt aktuell keine automatische E-Mail-Benachrichtigung mehr.
- Für Monitoring/Alerting kann das Logging später z. B. an Splunk oder andere Systeme angebunden werden.
- Die ursprüngliche Mailfunktion wurde entfernt, um die Komplexität zu reduzieren.

## Mapping von KI-Feldern zu Jira-Feldern
- Das Mapping von KI-generierten Feldern zu Jira-Feldern (inkl. Custom Fields) ist in der Klasse `JiraFieldMappingConfig` zentral konfiguriert.
- Beispiel-Mapping:
  | KI-Feld              | Jira-Feld           |
  |----------------------|---------------------|
  | acceptanceCriteria   | customfield_10010   |
  | epicLink             | customfield_10008   |
- Neue Felder können durch Ergänzen der Mapping-Klasse hinzugefügt werden.
- Ist ein Feld im Mapping nicht vorhanden, wird das Ticket nicht angelegt und ein Logeintrag erzeugt.

## Beispiel für das JSON-Übergabeformat
```json
{
  "summary": "Beispiel-Story",
  "description": "Dies ist eine automatisch generierte Story.",
  "issuetype": "Story",
  "projectKey": "PET",
  "components": ["Backend"],
  "acceptanceCriteria": "Das Ticket wird erfolgreich in Jira angelegt.\nAlle Pflichtfelder sind gesetzt.",
  "epicLink": "PET-1",
  "labels": ["ki", "import"]
}
```

*Letzte Aktualisierung: 2025-06-22*
