@echo off
echo Starting Telegram Link Manager - All Services
echo ==============================================
echo.

REM Start Backend
echo [1/3] Starting Backend...
start "Backend Server" cmd /k "cd backend && npm start"
timeout /t 2 /nobreak >nul

REM Start Frontend
echo [2/3] Starting Frontend...
start "Frontend Dev Server" cmd /k "cd frontend && npm run dev"
timeout /t 2 /nobreak >nul

REM Start Forwarder
echo [3/3] Starting Channel Forwarder...
start "Channel Forwarder" cmd /k "cd channel-forwarder && python forwarder.py"

echo.
echo ==============================================
echo All services started!
echo.
echo Backend:   http://localhost:3000
echo Frontend:  http://localhost:5173
echo Forwarder: Check the Python terminal
echo.
echo Press any key to close this window...
pause >nul
