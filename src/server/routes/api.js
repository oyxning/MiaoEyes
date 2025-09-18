const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');
const statsController = require('../controllers/statsController');

// 配置管理路由
router.get('/config', configController.getConfig);
router.post('/config', configController.updateConfig);
router.post('/config/reset', configController.resetConfig);

// 验证设置路由
router.get('/config/verification', configController.getVerificationSettings);
router.post('/config/verification', configController.updateVerificationSettings);

// 安全设置路由
router.get('/config/security', configController.getSecuritySettings);
router.post('/config/security', configController.updateSecuritySettings);

// 白名单管理路由
router.post('/config/whitelist/ip/add', configController.addIpToWhitelist);
router.post('/config/whitelist/ip/remove', configController.removeIpFromWhitelist);
router.post('/config/whitelist/useragent/add', configController.addUserAgentToWhitelist);
router.post('/config/whitelist/useragent/remove', configController.removeUserAgentFromWhitelist);

// 统计信息路由
router.get('/stats', statsController.getStats);

// 健康检查路由
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: require('../../../package.json').version || '1.0.0',
    uptime: process.uptime()
  });
});

module.exports = router;