import { useState } from 'react';
import { Card, Table, Button, Input, Space, message, Popconfirm, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '../../services/productsApi';
import type { Product } from '../../services/productsApi';
import { ProductFormModal } from './ProductFormModal';
import type { ColumnsType } from 'antd/es/table';

export const ProductsPage = () => {
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const queryClient = useQueryClient();

    // Fetch products
    const { data: products, isLoading } = useQuery({
        queryKey: ['products', search],
        queryFn: () => productsApi.getAll(search),
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: productsApi.delete,
        onSuccess: () => {
            message.success('Producto eliminado');
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
        onError: () => {
            message.error('Error al eliminar producto');
        },
    });

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        deleteMutation.mutate(id);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
    };

    const columns: ColumnsType<Product> = [
        {
            title: 'SKU',
            dataIndex: 'sku',
            key: 'sku',
            width: 120,
        },
        {
            title: 'Nombre',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Categoría',
            dataIndex: 'category',
            key: 'category',
            width: 150,
        },
        {
            title: 'Precio Venta',
            dataIndex: 'salePrice',
            key: 'salePrice',
            width: 120,
            render: (price: number) => `$${price.toFixed(2)}`,
        },
        {
            title: 'Stock',
            dataIndex: 'stock',
            key: 'stock',
            width: 100,
            render: (stock: number) => (
                <Tag color={stock > 10 ? 'green' : stock > 0 ? 'orange' : 'red'}>
                    {stock}
                </Tag>
            ),
        },
        {
            title: 'Unidad',
            dataIndex: 'unit',
            key: 'unit',
            width: 80,
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
                        title="¿Eliminar producto?"
                        description="Esta acción marcará al producto como inactivo"
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
                title="Gestión de Productos"
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setIsModalOpen(true)}
                    >
                        Nuevo Producto
                    </Button>
                }
            >
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    <Input
                        placeholder="Buscar por nombre, SKU o categoría"
                        prefix={<SearchOutlined />}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ maxWidth: 400 }}
                    />

                    <Table
                        columns={columns}
                        dataSource={products}
                        loading={isLoading}
                        rowKey="id"
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showTotal: (total) => `Total: ${total} productos`,
                        }}
                    />
                </Space>
            </Card>

            <ProductFormModal
                open={isModalOpen}
                product={editingProduct}
                onClose={handleModalClose}
            />
        </>
    );
};
