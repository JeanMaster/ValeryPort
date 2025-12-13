import { useState } from 'react';
import { Card, Table, Button, Input, Tag, Typography, Statistic, Row, Col, Space } from 'antd';
import { PlusOutlined, ReloadOutlined, SearchOutlined, DollarOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { expensesApi, type Expense } from '../../services/expensesApi';
import { CreateExpenseModal } from './components/CreateExpenseModal';
import { usePOSStore } from '../../store/posStore';
import { formatVenezuelanPrice } from '../../utils/formatters';

const { Title } = Typography;

export const ExpensesPage = () => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const { primaryCurrency } = usePOSStore();

    const { data: expenses = [], isLoading, refetch } = useQuery({
        queryKey: ['expenses'],
        queryFn: expensesApi.getAll
    });

    // Defensive check to ensure expenses is an array
    const safeExpenses = Array.isArray(expenses) ? expenses : [];

    const filteredExpenses = safeExpenses.filter(expense =>
        expense.description.toLowerCase().includes(searchText.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchText.toLowerCase())
    );

    // Calculate totals
    const totalToday = filteredExpenses
        .filter(e => dayjs(e.date).isSame(dayjs(), 'day'))
        .reduce((sum, e) => sum + Number(e.amount), 0);

    const totalMonth = filteredExpenses
        .filter(e => dayjs(e.date).isSame(dayjs(), 'month'))
        .reduce((sum, e) => sum + Number(e.amount), 0);

    const columns = [
        {
            title: 'Fecha',
            dataIndex: 'date',
            key: 'date',
            render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
            sorter: (a: Expense, b: Expense) => dayjs(a.date).unix() - dayjs(b.date).unix(),
        },
        {
            title: 'Descripción',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Categoría',
            dataIndex: 'category',
            key: 'category',
            render: (category: string) => <Tag color="blue">{category}</Tag>,
            filters: Array.from(new Set(expenses.map(e => e.category))).map(c => ({ text: c, value: c })),
            onFilter: (value: any, record: Expense) => record.category === value,
        },
        {
            title: 'Monto',
            dataIndex: 'amount',
            key: 'amount',
            align: 'right' as const,
            render: (amount: number) => (
                <Typography.Text strong style={{ color: '#cf1322' }}>
                    {formatVenezuelanPrice(amount, primaryCurrency?.symbol)}
                </Typography.Text>
            ),
        },
        {
            title: 'Método',
            dataIndex: 'paymentMethod',
            key: 'paymentMethod',
            render: (method: string) => {
                const methodMap: Record<string, string> = {
                    'CASH': 'Efectivo',
                    'TRANSFER': 'Transferencia',
                    'PAGO_MOVIL': 'Pago Móvil',
                    'DEBIT': 'Débito',
                    'CREDIT': 'Crédito',
                    'ZELLE': 'Zelle'
                };
                return methodMap[method] || method;
            }
        },
        {
            title: 'Ref.',
            dataIndex: 'reference',
            key: 'reference',
        }
    ];

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: 24 }}>
                <Title level={2}>Gastos Operativos</Title>
                <Row gutter={16}>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Gastos de Hoy"
                                value={totalToday}
                                precision={2}
                                valueStyle={{ color: '#cf1322' }}
                                prefix={<DollarOutlined />}
                                suffix={primaryCurrency?.symbol}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Gastos del Mes"
                                value={totalMonth}
                                precision={2}
                                valueStyle={{ color: '#cf1322' }}
                                prefix={<DollarOutlined />}
                                suffix={primaryCurrency?.symbol}
                            />
                        </Card>
                    </Col>
                </Row>
            </div>

            <Card
                extra={
                    <Space>
                        <Input
                            placeholder="Buscar gastos..."
                            prefix={<SearchOutlined />}
                            onChange={e => setSearchText(e.target.value)}
                            style={{ width: 200 }}
                        />
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={() => refetch()}
                        />
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setIsCreateModalOpen(true)}
                            danger
                        >
                            Registrar Gasto
                        </Button>
                    </Space>
                }
            >
                <Table
                    columns={columns}
                    dataSource={filteredExpenses}
                    rowKey="id"
                    loading={isLoading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <CreateExpenseModal
                open={isCreateModalOpen}
                onCancel={() => setIsCreateModalOpen(false)}
            />
        </div>
    );
};
