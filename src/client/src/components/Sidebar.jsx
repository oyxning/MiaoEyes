import React from 'react';
import { Menu, Typography } from 'antd';
import { PieChartOutlined, SettingOutlined, LockOutlined, InfoCircleOutlined, BookOutlined, CodeOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title } = Typography;

const Sidebar = ({ collapsed }) => {
  return (
    <Menu
      mode="inline"
      defaultSelectedKeys={['dashboard']}
      className="h-full border-r-0"
      style={{ padding: '16px 0' }}
    >
      {!collapsed && (
        <div className="px-4 py-2 mb-4">
          <Title level={5} className="m-0 text-blue-700">功能菜单</Title>
        </div>
      )}
      <Menu.Item
        key="dashboard"
        icon={<PieChartOutlined />}
        className="mt-2"
      >
        <Link to="/">仪表盘</Link>
      </Menu.Item>
      <Menu.Item
        key="verification"
        icon={<LockOutlined />}
      >
        <Link to="/verification">验证服务</Link>
      </Menu.Item>
      <Menu.Item
        key="configuration"
        icon={<SettingOutlined />}
      >
        <Link to="/configuration">配置管理</Link>
      </Menu.Item>
      <Menu.Item
        key="documentation"
        icon={<BookOutlined />}
      >
        <Link to="/documentation">文档中心</Link>
      </Menu.Item>
      <Menu.Item
        key="about"
        icon={<InfoCircleOutlined />}
      >
        <Link to="/about">关于我们</Link>
      </Menu.Item>
    </Menu>
  );
};

export default Sidebar;