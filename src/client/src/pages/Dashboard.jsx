import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Typography, Progress, Spin } from 'antd';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';

const { Title, Text } = Typography;
const { Meta } = Card;

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 模拟数据，用于初始展示
  const mockStats = {
    totalRequests: 1250,
    verifiedRequests: 980,
    failedRequests: 270,
    successRate: 78.4,
    activeToday: {
      total: 320,
      verified: 250,
      failed: 70
    },
    hourlyStats: {
      '2023-09-18T00:00': { total: 45, verified: 35, failed: 10 },
      '2023-09-18T01:00': { total: 30, verified: 25, failed: 5 },
      '2023-09-18T02:00': { total: 20, verified: 18, failed: 2 },
      '2023-09309-18T03:00': { total: 15, verified: 12, failed: 3 },
      '2023-09-18T04:00': { total: 10, verified: 8, failed: 2 },
      '2023-09-18T05:00': { total: 15, verified: 10, failed: 5 },
      '2023-09-18T06:00': { total: 30, verified: 25, failed: 5 },
      '2023-09-18T07:00': { total: 50, verified: 42, failed: 8 },
      '2023-09-18T08:00': { total: 65, verified: 55, failed: 10 },
      '2023-09-18T09:00': { total: 80, verified: 68, failed: 12 },
      '2023-09-18T10:00': { total: 95, verified: 82, failed: 13 },
      '2023-09-18T11:00': { total: 110, verified: 95, failed: 15 }
    }
  };

  // 获取统计数据
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/stats');
        setStats(response.data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        setError('无法获取统计数据，使用模拟数据');
        // 使用模拟数据
        setStats(mockStats);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // 每分钟刷新一次数据
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  // 准备图表数据
  const prepareChartData = () => {
    if (!stats) return [];
    
    // 转换小时统计数据为图表格式
    return Object.entries(stats.hourlyStats)
      .map(([time, data]) => ({
        time: time.split('T')[1].substring(0, 5),
        total: data.total,
        verified: data.verified,
        failed: data.failed
      }))
      .slice(-12); // 显示最近12小时
  };

  // 准备饼图数据
  const preparePieData = () => {
    if (!stats) return [];
    
    return [
      { name: '验证成功', value: stats.verifiedRequests, color: '#52c41a' },
      { name: '验证失败', value: stats.failedRequests, color: '#ff4d4f' }
    ];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Title level={4} className="mb-6">仪表盘</Title>
      {error && <Text type="danger" className="mb-4">{error}</Text>}
      
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Meta title="总请求数" />
            <Statistic value={stats.totalRequests} suffix="次" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Meta title="今日请求" />
            <Statistic value={stats.activeToday.total} suffix="次" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Meta title="验证成功率" />
            <Statistic value={stats.successRate} suffix="%" precision={1} />
            <Progress percent={stats.successRate} strokeColor="#52c41a" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Meta title="验证分布" />
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={preparePieData()}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {preparePieData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]} className="mt-4">
        <Col span={24}>
          <Card title="最近12小时验证趋势" />
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={prepareChartData()}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="total" stackId="1" stroke="#8884d8" fill="#8884d8" />
                <Area type="monotone" dataKey="verified" stackId="2" stroke="#52c41a" fill="#52c41a" />
                <Area type="monotone" dataKey="failed" stackId="3" stroke="#ff4d4f" fill="#ff4d4f" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;