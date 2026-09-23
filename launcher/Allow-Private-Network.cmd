@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Last $100 - 可选的局域网防火墙设置
echo 只允许当前游戏程序、专用网络、同一子网、TCP 8765-8775。
echo 不会关闭防火墙，也不会放行公用网络。此操作会请求管理员同意。
echo 正常启动游戏不需要运行此文件；仅在同 Wi-Fi 手机无法连接时使用。
choice /C YN /M "Continue / 继续？ Y=yes N=no"
if errorlevel 2 exit /b
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Allow-Private-Network.ps1"
