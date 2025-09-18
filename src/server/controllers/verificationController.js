const uuid = require('uuid');
const jwt = require('jsonwebtoken');
const { updateStats } = require('./statsController');
const { 
  _getConfigData, 
  isIpWhitelisted, 
  isUserAgentWhitelisted 
} = require('./configController');

// 存储验证会话的临时内存存储
const verificationSessions = new Map();

// 生成随机字符串
const generateRandomString = (length = 32) => {
  return uuid.v4().replace(/-/g, '').substr(0, length);
};

// 生成验证码
const generateCaptcha = (length = 6) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 排除容易混淆的字符
  let captcha = '';
  for (let i = 0; i < length; i++) {
    captcha += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return captcha;
};

/**
 * 获取客户端IP地址
 */
const getClientIp = (req) => {
  return req.headers['x-forwarded-for'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress || 
         req.connection.socket.remoteAddress;
};

/**
 * 检查请求是否在白名单中
 */
const isRequestWhitelisted = (req) => {
  try {
    const clientIp = getClientIp(req);
    const userAgent = req.headers['user-agent'] || '';
    
    // 检查IP是否在白名单中
    if (isIpWhitelisted(clientIp)) {
      return true;
    }
    
    // 检查User-Agent是否在白名单中
    if (isUserAgentWhitelisted(userAgent)) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking whitelist:', error);
    return false;
  }
};

// 创建验证挑战
const createChallenge = (req, res) => {
  try {
    // 获取配置
    const config = _getConfigData();
    
    // 检查验证是否启用
    if (!config.verification?.enabled) {
      return res.status(403).json({ error: 'Verification is disabled' });
    }
    
    // 检查白名单
    if (isRequestWhitelisted(req)) {
      // 白名单请求可以直接获取验证令牌
      const verificationToken = jwt.sign(
        {
          challengeId: 'whitelisted-request',
          verified: true,
          timestamp: Date.now(),
          whitelisted: true
        },
        process.env.JWT_SECRET || 'secret_key',
        { expiresIn: `${config.verification.tokenExpiry || 3600}s` }
      );
      
      // 记录验证成功统计
      updateStats('verified');
      
      return res.status(200).json({
        challengeId: 'whitelisted',
        challengeType: 'none',
        timestamp: Date.now(),
        token: verificationToken,
        whitelisted: true
      });
    }
    
    // 根据配置选择挑战类型
    const enabledTypes = config.challenges?.enabledTypes || ['captcha'];
    const defaultType = config.challenges?.defaultType || 'captcha';
    const challengeType = enabledTypes.includes(defaultType) ? defaultType : enabledTypes[0];
    
    // 生成挑战ID
    const challengeId = generateRandomString();
    
    // 根据挑战类型创建不同的挑战内容
    let challengeData = {};
    if (challengeType === 'captcha') {
      const captchaLength = config.challenges?.captcha?.length || 6;
      const captchaText = generateCaptcha(captchaLength);
      challengeData = {
        captchaText: captchaText,
        captchaConfig: config.challenges?.captcha || {}
      };
    }
    
    // 创建会话
    const session = {
      id: challengeId,
      type: challengeType,
      ...challengeData,
      createdAt: Date.now(),
      attempts: 0,
      verified: false
    };
    
    verificationSessions.set(challengeId, session);
    
    // 设置会话超时清理
    const timeout = config.verification?.timeout || 30000;
    setTimeout(() => {
      verificationSessions.delete(challengeId);
    }, timeout);
    
    // 记录验证请求统计
    updateStats('request');
    
    res.status(200).json({
      challengeId: challengeId,
      challengeType: challengeType,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error creating challenge:', error);
    res.status(500).json({ error: 'Failed to create verification challenge' });
  }
};

// 验证用户响应
const verifyResponse = (req, res) => {
  try {
    const { challengeId, response } = req.body;
    
    if (!challengeId || !response) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // 获取配置
    const config = _getConfigData();
    
    // 查找会话
    const session = verificationSessions.get(challengeId);
    
    if (!session) {
      return res.status(400).json({ error: 'Invalid or expired challenge' });
    }
    
    // 检查是否超时
    const timeout = config.verification?.timeout || 30000;
    
    if (Date.now() - session.createdAt > timeout) {
      verificationSessions.delete(challengeId);
      return res.status(400).json({ error: 'Challenge expired' });
    }
    
    // 检查尝试次数
    const maxAttempts = config.verification?.maxAttempts || 5;
    if (session.attempts >= maxAttempts) {
      return res.status(400).json({ 
        error: 'Maximum attempts reached',
        attemptsLeft: 0 
      });
    }
    
    // 增加尝试次数
    session.attempts += 1;
    
    // 根据挑战类型验证响应
    let isVerified = false;
    
    if (session.type === 'captcha') {
      // 验证码验证逻辑
      isVerified = response.toUpperCase() === session.captchaText;
    }
    // 可以在这里添加其他类型挑战的验证逻辑
    
    if (isVerified) {
      session.verified = true;
      
      // 记录验证成功统计
      updateStats('verified');
      
      // 生成验证令牌
      const tokenExpiry = config.verification?.tokenExpiry || 3600;
      const verificationToken = jwt.sign(
        {
          challengeId: session.id,
          verified: true,
          timestamp: Date.now(),
          type: session.type
        },
        process.env.JWT_SECRET || 'secret_key',
        { expiresIn: `${tokenExpiry}s` }
      );
      
      // 根据难度调整令牌有效期
      if (config.verification?.difficulty === 'hard') {
        // 高难度验证有效期更长
        const longExpiryToken = jwt.sign(
          {
            challengeId: session.id,
            verified: true,
            timestamp: Date.now(),
            type: session.type,
            highDifficulty: true
          },
          process.env.JWT_SECRET || 'secret_key',
          { expiresIn: `${tokenExpiry * 2}s` }
        );
        
        return res.status(200).json({
          success: true,
          verified: true,
          token: longExpiryToken,
          highDifficulty: true
        });
      }
      
      res.status(200).json({
        success: true,
        verified: true,
        token: verificationToken
      });
    } else {
      // 记录验证失败统计
      updateStats('failed');
      
      res.status(200).json({
        success: false,
        verified: false,
        attemptsLeft: maxAttempts - session.attempts
      });
    }
  } catch (error) {
    console.error('Error verifying response:', error);
    res.status(500).json({ error: 'Failed to verify response' });
  }
};

// 检查验证状态
const getVerificationStatus = (req, res) => {
  try {
    const { token } = req.params;
    
    if (!token) {
      return res.status(400).json({ error: 'Missing token' });
    }
    
    try {
      // 验证JWT令牌
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
      
      res.status(200).json({
        verified: true,
        ...decoded
      });
    } catch (jwtError) {
      res.status(200).json({
        verified: false,
        error: 'Invalid or expired token'
      });
    }
  } catch (error) {
    console.error('Error checking verification status:', error);
    res.status(500).json({ error: 'Failed to check verification status' });
  }
};

// 清理过期会话的定时任务
const cleanExpiredSessions = () => {
  const config = _getConfigData();
  const timeout = config.verification?.timeout || 30000;
  const now = Date.now();
  
  verificationSessions.forEach((session, id) => {
    if (now - session.createdAt > timeout) {
      verificationSessions.delete(id);
    }
  });
};

// 每5分钟清理一次过期会话
setInterval(cleanExpiredSessions, 5 * 60 * 1000);

module.exports = {
  createChallenge,
  verifyResponse,
  getVerificationStatus,
  // 用于测试的内部函数
  _getClientIp: getClientIp,
  _isRequestWhitelisted: isRequestWhitelisted
};