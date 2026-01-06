@echo off
echo Starting Telegram Link Manager...
echo.
echo Starting backend server...
echo (This window will show backend logs)
echo.
cd backend
start "Link Manager Backend" cmd /k "npm start"

timeout /t 3 /nobreak >nul

echo Starting frontend...
echo (Opening new window for frontend)
cd ..\frontend
start "Link Manager Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo Application is starting!
echo ========================================
echo.
echo Backend: http://localhost:3000
echo Frontend: http://localhost:5173
echo.
echo Check the other windows for logs.
echo You can close this window now.
echo.
pause
