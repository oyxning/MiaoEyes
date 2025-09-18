import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Input, Typography, Alert, Spin, Tabs } from 'antd';
import { CopyOutlined, CheckCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text, Code } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;

const Verification = () => {
  const [challenge, setChallenge] = useState(null);
  const [response, setResponse] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // 创建新的验证挑战
  const createNewChallenge = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/verify/challenge');
      setChallenge(res.data);
      setResponse('');
      setVerificationResult(null);
    } catch (error) {
      console.error('Failed to create challenge:', error);
    } finally {
      setLoading(false);
    }
  };

  // 验证用户响应
  const verifyUserResponse = async () => {
    if (!challenge || !response) {
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post('/verify/verify', {
        challengeId: challenge.challengeId,
        response: response
      });
      setVerificationResult(res.data);
    } catch (error) {
      console.error('Failed to verify response:', error);
    } finally {
      setLoading(false);
    }
  };

  // 复制代码到剪贴板
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // 示例代码
  const htmlExampleCode = `<!-- 在您的HTML中添加以下代码 -->
<div id="miaoeyes-verification"></div>
<script src="https://your-server.com/static/miaoeyes.js"></script>
<script>
  // 初始化验证组件
  MiaoEyes.init({
    container: '#miaoeyes-verification',
    onSuccess: function(token) {
      console.log('Verification successful, token:', token);
      // 在这里发送token到您的服务器进行验证
      fetch('/api/verify-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: token })
      }).then(response => response.json())
        .then(data => {
          if (data.verified) {
            // 验证通过，可以继续操作
          }
        });
    },
    onError: function(error) {
      console.error('Verification failed:', error);
    }
  });
</script>`;

  const apiExampleCode = `// 服务器端API调用示例
// 1. 创建验证挑战
fetch('https://your-server.com/verify/challenge')
  .then(response => response.json())
  .then(challenge => {
    console.log('Challenge created:', challenge);
    // 将challenge信息发送到客户端进行展示
  });

// 2. 验证用户响应
fetch('https://your-server.com/verify/verify', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    challengeId: 'challenge-id-from-client',
    response: 'user-response'
  })
})
  .then(response => response.json())
  .then(result => {
    if (result.verified) {
      console.log('Verification successful, token:', result.token);
      // 验证通过，可以继续操作
    } else {
      console.log('Verification failed');
    }
  });

// 3. 检查验证状态
fetch('https://your-server.com/verify/status/verification-token')
  .then(response => response.json())
  .then(status => {
    if (status.verified) {
      console.log('Token is valid');
    } else {
      console.log('Token is invalid or expired');
    }
  });`;

  useEffect(() => {
    // 页面加载时创建一个挑战
    createNewChallenge();
  }, []);

  return (
    <div>
      <Title level={4} className="mb-6">验证服务</Title>
      
      <Tabs defaultActiveKey="demo" className="mb-6">
        <TabPane tab="演示" key="demo">
          <Card title="人机验证演示" extra={<Button icon={<ReloadOutlined />} onClick={createNewChallenge} />}>
            {loading && (
              <div className="flex justify-center items-center h-40">
                <Spin size="large" />
              </div>
            )}
            {!loading && challenge && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Text>挑战ID: {challenge.challengeId}</Text>
                  <Text>挑战类型: {challenge.challengeType}</Text>
                </div>
                
                <div className="p-4 bg-gray-100 rounded text-center">
                  {/* 这里可以根据challengeType显示不同类型的验证挑战 */}
                  <Text strong className="text-2xl font-mono">{challenge.challengeId.substring(0, 6).toUpperCase()}</Text>
                </div>
                
                <div className="flex space-x-4">
                  <Input
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="请输入上方显示的字符"
                    className="flex-1"
                    disabled={loading}
                  />
                  <Button type="primary" onClick={verifyUserResponse} disabled={loading || !response}>
                    验证
                  </Button>
                </div>
                
                {verificationResult && (
                  <Alert
                    message={verificationResult.verified ? '验证成功' : '验证失败'}
                    description={verificationResult.token ? `验证令牌: ${verificationResult.token}` : `剩余尝试次数: ${verificationResult.attemptsLeft}`}
                    type={verificationResult.verified ? 'success' : 'error'}
                    showIcon
                  />
                )}
              </div>
            )}
          </Card>
        </TabPane>
        
        <TabPane tab="HTML集成" key="html">
          <Card title="HTML集成示例">
            <div className="relative">
              <Code language="html">{htmlExampleCode}</Code>
              <Button
                type="text"
                icon={copied ? <CheckCircleOutlined /> : <CopyOutlined />}
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(htmlExampleCode)}
              />
            </div>
          </Card>
        </TabPane>
        
        <TabPane tab="API文档" key="api">
          <Card title="API调用示例">
            <div className="relative">
              <Code language="javascript">{apiExampleCode}</Code>
              <Button
                type="text"
                icon={copied ? <CheckCircleOutlined /> : <CopyOutlined />}
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(apiExampleCode)}
              />
            </div>
          </Card>
        </TabPane>
      </Tabs>
      
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="使用指南">
            <div className="space-y-4">
              <div>
                <Text strong>1. 集成方式</Text>
                <Text>：可以通过HTML脚本标签直接集成，也可以通过API调用自行实现验证流程。</Text>
              </div>
              <div>
                <Text strong>2. 验证流程</Text>
                <Text>：创建挑战 → 用户响应 → 服务器验证 → 返回结果。</Text>
              </div>
              <div>
                <Text strong>3. 验证令牌</Text>
                <Text>：验证成功后会生成一个有效期为1小时的JWT令牌，可以用于后续API请求的身份验证。</Text>
              </div>
              <div>
                <Text strong>4. 安全考虑</Text>
                <Text>：建议在生产环境中使用HTTPS，并配置合理的验证难度和尝试次数限制。</Text>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="常见问题">
            <div className="space-y-4">
              <div>
                <Text strong>Q: 验证失败怎么办？</Text>
                <Text>：可以重新生成挑战，或者检查用户输入是否正确。</Text>
              </div>
              <div>
                <Text strong>Q: 如何自定义验证难度？</Text>
                <Text>：可以在配置页面调整验证难度参数。</Text>
              </div>
              <div>
                <Text strong>Q: 验证令牌的有效期是多久？</Text>
                <Text>：默认有效期为1小时，可以在代码中自定义。</Text>
              </div>
              <div>
                <Text strong>Q: 如何处理大量请求？</Text>
                <Text>：建议配置适当的速率限制，避免服务被滥用。</Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Verification;