#!/bin/bash

# MiaoEyes 一键部署脚本

# 设置颜色变量
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # 无颜色

# 欢迎信息
clear
cat << 'EOF'

  __  __       _ _   _       _   _
 |  \/  |     | | | (_)     | | | |
 | \  / |_   _| | |_ _  __ _| |_| |__   ___  _ __
 | |\/| | | | | | __| |/ _` | __| '_ \ / _ \| '_ \
 | |  | | |_| | | |_| | (_| | |_| | | | (_) | | | |
 |_|  |_|\__,_|_|\__|_|\__,_|\__|_| |_|\___/|_| |_|

EOF

echo "MiaoEyes - AI防火墙工具一键部署脚本"
echo "======================================"
echo

# 检查是否安装了Docker
echo -n "正在检查Docker安装状态..."
if ! command -v docker &> /dev/null; then
    echo -e " ${RED}未安装!${NC}"
    echo -e "${YELLOW}请先安装Docker，然后重试。${NC}"
    echo "安装指南: https://docs.docker.com/get-docker/"
    exit 1
fi
echo -e " ${GREEN}已安装${NC}"

# 检查是否安装了docker-compose
echo -n "正在检查docker-compose安装状态..."
if ! command -v docker-compose &> /dev/null; then
    echo -e " ${RED}未安装!${NC}"
    echo -e "${YELLOW}请先安装docker-compose，然后重试。${NC}"
    echo "安装指南: https://docs.docker.com/compose/install/"
    exit 1
fi
echo -e " ${GREEN}已安装${NC}"

# 提示用户配置必要的环境变量
read -p "请输入目标域名 (例如: example.com): " target_domain
read -p "请输入JWT密钥 (按回车使用默认值): " jwt_secret
read -p "请输入会话密钥 (按回车使用默认值): " session_secret
read -p "请输入映射端口 (默认: 3000): " port

# 设置默认值
jwt_secret=${jwt_secret:-'your-secure-secret-key'}
session_secret=${session_secret:-'your-session-secret-key'}
port=${port:-3000}

# 备份原有的docker-compose.yml
if [ -f docker-compose.yml ]; then
    cp docker-compose.yml docker-compose.yml.bak
    echo -e "${YELLOW}已备份原docker-compose.yml为docker-compose.yml.bak${NC}"
fi

# 创建临时docker-compose.yml
cat > docker-compose.yml << EOF
services:
  miaoeyes:
    build: .
    container_name: miaoeyes
    ports:
      - "${port}:3000"
    environment:
      - PORT=3000
      - NODE_ENV=production
      - JWT_SECRET=${jwt_secret}
      - SESSION_SECRET=${session_secret}
      # 域名跳转配置
      - DOMAIN_REDIRECT_ENABLED=true
      - TARGET_DOMAIN=${target_domain}
    volumes:
      - ./config:/app/config
    restart: always
EOF

echo -e "${GREEN}已更新docker-compose.yml配置${NC}"
echo

# 创建.env文件（如果不存在）
if [ ! -f .env ]; then
    cat > .env << EOF
PORT=3000
NODE_ENV=production
JWT_SECRET=${jwt_secret}
SESSION_SECRET=${session_secret}
DOMAIN_REDIRECT_ENABLED=true
TARGET_DOMAIN=${target_domain}
EOF
    echo -e "${GREEN}已创建.env文件${NC}"
fi

# 创建配置目录
mkdir -p config

# 开始部署
echo "开始部署MiaoEyes..."
echo "================="
docker-compose up -d --build

# 检查部署结果
if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}部署成功！${NC}"
    echo "======================================"
    echo "MiaoEyes已成功部署到Docker容器中。"
    echo "访问地址: http://localhost:${port}"
    echo "目标域名: ${target_domain}"
    echo "======================================"
    echo -e "${YELLOW}提示: 部署完成后，可以通过Web界面进一步配置域名跳转等功能。${NC}"
else
    echo -e "\n${RED}部署失败！${NC}"
    echo "请检查错误信息，修复问题后重试。"
    # 恢复原有的docker-compose.yml
    if [ -f docker-compose.yml.bak ]; then
        mv docker-compose.yml.bak docker-compose.yml
        echo "已恢复原docker-compose.yml文件"
    fi
    exit 1
fi