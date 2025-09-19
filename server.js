const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const rateLimiter = new RateLimiterMemory({
  points: 10,
  duration: 60,
});

const sessions = new Map();
const verifiedIps = new Map();

app.use(async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch (rejRes) {
    res.status(429).send('请求过于频繁');
  }
});

app.get('/verify', (req, res) => {
  const sessionId = uuidv4();
  const originalUrl = req.query.originalUrl || '/';
  
  sessions.set(sessionId, {
    originalUrl,
    createdAt: Date.now(),
    verified: false
  });

  res.sendFile(path.join(__dirname, 'public', 'verify.html'));
});

app.post('/api/verify', (req, res) => {
  const { sessionId } = req.body;
  
  if (!sessionId || !sessions.has(sessionId)) {
    return res.status(400).json({ success: false, message: '无效的会话ID' });
  }

  const session = sessions.get(sessionId);
  if (Date.now() - session.createdAt > 300000) {
    sessions.delete(sessionId);
    return res.status(400).json({ success: false, message: '会话已过期' });
  }

  session.verified = true;
  verifiedIps.set(req.ip, Date.now());
  
  res.json({ 
    success: true, 
    redirectUrl: session.originalUrl 
  });
});

app.get('/api/check-verification', (req, res) => {
  const ipVerification = verifiedIps.get(req.ip);
  if (ipVerification && Date.now() - ipVerification < 3600000) {
    return res.json({ verified: true });
  }
  res.json({ verified: false });
});

app.get('/api/generate-validator', (req, res) => {
  const validatorCode = `
(function() {
  const checkVerification = async () => {
    try {
      const response = await fetch('/api/check-verification');
      const data = await response.json();
      return data.verified;
    } catch (error) {
      return false;
    }
  };

  const redirectToVerification = () => {
    const currentUrl = encodeURIComponent(window.location.href);
    window.location.href = '/verify?originalUrl=' + currentUrl;
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
  `;

  res.setHeader('Content-Type', 'application/javascript');
  res.send(validatorCode);
});

app.listen(PORT, () => {
  console.log(`MiaoEyes服务运行在端口 ${PORT}`);
  
  if (!fs.existsSync('public')) {
    fs.mkdirSync('public');
  }
});