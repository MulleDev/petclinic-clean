# SDET MCP Quick Reference Card
*Kompakte Referenz für tägliche MCP Server Nutzung*

## 🚀 Server Setup (Daily Start)
```powershell
# Terminal 1: MCP Jira Server
cd mcp-jira; npm start                    # Port 3000

# Terminal 2: MCP Playwright Server  
cd mcp-playwright; npm start              # Port 3001

# Health Check
curl http://localhost:3000/health         # Jira MCP
curl http://localhost:3001/health         # Playwright MCP
```

## 🐛 Bug Reports (Häufigste Nutzung)

### Standard Bug Ticket
```bash
curl -X POST http://localhost:3000/create-from-template \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "petclinic-bug",
    "replacements": {
      "modul": "Owner Management",
      "beschreibung": "Form validation not working", 
      "schritt1": "Go to /owners/new",
      "schritt2": "Enter invalid data",
      "schritt3": "Click Submit",
      "erwartet": "Validation error shown",
      "tatsaechlich": "Form submits anyway",
      "fehlermeldung": "No validation triggered",
      "browser": "Chrome 120"
    }
  }'
```

### Quick Bug (Minimal)
```bash
curl -X POST http://localhost:3000/create-smart-ticket \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Bug: Test xyz fails on CI",
    "description": "Test failing consistently on CI environment",
    "context": {"petclinic": true, "ci": true}
  }'
```

## 🎭 Test Execution

### Run All Tests
```bash
curl -X POST http://localhost:3001/playwright/run-tests
```

### Run Specific Suite
```bash
curl -X POST http://localhost:3001/playwright/run-suite/owner-management
curl -X POST http://localhost:3001/playwright/run-suite/vet-management
curl -X POST http://localhost:3001/playwright/run-suite/pet-management
```

### Check Test Status
```bash
curl http://localhost:3001/playwright/status/run-ID
curl http://localhost:3001/playwright/results/run-ID
```

## 📊 Monitoring & Analysis

### Flaky Tests
```bash
curl http://localhost:3001/playwright/flaky-tests
curl http://localhost:3001/playwright/flaky-trends?days=7
```

### Performance
```bash
curl http://localhost:3001/playwright/performance-report
curl http://localhost:3001/playwright/slow-tests?threshold=30s
```

### Active Runs
```bash
curl http://localhost:3001/playwright/active-runs
```

## 🎯 Templates Quick Reference

### Available Templates
```bash
curl http://localhost:3000/templates
```

### Template IDs
- `petclinic-bug` - Standard Bug Report
- `petclinic-feature` - Feature Request  
- `test-automation` - Test Implementation Task
- `flaky-test-investigation` - Unstable Test Analysis
- `performance-investigation` - Performance Issues

## ⚡ One-Liners (Copy & Paste Ready)

### Create Bug from Failed Test
```bash
curl -X POST http://localhost:3000/create-from-template -H "Content-Type: application/json" -d '{"templateId":"petclinic-bug","replacements":{"modul":"REPLACE_MODULE","beschreibung":"REPLACE_DESC","tatsaechlich":"REPLACE_ERROR","browser":"Chrome"}}'
```

### Run Tests and Create Summary  
```bash
curl -X POST http://localhost:3001/playwright/run-tests && curl -X POST http://localhost:3000/create-smart-ticket -H "Content-Type: application/json" -d '{"title":"Test Run Complete","description":"Automated test execution finished","context":{"petclinic":true}}'
```

### Check Flaky Tests and Create Investigation
```bash
curl http://localhost:3001/playwright/flaky-tests && curl -X POST http://localhost:3000/create-from-template -H "Content-Type: application/json" -d '{"templateId":"flaky-test-investigation","replacements":{"testName":"REPLACE_TEST","failureRate":"REPLACE_RATE"}}'
```

## 🛠️ Troubleshooting Commands

### Port Conflicts
```powershell
netstat -an | findstr "3000\|3001"        # Check ports
taskkill /f /im node.exe                  # Kill all Node processes
```

### Service Status
```bash
curl -i http://localhost:3000/health      # Jira MCP detailed
curl -i http://localhost:3001/health      # Playwright MCP detailed
curl -i http://localhost:8080/health      # PetClinic Backend
```

### Logs & Debug
```powershell
cd mcp-jira; npm run debug                # Jira MCP logs
cd mcp-playwright; npm run debug          # Playwright MCP logs
```

## 📝 Daily SDET Workflow

### Morning Setup
```bash
# 1. Start all services
cd mcp-jira && npm start &
cd mcp-playwright && npm start &

# 2. Health check all
curl http://localhost:3000/health && curl http://localhost:3001/health

# 3. Check overnight failures
curl http://localhost:3001/playwright/flaky-tests
```

### During Development
```bash
# Run tests for current feature
curl -X POST http://localhost:3001/playwright/run-suite/current-feature

# Auto-create tickets for failures
# (Use afterEach hook in tests)
```

### End of Day
```bash
# Daily summary ticket
curl -X POST http://localhost:3000/create-smart-ticket \
  -H "Content-Type: application/json" \
  -d '{"title":"Daily Test Summary - $(date +%Y-%m-%d)","description":"End of day test status and metrics","context":{"petclinic":true,"daily":true}}'
```

## 🚨 Emergency Procedures

### Complete Reset
```powershell
# Kill all processes
taskkill /f /im node.exe

# Restart everything
cd mcp-jira; npm start
cd mcp-playwright; npm start

# Verify
curl http://localhost:3000/health
curl http://localhost:3001/health
```

### Critical Test Failure
```bash
# Immediate bug report
curl -X POST http://localhost:3000/create-smart-ticket \
  -H "Content-Type: application/json" \
  -d '{"title":"CRITICAL: Production test failure","description":"Immediate attention required","context":{"petclinic":true,"critical":true}}'
```

## 📞 Support Contacts

- **MCP Integration Issues**: Siehe `mcp-*/README.md`
- **Test Framework Questions**: `KI-SDET-Dokumentation.md` 
- **Jira Template Problems**: `mcp-jira/BA-Integration-Guide.md`

---
**💡 Pro Tip:** Bookmark diese Seite und verwenden Sie die One-Liner für schnelle MCP-Operationen!
