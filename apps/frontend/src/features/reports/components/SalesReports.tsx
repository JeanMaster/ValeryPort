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
    Grid
} from 'antd';
import {
    ReloadOutlined,
    DownloadOutlined,
    DollarOutlined,
    ShoppingOutlined,
    PrinterOutlined
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { salesApi, type Sale, type SalesFilters } from '../../../services/salesApi';
import { productsApi } from '../../../services/productsApi';
import { clientsApi } from '../../../services/clientsApi';
import { formatVenezuelanPrice } from '../../../utils/formatters';
import dayjs from 'dayjs';
import { SaleDetailModal } from './SaleDetailModal';
import { InvoiceModal } from '../../pos/components/InvoiceModal';

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

export const SalesReports = () => {
    const screens = Grid.useBreakpoint();
    const isMobile = !screens.lg;
    const [filters, setFilters] = useState<SalesFilters>({});
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
    const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

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
    const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.total || 0), 0);
    const totalDiscount = sales.reduce((sum, sale) => sum + Number(sale.discount || 0), 0);
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

    // Simplified table columns - only showing: Factura, Fecha, Productos, Total
    const columns = [
        {
            title: 'Factura',
            dataIndex: 'invoiceNumber',
            key: 'invoiceNumber',
            width: 100,
            fixed: 'left' as const,
            render: (invoiceNumber: string, record: Sale) => (
                <Button
                    type="link"
                    onClick={() => {
                        setSelectedSale(record);
                        setIsDetailModalOpen(true);
                    }}
                    style={{ padding: 0, height: 'auto' }}
                >
                    <Text strong style={{ color: '#1890ff' }}>{invoiceNumber}</Text>
                </Button>
            ),
            sorter: (a: Sale, b: Sale) => a.invoiceNumber.localeCompare(b.invoiceNumber)
        },
        {
            title: 'Fecha',
            dataIndex: 'date',
            key: 'date',
            width: 140,
            render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
            sorter: (a: Sale, b: Sale) => dayjs(a.date).unix() - dayjs(b.date).unix()
        },
        {
            title: 'Cliente',
            dataIndex: 'client',
            key: 'client',
            width: 150,
            render: (client: any) => client?.name || 'Cliente General'
        },
        {
            title: 'Productos',
            key: 'products',
            width: 250,
            render: (_: any, record: Sale) => (
                <div style={{ maxWidth: '100%' }}>
                    {record.items.slice(0, 3).map(item => (
                        <div key={item.id} style={{ fontSize: '12px', lineHeight: '1.4', whiteSpace: 'normal' }}>
                            • {item.product.name} x{item.quantity}
                        </div>
                    ))}
                    {record.items.length > 3 && (
                        <Text type="secondary" style={{ fontSize: '11px' }}>
                            +{record.items.length - 3} más...
                        </Text>
                    )}
                </div>
            )
        },
        {
            title: 'Total',
            dataIndex: 'total',
            key: 'total',
            width: 120,
            align: 'right' as const,
            render: (value: number | null | undefined) => (
                <Text strong style={{ color: '#1890ff', fontSize: '14px' }}>
                    {formatVenezuelanPrice(value || 0)}
                </Text>
            ),
            sorter: (a: Sale, b: Sale) => (a.total || 0) - (b.total || 0)
        },
        {
            title: 'Acciones',
            key: 'actions',
            width: 80,
            align: 'center' as const,
            fixed: isMobile ? false : ('right' as const),
            render: (_: any, record: Sale) => (
                <Button
                    type="text"
                    icon={<PrinterOutlined />}
                    onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSale(record);
                        setIsInvoiceModalOpen(true);
                    }}
                    title="Reimprimir Factura"
                    style={{ color: '#1890ff' }}
                />
            )
        }
    ];

    return (
        <div style={{ padding: isMobile ? 8 : 24 }}>
            <div style={{ marginBottom: 24 }}>
                <Row justify="space-between" align="middle" gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                        <Title level={isMobile ? 3 : 2} style={{ margin: 0 }}>📊 Reportes de Ventas</Title>
                        <Text type="secondary">Visualiza y analiza el desempeño de tus ventas</Text>
                    </Col>
                    <Col xs={24} md={12} style={{ textAlign: isMobile ? 'left' : 'right' }}>
                        <Space wrap>
                            <Button
                                type="primary"
                                icon={<ReloadOutlined />}
                                onClick={() => refetch()}
                                block={isMobile}
                            >
                                Actualizar
                            </Button>
                            <Button
                                icon={<DownloadOutlined />}
                                disabled={sales.length === 0}
                                block={isMobile}
                            >
                                Exportar
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </div>

            {/* Summary Statistics */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={12} lg={6}>
                    <Card size="small">
                        <Statistic
                            title="Total Ventas"
                            value={totalSales}
                            prefix={<ShoppingOutlined />}
                            valueStyle={{ color: '#1890ff', fontSize: isMobile ? 18 : 24 }}
                            styles={{ content: { color: '#1890ff', fontSize: isMobile ? 18 : 24 } }}
                        />
                    </Card>
                </Col>
                <Col xs={12} lg={6}>
                    <Card size="small">
                        <Statistic
                            title="Ingreso Bruto"
                            value={totalRevenue}
                            precision={2}
                            prefix={<DollarOutlined />}
                            formatter={(value) => formatVenezuelanPrice(Number(value))}
                            valueStyle={{ color: '#52c41a', fontSize: isMobile ? 18 : 24 }}
                            styles={{ content: { color: '#52c41a', fontSize: isMobile ? 18 : 24 } }}
                        />
                    </Card>
                </Col>
                <Col xs={12} lg={6}>
                    <Card size="small">
                        <Statistic
                            title="Descuentos"
                            value={totalDiscount}
                            precision={2}
                            prefix={<DollarOutlined />}
                            formatter={(value) => formatVenezuelanPrice(Number(value))}
                            valueStyle={{ color: '#ff4d4f', fontSize: isMobile ? 18 : 24 }}
                            styles={{ content: { color: '#ff4d4f', fontSize: isMobile ? 18 : 24 } }}
                        />
                    </Card>
                </Col>
                <Col xs={12} lg={6}>
                    <Card size="small">
                        <Statistic
                            title="Ticket Promedio"
                            value={averageTicket}
                            precision={2}
                            prefix={<DollarOutlined />}
                            formatter={(value) => formatVenezuelanPrice(Number(value))}
                            valueStyle={{ color: '#722ed1', fontSize: isMobile ? 18 : 24 }}
                            styles={{ content: { color: '#722ed1', fontSize: isMobile ? 18 : 24 } }}
                        />
                    </Card>
                </Col>
            </Row>

            <Card title="Filtros" style={{ marginBottom: 16 }} size={isMobile ? 'small' : 'default'}>
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={8}>
                        <Text strong>Rango de Fechas:</Text>
                        <RangePicker
                            style={{ width: '100%', marginTop: 8 }}
                            value={dateRange}
                            onChange={handleDateRangeChange}
                            format="DD/MM/YYYY"
                            placeholder={['Inicio', 'Fin']}
                        />
                    </Col>
                    <Col xs={12} md={4}>
                        <Text strong>Cliente:</Text>
                        <Select
                            style={{ width: '100%', marginTop: 8 }}
                            placeholder="Todos"
                            allowClear
                            onChange={(value) => handleFilterChange('clientId', value)}
                            value={filters.clientId}
                            options={clients.map(c => ({ label: c.name, value: c.id }))}
                        />
                    </Col>
                    <Col xs={12} md={4}>
                        <Text strong>Producto:</Text>
                        <Select
                            style={{ width: '100%', marginTop: 8 }}
                            placeholder="Todos"
                            allowClear
                            onChange={(value) => handleFilterChange('productId', value)}
                            value={filters.productId}
                            options={products.map(p => ({ label: p.name, value: p.id }))}
                        />
                    </Col>
                    <Col xs={12} md={4}>
                        <Text strong>Pago:</Text>
                        <Select
                            style={{ width: '100%', marginTop: 8 }}
                            placeholder="Todos"
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
                    </Col>
                    <Col xs={12} md={4}>
                        <Text strong>Monto Mín:</Text>
                        <InputNumber
                            style={{ width: '100%', marginTop: 8 }}
                            placeholder="0.00"
                            min={0}
                            onChange={(value) => handleFilterChange('minAmount', value)}
                            value={filters.minAmount}
                        />
                    </Col>
                </Row>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                    <Space>
                        <Button onClick={handleResetFilters}>Limpiar</Button>
                        <Button type="primary" onClick={() => refetch()} loading={isLoading}>Filtrar</Button>
                    </Space>
                </div>
            </Card>

            <Card styles={{ body: { padding: isMobile ? 0 : 24 } }}>
                <Table
                    columns={columns}
                    dataSource={sales}
                    rowKey="id"
                    loading={isLoading}
                    pagination={{
                        pageSize: 10,
                        size: isMobile ? 'small' : 'default',
                        responsive: true
                    }}
                    scroll={{ x: 800 }}
                    size={isMobile ? 'small' : 'middle'}
                />
            </Card>

            <SaleDetailModal
                open={isDetailModalOpen}
                sale={selectedSale}
                onCancel={() => setIsDetailModalOpen(false)}
            />

            <InvoiceModal
                open={isInvoiceModalOpen}
                sale={selectedSale}
                onClose={() => setIsInvoiceModalOpen(false)}
            />
        </div>
    );
};