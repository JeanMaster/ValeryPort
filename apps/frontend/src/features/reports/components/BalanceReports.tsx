import { Card, Table, Statistic, Row, Col, Typography, Tag, Space, Spin, Empty } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { statsApi, type BalanceEntry } from '../../../services/statsApi';
import { formatVenezuelanPrice } from '../../../utils/formatters';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { ArrowUpOutlined, ArrowDownOutlined, AccountBookOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export const BalanceReports = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['balanceReport'],
        queryFn: statsApi.getBalanceReport,
    });

    if (isLoading) return <div style={{ padding: 50, textAlign: 'center' }}><Spin size="large" /></div>;
    if (error || !data) return <Empty description="Error al cargar el balance" />;

    const totalIncome = data.reduce((sum, item) => sum + item.income, 0);
    const totalExpenses = data.reduce((sum, item) => sum + item.expenses, 0);
    const netBalance = totalIncome - totalExpenses;

    const columns = [
        {
            title: 'Mes',
            dataIndex: 'month',
            key: 'month',
            render: (text: string) => <Text strong>{text}</Text>,
        },
        {
            title: 'Ingresos (Ventas)',
            dataIndex: 'income',
            key: 'income',
            render: (val: number) => <Text style={{ color: '#52c41a' }}>{formatVenezuelanPrice(val)}</Text>,
            align: 'right' as const,
        },
        {
            title: 'Egresos (Gastos + Compras)',
            dataIndex: 'expenses',
            key: 'expenses',
            render: (val: number) => <Text style={{ color: '#ff4d4f' }}>{formatVenezuelanPrice(val)}</Text>,
            align: 'right' as const,
        },
        {
            title: 'Balance Neto',
            dataIndex: 'total',
            key: 'total',
            render: (val: number) => (
                <Tag color={val >= 0 ? 'green' : 'red'} style={{ fontSize: '14px', padding: '4px 8px' }}>
                    {formatVenezuelanPrice(val)}
                </Tag>
            ),
            align: 'right' as const,
        },
    ];

    return (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Row gutter={16}>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Ingresos Totales (12m)"
                            value={totalIncome}
                            precision={2}
                            prefix="Bs."
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Egresos Totales (12m)"
                            value={totalExpenses}
                            precision={2}
                            prefix="Bs."
                            valueStyle={{ color: '#ff4d4f' }}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Utilidad Neta Acumulada"
                            value={netBalance}
                            precision={2}
                            prefix="Bs."
                            valueStyle={{ color: netBalance >= 0 ? '#1890ff' : '#cf1322' }}
                            suffix={netBalance >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            <Card title="Gráfico de Salud Financiera (Ingresos vs Egresos)">
                <div style={{ height: 350 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip formatter={(value: number) => formatVenezuelanPrice(value)} />
                            <Legend />
                            <Bar name="Ingresos" dataKey="income" fill="#52c41a" radius={[4, 4, 0, 0]} />
                            <Bar name="Egresos" dataKey="expenses" fill="#ff4d4f" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            <Card title="Detalle Mensual de Balance">
                <Table
                    dataSource={data}
                    columns={columns}
                    pagination={false}
                    rowKey="month"
                    summary={(pageData) => {
                        let totalIncome = 0;
                        let totalExpenses = 0;

                        pageData.forEach(({ income, expenses }) => {
                            totalIncome += income;
                            totalExpenses += expenses;
                        });

                        return (
                            <Table.Summary fixed>
                                <Table.Summary.Row>
                                    <Table.Summary.Cell index={0}><Text strong>TOTAL ANUAL</Text></Table.Summary.Cell>
                                    <Table.Summary.Cell index={1} align="right">
                                        <Text strong style={{ color: '#52c41a' }}>{formatVenezuelanPrice(totalIncome)}</Text>
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={2} align="right">
                                        <Text strong style={{ color: '#ff4d4f' }}>{formatVenezuelanPrice(totalExpenses)}</Text>
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={3} align="right">
                                        <Text strong style={{ color: (totalIncome - totalExpenses) >= 0 ? '#1890ff' : '#cf1322' }}>
                                            {formatVenezuelanPrice(totalIncome - totalExpenses)}
                                        </Text>
                                    </Table.Summary.Cell>
                                </Table.Summary.Row>
                            </Table.Summary>
                        );
                    }}
                />
            </Card>
        </Space>
    );
};
