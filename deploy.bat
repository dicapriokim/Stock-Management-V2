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
echo  * Process  : Incremental Copy (Only changed files will be copied)
echo  * Protected: 'data' folder and asset backups will NOT be overwritten.
echo.
echo  [!] NOTICE: If the paths above do not match your environment,
echo             please right-click 'deploy.bat' and edit the paths.
echo.
pause
echo.
echo  [Copying in progress...]
echo.

:: Run Robocopy for Incremental Sync with progress output
:: /E  : Copy subdirectories, including empty ones.
:: /XO : Exclude older files (incremental sync helper).
:: /XD : Exclude directory list (excludes git, agent caching, and database folder).
:: /XF : Exclude file list (protects private backups, logs).
:: /R:1 : Retry count on failed copy (1 retry instead of infinity).
:: /W:1 : Wait time between retries (1 second).
robocopy "%SOURCE_DIR%" "%DEST_DIR%" /E /XD .git .agent data /XF asset_management_backup_*.json *.log .DS_Store /R:1 /W:1

if %ERRORLEVEL% LSS 8 (
    echo.
    echo ---------------------------------------------------
    echo  [SUCCESS] Incremental copy completed successfully!
    echo ---------------------------------------------------
) else (
    echo.
    echo ---------------------------------------------------
    echo  [ERROR] Copy encountered warning or errors. (Code: %ERRORLEVEL%)
    echo          Please check network connectivity or directory lock.
    echo ---------------------------------------------------
)

echo.
pause
