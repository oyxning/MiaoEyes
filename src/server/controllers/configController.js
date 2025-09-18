const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// 配置文件路径
const CONFIG_FILE_PATH = path.join(__dirname, '../../../config/config.json');

// 默认配置
const DEFAULT_CONFIG = {
  // 验证设置
  verification: {
    enabled: true,
    difficulty: 'medium', // easy, medium, hard
    timeout: 30000, // 挑战超时时间（毫秒）
    maxAttempts: 5, // 最大尝试次数
    tokenExpiry: 3600 // 验证令牌有效期（秒）
  },
  
  // 域名跳转配置
  domainRedirect: {
    enabled: false, // 是否启用域名跳转功能
    targetDomain: '', // 目标域名（验证后重定向到的域名）
    redirectDomains: [], // 需要验证后跳转的域名列表
    excludePaths: ['/api', '/static', '/verify', '/favicon.ico'] // 排除的路径（不进行跳转）
  },
  
  // 挑战类型配置
  challenges: {
    enabledTypes: ['captcha', 'puzzle'], // 启用的挑战类型
    defaultType: 'captcha', // 默认挑战类型
    // 各类型挑战的特定配置
    captcha: {
      length: 4, // 验证码长度
      noiseLevel: 3, // 干扰程度（1-5）
      fontSize: 30, // 字体大小
      width: 120, // 验证码图片宽度
      height: 40 // 验证码图片高度
    },
    puzzle: {
      difficulty: 'medium', // easy, medium, hard
      timeout: 60000 // 拼图挑战超时时间（毫秒）
    }
  },
  
  // 安全设置
  security: {
    rateLimiting: {
      enabled: true,
      maxRequests: 100, // 时间窗口内的最大请求数
      windowMs: 900000 // 时间窗口（毫秒） - 默认15分钟
    },
    // 白名单配置
    whitelist: {
      userAgents: [], // User-Agent白名单
      ipAddresses: [] // IP地址白名单
    },
    // 黑名单配置
    blacklist: {
      userAgents: [], // User-Agent黑名单
      ipAddresses: [] // IP地址黑名单
    }
  },
  
  // 日志配置
  logging: {
    level: 'info', // 日志级别: debug, info, warn, error
    enabled: true, // 是否启用日志
    fileLogging: false, // 是否启用文件日志
    logFilePath: '../logs/miaoeyes.log' // 日志文件路径
  },
  
  // 其他配置
  other: {
    version: '1.0.0', // 版本号
    maintainer: 'MiaoEyes Team', // 维护者信息
    allowPublicAccess: true // 是否允许公共访问API
  }
};

/**
 * 确保配置文件存在，如果不存在则创建
 */
function ensureConfigFileExists() {
  try {
    // 确保配置目录存在
    const configDir = path.dirname(CONFIG_FILE_PATH);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    // 如果配置文件不存在，创建它并写入默认配置
    if (!fs.existsSync(CONFIG_FILE_PATH)) {
      fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(DEFAULT_CONFIG, null, 2), 'utf8');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error ensuring config file exists:', error);
    return false;
  }
}

/**
 * 合并默认配置（递归处理嵌套对象）
 */
function mergeDefaults(config, defaults) {
  if (!config) {
    return defaults;
  }
  
  const merged = { ...config };
  
  for (const key in defaults) {
    if (typeof defaults[key] === 'object' && defaults[key] !== null && !Array.isArray(defaults[key])) {
      merged[key] = mergeDefaults(merged[key], defaults[key]);
    } else if (!(key in merged)) {
      merged[key] = defaults[key];
    }
  }
  
  return merged;
}

/**
 * 从配置文件读取配置（内部函数）
 */
function _getConfigData() {
  try {
    // 确保配置文件存在
    ensureConfigFileExists();
    
    // 读取配置文件
    const configData = fs.readFileSync(CONFIG_FILE_PATH, 'utf8');
    const config = JSON.parse(configData);
    
    // 合并默认配置，确保所有必要的配置项都存在
    return mergeDefaults(config, DEFAULT_CONFIG);
  } catch (error) {
    console.error('Error reading config:', error);
    // 如果读取失败，返回默认配置
    return DEFAULT_CONFIG;
  }
}

/**
 * 保存配置到文件（内部函数）
 */
