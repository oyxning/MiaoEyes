import React from 'react';
import { Card, Typography, List, Divider } from 'antd';
import { LockOutlined, GithubOutlined, CodeOutlined, BookOutlined, MessageOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Item } = List;

const About = () => {
  return (
    <div>
      <Title level={4} className="mb-6">关于MiaoEyes</Title>
      
      <Card title="项目介绍" className="mb-6">
        <div className="flex items-center mb-4">
          <LockOutlined className="text-blue-600 mr-3" style={{ fontSize: '2rem' }} />
          <div>
            <Title level={3} className="mb-1">MiaoEyes</Title>
            <Text type="secondary">v1.0.0 | 开源人机验证服务</Text>
          </div>
        </div>
        
        <Paragraph>
          MiaoEyes是一款类似于Anubis的Web AI防火墙工具，用于识别和阻止AI爬虫等自动化程序的访问。
          它通过提供多种验证挑战，帮助网站保护其资源不被大规模的自动化请求所消耗。
        </Paragraph>
        
        <Paragraph>
          本项目致力于帮助小型网站和社区抵抗来自AI公司的无限制爬虫访问，同时保持尽可能轻量级的设计，
          确保任何人都能够负担得起保护自己社区的成本。
        </Paragraph>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="功能特性">
          <List
            dataSource={[
              '多种验证挑战类型：验证码、拼图、隐形验证',
              '可配置的验证难度和超时时间',
              '完善的速率限制机制',
              '灵活的白名单系统：支持User-Agent和IP地址白名单',
              '实时统计和监控仪表盘',
              '易于集成的API和JavaScript SDK',
              '完全可配置的Web管理界面'
            ]}
            renderItem={(item, index) => (
              <Item>
                <Text>{index + 1}. {item}</Text>
              </Item>
            )}
          />
        </Card>
        
        <Card title="技术栈">
          <List
            dataSource={[
              '后端：Node.js + Express',
              '前端：React + Ant Design',
              '数据可视化：Chart.js + react-chartjs-2',
              '状态管理：React Hooks',
              '路由：React Router',
              '构建工具：Vite',
              '认证：JWT (JSON Web Token)'
            ]}
            renderItem={(item, index) => (
              <Item>
                <Text>{index + 1}. {item}</Text>
              </Item>
            )}
          />
        </Card>
      </div>
      
      <Divider className="my-6" />
      
      <Card title="使用说明">
        <div className="space-y-4">
          <div>
            <Title level={5}>1. 快速开始</Title>
            <Paragraph>
              安装依赖：
              <code className="bg-gray-100 px-2 py-1 rounded">npm install</code>
              <br />
              启动开发服务器：
              <code className="bg-gray-100 px-2 py-1 rounded">npm run dev</code>
              <br />
              构建生产版本：
              <code className="bg-gray-100 px-2 py-1 rounded">npm run build</code>
            </Paragraph>
          </div>
          
          <div>
            <Title level={5}>2. 配置环境变量</Title>
            <Paragraph>
              在项目根目录创建 <code className="bg-gray-100 px-2 py-1 rounded">config/.env</code> 文件，配置以下变量：
              <pre className="bg-gray-100 p-3 rounded mt-2">
                PORT=3000<br />
                JWT_SECRET=your_secret_key
              </pre>
            </Paragraph>
          </div>
          
          <div>
            <Title level={5}>3. 集成到您的网站</Title>
            <Paragraph>
              可以通过两种方式集成MiaoEyes：
              <ol className="list-decimal pl-6 mt-2">
                <li>使用提供的JavaScript SDK，直接在HTML中添加几行代码</li>
                <li>通过API调用，自行实现验证流程</li>
              </ol>
              详细的集成文档请参考验证服务页面。
            </Paragraph>
          </div>
        </div>
      </Card>
      
      <Divider className="my-6" />
      
      <Card title="开源与贡献">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="mb-4 md:mb-0">
            <Text>MiaoEyes是一个开源项目，欢迎社区贡献和反馈。</Text>
          </div>
          <div className="flex space-x-4">
            <a href="#" className="text-blue-600 flex items-center">
              <GithubOutlined className="mr-1" /> GitHub
            </a>
            <a href="#" className="text-blue-600 flex items-center">
              <BookOutlined className="mr-1" /> 文档
            </a>
            <a href="#" className="text-blue-600 flex items-center">
              <MessageOutlined className="mr-1" /> 反馈
            </a>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default About;