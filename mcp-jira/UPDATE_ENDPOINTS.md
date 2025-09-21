# 🔄 Jira Ticket Update Endpoints

## 📋 **Neue Update-Funktionalitäten**

### 1. **Komplettes Ticket-Update** (`PUT`)
```
PUT http://localhost:3001/jira/update-ticket/:ticketKey
```

**Body Beispiel:**
```json
{
  "summary": "Neuer Ticket-Titel",
  "description": "Aktualisierte Beschreibung",
  "priority": "High",
  "assignee": "dennis.entwickler",
  "labels": ["backend", "critical"],
  "status": "In Progress",
  "comment": "Ticket wurde vollständig überarbeitet"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Ticket PET-42 erfolgreich aktualisiert",
  "ticketKey": "PET-42",
  "updatedFields": ["summary", "description", "priority"],
  "statusChanged": true,
  "newStatus": "In Progress",
  "jiraUrl": "http://localhost:8080/browse/PET-42"
}
```

---

### 2. **Partielles Ticket-Update** (`PATCH`)
```
PATCH http://localhost:3001/jira/update-ticket/:ticketKey
```

**Body Beispiel (nur gewünschte Felder):**
```json
{
  "priority": "Critical",
  "assignee": "dennis.entwickler"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Ticket PET-42 partiell aktualisiert",
  "ticketKey": "PET-42",
  "updatedFields": ["priority", "assignee"],
  "jiraUrl": "http://localhost:8080/browse/PET-42"
}
```

---

### 3. **Status-Transition** (`POST`)
```
POST http://localhost:3001/jira/transition/:ticketKey
```

**Body Beispiel:**
```json
{
  "status": "Done",
  "comment": "Alle Tests erfolgreich, Feature ist ready für Production"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Status von PET-42 erfolgreich auf \"Done\" geändert",
  "ticketKey": "PET-42",
  "oldStatus": "In Progress",
  "newStatus": "Done",
  "transitionId": "31",
  "jiraUrl": "http://localhost:8080/browse/PET-42"
}
```

---

### 4. **Verfügbare Transitions abrufen** (`GET`)
```
GET http://localhost:3001/jira/transitions/:ticketKey
```

**Response:**
```json
{
  "success": true,
  "ticketKey": "PET-42",
  "transitions": [
    {
      "id": "21",
      "name": "To Do",
      "to": {
        "id": "10000",
        "name": "To Do",
        "description": "Work has not yet started on this issue."
      }
    },
    {
      "id": "31",
      "name": "Done",
      "to": {
        "id": "10001",
        "name": "Done",
        "description": "Work has been completed on this issue."
      }
    }
  ],
  "count": 2
}
```

---

## 🛠️ **PowerShell Test-Commands**

### **1. Komplettes Update testen:**
```powershell
$updateData = @{
    summary = "PET-42: Erweiterte Jira Error-Handling Tests (AKTUALISIERT)"
    description = "Ticket wurde über MCP-Server aktualisiert mit UTF-8 Support"
    priority = "Critical"
    comment = "Update via MCP Server erfolgreich durchgeführt"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/jira/update-ticket/PET-42" -Method PUT -Body $updateData -ContentType "application/json; charset=utf-8"
```

### **2. Partielles Update testen:**
```powershell
$partialUpdate = @{
    priority = "High"
    assignee = "dennis.entwickler"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/jira/update-ticket/PET-42" -Method PATCH -Body $partialUpdate -ContentType "application/json; charset=utf-8"
```

### **3. Status-Transition testen:**
```powershell
$transition = @{
    status = "In Progress"
    comment = "Beginne mit der Implementierung der erweiterten Test-Coverage"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/jira/transition/PET-42" -Method POST -Body $transition -ContentType "application/json; charset=utf-8"
```

### **4. Verfügbare Transitions abrufen:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/jira/transitions/PET-42" -Method GET
```

---

## ✅ **Unterstützte Update-Felder**

| **Feld** | **Typ** | **Beispiel** | **Beschreibung** |
|----------|---------|--------------|------------------|
| `summary` | String | "Neuer Titel" | Ticket-Überschrift |
| `description` | String | "Neue Beschreibung" | Ticket-Details |
| `priority` | String | "High", "Critical", "Low" | Priorität |
| `assignee` | String | "dennis.entwickler" | Zugewiesene Person |
| `labels` | Array | ["backend", "critical"] | Tags/Labels |
| `status` | String | "In Progress", "Done" | Status (via Transition) |
| `comment` | String | "Update-Kommentar" | Optional bei Updates |

---

## 🚀 **Antwort auf die ursprüngliche Frage:**

> **"prüüfe ob wir im mcp die möglichkeit haben, ein bestehdes ticket zu updaten"**

### ✅ **JA! Jetzt haben wir vollständige Update-Capabilities:**

1. **Komplette Updates** (PUT) - Alle Felder auf einmal ändern
2. **Partielle Updates** (PATCH) - Nur spezifische Felder ändern  
3. **Status-Transitions** (POST) - Workflow-Status ändern
4. **Transition-Info** (GET) - Verfügbare Status-Änderungen abrufen

### 🎯 **Für PET-42 bedeutet das:**
- Wir können jetzt technische Kommentare hinzufügen **UND**
- Den Ticket-Status auf "In Progress" setzen **UND**  
- Die Priorität auf "Critical" erhöhen **UND**
- Uns selbst als Assignee setzen

**Alle Update-Funktionen sind UTF-8-kompatibel** und unterstützen deutsche Umlaute! 🎉
