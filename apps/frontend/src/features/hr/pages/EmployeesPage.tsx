import { useState } from 'react';
import { Table, Button, Space, Typography, Tag, Tooltip, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeesApi } from '../services/employeesApi';
import type { Employee } from '../services/employeesApi';
import { EmployeeFormModal } from '../components/EmployeeFormModal';

const { Title } = Typography;

export const EmployeesPage = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const queryClient = useQueryClient();

    const { data: employees, isLoading } = useQuery({
        queryKey: ['employees'],
        queryFn: employeesApi.findAll,
    });

    const deleteMutation = useMutation({
        mutationFn: employeesApi.remove,
        onSuccess: () => {
            message.success('Empleado eliminado (inactivado)');
            queryClient.invalidateQueries({ queryKey: ['employees'] });
        }
    });

    const handleCreate = () => {
        setEditingEmployee(null);
        setIsModalVisible(true);
    };

    const handleEdit = (record: Employee) => {
        setEditingEmployee(record);
        setIsModalVisible(true);
    };

    const handleDelete = (id: string) => {
        deleteMutation.mutate(id);
    };

    const columns = [
        {
            title: 'Nombre',
            key: 'name',
            render: (_: any, record: Employee) => (
                <Space>
                    <UserOutlined />
                    <span style={{ fontWeight: 'bold' }}>{record.firstName} {record.lastName}</span>
                </Space>
            )
        },
        {
            title: 'Identificación',
            dataIndex: 'identification',
            key: 'identification',
        },
        {
            title: 'Cargo',
            dataIndex: 'position',
            key: 'position',
        },
        {
            title: 'Departamento',
            dataIndex: 'department',
            key: 'department',
        },
        {
            title: 'Sueldo Base',
            key: 'salary',
            render: (_: any, record: Employee) => (
                <span>
                    {record.baseSalary} <small>{record.currency || 'VES'}</small>
                </span>
            )
        },
        {
            title: 'Estado',
            key: 'status',
            render: (_: any, record: Employee) => (
                <Tag color={record.isActive ? 'green' : 'red'}>
                    {record.isActive ? 'Activo' : 'Inactivo'}
                </Tag>
            )
        },
        {
            title: 'Acciones',
            key: 'actions',
            render: (_: any, record: Employee) => (
                <Space>
                    <Tooltip title="Editar">
                        <Button
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record)}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="¿Inactivar empleado?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Sí"
                        cancelText="No"
                    >
                        <Button icon={<DeleteOutlined />} danger disabled={!record.isActive} />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <Title level={2}>Gestión de Empleados</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                    Nuevo Empleado
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={employees}
                rowKey="id"
                loading={isLoading}
            />

            <EmployeeFormModal
                visible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                employee={editingEmployee}
            />
        </div>
    );
};
