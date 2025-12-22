import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Button, Table, Spin, Empty, Segmented } from 'antd';
import {
    ShoppingCartOutlined,
    ShopOutlined,
    BankOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
    PlusOutlined,
    FileTextOutlined,
    WarningOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { statsApi, type DashboardStats } from '../services/statsApi';
import { formatVenezuelanPrice } from '../utils/formatters';

export const DashboardPage = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState('7days');

    useEffect(() => {
        fetchStats();
    }, [range]);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const data = await statsApi.getDashboardStats(range);
            setStats(data);
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const rangeLabels: Record<string, string> = {
        '7days': 'Últimos 7 días',
        '30days': 'Últimos 30 días',
        '1year': 'Último año',
        'all': 'Histórico total'
    };

    if (loading) {
        return (
            <div style={{ padding: 24, textAlign: 'center' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!stats) {
        return (
            <div style={{ padding: 24 }}>
                <Empty description="Error al cargar estadísticas" />
            </div>
        );
    }

    const monthChange = stats.thisMonthSales - stats.lastMonthSales;
    const monthChangePercent = stats.lastMonthSales
        ? ((monthChange / stats.lastMonthSales) * 100).toFixed(1)
        : 0;

    const topProductsColumns = [
        {
            title: 'Producto',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Unidades Vendidas',
            dataIndex: 'quantity',
            key: 'quantity',
            align: 'right' as const,
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <div style={{ marginBottom: 24 }}>
                <Row justify="space-between" align="middle">
                    <Col>
                        <h1 style={{ margin: 0, fontSize: 28 }}>📊 Dashboard</h1>
                        <p style={{ color: '#666', marginTop: 8 }}>
                            Resumen de tu negocio
                        </p>
                    </Col>
                    <Col>
                        <Segmented
                            options={[
                                { label: '7 Días', value: '7days' },
                                { label: '1 Mes', value: '30days' },
                                { label: '1 Año', value: '1year' },
                                { label: 'Todo', value: 'all' },
                            ]}
                            value={range}
                            onChange={(value) => setRange(value as string)}
                        />
                    </Col>
                </Row>
            </div>

            {/* KPI Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Ventas Hoy"
                            value={stats.todaySales}
                            precision={2}
                            prefix="Bs."
                            valueStyle={{ color: '#3f8600' }}
                            suffix={<ShoppingCartOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Ventas Este Mes"
                            value={stats.thisMonthSales}
                            precision={2}
                            prefix="Bs."
                            valueStyle={{ color: '#1890ff' }}
                            suffix={
                                monthChange >= 0 ? (
                                    <ArrowUpOutlined style={{ color: '#3f8600' }} />
                                ) : (
                                    <ArrowDownOutlined style={{ color: '#cf1322' }} />
                                )
                            }
                        />
                        <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                            {monthChange >= 0 ? '+' : ''}
                            {monthChangePercent}% vs mes anterior
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Balance de Caja"
                            value={stats.cashBalance}
                            precision={2}
                            prefix="Bs."
                            valueStyle={{ color: '#722ed1' }}
                            suffix={<BankOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card style={{ borderColor: stats.criticalStock > 0 ? '#faad14' : undefined }}>
                        <Statistic
                            title="Stock Crítico"
                            value={stats.criticalStock}
                            suffix={`/ ${stats.totalProducts}`}
                            valueStyle={{ color: stats.criticalStock > 0 ? '#faad14' : '#52c41a' }}
                            prefix={stats.criticalStock > 0 ? <WarningOutlined /> : <ShopOutlined />}
                        />
                        <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                            Productos totales
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Charts and Tables */}
            <Row gutter={[16, 16]}>
                {/* Sales Trend */}
                <Col xs={24} lg={16}>
                    <Card title={`Tendencia de Ventas (${rangeLabels[range]})`}>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={stats.salesTrend}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip
                                    formatter={(value: number) => formatVenezuelanPrice(value)}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="sales"
                                    stroke="#1890ff"
                                    strokeWidth={2}
                                    dot={{ fill: '#1890ff' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>

                {/* Top Products */}
                <Col xs={24} lg={8}>
                    <Card title="Top 5 Productos Más Vendidos">
                        <Table
                            dataSource={stats.topProducts}
                            columns={topProductsColumns}
                            pagination={false}
                            rowKey="name"
                            size="small"
                        />
                    </Card>
                </Col>
            </Row>

            {/* Quick Actions */}
            <Card title="Accesos Rápidos" style={{ marginTop: 16 }}>
                <Row gutter={16}>
                    <Col>
                        <Button
                            type="primary"
                            size="large"
                            icon={<ShoppingCartOutlined />}
                            onClick={() => navigate('/sales/pos')}
                        >
                            Punto de Venta
                        </Button>
                    </Col>
                    <Col>
                        <Button
                            size="large"
                            icon={<PlusOutlined />}
                            onClick={() => navigate('/purchases/history')}
                        >
                            Registrar Compra
                        </Button>
                    </Col>
                    <Col>
                        <Button
                            size="large"
                            icon={<FileTextOutlined />}
                            onClick={() => navigate('/reports')}
                        >
                            Ver Reportes
                        </Button>
                    </Col>
                </Row>
            </Card>
        </div>
    );
};
