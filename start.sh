#!/bin/bash

echo "========================================"
echo "  STARTLABX v3.0 - Quick Start"
echo "========================================"
echo ""

echo "[1/3] Installing Backend Dependencies..."
cd backend
npm install express cors helmet morgan express-rate-limit bcryptjs jsonwebtoken dotenv uuid --legacy-peer-deps
echo ""

echo "[2/3] Starting Backend Server..."
node server.js &
sleep 3
echo ""

echo "[3/3] Starting Frontend Server..."
cd ../frontend
python3 -m http.server 8000 &
sleep 2
echo ""

echo "========================================"
echo "  STARTLABX is Running!"
echo "========================================"
echo ""
echo "Backend API: http://localhost:3000"
echo "Frontend App: http://localhost:8000"
echo ""
echo "Opening browser..."
sleep 2

# Try to open browser
if command -v xdg-open > /dev/null; then
    xdg-open http://localhost:8000
elif command -v open > /dev/null; then
    open http://localhost:8000
fi

echo ""
echo "Press Ctrl+C to stop all servers"
wait
