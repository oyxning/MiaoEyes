const fs = require('fs');
const path = require('path');

// 统计数据文件路径
const statsPath = path.join(__dirname, '../../../config/stats.json');

// 初始化默认统计数据
const defaultStats = {
  totalRequests: 0,
  verifiedRequests: 0,
  failedRequests: 0,
  dailyStats: {},
  hourlyStats: {},
  lastUpdated: new Date().toISOString()
};

// 确保统计文件存在
const ensureStatsFile = () => {
  if (!fs.existsSync(statsPath)) {
    // 确保目录存在
    const dir = path.dirname(statsPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(statsPath, JSON.stringify(defaultStats, null, 2));
  }
};

// 更新统计数据
const updateStats = (type) => {
  try {
    ensureStatsFile();
    const stats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
    
    // 更新总计数
    stats.totalRequests += 1;
    if (type === 'verified') {
      stats.verifiedRequests += 1;
    } else if (type === 'failed') {
      stats.failedRequests += 1;
    }
    
    // 更新日期统计
    const today = new Date().toISOString().split('T')[0];
    if (!stats.dailyStats[today]) {
      stats.dailyStats[today] = {
        total: 0,
        verified: 0,
        failed: 0
      };
    }
    stats.dailyStats[today].total += 1;
    if (type === 'verified') {
      stats.dailyStats[today].verified += 1;
    } else if (type === 'failed') {
      stats.dailyStats[today].failed += 1;
    }
    
    // 更新小时统计
    const now = new Date();
    const hourKey = `${today}T${now.getHours().toString().padStart(2, '0')}:00`;
    if (!stats.hourlyStats[hourKey]) {
      stats.hourlyStats[hourKey] = {
        total: 0,
        verified: 0,
        failed: 0
      };
    }
    stats.hourlyStats[hourKey].total += 1;
    if (type === 'verified') {
      stats.hourlyStats[hourKey].verified += 1;
    } else if (type === 'failed') {
      stats.hourlyStats[hourKey].failed += 1;
    }
    
    // 更新最后更新时间
    stats.lastUpdated = new Date().toISOString();
    
    fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));
  } catch (error) {
    console.error('Error updating stats:', error);
    // 统计失败不应影响主服务
  }
};

// 获取统计信息
const getStats = (req, res) => {
  try {
    ensureStatsFile();
    const stats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
    
    // 计算成功率
    const successRate = stats.totalRequests > 0 
      ? (stats.verifiedRequests / stats.totalRequests * 100).toFixed(2) 
      : 0;
    
    // 准备响应数据
    const response = {
      ...stats,
      successRate: parseFloat(successRate),
      activeToday: stats.dailyStats[new Date().toISOString().split('T')[0]] || {
        total: 0,
        verified: 0,
        failed: 0
      }
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Error reading stats:', error);
    res.status(500).json({ error: 'Failed to read statistics' });
  }
};

// 初始化统计数据
const initializeStats = () => {
  try {
    ensureStatsFile();
    console.log('[MiaoEyes] Statistics initialized successfully');
  } catch (error) {
    console.error('Error initializing statistics:', error);
  }
};

module.exports = {
  getStats,
  updateStats,
  initializeStats
};