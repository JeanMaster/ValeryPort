import { List, Typography, Tag, Empty, Spin, Popover, Button } from 'antd';
import { HistoryOutlined, ShoppingOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { salesApi, type Sale } from '../services/salesApi';
import { formatVenezuelanPrice } from '../utils/formatters';

const { Text } = Typography;

interface ClientPurchaseHistoryProps {
    clientId: string;
    clientName?: string;
    limit?: number;
}

const PurchaseHistoryContent = ({ clientId, limit = 5 }: { clientId: string; limit?: number }) => {
    const { data: purchases, isLoading, error } = useQuery({
        queryKey: ['clientPurchases', clientId],
        queryFn: () => salesApi.getClientRecentPurchases(clientId, limit),
        enabled: !!clientId,
    });

    if (isLoading) return <Spin size="small" />;
    if (error) return <Text type="danger">Error al cargar</Text>;
    if (!purchases || purchases.length === 0) {
        return <Empty description="Sin compras" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    }

    return (
        <List
            size="small"
            dataSource={purchases}
            style={{ maxWidth: 350, maxHeight: 300, overflow: 'auto' }}
            renderItem={(sale) => {
                const itemsPreview = sale.items?.slice(0, 2).map(i => i.product?.name || 'Producto').join(', ') || '';
                const moreItems = (sale.items?.length || 0) > 2 ? ` +${sale.items!.length - 2} más` : '';

                return (
                    <List.Item style={{ padding: '8px 0' }}>
                        <div style={{ width: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                <Tag color="blue" style={{ margin: 0 }}>{sale.invoiceNumber}</Tag>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    {new Date(sale.date).toLocaleDateString('es-VE')}
                                </Text>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text ellipsis style={{ maxWidth: 200, fontSize: 12 }}>
                                    {itemsPreview}{moreItems}
                                </Text>
                                <Text strong style={{ color: '#52c41a' }}>
                                    {formatVenezuelanPrice(sale.total)}
                                </Text>
                            </div>
                        </div>
                    </List.Item>
                );
            }}
        />
    );
};

export const ClientPurchaseHistory = ({ clientId, clientName, limit = 5 }: ClientPurchaseHistoryProps) => {
    return (
        <Popover
            content={<PurchaseHistoryContent clientId={clientId} limit={limit} />}
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ShoppingOutlined />
                    <span>Últimas compras {clientName ? `de ${clientName}` : ''}</span>
                </div>
            }
            trigger="click"
            placement="right"
        >
            <Button
                type="link"
                icon={<HistoryOutlined />}
                size="small"
                title="Ver historial de compras"
            >
                Historial
            </Button>
        </Popover>
    );
};

// Compact version for POS
export const ClientPurchaseHistoryCompact = ({ clientId, clientName }: { clientId: string; clientName?: string }) => {
    return (
        <Popover
            content={<PurchaseHistoryContent clientId={clientId} limit={5} />}
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ShoppingOutlined />
                    <span>Últimas compras</span>
                </div>
            }
            trigger="click"
            placement="bottom"
        >
            <Button
                type="text"
                icon={<HistoryOutlined />}
                size="small"
                style={{ padding: '0 4px' }}
            />
        </Popover>
    );
};
