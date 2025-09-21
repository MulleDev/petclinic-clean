// Kurze Template-Definitionen zur Vermeidung von JIRA Längenbeschränkungen

const SHORT_TEMPLATES = {
  'bug-report': {
    name: 'Bug Report',
    issueType: 'Bug',
    priority: 'High',
    summary: '[TITEL]',
    description: `**Problem:** [Beschreibung]

**Schritte:**
1. [Schritt1]
2. [Schritt2]

**Erwartet:** [Verhalten]
**Tatsächlich:** [Fehler]`,
    labels: ['bug']
  },

  'feature-request': {
    name: 'Feature Request',
    issueType: 'Story',
    priority: 'Medium',
    summary: '[TITEL]',
    description: `**User Story:**
Als [Rolle] möchte ich [Funktion], damit [Nutzen].

**Akzeptanzkriterien:**
- [ ] [Kriterium 1]
- [ ] [Kriterium 2]`,
    labels: ['feature']
  },

  'task': {
    name: 'Aufgabe/Task',
    issueType: 'Aufgabe',
    priority: 'Medium',
    summary: '[TITEL]',
    description: `**Beschreibung:** [Aufgabe]

**Ziel:** [Was erreichen?]

**To-Do:**
- [ ] [Schritt 1]
- [ ] [Schritt 2]`,
    labels: ['task']
  },

  'petclinic-bug': {
    name: 'PetClinic Bug Report',
    issueType: 'Bug',
    priority: 'High',
    summary: '[TITEL]',
    description: `**Modul:** [Owner/Pet/Vet/Visit]

**Schritte:**
1. [Schritt1]
2. [Schritt2]

**Erwartet:** [Verhalten]
**Tatsächlich:** [Fehler]`,
    labels: ['petclinic', 'bug']
  },

  'petclinic-feature': {
    name: 'PetClinic Feature',
    issueType: 'Story',
    priority: 'Medium',
    summary: '[TITEL]',
    description: `**Modul:** [Owner/Pet/Vet/Visit]

**User Story:**
Als [Rolle] möchte ich [Funktion], damit [Nutzen].

**Akzeptanzkriterien:**
- [ ] Frontend
- [ ] Backend`,
    labels: ['petclinic', 'feature']
  }
};

module.exports = SHORT_TEMPLATES;
