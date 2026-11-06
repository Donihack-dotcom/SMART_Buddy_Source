@echo off
chcp 65001 >nul
cd /d "%~dp0"
rem Жаңалықтар серверін (қосылмаған болса) іске қосып, әкімші панелін браузерде ашады.
curl -s http://127.0.0.1:8100/api/health >nul 2>&1
if errorlevel 1 (
  start "Buddy News server" /min node news-server\server.js
  timeout /t 1 >nul
)
start "" http://localhost:8100
