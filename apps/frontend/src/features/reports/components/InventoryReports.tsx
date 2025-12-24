import { useEffect, useState } from 'react';
import { Card, Table, Spin, Empty, Row, Col, Statistic, Tooltip } from 'antd';
import { ShopOutlined, DollarOutlined, WarningOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { statsApi, type InventoryReport } from '../../../services/statsApi';
import { currenciesApi } from '../../../services/currenciesApi';
import { useQuery } from '@tanstack/react-query';
import { formatVenezuelanPrice, formatVenezuelanPriceOnly } from '../../../utils/formatters';

export const InventoryReports = () => {
    const [report, setReport] = useState<InventoryReport | null>(null);
    const [loading, setLoading] = useState(true);

    const { data: currencies = [] } = useQuery({
        queryKey: ['currencies'],
        queryFn: () => currenciesApi.getAll(),
    });

    useEffect(() => {
        fetchReport();
    }, []);

    const fetchReport = async () => {
        try {
            setLoading(true);
            const data = await statsApi.getInventoryReport();
            setReport(data);
        } catch (error) {
            console.error('Error fetching inventory report:', error);
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
        return <Empty description="Error al cargar reporte de inventario" />;
    }

    const deptColumns = [
        {
            title: 'Departamento',
            dataIndex: 'department',
            key: 'department',
        },
        {
            title: 'Unidades',
            dataIndex: 'units',
            key: 'units',
            align: 'right' as const,
        },
        {
            title: 'Valor Total',
            dataIndex: 'value',
            key: 'value',
            align: 'right' as const,
            render: (value: number) => `Bs. ${formatVenezuelanPrice(value)}`,
        },
    ];

    const lowStockColumns = [
        {
            title: 'Producto',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Categoría',
            dataIndex: ['category', 'name'],
            key: 'category',
        },
        {
            title: 'Stock Actual',
            dataIndex: 'stock',
            key: 'stock',
            align: 'right' as const,
            render: (stock: number) => (
                <span style={{ color: stock === 0 ? '#ff4d4f' : '#faad14' }}>
                    {stock}
                </span>
            ),
        },
    ];

    return (
        <div>
            {/* Summary Cards */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} lg={8}>
                    <Card>
                        <Tooltip
                            title={
                                <div>
                                    <div style={{ marginBottom: 4, fontWeight: 'bold' }}>Valor en otras monedas:</div>
                                    {currencies
                                        .filter(c => !c.isPrimary)
                                        .map(c => {
                                            const val = report.totalInventoryValue / Number(c.exchangeRate || 1);
                                            return (
                                                <div key={c.code}>
                                                    {c.symbol} {formatVenezuelanPriceOnly(val)}
                                                </div>
                                            );
                                        })}
                                </div>
                            }
                        >
                            <div style={{ cursor: 'help' }}>
                                <Statistic
                                    title={
                                        <span>
                                            Valor Total de Inventario <InfoCircleOutlined style={{ fontSize: 12, marginLeft: 4 }} />
                                        </span>
                                    }
                                    value={report.totalInventoryValue}
                                    precision={2}
                                    prefix="Bs."
                                    valueStyle={{ color: '#1890ff' }}
                                    suffix={<DollarOutlined />}
                                />
                            </div>
                        </Tooltip>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                    <Card>
                        <Statistic
                            title="Departamentos"
                            value={report.stockByDepartment.length}
                            valueStyle={{ color: '#52c41a' }}
                            suffix={<ShopOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                    <Card>
                        <Statistic
                            title="Productos con Stock Bajo"
                            value={report.lowStockProducts.length}
                            valueStyle={{ color: '#faad14' }}
                            suffix={<WarningOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Stock by Department */}
            <Card title="Stock por Departamento" style={{ marginBottom: 16 }}>
                <Table
                    dataSource={report.stockByDepartment}
                    columns={deptColumns}
                    rowKey="department"
                    pagination={false}
                />
            </Card>

            {/* Low Stock Products */}
            <Card title="Productos con Stock Bajo">
                <Table
                    dataSource={report.lowStockProducts}
                    columns={lowStockColumns}
                    rowKey="name"
                    pagination={{ pageSize: 10 }}
                />
            </Card>
        </div>
    );
};