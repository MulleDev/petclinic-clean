# KI-DEV-Dokumentation: Hinweise für Entwickler im PetClinic-Projekt

## Wer bin ich?
Ich bin GitHub Copilot, ein KI-basierter Programmierassistent, der dich bei der Entwicklung, Wartung und Erweiterung dieses Projekts unterstützt. Ich helfe bei Code-Reviews, Bugfixes, Refactorings, Dokumentation, Tests und allen Fragen rund um das Projekt.

## Quickstart für neue Entwickler

### Was ist das Ziel?
Die Spring PetClinic ist eine Beispielanwendung für Tierarztpraxenverwaltung. Ziel ist es, Stammdaten (Tierarten, Tierärzte, Besitzer, Tiere, Besuche) einfach zu pflegen und zu verwalten.

### 1. Projektüberblick
- Die Spring PetClinic ist eine klassische Spring Boot-Anwendung mit serverseitigem Rendering (Thymeleaf).
- Es gibt eine zentrale Verwaltungssektion („Verwaltung“) für die Pflege von Pet Types und Tierärzten.
- Die Navigation und das UI sind internationalisiert (DE/EN).

### 1a. Techstack
- **Backend:** Java 17+, Spring Boot, Spring MVC, Spring Data JPA, Hibernate
- **Frontend:** Thymeleaf (Server-Side Rendering), Bootstrap (CSS), Icons (FontAwesome)
- **Build/Tools:** Maven Wrapper (`./mvnw`), spring-javaformat, JUnit 5, Mockito, WebMvcTest
- **Datenbank:** H2 (dev/test), MySQL/PostgreSQL (prod möglich)
- **Tests:** JUnit, @WebMvcTest, MockMvc
- **Sonstiges:** Docker Compose (optional), Playwright (E2E-Tests)

### 1b. Architektur & Projektstruktur
- **src/main/java**: Hauptcode (Controller, Services, Repositories, Entities)
  - `org.springframework.samples.petclinic.verwaltung`: Verwaltung (Admin-Controller für Pet Types & Vets)
  - `org.springframework.samples.petclinic.owner`: Owner, Pet, PetType etc.
  - `org.springframework.samples.petclinic.vet`: Vet, VetRepository etc.
- **src/main/resources/templates**: Thymeleaf-Templates (UI)
  - `verwaltung/`: Admin-Views für Pet Types & Vets
  - `fragments/`: Layout, Navigation, wiederverwendbare UI-Teile
- **src/main/resources/messages*.properties**: I18n-Keys (DE/EN)
- **src/test/java**: Tests (WebMvcTest, Unit-Tests)
- **docker-compose.yml**: Optionale Container-Umgebung
- **playwright/**: E2E-Tests mit Playwright

### 1c. Projekt starten (lokal)
1. Java 17+ installieren, IDE öffnen (z.B. IntelliJ, VS Code)
2. Im Projektverzeichnis:
   - `./mvnw spring-javaformat:apply`
   - `./mvnw spring-boot:run`
   - **Hinweis:** Niemals Befehle mit `&&` verketten, sondern immer einzeln im Terminal ausführen!
3. Anwendung im Browser öffnen: http://localhost:8080

### 1d. Zugangsdaten & Konfiguration
- Standardmäßig keine Authentifizierung (Demo-Modus)
- Datenbank: H2 In-Memory (dev/test), keine Anpassung nötig
- Für produktive DB: `src/main/resources/application-*.properties` anpassen

### 1e. Typische Workflows
- Feature-Branch anlegen, Änderungen machen, formatieren, testen, Pull Request
- Bei UI-Änderungen: I18n und Barrierefreiheit beachten
- Bei Backend-Änderungen: Tests ergänzen oder anpassen

### 1f. Hilfe & Kontakt
- Bei Fragen: KI-DEV-Dokumentation lesen, README.md beachten
- Ansprechpartner: Team oder GitHub Copilot

### 1g. Bekannte Stolperfallen
- Vor jedem Start/Build: `./mvnw spring-javaformat:apply` nicht vergessen!
- I18n-Keys immer in beiden Sprachdateien pflegen
- Legacy-Code (alte Controller/Seiten) wurde auf neue Verwaltung umgeleitet oder entfernt
- **Terminal-Hinweis:** Niemals mehrere Befehle mit `&&` verketten, sondern immer einzeln ausführen!

### 2. Technische Standards
- **Code-Formatierung:** Vor jedem Start oder Build IMMER zuerst `./mvnw spring-javaformat:apply` ausführen, dann erst `./mvnw spring-boot:run`.
- **Build/Run-Regel:** Merke: Vor jedem `./mvnw spring-boot:run` IMMER zuerst `./mvnw spring-javaformat:apply` ausführen! (Pflicht für alle Entwickler)
- **Tests:** Es gibt gezielte @WebMvcTest-Tests für die wichtigsten Controller. Neue Features sollten ebenfalls getestet werden.
- **I18n:** Alle Labels, Buttons und Fehlermeldungen sind über `messages.properties` und Sprachvarianten gepflegt.
- **Validierung:** Pflichtfelder und Formulare sind serverseitig validiert. Fehler werden im UI klar angezeigt.
- **Navigation:** Die Verwaltung ist zentral über den Menüpunkt „Verwaltung“ erreichbar. Einzelmenüpunkte für Pet Types etc. wurden entfernt.

### 3. Einstieg ins Projekt
- Lies die README.md für Build- und Laufzeithinweise.
- Sieh dir die KI-BA und KI-SEN-DEV Dateien für Business- und Senior-Dev-Kontext an.
- Nutze die KI-DEV-Dokumentation (diese hier) für technische und organisatorische Hinweise.
- Bei Fragen oder Problemen: Frag GitHub Copilot oder das Team!

### 4. Typische Workflows
- Feature-Branch anlegen, Änderungen machen, formatieren, testen, Pull Request.
- Bei UI-Änderungen: I18n und Barrierefreiheit beachten.
- Bei Backend-Änderungen: Tests ergänzen oder anpassen.

### 5. Sonstiges
- Legacy-Code (alte Controller/Seiten) wurde auf neue Verwaltung umgeleitet oder entfernt.
- Für neue Features: Best Practices und vorhandene Patterns übernehmen.

Viel Erfolg und willkommen im Team!
