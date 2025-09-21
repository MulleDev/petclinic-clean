# Jira Software Setup Guide

## 🎯 **Neue Jira Installation erfolgreich gestartet!**

### **Container Status:**
- **Jira Software**: `http://localhost:8081` (v9.4.17)
- **PostgreSQL**: localhost:5432 
- **Status**: ✅ Beide Container laufen

---

## 🚀 **Setup-Schritte:**

### **1. Jira Setup öffnen:**
```
http://localhost:8081
```

### **2. Lizenz eingeben:**
- **Lizenztyp**: "Jira Software (Server)" 
- **Evaluation License**: Kostenlose 30-Tage-Testlizenz von Atlassian
- **Server ID**: Wird automatisch generiert

### **3. Datenbank konfigurieren:**
- **Database**: PostgreSQL
- **Hostname**: `postgres`
- **Port**: `5432`
- **Database**: `jiradb`
- **Username**: `jira`
- **Password**: `jira123`

### **4. Administrator Account:**
```
Full Name: Admin User
Email: admin@petclinic.local
Username: admin
Password: admin123
```

### **5. Mail-Server (optional überspringen)**

---

## 🔧 **Docker Commands:**

```powershell
# Status prüfen
docker-compose ps

# Logs anzeigen
docker-compose logs jira

# Stoppen
docker-compose down

# Komplett neu starten (mit Datenverlust)
docker-compose down -v
docker-compose up -d

# Nur Jira neustarten
docker-compose restart jira
```

---

## 📋 **Wichtige Informationen:**

- **Daten-Persistierung**: Volumes `jira_data` und `postgres_data`
- **Erste Anmeldung**: Kann 2-3 Minuten dauern
- **Memory**: 2GB JVM Heap für Jira
- **Backup**: Docker Volumes regelmäßig sichern

---

## 🎉 **Nach dem Setup:**

1. **Projekt erstellen**: "PetClinic Testing"
2. **MCP Jira Server konfigurieren** mit neuer URL
3. **API Token generieren** für Automatisierung

---

**⚡ Ready to go! Öffne http://localhost:8081 für das Setup! ⚡**
