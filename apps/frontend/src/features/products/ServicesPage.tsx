
import { useState } from 'react';
import { formatVenezuelanPrice } from '../../utils/formatters';
import { Card, Table, Button, Space, Input, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '../../services/productsApi';
import type { Product } from '../../services/productsApi';
import { ServiceFormModal } from './services/ServiceFormModal';

export const ServicesPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<Product | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const queryClient = useQueryClient();

    // Fetch services (products with type = SERVICE)
    const { data: services = [], isLoading } = useQuery({
        queryKey: ['services'],
        queryFn: () => productsApi.getAll({ type: 'SERVICE' }),
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: productsApi.delete,
        onSuccess: () => {
            message.success('Servicio eliminado');
            queryClient.invalidateQueries({ queryKey: ['services'] });
        },
        onError: () => {
            message.error('Error al eliminar servicio');
        },
    });

    const handleEdit = (service: Product) => {
        setEditingService(service);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        deleteMutation.mutate(id);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingService(null);
    };

    // Filter
    const filteredServices = services.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        {
            title: 'Código',
            dataIndex: 'sku',
            key: 'sku',
            width: 120,
        },
        {
            title: 'Nombre',
            dataIndex: 'name',
            key: 'name',
            render: (text: string, record: Product) => (
                <Space direction="vertical" size={0}>
                    <span style={{ fontWeight: 500 }}>{text}</span>
                    <span style={{ fontSize: '11px', color: '#888' }}>{record.category.name}</span>
                </Space>
            ),
        },
        {
            title: 'Precio',
            key: 'price',
            render: (_: any, record: Product) => (
                <Space direction="vertical" size={0} style={{ textAlign: 'right', width: '100%' }}>
                    <span style={{ fontWeight: 'bold', color: '#2ecc71' }}>
                        {record.currency.symbol} {formatVenezuelanPrice(record.salePrice)}
                    </span>
                </Space>
            ),
            align: 'right' as const,
        },
        {
            title: 'Acciones',
            key: 'actions',
            align: 'center' as const,
            width: 100,
            render: (_: any, record: Product) => (
                <Space>
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    />
                    <Popconfirm
                        title="¿Eliminar servicio?"
                        description="Esta acción no se puede deshacer."
                        onConfirm={() => handleDelete(record.id)}
                        okText="Sí"
                        cancelText="No"
                    >
                        <Button type="text" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <h1>Servicios</h1>
                <Space>
                    <Input
                        placeholder="Buscar servicio..."
                        prefix={<SearchOutlined />}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{ width: 250 }}
                    />
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={() => queryClient.invalidateQueries({ queryKey: ['services'] })}
                    />
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
                        Nuevo Servicio
                    </Button>
                </Space>
            </div>

            <Card styles={{ body: { padding: 0 } }}>
                <Table
                    columns={columns}
                    dataSource={filteredServices}
                    rowKey="id"
                    loading={isLoading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <ServiceFormModal
                open={isModalOpen}
                service={editingService}
                onClose={handleCloseModal}
            />
        </div>
    );
};
