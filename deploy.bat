@echo off
setlocal

:: ====================================================================
:: [USER GUIDE] 
:: Please edit the paths below to match your own environment!
::  - SOURCE_DIR: Your local development folder path.
::  - DEST_DIR  : Your target NAS Docker folder path.
:: ====================================================================
set "SOURCE_DIR=D:\Antigravity\stock"
set "DEST_DIR=\\DSM\docker\stock"

echo ===================================================
echo  [Stock Dashboard] Consolidating and Copying to NAS
echo ===================================================
echo.
echo  - Source: %SOURCE_DIR%
echo  - Destination: %DEST_DIR%
echo.
echo  * Process  : Core Code Update (Copying only HTML, JS, config files)
echo  * Protected: 'data' folder and asset backups will NOT be overwritten.
echo.
echo  [!] NOTICE: If the paths above do not match your environment,
echo             please right-click 'deploy.bat' and edit the paths.
echo.
pause
echo.
echo  [Syncing files in progress...]
echo.

:: Force overwrite only core text source files (instant copy)
echo  [+] Syncing: index.html
copy /y "%SOURCE_DIR%\index.html" "%DEST_DIR%\index.html" > nul
echo  [+] Syncing: server.js
copy /y "%SOURCE_DIR%\server.js" "%DEST_DIR%\server.js" > nul
echo  [+] Syncing: package.json
copy /y "%SOURCE_DIR%\package.json" "%DEST_DIR%\package.json" > nul
echo  [+] Syncing: README.md
copy /y "%SOURCE_DIR%\README.md" "%DEST_DIR%\README.md" > nul

echo.
echo ---------------------------------------------------
echo  [SUCCESS] Hybrid file synchronization completed!
echo.
echo  * NOTE: If this is your first install or package.json has changed,
echo         please run 'npm install' in the NAS directory terminal.
echo ---------------------------------------------------
echo.
pause
