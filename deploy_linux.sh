#!/bin/bash

echo "========================================"
echo "   MiaoEyes Linux一键部署脚本"
echo "========================================"
echo

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "错误: 未检测到Node.js，请先安装Node.js"
    echo "请运行: curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash - && sudo apt-get install -y nodejs"
    exit 1
fi

echo "Node.js已安装，版本: $(node --version)"
echo

echo "正在安装项目依赖..."
npm install
if [ $? -ne 0 ]; then
    echo "错误: 依赖安装失败"
    exit 1
fi

echo
echo "依赖安装完成！"
echo

echo "正在启动MiaoEyes服务..."
echo "服务将在 http://localhost:3000 运行"
echo "按 Ctrl+C 停止服务"
echo

npm start