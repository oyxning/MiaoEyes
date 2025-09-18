const express = require('express');
const router = express.Router();
const verificationController = require('../controllers/verificationController');

// 创建验证挑战
router.get('/challenge', verificationController.createChallenge);

// 验证用户响应
router.post('/verify', verificationController.verifyResponse);

// 检查验证状态
router.get('/status/:token', verificationController.getVerificationStatus);

module.exports = router;