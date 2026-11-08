@echo off
chcp 65001 >nul
cd /d "%~dp0"
rem Drawing Lab - Designed and Developed by Mohamed-Eldawly
where msedge >nul 2>nul
start "" msedge --app="%~dp0index.html" --start-fullscreen
if errorlevel 1 start "" "%~dp0index.html"
exit
