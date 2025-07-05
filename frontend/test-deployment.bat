@echo off
echo Testing Brilliant School Management System Deployment...
echo.

REM Test Node.js installation
echo [1/5] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
) else (
    echo ✅ Node.js is installed
    node --version
)

REM Test npm installation
echo [2/5] Checking npm installation...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not available
    pause
    exit /b 1
) else (
    echo ✅ npm is available
    npm --version
)

REM Test serve installation
echo [3/5] Checking serve installation...
npm list -g serve >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  serve is not installed globally
    echo Installing serve...
    npm install -g serve
    if %errorlevel% neq 0 (
        echo ❌ Failed to install serve
        pause
        exit /b 1
    ) else (
        echo ✅ serve installed successfully
    )
) else (
    echo ✅ serve is already installed
)

REM Test build folder
echo [4/5] Checking build folder...
if not exist "build" (
    echo ⚠️  build folder not found
    echo Building the application...
    npm run build:prod
    if %errorlevel% neq 0 (
        echo ❌ Build failed
        pause
        exit /b 1
    ) else (
        echo ✅ Build completed successfully
    )
) else (
    echo ✅ build folder exists
)

REM Test if main files exist
echo [5/5] Checking build files...
if not exist "build\index.html" (
    echo ❌ index.html not found in build folder
    pause
    exit /b 1
) else (
    echo ✅ index.html found
)

if not exist "build\static\js\*.js" (
    echo ❌ JavaScript files not found in build folder
    pause
    exit /b 1
) else (
    echo ✅ JavaScript files found
)

echo.
echo ==========================================
echo   🎉 DEPLOYMENT TEST SUCCESSFUL!
echo   
echo   Your system is ready to run the app.
echo   Double-click 'start-app.bat' to start.
echo ==========================================
echo.

pause
