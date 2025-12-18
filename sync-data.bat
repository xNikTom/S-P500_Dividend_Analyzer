@echo off
echo ===================================
echo Syncing data from Yahoo Finance...
echo ===================================
echo.

.portable\python\python.exe data_sync.py

echo.
echo Done!
pause
