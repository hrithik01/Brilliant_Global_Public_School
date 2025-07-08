@echo off
echo Starting Brilliant School Backend Server...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js 14 or higher from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if we're in the backend directory
if not exist "server.js" (
    echo ERROR: server.js not found
    echo Please run this script from the backend directory
    pause
    exit /b 1
)

REM Check if package.json exists
if not exist "package.json" (
    echo ERROR: package.json not found
    echo Please ensure you're in the backend directory
    pause
    exit /b 1
)

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing backend dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)

echo.
echo ==========================================
echo   🚀 STARTING BACKEND SERVER
echo   
echo   Server will be available at:
echo   http://127.0.0.1:3001
echo   
echo   ⚡ Optimized for Windows 8.1
echo   ⚡ CORS disabled for same-machine setup
echo   ⚡ Database performance optimized
echo ==========================================
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the server
node server.js

pause
