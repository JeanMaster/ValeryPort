import { useState } from 'react';
import { Card, Table, Button, Space, Input, message, Popconfirm, Tag, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '../../services/productsApi';
import type { Product } from '../../services/productsApi';
import { ProductFormModal } from './ProductFormModal';

export const ProductsPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const queryClient = useQueryClient();

    // Fetch products
    const { data: products = [], isLoading } = useQuery({
        queryKey: ['products'],
        queryFn: () => productsApi.getAll(),
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: productsApi.delete,
        onSuccess: () => {
            message.success('Producto eliminado exitosamente');
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Error al eliminar producto');
        },
    });

    const handleAdd = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

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

    // Filter products
    const filteredData = products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        {
            title: 'SKU',
            dataIndex: 'sku',
            key: 'sku',
            width: '10%',
        },
        {
            title: 'Nombre',
            dataIndex: 'name',
            key: 'name',
            width: '20%',
        },
        {
            title: 'Categoría',
            key: 'category',
            width: '15%',
            render: (_: any, record: Product) => (
                <div>
                    <div>{record.category.name}</div>
                    {record.subcategory && (
                        <div style={{ fontSize: 12, color: '#888' }}>
                            → {record.subcategory.name}
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: 'Moneda',
            key: 'currency',
            width: '8%',
            render: (_: any, record: Product) => (
                <Tag color="blue">{record.currency.symbol}</Tag>
            ),
        },
        {
            title: 'Precio Costo',
            key: 'costPrice',
            width: '10%',
            render: (_: any, record: Product) => (
                <span>{record.currency.symbol} {record.costPrice.toFixed(2)}</span>
            ),
        },
        {
            title: 'Precios',
            key: 'prices',
            width: '12%',
            render: (_: any, record: Product) => {
                const hasExtraPrices = record.offerPrice || record.wholesalePrice;

                const tooltipContent = hasExtraPrices ? (
                    <div style={{ fontSize: 12 }}>
                        {record.offerPrice && (
                            <div style={{ marginBottom: 4 }}>
                                <strong>Oferta:</strong> {record.currency.symbol} {record.offerPrice.toFixed(2)}
                            </div>
                        )}
                        {record.wholesalePrice && (
                            <div>
                                <strong>Al Mayor:</strong> {record.currency.symbol} {record.wholesalePrice.toFixed(2)}
                            </div>
                        )}
                    </div>
                ) : null;

                return (
                    <Tooltip title={tooltipContent} placement="top">
                        <span style={{ cursor: hasExtraPrices ? 'help' : 'default' }}>
                            {record.currency.symbol} {record.salePrice.toFixed(2)}
                        </span>
                    </Tooltip>
                );
            },
        },
        {
            title: 'Stock',
            dataIndex: 'stock',
            key: 'stock',
            width: '8%',
            render: (stock: number) => (
                <Tag color={stock > 10 ? 'green' : stock > 0 ? 'orange' : 'red'}>
                    {stock}
                </Tag>
            ),
        },
        {
            title: 'Unidad',
            key: 'unit',
            width: '8%',
            render: (_: any, record: Product) => record.unit.abbreviation,
        },
        {
            title: 'Acciones',
            key: 'actions',
            width: '13%',
            render: (_: any, record: Product) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        Editar
                    </Button>
                    <Popconfirm
                        title="¿Eliminar producto?"
                        description="Esta acción no se puede deshacer"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Eliminar"
                        cancelText="Cancelar"
                    >
                        <Button type="link" danger icon={<DeleteOutlined />}>
                            Eliminar
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <Card
            title="Productos Terminados"
            extra={
                <Space>
                    <Input
                        placeholder="Buscar producto..."
                        prefix={<SearchOutlined />}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: 250 }}
                    />
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                        Nuevo Producto
                    </Button>
                </Space>
            }
        >
            <Table
                columns={columns}
                dataSource={filteredData}
                rowKey="id"
                loading={isLoading}
                pagination={{ pageSize: 15 }}
            />

            <ProductFormModal
                open={isModalOpen}
                product={editingProduct}
                onClose={handleModalClose}
            />
        </Card>
    );
};
