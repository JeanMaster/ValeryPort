import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Row, Col, Card, App } from 'antd';
import { PlusOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { purchasesApi } from '../../services/purchasesApi';
import type { Purchase } from '../../services/purchasesApi';
import { CreatePurchaseModal } from './components/CreatePurchaseModal';
// No, previously we removed it because App component wraps routes.
// But some pages use it?
// Let's check SuppliersPage. It returns <div>.
// App.tsx wraps routes in MainLayout. So pages should NOT use MainLayout wrapper, just content.
// Confirmed.

export const PurchasesPage: React.FC = () => {
    const { message } = App.useApp();
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false); // For Create Modal

    useEffect(() => {
        fetchPurchases();
    }, []);

    const fetchPurchases = async () => {
        setLoading(true);
        try {
            const data = await purchasesApi.getAll();
            setPurchases(data);
        } catch (error) {
            message.error('Error al cargar historial de compras');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Fecha',
            dataIndex: 'invoiceDate',
            key: 'date',
            render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
            sorter: (a: Purchase, b: Purchase) => dayjs(a.invoiceDate).unix() - dayjs(b.invoiceDate).unix(),
        },
        {
            title: 'Proveedor',
            dataIndex: ['supplier', 'comercialName'],
            key: 'supplier',
        },
        {
            title: '# Factura',
            dataIndex: 'invoiceNumber',
            key: 'invoiceNumber',
            render: (text: string) => text || 'N/A',
        },
        {
            title: 'Items',
            dataIndex: 'items',
            key: 'items',
            render: (items: any[]) => items.length,
        },
        {
            title: 'Total',
            dataIndex: 'total',
            key: 'total',
            render: (total: number, record: Purchase) => (
                <span>{record.currencyCode} {Number(total).toFixed(2)}</span>
            ),
        },
        {
            title: 'Estado',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={status === 'COMPLETED' ? 'green' : 'orange'}>
                    {status === 'COMPLETED' ? 'Completado' : status}
                </Tag>
            ),
        },
        {
            title: 'Acciones',
            key: 'actions',
            render: (_: any, _record: Purchase) => (
                <Button icon={<EyeOutlined />} type="text" />
            ),
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Card>
                <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                    <Col>
                        <h1 style={{ margin: 0, fontSize: '24px' }}>Recepción de Compras</h1>
                    </Col>
                    <Col>
                        <Button icon={<ReloadOutlined />} onClick={fetchPurchases} style={{ marginRight: 8 }} />
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setModalVisible(true)}
                        >
                            Registrar Compra
                        </Button>
                    </Col>
                </Row>

                <Table
                    columns={columns}
                    dataSource={purchases}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <CreatePurchaseModal
                visible={modalVisible}
                onCancel={() => setModalVisible(false)}
                onSuccess={() => {
                    setModalVisible(false);
                    fetchPurchases();
                }}
            />
        </div>
    );
};
