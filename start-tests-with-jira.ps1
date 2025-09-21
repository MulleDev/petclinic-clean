# PetClinic Tests mit JIRA Integration
# PowerShell Startup Script

Write-Host "🚀 Starting PetClinic with JIRA Integration..." -ForegroundColor Green
Write-Host ""

# Step 1: Dependencies installieren
Write-Host "📋 Step 1: Installing dependencies..." -ForegroundColor Yellow
Set-Location $PSScriptRoot

try {
    Set-Location "playwright"
    npm install
    if ($LASTEXITCODE -ne 0) { throw "Playwright npm install failed" }
    
    Set-Location "..\mcp-jira"
    npm install
    if ($LASTEXITCODE -ne 0) { throw "JIRA MCP npm install failed" }
    
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
}
catch {
    Write-Host "❌ Failed to install dependencies: $_" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Step 2: JIRA starten
Write-Host ""
Write-Host "🏥 Step 2: Starting JIRA Docker Container..." -ForegroundColor Yellow
Set-Location ".."

try {
    docker-compose -f docker-compose-jira.yml up -d
    if ($LASTEXITCODE -ne 0) { throw "Docker compose failed" }
    
    Write-Host "⏳ Waiting for JIRA to start (30 seconds)..." -ForegroundColor Cyan
    Start-Sleep -Seconds 30
}
catch {
    Write-Host "❌ Failed to start JIRA: $_" -ForegroundColor Red
    Write-Host "Make sure Docker is running and try again" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Step 3: JIRA MCP Server starten
Write-Host ""
Write-Host "🔧 Step 3: Starting JIRA MCP Server..." -ForegroundColor Yellow
try {
    Set-Location "mcp-jira"
    $jiraMcp = Start-Process -FilePath "npm" -ArgumentList "start" -PassThru -WindowStyle Minimized
    Start-Sleep -Seconds 5
    Write-Host "✅ JIRA MCP Server started (PID: $($jiraMcp.Id))" -ForegroundColor Green
}
catch {
    Write-Host "❌ Failed to start JIRA MCP Server: $_" -ForegroundColor Red
}

# Step 4: PetClinic starten
Write-Host ""
Write-Host "☕ Step 4: Starting PetClinic Application..." -ForegroundColor Yellow
try {
    Set-Location ".."
    $petclinic = Start-Process -FilePath ".\mvnw.cmd" -ArgumentList "spring-boot:run" -PassThru -WindowStyle Minimized
    Start-Sleep -Seconds 15
    Write-Host "✅ PetClinic started (PID: $($petclinic.Id))" -ForegroundColor Green
}
catch {
    Write-Host "❌ Failed to start PetClinic: $_" -ForegroundColor Red
}

# Step 5: Tests ausführen
Write-Host ""
Write-Host "🧪 Step 5: Running Playwright Tests with JIRA Integration..." -ForegroundColor Yellow
try {
    Set-Location "playwright"
    npm test
    
    Write-Host ""
    Write-Host "📊 Test execution completed!" -ForegroundColor Green
    Write-Host "📋 Check JIRA at http://localhost:8081 for test reports and failure tickets" -ForegroundColor Cyan
    Write-Host "📈 Check Playwright report: playwright-report/index.html" -ForegroundColor Cyan
    Write-Host "🎯 Check JIRA MCP Server at http://localhost:3000" -ForegroundColor Cyan
}
catch {
    Write-Host "❌ Test execution failed: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "🔗 Useful URLs:" -ForegroundColor Magenta
Write-Host "   JIRA: http://localhost:8081 (admin/admin)" -ForegroundColor White
Write-Host "   PetClinic: http://localhost:8080" -ForegroundColor White
Write-Host "   JIRA MCP: http://localhost:3000" -ForegroundColor White
Write-Host "   Playwright Report: file:///$PWD/playwright-report/index.html" -ForegroundColor White

Read-Host "Press Enter to exit"
