@echo off
echo ===================================
echo Dividend Analyzer Pro Launcher
echo ===================================
echo.

set NODE_PATH=.portable\node-v20.11.0-win-x64
set PYTHON_PATH=.portable\python

echo Using portable Node.js from: %NODE_PATH%
echo Using portable Python from: %PYTHON_PATH%
echo.

choice /C YN /M "Do you want to sync data from Yahoo Finance first (this may take a while)"

if errorlevel 2 goto skipdata
if errorlevel 1 goto syncdata

:syncdata
echo.
echo Syncing data from Yahoo Finance...
%PYTHON_PATH%\python.exe data_sync.py
echo.
echo Data sync complete!
echo.
goto runserver

:skipdata
echo.
echo Skipping data sync...
echo.

:runserver
echo Starting development server...
echo.
echo Server will be available at:
echo   Local:   http://localhost:5173
echo   Network: Use your PC's IP address
echo.
%NODE_PATH%\node.exe .\node_modules\vite\bin\vite.js

pause
