import React from 'react';
import { Menu } from 'antd';
import { PieChartOutlined, SettingOutlined, LockOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const Sidebar = ({ collapsed }) => {
  return (
    <Menu
      mode="inline"
      defaultSelectedKeys={['dashboard']}
      className="h-full border-r-0"
    >
      <Menu.Item
        key="dashboard"
        icon={<PieChartOutlined />}
        className="mt-4"
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
        key="about"
        icon={<InfoCircleOutlined />}
      >
        <Link to="/about">关于我们</Link>
      </Menu.Item>
    </Menu>
  );
};

export default Sidebar;