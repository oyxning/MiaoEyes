# MiaoEyes - 人机识别系统

![MiaoEyes头图](https://raw.githubusercontent.com/oyxning/oyxning/refs/heads/main/longmiaomiao.png)

MiaoEyes是一款Web爬虫防火墙工具，用于识别和阻止各类自动化程序的访问。它通过提供验证挑战，帮助网站保护其资源不被大规模的自动化请求所消耗。

## 功能特性

- 🔒 智能人机验证
- 🛡️ 自动恶意流量拦截
- 🌐 支持多种网站类型
- 📱 响应式设计
- ⚡ 高性能低延迟
- 🔧 简单易用的API

## 快速开始

### 环境要求

- Node.js 14.0.0 或更高版本
- npm 或 yarn 包管理器

### 一键部署

#### Windows系统
```bash
双击运行 deploy_windows.bat
```

#### Linux系统
```bash
chmod +x deploy_linux.sh
./deploy_linux.sh
```

### 手动安装

1. 安装依赖：
```bash
npm install
```

2. 启动服务：
```bash
npm start
```

3. 访问管理界面：
```
http://localhost:3000
```

## 服务器面板部署指南

### 1Panel面板部署

#### 方法一：使用应用商店

1. 登录1Panel管理界面
2. 进入「应用商店」
3. 搜索「Node.js」
4. 安装Node.js运行环境
5. 创建新网站，选择Node.js类型
6. 上传MiaoEyes项目文件
7. 设置启动命令：`npm start`
8. 配置端口为3000

#### 方法二：手动部署

1. 通过1Panel文件管理器上传项目文件
2. 打开终端，进入项目目录
3. 安装依赖：
```bash
npm install
```
4. 使用PM2管理进程：
```bash
npm install -g pm2
pm2 start server.js --name miaoeyes
pm2 startup
pm2 save
```
5. 配置反向代理（可选）

### 宝塔面板部署

1. 创建Node.js项目
2. 上传项目文件到网站目录
3. 安装依赖：
```bash
npm install
```
4. 设置启动文件：`server.js`
5. 配置运行端口：3000
6. 开启PM2进程管理

### Nginx反向代理配置

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 网站集成

### 基本集成方法

将以下代码添加到需要保护的网站页面中：

```html
<!-- MiaoEyes验证器 -->
<script>
(function() {
    const checkVerification = async () => {
        try {
            const response = await fetch('http://your-miaoeyes-domain:3000/api/check-verification');
            const data = await response.json();
            return data.verified;
        } catch (error) {
            return false;
        }
    };

    const redirectToVerification = () => {
        const currentUrl = encodeURIComponent(window.location.href);
        window.location.href = 'http://your-miaoeyes-domain:3000/verify?originalUrl=' + currentUrl;
    };

    const init = async () => {
        const verified = await checkVerification();
        if (!verified) {
            redirectToVerification();
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
</script>
```

### 自动生成验证器

访问以下端点获取自动生成的验证器代码：
```
GET /api/generate-validator
```

## 配置选项

### 环境变量

| 变量名 | 默认值 | 描述 |
|--------|--------|------|
| PORT | 3000 | 服务运行端口 |
| NODE_ENV | development | 运行环境 |

### 速率限制配置

默认配置：
- 每个IP地址每分钟最多10次请求
- 验证会话有效期5分钟
- IP验证状态有效期1小时

## API接口

### 验证检查
```
GET /api/check-verification
```
检查当前IP是否已验证

### 提交验证
```
POST /api/verify
Content-Type: application/json

{
    "sessionId": "session_identifier"
}
```

### 生成验证器
```
GET /api/generate-validator
```

## 文件结构

```
miaoeyes/
├── server.js          # 主服务器文件
├── package.json       # 项目配置
├── deploy_windows.bat # Windows部署脚本
├── deploy_linux.sh    # Linux部署脚本
├── validator-template.js # 验证器模板
├── public/            # 静态资源
│   ├── index.html     # 管理界面
│   ├── verify.html    # 验证页面
│   ├── styles.css     # 样式文件
│   └── script.js      # 客户端脚本
└── miaoeyes.png       # 看板娘图片
```

## 故障排除

### 常见问题

1. **端口占用**：修改PORT环境变量或杀死占用端口的进程
2. **依赖安装失败**：清除npm缓存后重试
3. **验证不生效**：检查防火墙设置和网络连通性

### 日志查看

服务运行日志会输出到控制台，包含详细的请求和错误信息。

## 技术支持

如有问题请提交Issue或联系开发团队。

## 许可证

MIT License - 详见LICENSE文件

---

由LumineStory开发 | [项目仓库](https://github.com/oyxning/MiaoEyes)