@echo off
echo "🚀 Starting PetClinic with JIRA Integration..."
echo.

echo "📋 Step 1: Installing dependencies..."
cd /d "%~dp0"
call npm install
if %errorlevel% neq 0 (
    echo "❌ Failed to install Playwright dependencies"
    pause
    exit /b 1
)

cd ..\mcp-jira
call npm install
if %errorlevel% neq 0 (
    echo "❌ Failed to install JIRA MCP dependencies"
    pause
    exit /b 1
)

echo "✅ Dependencies installed successfully"
echo.

echo "🏥 Step 2: Starting JIRA Docker Container..."
cd ..
docker-compose -f docker-compose-jira.yml up -d
if %errorlevel% neq 0 (
    echo "❌ Failed to start JIRA container"
    echo "Make sure Docker is running and try again"
    pause
    exit /b 1
)

echo "⏳ Waiting for JIRA to start (this may take a few minutes)..."
timeout /t 30 /nobreak > nul

echo "🔧 Step 3: Starting JIRA MCP Server..."
cd mcp-jira
start "JIRA MCP Server" cmd /c "npm start"
timeout /t 5 /nobreak > nul

echo "☕ Step 4: Starting PetClinic Application..."
cd ..
start "PetClinic App" cmd /c ".\mvnw.cmd spring-boot:run"
timeout /t 10 /nobreak > nul

echo "🧪 Step 5: Running Playwright Tests with JIRA Integration..."
cd playwright
call npm test

echo.
echo "📊 Test execution completed!"
echo "Check JIRA at http://localhost:8081 for test reports and failure tickets"
echo "Check Playwright report at: playwright-report/index.html"
echo.

pause
