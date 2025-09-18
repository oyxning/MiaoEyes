# MiaoEyes 一键部署脚本 (Windows PowerShell版)

# 欢迎信息
Clear-Host
Write-Host ""
Write-Host "  __  __       _ _   _       _   _   "
Write-Host " |  \/  |     | | | (_)     | | | |  "
Write-Host " | \\  / |_   _| | |_ _  __ _| |_| |__   ___  _ __"
Write-Host " | |\\/| | | | | | __| |/ _` | __| '_ \\ / _ \\ | '_ \"
Write-Host " | |  | | |_| | | |_| | (_| | |_| | | | (_) | | | | |"
Write-Host " |_|  |_|\\__,_|_|\\__|_|\\__,_|\\__|_| |_|\\___/|_| |_|"
Write-Host ""
Write-Host "MiaoEyes - AI防火墙工具一键部署脚本"
Write-Host "======================================"
Write-Host ""

# 检查是否安装了Docker
Write-Host -NoNewline "正在检查Docker安装状态..."
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host -ForegroundColor Red " 未安装!"
    Write-Host -ForegroundColor Yellow "请先安装Docker Desktop for Windows，然后重试。"
    Write-Host "安装指南: https://docs.docker.com/get-docker/"
    Read-Host "按Enter键退出..."
    exit 1
}
Write-Host -ForegroundColor Green " 已安装"

# 检查Docker是否正在运行
Write-Host -NoNewline "正在检查Docker服务状态..."
try {
    docker info > $null 2>&1
    Write-Host -ForegroundColor Green " 正在运行"
} catch {
    Write-Host -ForegroundColor Red " 未运行!"
    Write-Host -ForegroundColor Yellow "请先启动Docker Desktop，然后重试。"
    Read-Host "按Enter键退出..."
    exit 1
}

# 提示用户配置必要的环境变量
$target_domain = Read-Host "请输入目标域名 (例如: example.com)"
$jwt_secret = Read-Host "请输入JWT密钥 (按回车使用默认值)"
$session_secret = Read-Host "请输入会话密钥 (按回车使用默认值)"
$port = Read-Host "请输入映射端口 (默认: 3000)"

# 设置默认值
if (-not $jwt_secret) { $jwt_secret = "your-secure-secret-key" }
if (-not $session_secret) { $session_secret = "your-session-secret-key" }
if (-not $port) { $port = "3000" }

# 备份原有的docker-compose.yml
if (Test-Path "docker-compose.yml") {
    Copy-Item "docker-compose.yml" "docker-compose.yml.bak"
    Write-Host -ForegroundColor Yellow "已备份原docker-compose.yml为docker-compose.yml.bak"
}

# 创建临时docker-compose.yml
@"services:
  miaoeyes:
    build: .
    container_name: miaoeyes
    ports:
      - "$port:3000"
    environment:
      - PORT=3000
      - NODE_ENV=production
      - JWT_SECRET=$jwt_secret
      - SESSION_SECRET=$session_secret
      # 域名跳转配置
      - DOMAIN_REDIRECT_ENABLED=true
      - TARGET_DOMAIN=$target_domain
    volumes:
      - ./config:/app/config
    restart: always"@ | Out-File -FilePath "docker-compose.yml" -Encoding utf8

Write-Host -ForegroundColor Green "已更新docker-compose.yml配置"
Write-Host ""

# 创建.env文件（如果不存在）
if (-not (Test-Path ".env")) {
    @"PORT=3000
NODE_ENV=production
JWT_SECRET=$jwt_secret
SESSION_SECRET=$session_secret
DOMAIN_REDIRECT_ENABLED=true
TARGET_DOMAIN=$target_domain"@ | Out-File -FilePath ".env" -Encoding utf8
    Write-Host -ForegroundColor Green "已创建.env文件"
}

# 创建配置目录
if (-not (Test-Path "config")) {
    New-Item -ItemType Directory -Path "config" | Out-Null
}

# 开始部署
Write-Host "开始部署MiaoEyes..."
Write-Host "================="
docker-compose up -d --build

# 检查部署结果
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host -ForegroundColor Green "部署成功！"
    Write-Host "======================================"
    Write-Host "MiaoEyes已成功部署到Docker容器中。"
    Write-Host "访问地址: http://localhost:$port"
    Write-Host "目标域名: $target_domain"
    Write-Host "======================================"
    Write-Host -ForegroundColor Yellow "提示: 部署完成后，可以通过Web界面进一步配置域名跳转等功能。"
} else {
    Write-Host ""
    Write-Host -ForegroundColor Red "部署失败！"
    Write-Host "请检查错误信息，修复问题后重试。"
    # 恢复原有的docker-compose.yml
    if (Test-Path "docker-compose.yml.bak") {
        Move-Item -Path "docker-compose.yml.bak" -Destination "docker-compose.yml" -Force
        Write-Host "已恢复原docker-compose.yml文件"
    }
    Read-Host "按Enter键退出..."
    exit 1
}

Read-Host "按Enter键退出..."