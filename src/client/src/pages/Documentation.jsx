import React, { useState } from 'react';
import { Card, Typography, Tabs, Alert, Tag, Button, message } from 'antd';
import { CopyOutlined, CheckCircleOutlined, CodeOutlined, FileTextOutlined } from '@ant-design/icons';

const { Title, Text, Code, Paragraph } = Typography;
const { TabPane } = Tabs;

const Documentation = () => {
  const [copied, setCopied] = useState('');

  // 复制代码到剪贴板
  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(''), 2000);
      message.success('代码已复制到剪贴板');
    }).catch(() => {
      message.error('复制失败，请手动复制');
    });
  };

  // HTML集成代码示例
  const htmlIntegrationCode = `<!-- 在您的HTML页面中添加以下代码 -->
<div id="miaoeyes-verification"></div>
<script src="https://您的服务器域名/static/miaoeyes.js"></script>
<script>
  // 初始化MiaoEyes验证组件
  MiaoEyes.init({
    container: '#miaoeyes-verification',
    serverUrl: 'https://您的服务器域名', // 可选，默认使用当前域名
    onSuccess: function(token) {
      console.log('验证成功，令牌:', token);
      // 验证成功后，您可以：
      // 1. 将令牌存储在localStorage中
      localStorage.setItem('miaoeyes-verified', token);
      // 2. 向您的服务器发送令牌进行验证
      fetch('/api/check-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: token })
      }).then(response => response.json())
        .then(data => {
          if (data.verified) {
            // 验证通过，可以继续操作
            document.getElementById('access-content').style.display = 'block';
          } else {
            // 验证失败，显示错误信息
            alert('验证失败，请重试');
          }
        });
    },
    onError: function(error) {
      console.error('验证出错:', error);
    },
    onExpire: function() {
      console.log('验证已过期，请重新验证');
      // 验证过期后的处理逻辑
    },
    autoVerify: true, // 启用自动验证（静默验证）
    retryAttempts: 3, // 自动验证失败时的重试次数
    retryDelay: 1000 // 重试间隔时间（毫秒）
  });
</script>`;

  // 服务器端验证代码示例
  const serverVerifyCode = `// 服务器端验证示例（Node.js + Express）
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 验证MiaoEyes令牌的中间件
exports.verifyMiaoEyesToken = (req, res, next) => {
  try {
    // 从请求头或Cookie中获取令牌
    const token = req.headers['x-miaoeyes-token'] || 
                 req.cookies['miaoeyes-token'] || 
                 req.body.token;
    
    if (!token) {
      return res.status(401).json({ verified: false, error: '未提供验证令牌' });
    }
    
    // 验证令牌
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // 检查令牌是否已验证
    if (!decoded.verified) {
      return res.status(401).json({ verified: false, error: '验证未通过' });
    }
    
    // 保存验证信息到请求对象
    req.miaoeyes = decoded;
    
    next();
  } catch (error) {
    return res.status(401).json({ verified: false, error: '无效或过期的令牌' });
  }
};

// 验证API路由
exports.checkVerification = (req, res) => {
  try {
    const token = req.body.token;
    
    if (!token) {
      return res.status(400).json({ verified: false, error: '缺少令牌' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    
    res.status(200).json({
      verified: decoded.verified,
      timestamp: decoded.timestamp,
      expiry: decoded.exp
    });
  } catch (error) {
    res.status(401).json({ verified: false, error: '验证失败' });
  }
};`;

  // API文档内容
  const apiDocumentation = [
    {
      endpoint: '/verify/challenge',
      method: 'GET',
      description: '创建新的验证挑战',
      parameters: [],
      response: {
        success: {
          challengeId: 'string',
          challengeType: 'string',
          timestamp: 'number'
        },
        error: {
          error: 'string'
        }
      }
    },
    {
      endpoint: '/verify/verify',
      method: 'POST',
      description: '验证用户响应',
      parameters: [
        { name: 'challengeId', type: 'string', required: true, description: '挑战ID' },
        { name: 'response', type: 'string', required: true, description: '用户响应' }
      ],
      response: {
        success: {
          verified: 'boolean',
          token: 'string' // 验证成功时返回的JWT令牌
        },
        error: {
          error: 'string',
          attemptsLeft: 'number' // 剩余尝试次数
        }
      }
    },
    {
      endpoint: '/verify/status/:token',
      method: 'GET',
      description: '检查验证状态',
      parameters: [
        { name: 'token', type: 'string', required: true, description: '验证令牌' }
      ],
      response: {
        success: {
          verified: 'boolean',
          timestamp: 'number',
          expiry: 'number'
        },
        error: {
          error: 'string'
        }
      }
    },
    {
      endpoint: '/api/config',
      method: 'GET',
      description: '获取当前配置',
      parameters: [],
      response: {
        success: '配置对象',
        error: {
          error: 'string'
        }
      }
    },
    {
      endpoint: '/api/stats',
      method: 'GET',
      description: '获取统计数据',
      parameters: [],
      response: {
        success: '统计数据对象',
        error: {
          error: 'string'
        }
      }
    }
  ];

  return (
    <div>
      <Title level={2} className="mb-6">
        <BookOutlined className="mr-2" />
        文档中心
      </Title>
      
      <Alert 
        message="重要提示" 
        description="本文档提供了MiaoEyes Web爬虫防火墙的集成指南和API文档。请根据您的需求选择合适的集成方式。" 
        type="info" 
        className="mb-6"
      />
      
      <Tabs defaultActiveKey="html" className="mb-6">
        <TabPane tab={
          <span>
            <FileCodeOutlined />
            HTML集成指南
          </span>
        } key="html">
          <Card title="HTML页面集成" className="mb-6">
            <Paragraph>
              要在您的网站中集成MiaoEyes验证服务，只需将以下代码添加到您的HTML页面中。
              您可以根据需要自定义验证组件的行为。
            </Paragraph>
            
            <div className="relative bg-gray-50 rounded-md p-4 mb-4">
              <Code className="block text-sm text-gray-800 whitespace-pre-wrap">{htmlIntegrationCode}</Code>
              <Button
                type="text"
                icon={copied === 'html' ? <CheckCircleOutlined /> : <CopyOutlined />}
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(htmlIntegrationCode, 'html')}
              />
            </div>
            
            <div className="mt-4">
              <Title level={4}>集成步骤说明</Title>
              <ol className="list-decimal pl-6 space-y-2">
                <li>
                  <strong>添加容器元素</strong>：在您希望显示验证组件的位置添加 <code>&lt;div id="miaoeyes-verification"&gt;&lt;/div&gt;</code>
                </li>
                <li>
                  <strong>引入验证脚本</strong>：添加 <code>&lt;script src="https://您的服务器域名/static/miaoeyes.js"&gt;&lt;/script&gt;</code>
                </li>
                <li>
                  <strong>初始化验证组件</strong>：使用 <code>MiaoEyes.init()</code> 方法配置验证组件
                </li>
                <li>
                  <strong>处理验证结果</strong>：在 <code>onSuccess</code> 回调中处理验证成功事件
                </li>
              </ol>
            </div>
          </Card>
        </TabPane>
        
        <TabPane tab={
          <span>
            <CodeOutlined />
            服务器端集成
          </span>
        } key="server">
          <Card title="服务器端验证示例" className="mb-6">
            <Paragraph>
              以下是服务器端验证MiaoEyes令牌的代码示例（Node.js + Express）。
              您可以根据您的服务器技术栈进行相应调整。
            </Paragraph>
            
            <div className="relative bg-gray-50 rounded-md p-4 mb-4">
              <Code className="block text-sm text-gray-800 whitespace-pre-wrap">{serverVerifyCode}</Code>
              <Button
                type="text"
                icon={copied === 'server' ? <CheckCircleOutlined /> : <CopyOutlined />}
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(serverVerifyCode, 'server')}
              />
            </div>
          </Card>
        </TabPane>
        
        <TabPane tab={
          <span>
            <CodeOutlined />
            API文档
          </span>
        } key="api">
          <Card title="MiaoEyes API接口" className="mb-6">
            <Paragraph>
              MiaoEyes提供了一组RESTful API，用于创建验证挑战、验证用户响应和获取配置等功能。
            </Paragraph>
            
            <div className="space-y-6">
              {apiDocumentation.map((api, index) => (
                <div key={index} className="border border-gray-200 rounded-md p-4">
                  <div className="flex flex-wrap items-center mb-2 gap-2">
                    <Tag color={api.method === 'GET' ? 'blue' : 'green'}>{api.method}</Tag>
                    <Code className="text-blue-600">{api.endpoint}</Code>
                  </div>
                  <Paragraph>{api.description}</Paragraph>
                  
                  {api.parameters.length > 0 && (
                    <div className="mb-3">
                      <Text strong>参数：</Text>
                      <ul className="list-disc pl-6 space-y-1">
                        {api.parameters.map((param, i) => (
                          <li key={i}>
                            <code>{param.name}</code> ({param.type}) {param.required && <Tag color="red" className="ml-1">必填</Tag>}: {param.description}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="mb-2">
                    <Text strong>响应：</Text>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <Text>成功响应：</Text>
                    <pre className="text-sm mt-1 bg-gray-100 p-2 rounded">
                      {JSON.stringify(api.response.success, null, 2)}
                    </pre>
                    
                    <Text className="mt-2 block">错误响应：</Text>
                    <pre className="text-sm mt-1 bg-gray-100 p-2 rounded">
                      {JSON.stringify(api.response.error, null, 2)}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabPane>
      </Tabs>
      
      <Card title="自动验证功能" className="mb-6">
        <Title level={4}>什么是自动验证？</Title>
        <Paragraph>
          自动验证（也称为静默验证）是MiaoEyes的一项高级功能，它可以在用户不知情的情况下
          对访问者进行自动化检测，只有在怀疑是爬虫或自动化程序时才会显示可见的验证挑战。
        </Paragraph>
        
        <Title level={4} className="mt-4">如何启用自动验证？</Title>
        <Paragraph>
          要启用自动验证功能，只需在调用 <code>MiaoEyes.init()</code> 方法时设置 <code>autoVerify: true</code> 选项。
          您还可以配置 <code>retryAttempts</code>（重试次数）和 <code>retryDelay</code>（重试间隔）来优化自动验证的行为。
        </Paragraph>
        
        <Title level={4} className="mt-4">前端集成代码</Title>
        <div className="relative bg-gray-50 rounded-md p-4 mb-4">
          <Code className="block text-sm text-gray-800 whitespace-pre-wrap">{`// 自动验证功能集成示例
async function performAutoVerification() {
  try {
    // 收集客户端信息
    const clientInfo = {
      screenSize: \`\${window.screen.width}x\${window.screen.height}\`,
      timezone: \`\${new Date().getTimezoneOffset()}\`,
      plugins: navigator.plugins ? Array.from(navigator.plugins).map(p => p.name).join(',') : '',
      // 可以添加更多客户端信息...
      interactionScore: calculateInteractionScore() // 计算用户交互分数
    };
    
    // 构建查询参数
    const queryParams = new URLSearchParams(clientInfo);
    
    // 发起自动验证请求
    const response = await fetch('/api/verification/auto-verify?' + queryParams, {
      method: 'GET',
      credentials: 'include'
    });
    
    const data = await response.json();
    
    if (data.verified && data.token) {
      // 自动验证成功，存储验证令牌
      localStorage.setItem('verificationToken', data.token);
      console.log('自动验证成功');
      return true;
    } else if (data.requiresInteraction) {
      // 需要交互式验证
      console.log('需要进行交互式验证');
      return false;
    }
  } catch (error) {
    console.error('自动验证失败:', error);
    return false;
  }
}

// 计算用户交互分数（简单示例）
function calculateInteractionScore() {
  // 这里可以实现更复杂的交互分析逻辑
  // 例如检测鼠标移动、键盘事件等
  return 0.5; // 默认分数
}

// 在页面加载时尝试自动验证
window.addEventListener('DOMContentLoaded', async () => {
  const autoVerified = await performAutoVerification();
  
  if (!autoVerified) {
    // 自动验证失败，显示交互式验证界面
    showVerificationUI();
  }
});`}</Code>
          <Button
            type="text"
            icon={copied === 'autoVerify' ? <CheckCircleOutlined /> : <CopyOutlined />}
            className="absolute top-2 right-2"
            onClick={() => copyToClipboard(`// 自动验证功能集成示例
async function performAutoVerification() {
  try {
    // 收集客户端信息
    const clientInfo = {
      screenSize: \`\${window.screen.width}x\${window.screen.height}\`,
      timezone: \`\${new Date().getTimezoneOffset()}\`,
      plugins: navigator.plugins ? Array.from(navigator.plugins).map(p => p.name).join(',') : '',
      // 可以添加更多客户端信息...
      interactionScore: calculateInteractionScore() // 计算用户交互分数
    };
    
    // 构建查询参数
    const queryParams = new URLSearchParams(clientInfo);
    
    // 发起自动验证请求
    const response = await fetch('/api/verification/auto-verify?' + queryParams, {
      method: 'GET',
      credentials: 'include'
    });
    
    const data = await response.json();
    
    if (data.verified && data.token) {
      // 自动验证成功，存储验证令牌
      localStorage.setItem('verificationToken', data.token);
      console.log('自动验证成功');
      return true;
    } else if (data.requiresInteraction) {
      // 需要交互式验证
      console.log('需要进行交互式验证');
      return false;
    }
  } catch (error) {
    console.error('自动验证失败:', error);
    return false;
  }
}

// 计算用户交互分数（简单示例）
function calculateInteractionScore() {
  // 这里可以实现更复杂的交互分析逻辑
  // 例如检测鼠标移动、键盘事件等
  return 0.5; // 默认分数
}

// 在页面加载时尝试自动验证
window.addEventListener('DOMContentLoaded', async () => {
  const autoVerified = await performAutoVerification();
  
  if (!autoVerified) {
    // 自动验证失败，显示交互式验证界面
    showVerificationUI();
  }
});`, 'autoVerify')}
          />
        </div>
        
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mt-4">
          <Title level={5}>自动验证工作原理</Title>
          <Paragraph>
            自动验证通过收集和分析以下信息来判断访问者是否为人类：
          </Paragraph>
          <ul className="list-disc pl-6 space-y-1">
            <li>用户代理字符串分析</li>
            <li>屏幕尺寸和分辨率</li>
            <li>时区设置</li>
            <li>浏览器插件信息</li>
            <li>Canvas和WebGL指纹</li>
            <li>用户交互行为分析</li>
          </ul>
          <ol className="list-decimal pl-6 space-y-2 mt-4">
            <li>当页面加载时，MiaoEyes会在后台进行一系列检测（无需用户交互）</li>
            <li>如果检测结果表明访问者很可能是真实用户，会自动完成验证并触发 <code>onSuccess</code> 回调</li>
            <li>如果检测结果不确定，会尝试几次自动验证（可配置重试次数）</li>
            <li>如果自动验证失败，才会显示可见的验证挑战（如验证码）</li>
          </ol>
        </div>
        
        <Title level={4} className="mt-4">配置选项</Title>
        <Paragraph>
          在系统配置页面中，您可以设置：
        </Paragraph>
        <ul className="list-disc pl-6 space-y-1">
          <li>是否启用自动验证功能</li>
          <li>自动验证的可信度阈值（建议设置为70%）</li>
          <li>自动验证失败后的重试策略</li>
        </ul>
      </Card>
      
      <Card title="常见问题">
        <div className="space-y-4">
          <div>
            <Title level={5}>验证令牌的有效期是多久？</Title>
            <Paragraph>
              默认情况下，验证令牌的有效期为1小时（3600秒）。您可以在配置页面中调整 <code>tokenExpiry</code> 参数来修改有效期。
            </Paragraph>
          </div>
          
          <div>
            <Title level={5}>如何处理验证过期的情况？</Title>
            <Paragraph>
              您可以在 <code>MiaoEyes.init()</code> 的配置中使用 <code>onExpire</code> 回调函数来处理验证过期的情况，
              例如显示提示信息或重新启动验证流程。
            </Paragraph>
          </div>
          
          <div>
            <Title level={5}>自动验证失败时会发生什么？</Title>
            <Paragraph>
              如果自动验证失败，MiaoEyes会显示可见的验证挑战（如验证码或拼图），要求用户手动完成验证。
              您可以通过配置 <code>retryAttempts</code> 来控制自动验证的重试次数。
            </Paragraph>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Documentation;