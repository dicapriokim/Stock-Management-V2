@echo off
setlocal

:: Settings
set "SOURCE_DIR=D:\Antigravity\stock"
set "DEST_DIR=\\DSM\docker\stock"

echo ===================================================
echo  [Stock Dashboard] Copying files to NAS Docker
echo ===================================================
echo.
echo  - Source: %SOURCE_DIR%
echo  - Destination: %DEST_DIR%
echo.
echo  * Excluding: .git, .agent, asset_management_backup_*.json, *.log
echo.
pause

:: Run PowerShell Copy-Item on a single line to prevent CMD syntax issues
powershell -NoProfile -ExecutionPolicy Bypass -Command "if (Test-Path '%DEST_DIR%') { Remove-Item -Path '%DEST_DIR%\*' -Recurse -Force -ErrorAction SilentlyContinue }; Copy-Item -Path '%SOURCE_DIR%\*' -Destination '%DEST_DIR%' -Recurse -Force -Exclude '.git','.agent','asset_management_backup_*.json','*.log','*.bat' -ErrorAction SilentlyContinue"

echo.
echo ---------------------------------------------------
echo  [SUCCESS] Files successfully copied via PowerShell!
echo ---------------------------------------------------
echo.
pause
