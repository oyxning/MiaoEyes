@echo off
echo ========================================
echo    MiaoEyes Windows一键部署脚本
echo ========================================
echo.

echo 正在检查Node.js安装...
node --version >nul 2>&1
if errorlevel 1 (
    echo 错误: 未检测到Node.js，请先安装Node.js
    echo 访问 https://nodejs.org/ 下载并安装
    pause
    exit /b 1
)

echo Node.js已安装，版本: 
node --version
echo.

echo 正在安装项目依赖...
npm install
if errorlevel 1 (
    echo 错误: 依赖安装失败
    pause
    exit /b 1
)

echo.
echo 依赖安装完成！
echo.

echo 正在启动MiaoEyes服务...
echo 服务将在 http://localhost:3000 运行
echo 按 Ctrl+C 停止服务
echo.

npm start

pause