function _saveConfigData(config) {
  try {
    // 确保配置文件存在
    ensureConfigFileExists();
    
    // 写入配置文件
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(config, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error saving config:', error);
    return false;
  }
}

/**
 * 获取配置 - API控制器
 */
const getConfig = (req, res) => {
  try {
    const config = _getConfigData();
    res.status(200).json(config);
  } catch (error) {
    console.error('Error reading config:', error);
    res.status(500).json({ error: 'Failed to read configuration' });
  }
};

/**
 * 更新配置 - API控制器
 */
const updateConfig = (req, res) => {
  try {
    const newConfig = req.body;
    
    // 验证配置格式
    if (!newConfig || typeof newConfig !== 'object') {
      return res.status(400).json({ error: 'Invalid configuration format' });
    }
    
    // 合并配置
    const currentConfig = _getConfigData();
    const mergedConfig = mergeDefaults(newConfig, currentConfig);
    
    if (_saveConfigData(mergedConfig)) {
      res.status(200).json({ message: 'Configuration updated successfully', config: mergedConfig });
    } else {
      res.status(500).json({ error: 'Failed to update configuration' });
    }
  } catch (error) {
    console.error('Error updating config:', error);
    res.status(500).json({ error: 'Failed to update configuration' });
  }
};

/**
 * 添加IP地址到白名单
 */
const addIpToWhitelist = (req, res) => {
  try {
    const { ipAddress } = req.body;
    
    if (!ipAddress) {
      return res.status(400).json({ error: 'IP address is required' });
    }
    
    const config = _getConfigData();
    
    if (!config.security || !config.security.whitelist) {
      config.security = { ...config.security, whitelist: { ipAddresses: [] } };
    }
    
    if (!config.security.whitelist.ipAddresses) {
      config.security.whitelist.ipAddresses = [];
    }
    
    // 检查IP是否已经在白名单中
    if (!config.security.whitelist.ipAddresses.includes(ipAddress)) {
      config.security.whitelist.ipAddresses.push(ipAddress);
      if (_saveConfigData(config)) {
        return res.status(200).json({ message: 'IP address added to whitelist successfully' });
      } else {
        return res.status(500).json({ error: 'Failed to update configuration' });
      }
    }
    
    return res.status(200).json({ message: 'IP address is already in whitelist' });
  } catch (error) {
    console.error('Error adding IP to whitelist:', error);
    res.status(500).json({ error: 'Failed to add IP to whitelist' });
  }
};

/**
 * 从白名单中移除IP地址
 */
const removeIpFromWhitelist = (req, res) => {
  try {
    const { ipAddress } = req.body;
    
    if (!ipAddress) {
      return res.status(400).json({ error: 'IP address is required' });
    }
    
    const config = _getConfigData();
    
    if (!config.security || !config.security.whitelist || !config.security.whitelist.ipAddresses) {
      return res.status(404).json({ error: 'Whitelist not found' });
    }
    
    const ipIndex = config.security.whitelist.ipAddresses.indexOf(ipAddress);
    if (ipIndex !== -1) {
      config.security.whitelist.ipAddresses.splice(ipIndex, 1);
      if (_saveConfigData(config)) {
        return res.status(200).json({ message: 'IP address removed from whitelist successfully' });
      } else {
        return res.status(500).json({ error: 'Failed to update configuration' });
      }
    }
    
    return res.status(404).json({ message: 'IP address not found in whitelist' });
  } catch (error) {
    console.error('Error removing IP from whitelist:', error);
    res.status(500).json({ error: 'Failed to remove IP from whitelist' });
  }
};

/**
 * 添加User-Agent到白名单
 */
const addUserAgentToWhitelist = (req, res) => {
  try {
    const { userAgent } = req.body;
    
    if (!userAgent) {
      return res.status(400).json({ error: 'User-Agent is required' });
    }
    
    const config = _getConfigData();
    
    if (!config.security || !config.security.whitelist) {
      config.security = { ...config.security, whitelist: { userAgents: [] } };
    }
    
    if (!config.security.whitelist.userAgents) {
      config.security.whitelist.userAgents = [];
    }
    
    // 检查User-Agent是否已经在白名单中
    if (!config.security.whitelist.userAgents.includes(userAgent)) {
      config.security.whitelist.userAgents.push(userAgent);
      if (_saveConfigData(config)) {
        return res.status(200).json({ message: 'User-Agent added to whitelist successfully' });
      } else {
        return res.status(500).json({ error: 'Failed to update configuration' });
      }
    }
    
    return res.status(200).json({ message: 'User-Agent is already in whitelist' });
  } catch (error) {
    console.error('Error adding User-Agent to whitelist:', error);
    res.status(500).json({ error: 'Failed to add User-Agent to whitelist' });
  }
};

/**
 * 从白名单中移除User-Agent
 */
const removeUserAgentFromWhitelist = (req, res) => {
  try {
    const { userAgent } = req.body;
    
    if (!userAgent) {
      return res.status(400).json({ error: 'User-Agent is required' });
    }
    
    const config = _getConfigData();
    
    if (!config.security || !config.security.whitelist || !config.security.whitelist.userAgents) {
      return res.status(404).json({ error: 'Whitelist not found' });
    }
    
    const uaIndex = config.security.whitelist.userAgents.indexOf(userAgent);
    if (uaIndex !== -1) {
      config.security.whitelist.userAgents.splice(uaIndex, 1);
      if (_saveConfigData(config)) {
        return res.status(200).json({ message: 'User-Agent removed from whitelist successfully' });
      } else {
        return res.status(500).json({ error: 'Failed to update configuration' });
      }
    }
    
    return res.status(404).json({ message: 'User-Agent not found in whitelist' });
  } catch (error) {
    console.error('Error removing User-Agent from whitelist:', error);
    res.status(500).json({ error: 'Failed to remove User-Agent from whitelist' });
  }
};

/**
 * 重置配置为默认值
 */
const resetConfig = (req, res) => {
  try {
    if (fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(DEFAULT_CONFIG, null, 2), 'utf8')) {
      return res.status(200).json({ message: 'Configuration reset to default successfully', config: DEFAULT_CONFIG });
    }
    return res.status(500).json({ error: 'Failed to reset configuration' });
  } catch (error) {
    console.error('Error resetting config:', error);
    res.status(500).json({ error: 'Failed to reset configuration' });
  }
};

