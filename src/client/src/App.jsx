import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout, Typography, Avatar } from 'antd';
import { PieChartOutlined, SettingOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Verification from './pages/Verification';
import Configuration from './pages/Configuration';
import About from './pages/About';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;

const App = () => {
  const [collapsed, setCollapsed] = React.useState(false);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  return (
    <Layout className="min-h-screen">
      <Header className="flex items-center justify-between bg-white border-b px-6">
        <div className="flex items-center">
          <LockOutlined className="text-blue-600 mr-2" />
          <Title level={3} className="m-0">MiaoEyes</Title>
        </div>
        <div className="flex items-center space-x-4">
          <Text className="text-gray-600">人机验证服务</Text>
          <Avatar icon={<UserOutlined />} />
        </div>
      </Header>
      <Layout>
        <Sider
          width={200}
          theme="light"
          collapsible
          collapsed={collapsed}
          onCollapse={toggleCollapsed}
          className="border-r"
        >
          <Sidebar collapsed={collapsed} />
        </Sider>
        <Layout className="p-6">
          <Content className="bg-white p-6 rounded-lg shadow-sm">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/verification" element={<Verification />} />
              <Route path="/configuration" element={<Configuration />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default App;