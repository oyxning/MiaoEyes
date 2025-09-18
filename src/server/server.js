// MiaoEyes 服务器主入口文件

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const fs = require('fs');
const https = require('https');

// 加载环境变量
const envPath = path.resolve(__dirname, '../../config/.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  console.warn('Warning: .env file not found, using default values');
  dotenv.config();
}

// 创建Express应用
const app = express();

// 获取配置
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const SESSION_SECRET = process.env.SESSION_SECRET || 'your-session-secret';

// 中间件配置

// 设置安全HTTP响应头
app.use(helmet());

// 配置CORS
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));

// 解析请求体
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 日志记录
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// 静态文件服务
app.use('/static', express.static(path.join(__dirname, '../../public')));

// 导入控制器
const { _getConfigData } = require('./controllers/configController');
const verificationController = require('./controllers/verificationController');

// 获取域名跳转配置
const domainRedirectConfig = {
  enabled: false, // 暂时禁用域名重定向功能
  targetDomain: '',
  redirectDomains: [],
  excludePaths: ['/api', '/static', '/verify', '/favicon.ico']
};

// 检查是否启用了域名跳转功能
if (domainRedirectConfig.enabled && domainRedirectConfig.targetDomain) {
  app.use((req, res, next) => {
    const host = req.headers.host;
    
    // 检查请求的域名是否在重定向域名列表中
    if (domainRedirectConfig.redirectDomains.length > 0 && domainRedirectConfig.redirectDomains.includes(host)) {
      // 检查用户是否已经通过验证（检查session或cookie）
      if (!req.session || !req.session.verified) {
        // 检查是否是排除的路径
        const isExcludedPath = domainRedirectConfig.excludePaths.some(path => req.path.startsWith(path));
        if (!isExcludedPath) {
          // 保存原始请求URL，验证成功后跳转到该URL
          req.session.redirectUrl = req.originalUrl;
          // 重定向到验证页面
          return res.redirect('/verify-page');
        }
      }
    }
    next();
  });
}

// 会话配置
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24小时
  }
}));

// 速率限制
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15分钟
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // 每个IP最多100个请求
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests, please try again later.'
  }
});
app.use('/api', limiter);
app.use('/verify', limiter);

// 路由挂载
const verificationRoutes = require('./routes/verification');
const apiRoutes = require('./routes/api');

app.use('/verify', verificationRoutes);
app.use('/api', apiRoutes);

// 验证页面路由
app.get('/verify-page', (req, res) => {
  if (domainRedirectConfig.enabled && domainRedirectConfig.targetDomain) {
    // 在生产环境中，发送静态验证页面
    if (NODE_ENV === 'production') {
      const verifyPagePath = path.join(__dirname, '../../src/client/dist/verify-page.html');
      if (fs.existsSync(verifyPagePath)) {
        return res.sendFile(verifyPagePath);
      }
    }
    // 在开发环境中，返回临时验证页面HTML
    return res.send(`
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>MiaoEyes验证</title>
        <script src="/static/captcha.js"></script>
        <style>
          body { font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; text-align: center; }
          .verification-container { border: 1px solid #ddd; padding: 20px; border-radius: 8px; margin-top: 50px; }
          button { padding: 10px 20px; background-color: #1890ff; color: white; border: none; border-radius: 4px; cursor: pointer; }
          button:hover { background-color: #40a9ff; }
        </style>
      </head>
      <body>
        <div class="verification-container">
          <h1>MiaoEyes验证</h1>
          <p>请完成验证以继续访问</p>
          <div id="miaoeyes-verification"></div>
          <script>
            // 验证成功后的回调函数
            function onVerificationSuccess(token) {
              // 发送验证token到服务器
              fetch('/verify/verify-redirect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: token })
              }).then(response => {
                if (response.ok) {
                  // 验证成功，跳转到目标域名
                  window.location.href = 'https://${domainRedirectConfig.targetDomain}${req.session?.redirectUrl || ''}';
                } else {
                  alert('验证失败，请重试');
                }
              });
            }
            // 初始化验证组件
            window.onload = function() {
              // 这里应该初始化MiaoEyes验证组件
              // 为了演示，我们添加一个简单的按钮
              const container = document.getElementById('miaoeyes-verification');
              const button = document.createElement('button');
              button.textContent = '验证';
              button.onclick = function() {
                // 模拟验证成功
                onVerificationSuccess('mock-verification-token');
              };
              container.appendChild(button);
            };
          </script>
        </div>
      </body>
      </html>
    `);
  }
  res.status(404).send('Page not found');
});

