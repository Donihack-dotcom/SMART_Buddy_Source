@echo off
chcp 65001 >nul
title SMART.Buddy tunnel (Pinggy)
echo.
echo  Алдымен start.bat іске қосылып тұруы керек.
echo  Төменде https://....pinggy.link сілтемесі шығады — соны басқаларға жіберіңіз.
echo  Тегін сілтеме 60 минут жұмыс істейді, сосын осы файлды қайта ашыңыз.
echo  Сұрақ шықса (yes/no) — yes деп жазып Enter басыңыз.
echo.
ssh -p 443 -o StrictHostKeyChecking=accept-new -o ServerAliveInterval=30 -R0:127.0.0.1:8000 a.pinggy.io
pause
