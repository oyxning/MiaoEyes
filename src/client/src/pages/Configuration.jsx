import React, { useState, useEffect } from 'react';
import { Card, Typography, Form, Input, Select, Switch, Button, message, Divider, Table, Tag, Modal } from 'antd';
import { SaveOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;
const { Option } = Select;

const Configuration = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialConfig, setInitialConfig] = useState(null);
  
  // 添加白名单项模态框
  const [whitelistModalVisible, setWhitelistModalVisible] = useState(false);
  const [currentWhitelistType, setCurrentWhitelistType] = useState('userAgents');
  const [whitelistItem, setWhitelistItem] = useState('');
  const [whitelistItems, setWhitelistItems] = useState([]);
  
  // 域名跳转配置管理
  const [redirectDomainModalVisible, setRedirectDomainModalVisible] = useState(false);
  const [redirectPathModalVisible, setRedirectPathModalVisible] = useState(false);
  const [redirectDomain, setRedirectDomain] = useState('');
  const [redirectPath, setRedirectPath] = useState('');
  
  // 默认配置，用于初始展示
  const defaultConfig = {
    verification: {
      enabled: true,
      difficulty: 'medium',
      timeout: 30000,
      maxAttempts: 5
    },
    security: {
      rateLimiting: {
        enabled: true,
        maxRequests: 100,
        windowMs: 60000
      },
      allowedIPs: [],
      blockedIPs: []
    },
    challenges: {
      type: ['captcha', 'puzzle', 'invisible'],
      defaultType: 'captcha'
    },
    whitelist: {
      userAgents: [],
      ipAddresses: []
    },
    domainRedirect: {
      enabled: false,
      targetDomain: '',
      redirectDomains: [],
      excludePaths: ['/api', '/static', '/verify', '/favicon.ico']
    }
  };

  // 获取配置
  const fetchConfig = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/config');
      const config = response.data;
      setInitialConfig(config);
      form.setFieldsValue(config);
      // 初始化白名单表格数据
      setWhitelistItems([...(config.whitelist?.userAgents || []).map(item => ({ type: 'userAgents', value: item })),
                         ...(config.whitelist?.ipAddresses || []).map(item => ({ type: 'ipAddresses', value: item }))]);
      // 初始化域名跳转配置
      if (config.domainRedirect) {
        setRedirectDomain(config.domainRedirect.targetDomain || '');
        // 如果有重定向域名列表且不为空，设置第一个作为当前编辑的域名
        if (config.domainRedirect.redirectDomains && config.domainRedirect.redirectDomains.length > 0) {
          setRedirectDomain(config.domainRedirect.redirectDomains[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch config:', error);
      message.error('获取配置失败，使用默认配置');
      // 使用默认配置
      setInitialConfig(defaultConfig);
      form.setFieldsValue(defaultConfig);
      setWhitelistItems([]);
      // 初始化默认域名跳转配置
      setRedirectDomain(defaultConfig.domainRedirect.targetDomain);
    } finally {
      setLoading(false);
    }
  };

  // 保存配置
  const saveConfig = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      // 更新白名单配置
      const updatedValues = {
        ...values,
        whitelist: {
          userAgents: whitelistItems.filter(item => item.type === 'userAgents').map(item => item.value),
          ipAddresses: whitelistItems.filter(item => item.type === 'ipAddresses').map(item => item.value)
        }
      };
      
      const response = await axios.post('/api/config', updatedValues);
      message.success('配置保存成功');
      setInitialConfig(updatedValues);
    } catch (error) {
      console.error('Failed to save config:', error);
      message.error('配置保存失败');
    } finally {
      setLoading(false);
    }
  };

  // 添加白名单项
  const addWhitelistItem = () => {
    if (!whitelistItem.trim()) {
      message.error('请输入白名单项');
      return;
    }
    
    const newItem = { type: currentWhitelistType, value: whitelistItem.trim() };
    
    // 检查重复
    if (whitelistItems.some(item => item.type === newItem.type && item.value === newItem.value)) {
      message.error('该白名单项已存在');
      return;
    }
    
    setWhitelistItems([...whitelistItems, newItem]);
    setWhitelistItem('');
    setWhitelistModalVisible(false);
    message.success('白名单项添加成功');
  };
  
  // 添加重定向域名
  const handleAddRedirectDomain = () => {
    if (!redirectDomain.trim()) {
      message.error('请输入域名');
      return;
    }
    
    // 获取当前配置的域名列表
    const currentRedirectDomains = form.getFieldValue(['domainRedirect', 'redirectDomains']) || [];
    
    // 检查域名是否已存在
    if (currentRedirectDomains.includes(redirectDomain.trim())) {
      message.error('该域名已存在');
      return;
    }
    
    // 更新域名列表
    form.setFieldValue(['domainRedirect', 'redirectDomains'], [...currentRedirectDomains, redirectDomain.trim()]);
    setRedirectDomain('');
    setRedirectDomainModalVisible(false);
    message.success('域名添加成功');
  };
  
  // 添加排除路径
  const handleAddRedirectPath = () => {
    if (!redirectPath.trim()) {
      message.error('请输入路径');
      return;
    }
    
    // 获取当前配置的排除路径列表
    const currentExcludePaths = form.getFieldValue(['domainRedirect', 'excludePaths']) || [];
    
    // 检查路径是否已存在
    if (currentExcludePaths.includes(redirectPath.trim())) {
      message.error('该路径已存在');
      return;
    }
    
    // 更新排除路径列表
    form.setFieldValue(['domainRedirect', 'excludePaths'], [...currentExcludePaths, redirectPath.trim()]);
    setRedirectPath('');
    setRedirectPathModalVisible(false);
    message.success('路径添加成功');
  };

  // 删除白名单项
  const deleteWhitelistItem = (index) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除此白名单项吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        const newWhitelistItems = [...whitelistItems];
        newWhitelistItems.splice(index, 1);
        setWhitelistItems(newWhitelistItems);
        message.success('白名单项删除成功');
      }
    });
  };

  // 打开白名单模态框
  const showWhitelistModal = (type) => {
    setCurrentWhitelistType(type);
    setWhitelistModalVisible(true);
  };

  // 白名单表格列定义
  const whitelistColumns = [
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        return type === 'userAgents' ? 'User-Agent' : 'IP地址';
      }
    },
    {
      title: '值',
      dataIndex: 'value',
      key: 'value',
      ellipsis: true
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record, index) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => deleteWhitelistItem(index)}
        >
          删除
        </Button>
      )
    }
  ];

  useEffect(() => {
    fetchConfig();
  }, []);

  return (
    <div>
      <Title level={4} className="mb-6">配置管理</Title>
      
      <Card title="基本配置" className="mb-6">
        <Form
          form={form}
          layout="vertical"
          size="middle"
          disabled={loading}
        >
          <div className="space-y-6">
            {/* 验证设置 */}
            <div>
              <Title level={5}>验证设置</Title>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item label="启用验证" name={['verification', 'enabled']} valuePropName="checked">
                  <Switch />
                </Form.Item>
                
                <Form.Item label="验证难度" name={['verification', 'difficulty']}>
                  <Select>
                    <Option value="easy">简单</Option>
                    <Option value="medium">中等</Option>
                    <Option value="hard">困难</Option>
                  </Select>
                </Form.Item>
                
                <Form.Item label="超时时间(毫秒)" name={['verification', 'timeout']}>
                  <Input type="number" min={5000} max={120000} />
                </Form.Item>
                
                <Form.Item label="最大尝试次数" name={['verification', 'maxAttempts']}>
                  <Input type="number" min={1} max={20} />
                </Form.Item>
              </div>
            </div>
            
            <Divider />
            
            {/* 安全设置 */}
            <div>
              <Title level={5}>安全设置</Title>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item label="启用速率限制" name={['security', 'rateLimiting', 'enabled']} valuePropName="checked">
                  <Switch />
                </Form.Item>
                
                <Form.Item label="最大请求数" name={['security', 'rateLimiting', 'maxRequests']}>
                  <Input type="number" min={1} max={1000} />
                </Form.Item>
                
                <Form.Item label="时间窗口(毫秒)" name={['security', 'rateLimiting', 'windowMs']}>
                  <Input type="number" min={1000} max={3600000} />
                </Form.Item>
                
                <Form.Item label="默认挑战类型" name={['challenges', 'defaultType']}>
                  <Select>
                    <Option value="captcha">验证码</Option>
                    <Option value="puzzle">拼图</Option>
                    <Option value="invisible">隐形验证</Option>
                  </Select>
                </Form.Item>
              </div>
            </div>
            
            <Divider />
            
            {/* 白名单管理 */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <Title level={5}>白名单管理</Title>
                <div className="space-x-2">
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => showWhitelistModal('userAgents')}
                  >
                    添加User-Agent
                  </Button>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => showWhitelistModal('ipAddresses')}
                  >
                    添加IP地址
                  </Button>
                </div>
              </div>
              <Table
                columns={whitelistColumns}
                dataSource={whitelistItems}
                rowKey={(record, index) => index}
                pagination={false}
                size="middle"
                className="mb-4"
              />
              <Text type="secondary">白名单中的项将绕过验证检查，请谨慎添加。</Text>
            </div>
          </div>
          
          <Divider />
          
          {/* 域名跳转配置 */}
          <div>
            <Title level={5}>域名跳转配置</Title>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item label="启用域名跳转" name={['domainRedirect', 'enabled']} valuePropName="checked">
                <Switch />
              </Form.Item>
            </div>
            
            <div className="mt-4">
              <Form.Item label="目标域名" name={['domainRedirect', 'targetDomain']}>
                <Input placeholder="请输入验证后重定向到的域名（如：https://example.com）" />
              </Form.Item>
            </div>
            
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <Text strong>需验证的域名列表</Text>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  size="small"
                  onClick={() => setRedirectDomainModalVisible(true)}
                >
                  添加域名
                </Button>
              </div>
              <Form.Item name={['domainRedirect', 'redirectDomains']}>
                <Select mode="tags" placeholder="请输入或选择需验证的域名">
                  {initialConfig?.domainRedirect?.redirectDomains?.map(domain => (
                    <Option key={domain} value={domain}>{domain}</Option>
                  ))}
                </Select>
              </Form.Item>
              <Text type="secondary" className="block mt-1">
                这些域名的请求将被重定向到验证页面，验证通过后跳转到目标域名。
              </Text>
            </div>
            
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <Text strong>排除的路径列表</Text>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  size="small"
                  onClick={() => setRedirectPathModalVisible(true)}
                >
                  添加路径
                </Button>
              </div>
              <Form.Item name={['domainRedirect', 'excludePaths']}>
                <Select mode="tags" placeholder="请输入或选择不进行跳转的路径">
                  {initialConfig?.domainRedirect?.excludePaths?.map(path => (
                    <Option key={path} value={path}>{path}</Option>
                  ))}
                </Select>
              </Form.Item>
              <Text type="secondary" className="block mt-1">
                这些路径的请求将不会进行域名跳转，保持原域名访问。
              </Text>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <Button type="primary" icon={<SaveOutlined />} onClick={saveConfig} loading={loading}>
              保存配置
            </Button>
          </div>
        </Form>
      </Card>
      
      {/* 添加白名单项模态框 */}
      <Modal
        title={`添加${currentWhitelistType === 'userAgents' ? 'User-Agent' : 'IP地址'}白名单`}
        open={whitelistModalVisible}
        onOk={addWhitelistItem}
        onCancel={() => setWhitelistModalVisible(false)}
        okText="确定"
        cancelText="取消"
      >
        <Input
          value={whitelistItem}
          onChange={(e) => setWhitelistItem(e.target.value)}
          placeholder={`请输入${currentWhitelistType === 'userAgents' ? 'User-Agent' : 'IP地址'}`}
          className="mt-2"
          autoFocus
        />
      </Modal>
      
      {/* 添加重定向域名模态框 */}
      <Modal
        title="添加需验证的域名"
        open={redirectDomainModalVisible}
        onOk={handleAddRedirectDomain}
        onCancel={() => setRedirectDomainModalVisible(false)}
        okText="确定"
        cancelText="取消"
      >
        <Input
          value={redirectDomain}
          onChange={(e) => setRedirectDomain(e.target.value)}
          placeholder="请输入需验证的域名（如：http://verify.example.com）"
          className="mt-2"
          autoFocus
        />
      </Modal>
      
      {/* 添加排除路径模态框 */}
      <Modal
        title="添加排除的路径"
        open={redirectPathModalVisible}
        onOk={handleAddRedirectPath}
        onCancel={() => setRedirectPathModalVisible(false)}
        okText="确定"
        cancelText="取消"
      >
        <Input
          value={redirectPath}
          onChange={(e) => setRedirectPath(e.target.value)}
          placeholder="请输入不进行跳转的路径（如：/api）"
          className="mt-2"
          autoFocus
        />
      </Modal>
    </div>
  );
};

export default Configuration;