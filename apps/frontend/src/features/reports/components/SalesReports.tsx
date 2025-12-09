import { useState } from 'react';
import {
    Card,
    Row,
    Col,
    DatePicker,
    Select,
    InputNumber,
    Button,
    Table,
    Statistic,
    Space,
    Typography,
    Tag,
    Spin,
    Alert
} from 'antd';
import {
    SearchOutlined,
    ReloadOutlined,
    DownloadOutlined,
    DollarOutlined,
    ShoppingOutlined
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { salesApi, type Sale, type SalesFilters } from '../../../services/salesApi';
import { productsApi } from '../../../services/productsApi';
import { clientsApi } from '../../../services/clientsApi';
import { formatVenezuelanPrice } from '../../../utils/formatters';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

export const SalesReports = () => {
    const [filters, setFilters] = useState<SalesFilters>({});
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

    // Fetch sales data with filters
    const { data: sales = [], isLoading, refetch } = useQuery({
        queryKey: ['sales-reports', filters],
        queryFn: () => salesApi.getWithFilters(filters),
        enabled: true
    });

    // Fetch reference data for filters
    const { data: products = [] } = useQuery({
        queryKey: ['products'],
        queryFn: () => productsApi.getAll(),
    });

    const { data: clients = [] } = useQuery({
        queryKey: ['clients'],
        queryFn: () => clientsApi.getAll(),
    });

    // Calculate summary statistics
    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + (sale.total || 0), 0);
    const totalDiscount = sales.reduce((sum, sale) => sum + (sale.discount || 0), 0);
    const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

    // Handle filter changes
    const handleDateRangeChange = (dates: any) => {
        setDateRange(dates);
        if (dates && dates.length === 2) {
            setFilters(prev => ({
                ...prev,
                startDate: dates[0].format('YYYY-MM-DD'),
                endDate: dates[1].format('YYYY-MM-DD')
            }));
        } else {
            setFilters(prev => ({
                ...prev,
                startDate: undefined,
                endDate: undefined
            }));
        }
    };

    const handleFilterChange = (key: keyof SalesFilters, value: any) => {
        setFilters(prev => ({
            ...prev,
            [key]: value || undefined
        }));
    };

    const handleResetFilters = () => {
        setFilters({});
        setDateRange(null);
    };

    // Table columns
    const columns = [
        {
            title: 'Fecha',
            dataIndex: 'date',
            key: 'date',
            width: 120,
            render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
            sorter: (a: Sale, b: Sale) => dayjs(a.date).unix() - dayjs(b.date).unix()
        },
        {
            title: 'Cliente',
            dataIndex: 'client',
            key: 'client',
            width: 200,
            render: (client: any) => client?.name || 'Cliente General',
            filters: clients.map(client => ({ text: client.name, value: client.id })),
            onFilter: (value: any, record: Sale) => record.clientId === value
        },
        {
            title: 'Productos',
            key: 'products',
            width: 200,
            render: (_: any, record: Sale) => (
                <div>
                    {record.items.slice(0, 2).map(item => (
                        <div key={item.id} style={{ fontSize: '12px' }}>
                            {item.product.name} x{item.quantity}
                        </div>
                    ))}
                    {record.items.length > 2 && (
                        <Text type="secondary" style={{ fontSize: '11px' }}>
                            +{record.items.length - 2} más...
                        </Text>
                    )}
                </div>
            )
        },
        {
            title: 'Subtotal',
            dataIndex: 'subtotal',
            key: 'subtotal',
            width: 120,
            align: 'right' as const,
            render: (value: number | null | undefined) => formatVenezuelanPrice(value || 0),
            sorter: (a: Sale, b: Sale) => (a.subtotal || 0) - (b.subtotal || 0)
        },
        {
            title: 'Descuento',
            dataIndex: 'discount',
            key: 'discount',
            width: 100,
            align: 'right' as const,
            render: (value: number | null | undefined) => (
                <span style={{ color: (value || 0) > 0 ? '#ff4d4f' : 'inherit' }}>
                    {(value || 0) > 0 ? `-${formatVenezuelanPrice(value || 0)}` : '-'}
                </span>
            ),
            sorter: (a: Sale, b: Sale) => (a.discount || 0) - (b.discount || 0)
        },
        {
            title: 'Total',
            dataIndex: 'total',
            key: 'total',
            width: 120,
            align: 'right' as const,
            render: (value: number | null | undefined) => (
                <Text strong style={{ color: '#1890ff' }}>
                    {formatVenezuelanPrice(value || 0)}
                </Text>
            ),
            sorter: (a: Sale, b: Sale) => (a.total || 0) - (b.total || 0)
        },
        {
            title: 'Forma de Pago',
            dataIndex: 'paymentMethod',
            key: 'paymentMethod',
            width: 120,
            render: (method: string) => {
                const colors: { [key: string]: string } = {
                    'CASH': 'green',
                    'DEBIT': 'blue',
                    'CREDIT': 'orange',
                    'TRANSFER': 'purple',
                    'MOBILE': 'cyan'
                };
                return <Tag color={colors[method] || 'default'}>{method}</Tag>;
            },
            filters: [
                { text: 'Efectivo', value: 'CASH' },
                { text: 'T. Débito', value: 'DEBIT' },
                { text: 'T. Crédito', value: 'CREDIT' },
                { text: 'Transferencia', value: 'TRANSFER' },
                { text: 'Pago Móvil', value: 'MOBILE' }
            ],
            onFilter: (value: any, record: Sale) => record.paymentMethod === value
        },
        {
            title: 'Items',
            key: 'items',
            width: 80,
            align: 'center' as const,
            render: (_: any, record: Sale) => (
                <Tag color="blue">{record.items.length}</Tag>
            ),
            sorter: (a: Sale, b: Sale) => a.items.length - b.items.length
        }
    ];

    return (
        <div>
            {/* Summary Cards */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Total Ventas"
                            value={totalSales}
                            prefix={<ShoppingOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Ingresos Totales"
                            value={totalRevenue}
                            precision={2}
                            prefix={<DollarOutlined />}
                            formatter={(value) => formatVenezuelanPrice(Number(value))}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Descuentos"
                            value={totalDiscount}
                            precision={2}
                            prefix={<DollarOutlined />}
                            formatter={(value) => formatVenezuelanPrice(Number(value))}
                            valueStyle={{ color: '#ff4d4f' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Ticket Promedio"
                            value={averageTicket}
                            precision={2}
                            prefix={<DollarOutlined />}
                            formatter={(value) => formatVenezuelanPrice(Number(value))}
                            valueStyle={{ color: '#722ed1' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Filters */}
            <Card title="Filtros" style={{ marginBottom: 16 }}>
                <Row gutter={16}>
                    <Col span={8}>
                        <div style={{ marginBottom: 16 }}>
                            <Text strong>Rango de Fechas:</Text>
                            <RangePicker
                                style={{ width: '100%', marginTop: 8 }}
                                value={dateRange}
                                onChange={handleDateRangeChange}
                                format="DD/MM/YYYY"
                                placeholder={['Fecha inicio', 'Fecha fin']}
                            />
                        </div>
                    </Col>
                    <Col span={4}>
                        <div style={{ marginBottom: 16 }}>
                            <Text strong>Cliente:</Text>
                            <Select
                                style={{ width: '100%', marginTop: 8 }}
                                placeholder="Todos los clientes"
                                allowClear
                                onChange={(value) => handleFilterChange('clientId', value)}
                                value={filters.clientId}
                            >
                                {clients.map(client => (
                                    <Select.Option key={client.id} value={client.id}>
                                        {client.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </div>
                    </Col>
                    <Col span={4}>
                        <div style={{ marginBottom: 16 }}>
                            <Text strong>Producto:</Text>
                            <Select
                                style={{ width: '100%', marginTop: 8 }}
                                placeholder="Todos los productos"
                                allowClear
                                onChange={(value) => handleFilterChange('productId', value)}
                                value={filters.productId}
                            >
                                {products.map(product => (
                                    <Select.Option key={product.id} value={product.id}>
                                        {product.sku} - {product.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </div>
                    </Col>
                    <Col span={4}>
                        <div style={{ marginBottom: 16 }}>
                            <Text strong>Forma de Pago:</Text>
                            <Select
                                style={{ width: '100%', marginTop: 8 }}
                                placeholder="Todas las formas"
                                allowClear
                                onChange={(value) => handleFilterChange('paymentMethod', value)}
                                value={filters.paymentMethod}
                            >
                                <Select.Option value="CASH">Efectivo</Select.Option>
                                <Select.Option value="DEBIT">T. Débito</Select.Option>
                                <Select.Option value="CREDIT">T. Crédito</Select.Option>
                                <Select.Option value="TRANSFER">Transferencia</Select.Option>
                                <Select.Option value="MOBILE">Pago Móvil</Select.Option>
                            </Select>
                        </div>
                    </Col>
                    <Col span={4}>
                        <div style={{ marginBottom: 16 }}>
                            <Text strong>Monto Mínimo:</Text>
                            <InputNumber
                                style={{ width: '100%', marginTop: 8 }}
                                placeholder="0.00"
                                min={0}
                                onChange={(value) => handleFilterChange('minAmount', value)}
                                value={filters.minAmount}
                            />
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <Space>
                            <Button
                                type="primary"
                                icon={<SearchOutlined />}
                                onClick={() => refetch()}
                                loading={isLoading}
                            >
                                Generar Reporte
                            </Button>
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={handleResetFilters}
                            >
                                Limpiar Filtros
                            </Button>
                            <Button
                                icon={<DownloadOutlined />}
                                disabled={sales.length === 0}
                            >
                                Exportar
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </Card>

            {/* Results */}
            <Card>
                <div style={{ marginBottom: 16 }}>
                    <Title level={4}>
                        Resultados del Reporte
                        <Text type="secondary" style={{ fontSize: '14px', marginLeft: 16 }}>
                            ({sales.length} ventas encontradas)
                        </Text>
                    </Title>
                </div>

                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: 50 }}>
                        <Spin size="large" />
                    </div>
                ) : sales.length === 0 ? (
                    <Alert
                        message="No se encontraron ventas"
                        description="No hay ventas que coincidan con los filtros seleccionados."
                        type="info"
                        showIcon
                    />
                ) : (
                    <Table
                        columns={columns}
                        dataSource={sales}
                        rowKey="id"
                        pagination={{
                            pageSize: 20,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) =>
                                `${range[0]}-${range[1]} de ${total} ventas`
                        }}
                        scroll={{ x: 1200 }}
                        size="small"
                    />
                )}
            </Card>
        </div>
    );
};