// 验证重定向路由
app.post('/verify/verify-redirect', async (req, res) => {
  try {
    const { token } = req.body;
    
    // 创建一个模拟的请求对象，用于调用控制器方法
    const mockReq = {
      params: { token }
    };
    
    // 验证token - 注意：这是一个简化的实现，实际应该根据verificationController的API调整
    let verificationStatus = { verified: false };
    
    try {
      // 尝试调用验证控制器验证token
      verificationStatus = await new Promise((resolve, reject) => {
        // 创建一个模拟的响应对象
        const mockRes = {
          json: (data) => {
            if (data.verified) {
              resolve({ verified: true });
            } else {
              resolve({ verified: false });
            }
          },
          status: (code) => ({
            json: (data) => resolve({ verified: false, error: data.error })
          })
        };
        
        // 调用控制器方法
        verificationController.getVerificationStatus(mockReq, mockRes);
      });
    } catch (error) {
      console.error('Verification controller error:', error);
    }
    
    // 对于演示目的，如果没有验证控制器或者验证失败，我们假设token为'mock-verification-token'是有效的
    const isTokenValid = verificationStatus.verified || token === 'mock-verification-token';
    
    if (isTokenValid) {
      // 设置验证状态到session
      req.session.verified = true;
      
      // 返回成功响应
      return res.json({ success: true, message: 'Verification successful' });
    }
    
    // 验证失败
    return res.status(401).json({ success: false, message: 'Verification failed' });
  } catch (error) {
    console.error('Error in verification redirect:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// 前端静态资源服务（生产环境）
if (NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '../../src/client/dist');
  if (fs.existsSync(clientBuildPath)) {
    app.use(express.static(clientBuildPath));
    
    // 处理单页应用路由
    app.get('*', (req, res) => {
      res.sendFile(path.join(clientBuildPath, 'index.html'));
    });
  } else {
    console.error('Client build not found at:', clientBuildPath);
  }
}

// 开发环境下的前端重定向
if (NODE_ENV === 'development') {
  // 对于根路径请求，直接访问前端开发服务器
  app.get('/', (req, res) => {
    res.redirect('http://localhost:5173/');
  });
  
  // 对于其他路径，保持原有的重定向逻辑
  app.get('*', (req, res, next) => {
    // 跳过已定义的路由
    if (req.path.startsWith('/api') || 
        req.path.startsWith('/verify') || 
        req.path.startsWith('/static') || 
        req.path === '/favicon.ico' ||
        req.path === '/verify-page' ||
        req.path === '/') {
      return next();
    }
    // 重定向到前端开发服务器
    res.redirect(`http://localhost:5173${req.originalUrl}`);
  });
}

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  // 根据错误类型返回适当的响应
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: err.message
    });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      details: 'Invalid or missing token'
    });
  }
  
  // 默认错误处理
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    details: NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 启动服务器
function startServer() {
  // 检查是否需要使用HTTPS
  const useHttps = process.env.USE_HTTPS === 'true';
  const certPath = process.env.SSL_CERT_PATH;
  const keyPath = process.env.SSL_KEY_PATH;
  
  if (useHttps && certPath && keyPath) {
    try {
      const privateKey = fs.readFileSync(keyPath, 'utf8');
      const certificate = fs.readFileSync(certPath, 'utf8');
      const credentials = { key: privateKey, cert: certificate };
      
      https.createServer(credentials, app).listen(PORT, () => {
        console.log(`[MiaoEyes] HTTPS Server is running on port ${PORT} in ${NODE_ENV} mode`);
      });
    } catch (error) {
      console.error('Error starting HTTPS server:', error);
      console.log('Falling back to HTTP...');
      startHttpServer();
    }
  } else {
    startHttpServer();
  }
}

function startHttpServer() {
  app.listen(PORT, () => {
    console.log(`[MiaoEyes] Server is running on port ${PORT} in ${NODE_ENV} mode`);
    console.log(`[MiaoEyes] API endpoints available at http://localhost:${PORT}/api`);
    console.log(`[MiaoEyes] Verification endpoints available at http://localhost:${PORT}/verify`);
    if (NODE_ENV !== 'production') {
      console.log(`[MiaoEyes] Web interface is available at http://localhost:${PORT}`);
    }
  });
}

// 初始化统计数据
const { initializeStats } = require('./controllers/statsController');
initializeStats();

// 启动服务器
startServer();

// 导出app供测试使用
module.exports = app;