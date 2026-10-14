@echo off
cd /d "%~dp0"
start "ImageGrab" http://127.0.0.1:8766/docs/index.html
node tools\serve.cjs
pause
