@echo off
setlocal enabledelayedexpansion

set REPO_DIR=%~dp0..
set AUTO_MODE=false

if /I "%1"=="auto" set AUTO_MODE=true

cd /d "%REPO_DIR%"

echo === opencode-memory updater ===
echo.

if not exist ".git" (
  echo Not a git repository: %REPO_DIR%
  exit /b 1
)

git remote get-url upstream >nul 2>&1
if errorlevel 1 (
  echo Adding upstream remote...
  git remote add upstream https://github.com/thedotmack/claude-mem.git
)

echo Fetching upstream...
git fetch upstream

set BRANCH=master
git show-ref --verify --quiet refs/heads/main
if not errorlevel 1 set BRANCH=main

for /f %%i in ('git rev-parse upstream/!BRANCH!') do set UPSTREAM_LATEST=%%i
for /f %%i in ('git rev-parse !BRANCH!') do set LOCAL_LATEST=%%i

if "!UPSTREAM_LATEST!"=="!LOCAL_LATEST!" (
  echo Already up to date with upstream/!BRANCH!.
  exit /b 0
)

echo.
echo New commits:
git log --oneline !BRANCH!..upstream/!BRANCH!
echo.

if /I "!AUTO_MODE!"=="true" (
  echo Merging upstream/!BRANCH!...
  git merge upstream/!BRANCH! --no-edit
  if errorlevel 1 (
    echo Merge conflict detected. Resolve manually.
    exit /b 1
  )
  echo Building...
  call npm run build
  if errorlevel 1 exit /b 1
  echo Update complete. Restart OpenCode to load updates.
) else (
  echo Run with 'auto' to merge + build automatically.
)
