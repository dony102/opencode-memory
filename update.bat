@echo off
setlocal

set SCRIPT_DIR=%~dp0
call "%SCRIPT_DIR%scripts\update.bat" %*
exit /b %errorlevel%
