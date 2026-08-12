@echo off
chcp 65001 >nul
where npm >nul 2>nul || (
  echo 请先安装 Node.js 20.19 或更高版本。
  pause
  exit /b 1
)
if not exist node_modules call npm install
start "" cmd /c "ping -n 3 127.0.0.1 >nul & start http://127.0.0.1:1420"
call npm run dev
