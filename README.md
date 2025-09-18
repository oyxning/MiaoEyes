# MiaoEyes

![MiaoEyes Logo](https://via.placeholder.com/150)  <!-- 可以替换为实际的logo图片 -->

## 项目简介

MiaoEyes是一款Web爬虫防火墙工具，用于识别和阻止各类自动化程序的访问。它通过提供多种验证挑战，帮助网站保护其资源不被大规模的自动化请求所消耗。

本项目致力于帮助小型网站和社区抵抗无限制的爬虫访问，同时保持尽可能轻量级的设计，确保任何人都能够负担得起保护自己网站资源的成本。

**作者**: LumineStory

**GitHub仓库**: [https://github.com/oyxning/miaoeyes](https://github.com/oyxning/miaoeyes)

## 功能特性

- **多种验证挑战类型**：支持验证码、拼图和隐形验证
- **可配置的验证难度**：根据需求调整验证的难度级别
- **完善的统计监控**：实时统计验证请求、成功率等关键指标
- **灵活的白名单系统**：支持User-Agent和IP地址白名单
- **易于集成的API**：提供简洁的API接口，方便与现有系统集成
- **可视化配置界面**：通过Web UI轻松配置和管理验证服务
- **速率限制保护**：防止服务被滥用

## 技术栈

- **后端**：Node.js + Express
- **前端**：React + Ant Design
- **数据可视化**：Chart.js + react-chartjs-2
- **认证**：JWT (JSON Web Token)
- **构建工具**：Vite

## 快速开始

MiaoEyes提供了两种部署方式：一键部署（推荐）和手动部署。

### 一键部署（推荐）

MiaoEyes提供了简便的一键部署脚本，支持Windows和Linux/Mac系统，只需几分钟即可完成部署。

#### 前提条件

- Docker 和 docker-compose
- 已配置的域名（用于部署到生产环境）

#### Linux/Mac系统

1. 克隆仓库

```bash
git clone https://github.com/oyxning/miaoeyes.git
cd miaoeyes
```

2. 运行一键部署脚本

```bash
chmod +x deploy.sh
./deploy.sh
```

3. 根据提示输入必要的配置信息：
   - 目标域名（验证后重定向的域名）
   - JWT密钥（按回车使用默认值）
   - 会话密钥（按回车使用默认值）
   - 映射端口（默认: 3000）

4. 部署完成后，可以通过 http://localhost:3000 访问Web管理界面

#### Windows系统

1. 克隆仓库

```powershell
git clone https://github.com/oyxning/miaoeyes.git
cd miaoeyes
```

2. 运行一键部署脚本（以管理员身份运行PowerShell）

```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force; .\deploy.ps1
```

3. 根据提示输入必要的配置信息：
   - 目标域名（验证后重定向的域名）
   - JWT密钥（按回车使用默认值）
   - 会话密钥（按回车使用默认值）
   - 映射端口（默认: 3000）

4. 部署完成后，可以通过 http://localhost:3000 访问Web管理界面

### 手动部署方式

#### 安装步骤

1. **克隆仓库**

```bash
git clone https://github.com/oyxning/miaoeyes.git
cd miaoeyes
```

2. **安装依赖**

```bash
npm install
# 或者使用yarn
# yarn install
```

3. **配置环境变量**

复制 `.env.example` 文件并重命名为 `.env`，然后根据需要修改配置：

```bash
cp config/.env.example config/.env
# 编辑.env文件
```

4. **启动开发服务器**

```bash
npm run dev
```

服务器将在 http://localhost:3000 启动。

#### 生产环境构建

```bash
# 安装客户端依赖
npm run install-client

# 构建前端应用
npm run build

# 启动生产服务器
NODE_ENV=production npm start
```

## 使用指南

### 1. Web管理界面

启动服务器后，可以访问 http://localhost:3000 打开MiaoEyes的Web管理界面。通过界面可以：

- 查看验证服务的统计数据和监控图表
- 配置验证难度、超时时间等参数
- 管理白名单
- 查看API文档和使用示例

### 2. API集成

MiaoEyes提供了以下API端点：

#### 创建验证挑战

```http
GET /verify/challenge
```

返回：
```json
{
  "challengeId": "unique-challenge-id",
  "challengeType": "captcha",
  "timestamp": 1623456789012
}
```

#### 验证用户响应

```http
POST /verify/verify
Content-Type: application/json

{
  "challengeId": "unique-challenge-id",
  "response": "user-response"
}
```

返回（成功）：
```json
{
  "success": true,
  "verified": true,
  "token": "jwt-verification-token"
}
```

返回（失败）：
```json
{
  "success": false,
  "verified": false,
  "attemptsLeft": 4
}
```

#### 检查验证状态

```http
GET /verify/status/:token
```

返回：
```json
{
  "verified": true,
  "challengeId": "unique-challenge-id",
  "timestamp": 1623456789012
}
```

### 3. JavaScript SDK集成

在HTML页面中添加以下代码，快速集成MiaoEyes验证服务：

```html
<div id="miaoeyes-verification"></div>
<script src="https://your-server.com/static/miaoeyes.js"></script>
<script>
  MiaoEyes.init({
    container: '#miaoeyes-verification',
    onSuccess: function(token) {
      console.log('Verification successful, token:', token);
      // 在这里发送token到您的服务器进行验证
    },
    onError: function(error) {
      console.error('Verification failed:', error);
    }
  });
</script>
```

## 配置选项

MiaoEyes支持以下配置选项，可以通过Web管理界面或直接编辑 `config/config.json` 文件进行修改：

### 验证设置
- `enabled`: 是否启用验证
- `difficulty`: 验证难度 (easy/medium/hard)
- `timeout`: 挑战超时时间（毫秒）
- `maxAttempts`: 最大尝试次数

### 安全设置
- `rateLimiting.enabled`: 是否启用速率限制
- `rateLimiting.maxRequests`: 最大请求数
- `rateLimiting.windowMs`: 时间窗口（毫秒）
- `allowedIPs`: 允许的IP地址列表
- `blockedIPs`: 阻止的IP地址列表

### 挑战设置
- `type`: 支持的挑战类型列表
- `defaultType`: 默认挑战类型

### 白名单设置
- `userAgents`: User-Agent白名单
- `ipAddresses`: IP地址白名单

### 域名跳转设置（新功能）
MiaoEyes支持配置域名跳转功能，用于将特定域名的请求重定向到目标域名：

- `domainRedirect.enabled`: 是否启用域名跳转功能
- `domainRedirect.targetDomain`: 验证成功后重定向的目标域名
- `domainRedirect.redirectDomains`: 需要进行重定向的域名列表
- `domainRedirect.excludePaths`: 不需要进行重定向的路径列表

这些配置可以通过Web管理界面的"配置"页面进行设置，也可以在一键部署时通过环境变量进行配置。

2. **更新DNS配置**

将您的域名（如`verify.your-domain.com`）指向MiaoEyes服务器的IP地址。

3. **配置反向代理（可选）**

如果您使用Nginx作为反向代理，可以添加以下配置：

```nginx
server {
    listen 80;
    server_name verify.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 部署建议

- 在生产环境中使用HTTPS
- 配置适当的JWT密钥（不要使用默认值）
- 根据实际需求调整速率限制和验证难度
- 定期查看统计数据，监控服务运行状况
- 考虑使用Redis等缓存服务存储会话数据，以支持分布式部署

## 常见问题

**Q: 验证失败怎么办？**
A: 可以重新生成挑战，或者检查用户输入是否正确。

**Q: 如何自定义验证难度？**
A: 可以在配置页面调整验证难度参数。

**Q: 验证令牌的有效期是多久？**
A: 默认有效期为1小时，可以在代码中自定义。

**Q: 如何处理大量请求？**
A: 建议配置适当的速率限制，避免服务被滥用。

## 开源与贡献

MiaoEyes是一个开源项目，欢迎社区贡献和反馈。如果您有任何问题或建议，请提交Issue或Pull Request。

## 许可证

本项目采用MIT许可证 - 详见 [LICENSE](LICENSE) 文件。

## 免责声明

MiaoEyes是一个开源工具，不保证能够完全阻止所有的爬虫和自动化工具。对于因使用本工具而导致的任何损失，作者不承担任何责任。