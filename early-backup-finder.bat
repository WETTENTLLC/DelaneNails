@echo off
echo ===================================
echo Early Backup Finder for DelaneNails
echo ===================================
echo.
echo This script will search for potential earlier backups of your website files.
echo.

echo Step 1: Checking for .git directory...
if exist ".git" (
    echo Git repository found!
    echo Listing previous versions of index.html:
    echo.
    git log --oneline -- index.html
    echo.
    echo To restore a specific version, use:
    echo git checkout [commit-hash] -- index.html
    echo.
) else (
    echo No Git repository found.
)

echo Step 2: Looking for .history folder...
if exist ".history" (
    echo VSCode history folder found!
    echo Checking for index.html files...
    dir /s /b .history\*index.html
    echo.
    echo To restore, copy any of these files to your project directory.
    echo.
) else (
    echo No .history folder found.
)

echo Step 3: Searching for backup files in project directory...
echo.
echo *** Files with 'backup' in the name: ***
dir /s /b *backup*.*
echo.
echo *** Files with 'bak' extension: ***
dir /s /b *.bak
echo.
echo *** Old HTML files: ***
dir /s /b *.old.html
dir /s /b *old*.html
echo.

echo Step 4: Checking Windows temporary folders...
echo.
echo *** Searching temporary folders - this may take a moment... ***
dir /s /b "%TEMP%\*index.html" 2>nul
dir /s /b "%TEMP%\*delane*.*" 2>nul
dir /s /b "%LOCALAPPDATA%\Temp\*index.html" 2>nul
dir /s /b "%LOCALAPPDATA%\Temp\*delane*.*" 2>nul
echo.

echo Step 5: Checking OneDrive for potential backups...
echo.
if exist "%USERPROFILE%\OneDrive" (
    echo *** Searching OneDrive - this may take a moment... ***
    dir /s /b "%USERPROFILE%\OneDrive\*delane*.*" 2>nul
    dir /s /b "%USERPROFILE%\OneDrive\*nail*.*" 2>nul
    echo.
) else (
    echo OneDrive not found.
)

echo Search complete!
echo.
echo To restore a backup:
echo 1. Copy the backup file to your project directory
echo 2. Rename it to index.html (make a backup of the current one first)
echo 3. Make sure to fix any issues with client-personalization.js
echo.
echo Press any key to exit...
pause > nul
