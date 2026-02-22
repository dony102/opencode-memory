@echo off
REM opencode-memory Auto-Update Script for Windows
REM Usage: update.bat [auto]

set REPO_DIR=C:\Users\WINDOWS 10\.gemini\antigravity\opencode-mem
set AUTO_MODE=false

if "%1"=="auto" set AUTO_MODE=true

cd /d "%REPO_DIR%"

echo === opencode-memory Updater ===
echo.

REM Check if git repo
if not exist ".git" (
    echo Not a git repository. Run from the opencode-memory directory.
    exit /b 1
)

REM Check upstream remote
git remote get-url upstream >nul 2>&1
if errorlevel 1 (
    echo Adding upstream remote...
    git remote add upstream https://github.com/thedotmack/claude-mem.git
)

echo Fetching upstream (claude-mem)...
git fetch upstream

for /f %%i in ('git rev-parse upstream/master') do set UPSTREAM_LATEST=%%i
for /f %%i in ('git rev-parse master') do set LOCAL_LATEST=%%i

if "%UPSTREAM_LATEST%"=="%LOCAL_LATEST%" (
    echo Already up to date with upstream!
    exit /b 0
)

echo.
echo New commits available:
git log --oneline master..upstream/master
echo.

if "%AUTO_MODE%"=="true" (
    echo Auto-updating...
    git merge upstream/master --no-edit || (
        echo Merge conflict detected. Please resolve manually.
        exit /b 1
    )
    echo Rebuilding...
    call npm run build
    echo Update complete!
    echo.
    echo Restart OpenCode to load new version
) else (
    echo To update, run: update.bat auto
    echo Or manually: git merge upstream/master ^&^& npm run build
)
