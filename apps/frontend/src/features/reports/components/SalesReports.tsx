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
    Spin,
    Alert
} from 'antd';
import {
    SearchOutlined,
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
import { currenciesApi } from '../../../services/currenciesApi';
import { formatVenezuelanPrice } from '../../../utils/formatters';
import dayjs from 'dayjs';
import { SaleDetailModal } from './SaleDetailModal';
import { InvoiceModal } from '../../pos/components/InvoiceModal';

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

export const SalesReports = () => {
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

    const { data: currencies = [] } = useQuery({
        queryKey: ['currencies'],
        queryFn: () => currenciesApi.getAll(),
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
            width: 100,
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
                                <Select.OptGroup label="Métodos de Pago">
                                    <Select.Option value="CASH">Efectivo</Select.Option>
                                    <Select.Option value="DEBIT">T. Débito</Select.Option>
                                    <Select.Option value="CREDIT">T. Crédito</Select.Option>
                                    <Select.Option value="TRANSFER">Transferencia</Select.Option>
                                    <Select.Option value="MOBILE">Pago Móvil</Select.Option>
                                </Select.OptGroup>
                                {currencies.filter(c => !c.isPrimary).length > 0 && (
                                    <Select.OptGroup label="Divisas">
                                        {currencies.filter(c => !c.isPrimary).map(currency => (
                                            <Select.Option key={currency.code} value={`CURRENCY_${currency.code}`}>
                                                {currency.code} - {currency.name}
                                            </Select.Option>
                                        ))}
                                    </Select.OptGroup>
                                )}
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
                        scroll={{ x: 'max-content' }}
                        size="small"
                        style={{ overflowX: 'auto' }}
                    />
                )}
            </Card>
            {/* Sale Detail Modal */}
            <SaleDetailModal
                open={isDetailModalOpen}
                sale={selectedSale}
                onCancel={() => setIsDetailModalOpen(false)}
            />

            {/* Invoice Modal for Reprinting */}
            <InvoiceModal
                open={isInvoiceModalOpen}
                sale={selectedSale}
                onClose={() => setIsInvoiceModalOpen(false)}
            />
        </div>
    );
};