@echo off
title Last $100 - Play on phone
cd /d "%~dp0"
where py >nul 2>nul && (py -3 play-on-phone.py & goto :end)
where python >nul 2>nul && (python play-on-phone.py & goto :end)
if exist "launcher\bin\Start-Last100.exe" (start "" "launcher\bin\Start-Last100.exe" & goto :end)
echo Python was not found. Install it from https://www.python.org/downloads/ (tick "Add to PATH"),
echo or just open index.html directly on this computer.
pause
:end
