import { useState } from 'react';
import { Card, Table, Button, Input, Space, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { suppliersApi } from '../../services/suppliersApi';
import type { Supplier } from '../../services/suppliersApi';
import { SupplierFormModal } from './SupplierFormModal';
import type { ColumnsType } from 'antd/es/table';

export const SuppliersPage = () => {
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const queryClient = useQueryClient();

    // Fetch suppliers
    const { data: suppliers, isLoading } = useQuery({
        queryKey: ['suppliers', search],
        queryFn: () => suppliersApi.getAll(search),
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: suppliersApi.delete,
        onSuccess: () => {
            message.success('Proveedor eliminado');
            queryClient.invalidateQueries({ queryKey: ['suppliers'] });
        },
        onError: () => {
            message.error('Error al eliminar proveedor');
        },
    });

    const handleEdit = (supplier: Supplier) => {
        setEditingSupplier(supplier);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        deleteMutation.mutate(id);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setEditingSupplier(null);
    };

    const columns: ColumnsType<Supplier> = [
        {
            title: 'RIF',
            dataIndex: 'rif',
            key: 'rif',
            width: 150,
        },
        {
            title: 'Nombre Comercial',
            dataIndex: 'comercialName',
            key: 'comercialName',
        },
        {
            title: 'Contacto',
            dataIndex: 'contactName',
            key: 'contactName',
        },
        {
            title: 'Categoría',
            dataIndex: 'category',
            key: 'category',
            width: 150,
        },
        {
            title: 'Teléfono',
            dataIndex: 'phone',
            key: 'phone',
            width: 150,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Acciones',
            key: 'actions',
            width: 120,
            render: (_, record) => (
                <Space>
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    />
                    <Popconfirm
                        title="¿Eliminar proveedor?"
                        description="Esta acción marcará al proveedor como inactivo"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Sí"
                        cancelText="No"
                    >
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                        />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <>
            <Card
                title="Gestión de Proveedores"
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setIsModalOpen(true)}
                    >
                        Nuevo Proveedor
                    </Button>
                }
            >
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    <Input
                        placeholder="Buscar por nombre, RIF, email o contacto"
                        prefix={<SearchOutlined />}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ maxWidth: 400 }}
                    />

                    <Table
                        columns={columns}
                        dataSource={suppliers}
                        loading={isLoading}
                        rowKey="id"
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showTotal: (total) => `Total: ${total} proveedores`,
                        }}
                    />
                </Space>
            </Card>

            <SupplierFormModal
                open={isModalOpen}
                supplier={editingSupplier}
                onClose={handleModalClose}
            />
        </>
    );
};
