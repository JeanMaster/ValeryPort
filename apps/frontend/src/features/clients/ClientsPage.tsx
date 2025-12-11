import { useState } from 'react';
import { Card, Table, Button, Input, Space, message, Popconfirm, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, WhatsAppOutlined, InstagramOutlined, FacebookOutlined, TwitterOutlined, ReloadOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientsApi } from '../../services/clientsApi';
import type { Client } from '../../services/clientsApi';
import { ClientFormModal } from './ClientFormModal';
import type { ColumnsType } from 'antd/es/table';

export const ClientsPage = () => {
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const queryClient = useQueryClient();

    // Fetch clients
    const { data: clients, isLoading } = useQuery({
        queryKey: ['clients', search],
        queryFn: () => clientsApi.getAll(search),
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: clientsApi.delete,
        onSuccess: () => {
            message.success('Cliente eliminado');
            queryClient.invalidateQueries({ queryKey: ['clients'] });
        },
        onError: () => {
            message.error('Error al eliminar cliente');
        },
    });

    const handleEdit = (client: Client) => {
        setEditingClient(client);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        deleteMutation.mutate(id);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setEditingClient(null);
    };

    const columns: ColumnsType<Client> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 150,
        },
        {
            title: 'Nombre',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Teléfono',
            dataIndex: 'phone',
            key: 'phone',
            width: 150,
            render: (phone: string, record: Client) => (
                <Space>
                    {phone}
                    {record.hasWhatsapp && (
                        <WhatsAppOutlined style={{ color: '#25D366' }} />
                    )}
                </Space>
            ),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Redes Sociales',
            key: 'social',
            width: 120,
            render: (_, record: Client) => (
                <Space>
                    {record.social1 && (
                        <Tooltip title={`Instagram: ${record.social1}`}>
                            <InstagramOutlined style={{ color: '#E1306C', cursor: 'pointer' }} />
                        </Tooltip>
                    )}
                    {record.social2 && (
                        <Tooltip title={`Facebook: ${record.social2}`}>
                            <FacebookOutlined style={{ color: '#4267B2', cursor: 'pointer' }} />
                        </Tooltip>
                    )}
                    {record.social3 && (
                        <Tooltip title={`Twitter/X: ${record.social3}`}>
                            <TwitterOutlined style={{ color: '#1DA1F2', cursor: 'pointer' }} />
                        </Tooltip>
                    )}
                </Space>
            ),
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
                        title="¿Eliminar cliente?"
                        description="Esta acción marcará al cliente como inactivo"
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
                title="Gestión de Clientes"
                extra={
                    <Space>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={() => queryClient.invalidateQueries({ queryKey: ['clients'] })}
                        />
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setIsModalOpen(true)}
                        >
                            Nuevo Cliente
                        </Button>
                    </Space>
                }
            >
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    <Input
                        placeholder="Buscar por nombre, ID o email"
                        prefix={<SearchOutlined />}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ maxWidth: 400 }}
                    />

                    <Table
                        columns={columns}
                        dataSource={clients}
                        loading={isLoading}
                        rowKey="id"
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showTotal: (total) => `Total: ${total} clientes`,
                        }}
                    />
                </Space>
            </Card>

            <ClientFormModal
                open={isModalOpen}
                client={editingClient}
                onClose={handleModalClose}
            />
        </>
    );
};
