@echo off
chcp 65001 >nul
title SMART.Buddy server
cd /d "%~dp0"

rem Ollama іске қосылмаған болса, фонда қосамыз (ЖИ үшін керек).
curl -s http://127.0.0.1:11434/api/version >nul 2>&1
if errorlevel 1 (
  echo Ollama іске қосылып жатыр...
  start "" /min ollama serve
  timeout /t 3 >nul
)

rem Жаңалықтар сервері (әкімші панелі) — бөлек терезеде.
curl -s http://127.0.0.1:8100/api/health >nul 2>&1
if errorlevel 1 (
  start "Buddy News server" /min node news-server\server.js
  timeout /t 1 >nul
)

echo.
echo  SMART.Buddy (студенттерге):     http://localhost:8000
echo  Buddy News (жаңалық жазу):      http://localhost:8100
echo  Тоқтату үшін осы терезеде Ctrl+C басыңыз.
echo.
start "" http://localhost:8000
node server.js
pause
