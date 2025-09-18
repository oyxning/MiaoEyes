import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout, Typography, Avatar, Tooltip } from 'antd';
import { PieChartOutlined, SettingOutlined, LockOutlined, UserOutlined, BookOutlined, CodeOutlined } from '@ant-design/icons';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Verification from './pages/Verification';
import Configuration from './pages/Configuration';
import About from './pages/About';
import Documentation from './pages/Documentation';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;

const App = () => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  return (
    <Layout className="min-h-screen">
      <Header className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-800 px-6 shadow-md">
        <div className="flex items-center">
          <LockOutlined className="text-white mr-2" style={{ fontSize: '24px' }} />
          <Title level={3} className="m-0 text-white">MiaoEyes</Title>
        </div>
        <div className="flex items-center space-x-4">
          <Text className="text-white">Web爬虫防火墙</Text>
          <Tooltip title="管理员">
            <Avatar icon={<UserOutlined />} className="bg-white text-blue-700" />
          </Tooltip>
        </div>
      </Header>
      <Layout>
        <Sider
          width={220}
          theme="light"
          collapsible
          collapsed={collapsed}
          onCollapse={toggleCollapsed}
          className="border-r bg-white shadow-sm"
          style={{ minHeight: 'calc(100vh - 64px)' }}
        >
          <Sidebar collapsed={collapsed} />
        </Sider>
        <Layout className="p-6 bg-gray-50">
          <Content className="bg-white p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/verification" element={<Verification />} />
              <Route path="/configuration" element={<Configuration />} />
              <Route path="/documentation" element={<Documentation />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </Layout>
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 1000,
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    }}>
      <img 
        src="/miaoeyes.png" 
        alt="MiaoEyes 看板娘"
        style={{ 
          width: '120px', 
          height: 'auto',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        }}
        onClick={() => window.alert('欢迎使用 MiaoEyes Web爬虫防火墙！')}
      />
    </div>
  );
};

export default App;