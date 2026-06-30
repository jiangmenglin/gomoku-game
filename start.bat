@echo off
echo ========================================
echo Gomoku Game Launcher (Windows)
echo ========================================

cd /d "%~dp0server"
echo Installing server dependencies...
call npm install
echo Starting server...
start "Gomoku Server" cmd /k "npm run dev"

cd /d "%~dp0client"
echo Installing client dependencies...
call npm install
echo Starting client...
start "Gomoku Client" cmd /k "npm start"

echo.
echo Services started!
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:4000
echo.
echo.
echo For production deployment with Docker:
echo   docker compose build
echo   docker compose up -d
echo.
echo Press any key to exit...
pause > nul