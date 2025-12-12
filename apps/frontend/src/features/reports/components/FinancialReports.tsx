import { useEffect, useState } from 'react';
import { Card, Spin, Empty, Row, Col, Statistic } from 'antd';
import {
    DollarOutlined,
    ShoppingOutlined,
    RiseOutlined,
    CreditCardOutlined,
} from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { statsApi, type FinanceReport } from '../../../services/statsApi';
import { formatVenezuelanPrice } from '../../../utils/formatters';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const FinancialReports = () => {
    const [report, setReport] = useState<FinanceReport | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReport();
    }, []);

    const fetchReport = async () => {
        try {
            setLoading(true);
            const data = await statsApi.getFinanceReport();
            setReport(data);
        } catch (error) {
            console.error('Error fetching finance report:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: 24, textAlign: 'center' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!report) {
        return <Empty description="Error al cargar reporte financiero" />;
    }

    const cashFlow = report.monthlySalesTotal - report.monthlyPurchasesTotal;
    const paymentData = report.paymentMethodsBreakdown.map((item) => ({
        name: item.method,
        value: item.amount,
    }));

    // Map payment method to friendly name, icon and color
    const getPaymentMethodInfo = (method: string) => {
        // Handle currency-based payments (format: CURRENCY_xyz)
        if (method.startsWith('CURRENCY_')) {
            const currencyCode = method.replace('CURRENCY_', '').toUpperCase();
            const currencyMap: Record<string, { name: string; symbol: string; color: string; bgColor: string }> = {
                DLR: { name: 'Dólares', symbol: '$', color: '#52c41a', bgColor: '#f6ffed' },
                USD: { name: 'Dólares', symbol: '$', color: '#52c41a', bgColor: '#f6ffed' },
                EUR: { name: 'Euros', symbol: '€', color: '#1890ff', bgColor: '#e6f7ff' },
                COP: { name: 'Pesos Colombianos', symbol: 'COL$', color: '#faad14', bgColor: '#fffbe6' },
                VES: { name: 'Bolívares', symbol: 'Bs.', color: '#722ed1', bgColor: '#f9f0ff' },
                BRL: { name: 'Reales', symbol: 'R$', color: '#13c2c2', bgColor: '#e6fffb' },
            };
            const currency = currencyMap[currencyCode] || {
                name: currencyCode,
                symbol: currencyCode,
                color: '#8c8c8c',
                bgColor: '#fafafa'
            };
            return {
                displayName: currency.name,
                icon: currency.symbol,
                color: currency.color,
                bgColor: currency.bgColor,
            };
        }

        // Standard payment methods
        const standardMethods: Record<string, { displayName: string; icon: string; color: string; bgColor: string }> = {
            CASH: { displayName: 'Efectivo (Bs.)', icon: '💵', color: '#52c41a', bgColor: '#f6ffed' },
            DEBIT: { displayName: 'Débito', icon: '💳', color: '#1890ff', bgColor: '#e6f7ff' },
            CREDIT: { displayName: 'Crédito', icon: '💳', color: '#722ed1', bgColor: '#f9f0ff' },
            TRANSFER: { displayName: 'Transferencia', icon: '🏦', color: '#fa8c16', bgColor: '#fff7e6' },
            MOBILE: { displayName: 'Pago Móvil', icon: '📱', color: '#eb2f96', bgColor: '#fff0f6' },
            ZELLE: { displayName: 'Zelle', icon: '💸', color: '#722ed1', bgColor: '#f9f0ff' },
        };

        return standardMethods[method] || {
            displayName: method,
            icon: '💰',
            color: '#8c8c8c',
            bgColor: '#fafafa'
        };
    };

    return (
        <div>
            {/* Summary Cards */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Ventas del Mes"
                            value={report.monthlySalesTotal}
                            precision={2}
                            prefix="Bs."
                            valueStyle={{ color: '#52c41a' }}
                            suffix={<DollarOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Compras del Mes"
                            value={report.monthlyPurchasesTotal}
                            precision={2}
                            prefix="Bs."
                            valueStyle={{ color: '#ff4d4f' }}
                            suffix={<ShoppingOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Flujo de Caja"
                            value={cashFlow}
                            precision={2}
                            prefix="Bs."
                            valueStyle={{ color: cashFlow >= 0 ? '#52c41a' : '#ff4d4f' }}
                            suffix={<RiseOutlined />}
                        />
                        <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                            Ventas - Compras
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Métodos de Pago"
                            value={report.paymentMethodsBreakdown.length}
                            valueStyle={{ color: '#1890ff' }}
                            suffix={<CreditCardOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Charts */}
            <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col xs={24} lg={14}>
                    <Card title="Ventas Diarias del Mes">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={report.dailySalesData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip
                                    formatter={(value: number) => formatVenezuelanPrice(value)}
                                />
                                <Bar dataKey="amount" fill="#1890ff" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col xs={24} lg={10}>
                    <Card title="Distribución por Método de Pago">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={paymentData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={(entry) => `${entry.name}: ${((entry.value / report.monthlySalesTotal) * 100).toFixed(1)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {paymentData.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: number) => formatVenezuelanPrice(value)}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>

            {/* Payment Methods Cards */}
            <Card title="Desglose de Métodos de Pago">
                <Row gutter={[16, 16]}>
                    {report.paymentMethodsBreakdown.map((payment) => {
                        const info = getPaymentMethodInfo(payment.method);
                        const percentage = ((payment.amount / report.monthlySalesTotal) * 100).toFixed(1);

                        return (
                            <Col xs={24} sm={12} lg={8} key={payment.method}>
                                <Card
                                    style={{
                                        borderLeft: `4px solid ${info.color}`,
                                        backgroundColor: info.bgColor,
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                        transition: 'all 0.3s ease',
                                    }}
                                    hoverable
                                    bodyStyle={{ padding: 16 }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{
                                                fontSize: 14,
                                                fontWeight: 500,
                                                marginBottom: 8,
                                                color: info.color,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 8
                                            }}>
                                                <span style={{ fontSize: 20 }}>{info.icon}</span>
                                                {info.displayName}
                                            </div>
                                            <div style={{ fontSize: 22, fontWeight: 'bold', color: '#262626', marginBottom: 4 }}>
                                                Bs. {formatVenezuelanPrice(payment.amount)}
                                            </div>
                                            <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                                                {percentage}% del total
                                            </div>
                                        </div>
                                        <div style={{
                                            fontSize: 28,
                                            fontWeight: 'bold',
                                            color: info.color,
                                            opacity: 0.3,
                                            marginLeft: 12
                                        }}>
                                            {percentage}%
                                        </div>
                                    </div>
                                </Card>
                            </Col>
                        );
                    })}
                </Row>
            </Card>
        </div>
    );
};