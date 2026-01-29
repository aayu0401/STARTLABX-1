@echo off
echo ========================================
echo   STARTLABX v3.0 - Quick Start
echo ========================================
echo.

echo [1/3] Installing Backend Dependencies...
cd backend
call npm install express cors helmet morgan express-rate-limit bcryptjs jsonwebtoken dotenv uuid --legacy-peer-deps
echo.

echo [2/3] Starting Backend Server...
start cmd /k "node server.js"
timeout /t 3 /nobreak >nul
echo.

echo [3/3] Starting Frontend Server...
cd ..\frontend
start cmd /k "python -m http.server 8000"
timeout /t 2 /nobreak >nul
echo.

echo ========================================
echo   STARTLABX is Starting!
echo ========================================
echo.
echo Backend API: http://localhost:3000
echo Frontend App: http://localhost:8000
echo.
echo Opening browser in 3 seconds...
timeout /t 3 /nobreak >nul
start http://localhost:8000
echo.
echo Press any key to exit this window...
pause >nul
