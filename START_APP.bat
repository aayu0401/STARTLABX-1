@echo off
echo ========================================
echo   STARTLABX - Starting Application
echo ========================================
echo.

echo [1/2] Starting Backend Server...
start "STARTLABX Backend" cmd /k "cd backend && node server.js"
timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend Server...
start "STARTLABX Frontend" cmd /k "cd frontend && python -m http.server 8000"
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo   Application Started!
echo ========================================
echo.
echo Frontend: http://localhost:8000
echo Backend:  http://localhost:3000
echo Health:   http://localhost:3000/health
echo.
echo Press any key to open the app in your browser...
pause >nul
start http://localhost:8000
echo.
echo Servers are running in separate windows.
echo Close those windows to stop the servers.
echo.