/**
 * 获取验证设置
 */
const getVerificationSettings = (req, res) => {
  try {
    const config = _getConfigData();
    res.status(200).json(config.verification || DEFAULT_CONFIG.verification);
  } catch (error) {
    console.error('Error getting verification settings:', error);
    res.status(500).json({ error: 'Failed to get verification settings' });
  }
};

/**
 * 更新验证设置
 */
const updateVerificationSettings = (req, res) => {
  try {
    const settings = req.body;
    
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ error: 'Invalid settings format' });
    }
    
    const config = _getConfigData();
    config.verification = { ...config.verification, ...settings };
    
    if (_saveConfigData(config)) {
      res.status(200).json({ message: 'Verification settings updated successfully', settings: config.verification });
    } else {
      res.status(500).json({ error: 'Failed to update verification settings' });
    }
  } catch (error) {
    console.error('Error updating verification settings:', error);
    res.status(500).json({ error: 'Failed to update verification settings' });
  }
};

/**
 * 获取安全设置
 */
const getSecuritySettings = (req, res) => {
  try {
    const config = _getConfigData();
    res.status(200).json(config.security || DEFAULT_CONFIG.security);
  } catch (error) {
    console.error('Error getting security settings:', error);
    res.status(500).json({ error: 'Failed to get security settings' });
  }
};

/**
 * 更新安全设置
 */
const updateSecuritySettings = (req, res) => {
  try {
    const settings = req.body;
    
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ error: 'Invalid settings format' });
    }
    
    const config = _getConfigData();
    config.security = { ...config.security, ...settings };
    
    if (_saveConfigData(config)) {
      res.status(200).json({ message: 'Security settings updated successfully', settings: config.security });
    } else {
      res.status(500).json({ error: 'Failed to update security settings' });
    }
  } catch (error) {
    console.error('Error updating security settings:', error);
    res.status(500).json({ error: 'Failed to update security settings' });
  }
};

/**
 * 检查IP是否在白名单中（内部函数）
 */
function isIpWhitelisted(ipAddress) {
  const config = _getConfigData();
  
  if (!config.security || !config.security.whitelist || !config.security.whitelist.ipAddresses) {
    return false;
  }
  
  return config.security.whitelist.ipAddresses.includes(ipAddress);
}

/**
 * 检查User-Agent是否在白名单中（内部函数）
 */
function isUserAgentWhitelisted(userAgent) {
  const config = _getConfigData();
  
  if (!config.security || !config.security.whitelist || !config.security.whitelist.userAgents) {
    return false;
  }
  
  // 支持通配符匹配
  return config.security.whitelist.userAgents.some(whitelistedUA => {
    if (whitelistedUA.includes('*')) {
      // 将通配符转换为正则表达式
      const regexPattern = whitelistedUA.replace(/\*/g, '.*');
      const regex = new RegExp(regexPattern, 'i');
      return regex.test(userAgent);
    }
    return userAgent.toLowerCase().includes(whitelistedUA.toLowerCase());
  });
}

module.exports = {
  getConfig,
  updateConfig,
  addIpToWhitelist,
  removeIpFromWhitelist,
  addUserAgentToWhitelist,
  removeUserAgentFromWhitelist,
  resetConfig,
  getVerificationSettings,
  updateVerificationSettings,
  getSecuritySettings,
  updateSecuritySettings,
  // 内部工具函数
  _getConfigData,
  _saveConfigData,
  isIpWhitelisted,
  isUserAgentWhitelisted
};