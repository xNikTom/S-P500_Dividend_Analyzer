@echo off
echo ===================================
echo Adding Firewall Rule for Port 5173
echo ===================================
echo.
echo This will allow incoming connections to Vite dev server
echo so you can access the app from your phone.
echo.
echo NOTE: This requires Administrator privileges!
echo.

powershell -Command "New-NetFirewallRule -DisplayName 'Vite Dev Server (Port 5173)' -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow -Profile Private,Domain"

if %errorlevel%==0 (
    echo.
    echo SUCCESS! Firewall rule added.
    echo You can now access the app from your phone on the same network.
) else (
    echo.
    echo FAILED! Make sure to run this script as Administrator.
    echo Right-click and select "Run as Administrator"
)

echo.
pause
