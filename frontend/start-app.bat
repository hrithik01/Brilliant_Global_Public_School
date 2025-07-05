@echo off
echo Starting Brilliant School Management System...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js 14 or higher from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if we're in the frontend directory
if not exist "package.json" (
    echo ERROR: package.json not found
    echo Please run this script from the frontend directory
    pause
    exit /b 1
)

REM Check if serve is installed
npm list -g serve >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing serve globally...
    npm install -g serve
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install serve
        echo Please run as Administrator or install manually: npm install -g serve
        pause
        exit /b 1
    )
)

REM Check if build folder exists
if not exist "build" (
    echo ERROR: build folder not found
    echo Building the application...
    npm run build:prod
    if %errorlevel% neq 0 (
        echo ERROR: Build failed
        pause
        exit /b 1
    )
)

REM Start the application
echo.
echo ===========================================
echo   Brilliant School Management System
echo   Ready to serve on http://localhost:3000
echo ===========================================
echo.
echo Press Ctrl+C to stop the application
echo.
serve -s build -p 3000

pause
