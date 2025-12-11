import { useState } from 'react';
import {
    Card,
    Table,
    Button,
    Select,
    DatePicker,
    Space,
    Tag,
    Typography,
    Row,
    Col
} from 'antd';
import {
    PlusOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
    ReloadOutlined,
    ClearOutlined
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { inventoryAdjustmentsApi, type InventoryAdjustment } from '../../services/inventoryAdjustmentsApi';
import { productsApi } from '../../services/productsApi';
import dayjs from 'dayjs';
import { CreateAdjustmentModal } from './components/CreateAdjustmentModal';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const reasonLabels: Record<string, string> = {
    DAMAGE: '🔨 Daño',
    LOSS: '📉 Pérdida',
    ERROR: '❌ Error',
    INITIAL: '📦 Inicial',
    RETURN: '↩️ Devolución',
    TRANSFER: '↔️ Transferencia',
    OTHER: '📝 Otro'
};

export const InventoryAdjustmentsPage = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [filters, setFilters] = useState<any>({});

    const { data: adjustments = [], refetch } = useQuery({
        queryKey: ['inventory-adjustments', filters],
        queryFn: () => inventoryAdjustmentsApi.findAll(filters)
    });

    const { data: products = [] } = useQuery({
        queryKey: ['products-active'],
        queryFn: () => productsApi.getAll()
    });

    const handleFilterChange = (key: string, value: any) => {
        setFilters((prev: any) => ({
            ...prev,
            [key]: value
        }));
    };

    const handleDateRangeChange = (dates: any) => {
        if (dates) {
            setFilters((prev: any) => ({
                ...prev,
                startDate: dates[0].format('YYYY-MM-DD'),
                endDate: dates[1].format('YYYY-MM-DD')
            }));
        } else {
            setFilters((prev: any) => {
                const { startDate, endDate, ...rest } = prev;
                return rest;
            });
        }
    };

    const handleClearFilters = () => {
        setFilters({});
    };

    const columns = [
        {
            title: 'Fecha',
            dataIndex: 'createdAt',
            key: 'date',
            width: 150,
            render: (date: string) => (
                <div>
                    <div><strong>{dayjs(date).format('DD/MM/YYYY')}</strong></div>
                    <div style={{ fontSize: 11, color: '#888' }}>
                        {dayjs(date).format('HH:mm')}
                    </div>
                </div>
            )
        },
        {
            title: 'Producto',
            key: 'product',
            render: (_: any, record: InventoryAdjustment) => (
                <div>
                    <div><strong>{record.product.name}</strong></div>
                    <div style={{ fontSize: 11, color: '#888' }}>{record.product.sku}</div>
                </div>
            )
        },
        {
            title: 'Tipo',
            dataIndex: 'type',
            key: 'type',
            width: 120,
            align: 'center' as const,
            render: (type: string) => {
                const isIncrease = type === 'INCREASE';
                return (
                    <Tag
                        icon={isIncrease ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                        color={isIncrease ? 'success' : 'error'}
                    >
                        {isIncrease ? 'Incremento' : 'Decremento'}
                    </Tag>
                );
            }
        },
        {
            title: 'Cantidad',
            dataIndex: 'quantity',
            key: 'quantity',
            width: 100,
            align: 'right' as const,
            render: (quantity: number, record: InventoryAdjustment) => {
                const isIncrease = record.type === 'INCREASE';
                return (
                    <Text strong style={{ color: isIncrease ? '#52c41a' : '#ff4d4f' }}>
                        {isIncrease ? '+' : '-'}{quantity}
                    </Text>
                );
            }
        },
        {
            title: 'Stock',
            key: 'stock',
            width: 120,
            align: 'center' as const,
            render: (_: any, record: InventoryAdjustment) => (
                <div>
                    <span style={{ color: '#888' }}>{record.previousStock}</span>
                    {' → '}
                    <strong style={{ color: '#1890ff' }}>{record.newStock}</strong>
                </div>
            )
        },
        {
            title: 'Razón',
            dataIndex: 'reason',
            key: 'reason',
            width: 120,
            render: (reason: string) => (
                <Tag>{reasonLabels[reason] || reason}</Tag>
            )
        },
        {
            title: 'Notas',
            dataIndex: 'notes',
            key: 'notes',
            ellipsis: true,
            render: (notes: string) => notes || '-'
        },
        {
            title: 'Realizado por',
            dataIndex: 'performedBy',
            key: 'performedBy',
            width: 120
        }
    ];

    return (
        <div style={{ padding: 24 }}>
            <Title level={2}>📦 Ajustes de Inventario</Title>

            <Card style={{ marginBottom: 16 }}>
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={6}>
                        <Select
                            placeholder="Filtrar por producto"
                            showSearch
                            allowClear
                            style={{ width: '100%' }}
                            optionFilterProp="children"
                            value={filters.productId}
                            onChange={(value) => handleFilterChange('productId', value)}
                            options={products.map(p => ({
                                label: `${p.name} (${p.sku})`,
                                value: p.id
                            }))}
                        />
                    </Col>
                    <Col xs={24} sm={12} md={4}>
                        <Select
                            placeholder="Tipo"
                            allowClear
                            style={{ width: '100%' }}
                            value={filters.type}
                            onChange={(value) => handleFilterChange('type', value)}
                        >
                            <Select.Option value="INCREASE">↑ Incremento</Select.Option>
                            <Select.Option value="DECREASE">↓ Decremento</Select.Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={5}>
                        <Select
                            placeholder="Razón"
                            allowClear
                            style={{ width: '100%' }}
                            value={filters.reason}
                            onChange={(value) => handleFilterChange('reason', value)}
                        >
                            {Object.entries(reasonLabels).map(([key, label]) => (
                                <Select.Option key={key} value={key}>
                                    {label}
                                </Select.Option>
                            ))}
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <RangePicker
                            style={{ width: '100%' }}
                            format="DD/MM/YYYY"
                            onChange={handleDateRangeChange}
                        />
                    </Col>
                    <Col xs={24} sm={24} md={3}>
                        <Space>
                            <Button
                                icon={<ClearOutlined />}
                                onClick={handleClearFilters}
                            >
                                Limpiar
                            </Button>
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={() => refetch()}
                            />
                        </Space>
                    </Col>
                </Row>
            </Card>

            <Card
                title="Historial de Ajustes"
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setIsModalVisible(true)}
                    >
                        Nuevo Ajuste
                    </Button>
                }
            >
                <Table
                    dataSource={adjustments}
                    columns={columns}
                    rowKey="id"
                    pagination={{
                        pageSize: 15,
                        showTotal: (total) => `Total: ${total} ajustes`
                    }}
                />
            </Card>

            <CreateAdjustmentModal
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onSuccess={() => {
                    setIsModalVisible(false);
                    refetch();
                }}
            />
        </div>
    );
};
