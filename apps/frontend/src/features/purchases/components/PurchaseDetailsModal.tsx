import React from 'react';
import { Modal, Descriptions, Table, Tag } from 'antd';
import dayjs from 'dayjs';
import type { Purchase } from '../../../services/purchasesApi';
import { formatVenezuelanPrice } from '../../../utils/formatters';

interface PurchaseDetailsModalProps {
    visible: boolean;
    purchase: Purchase | null;
    onClose: () => void;
}

export const PurchaseDetailsModal: React.FC<PurchaseDetailsModalProps> = ({
    visible,
    purchase,
    onClose
}) => {
    if (!purchase) return null;

    const columns = [
        {
            title: 'Producto',
            dataIndex: ['product', 'name'],
            key: 'product',
        },
        {
            title: 'Cantidad',
            dataIndex: 'quantity',
            key: 'quantity',
            align: 'right' as const,
        },
        {
            title: 'Costo Unitario',
            dataIndex: 'cost',
            key: 'cost',
            align: 'right' as const,
            render: (cost: number) => `${purchase.currencyCode} ${formatVenezuelanPrice(cost)}`,
        },
        {
            title: 'Total',
            dataIndex: 'total',
            key: 'total',
            align: 'right' as const,
            render: (total: number) => `${purchase.currencyCode} ${formatVenezuelanPrice(total)}`,
        },
    ];

    return (
        <Modal
            title={`Detalle de Compra - ${purchase.invoiceNumber || 'Sin Factura'}`}
            open={visible}
            onCancel={onClose}
            footer={null}
            width={800}
        >
            <Descriptions bordered size="small" column={2}>
                <Descriptions.Item label="Fecha">
                    {dayjs(purchase.invoiceDate).format('DD/MM/YYYY')}
                </Descriptions.Item>
                <Descriptions.Item label="Proveedor">
                    {purchase.supplier?.comercialName || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Estado">
                    <Tag color={purchase.status === 'COMPLETED' ? 'green' : 'orange'}>
                        {purchase.status === 'COMPLETED' ? 'Completado' : purchase.status}
                    </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Moneda">
                    {purchase.currencyCode} (Tasa: {purchase.exchangeRate})
                </Descriptions.Item>
                <Descriptions.Item label="Total Compra" span={2}>
                    <strong>{purchase.currencyCode} {formatVenezuelanPrice(Number(purchase.total))}</strong>
                </Descriptions.Item>
            </Descriptions>

            <h3 style={{ marginTop: 24, marginBottom: 16 }}>Items</h3>
            <Table
                dataSource={purchase.items}
                columns={columns}
                rowKey="id"
                pagination={false}
                size="small"
                bordered
            />
        </Modal>
    );
};
