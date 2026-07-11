@echo off
title England Manager
cd /d "%~dp0"
set PYTHON=
python --version >nul 2>&1
if %errorlevel% equ 0 set PYTHON=python
if "%PYTHON%"=="" (python3 --version >nul 2>&1
    if %errorlevel% equ 0 set PYTHON=python3)
if "%PYTHON%"=="" (echo Python not found
    pause
    exit /b 1)
start "" cmd /c "ping -n 4 127.0.0.1 >nul && start http://localhost:8000"
%PYTHON% -m http.server 8000
pause
