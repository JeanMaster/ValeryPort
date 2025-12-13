import { useState } from 'react';
import { Table, Button, Typography, Tag, Card } from 'antd';
import { PlusOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { payrollApi } from '../services/payrollApi';
import type { PayrollPeriod } from '../services/payrollApi';
import { GeneratePayrollModal } from '../components/GeneratePayrollModal';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { Title } = Typography;

export const PayrollPage = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const navigate = useNavigate();

    const { data: periods, isLoading } = useQuery({
        queryKey: ['payroll-periods'],
        queryFn: payrollApi.findAllPeriods,
    });

    const columns = [
        {
            title: 'Periodo',
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => <span style={{ fontWeight: 500 }}>{text}</span>
        },
        {
            title: 'Desde',
            dataIndex: 'startDate',
            key: 'startDate',
            render: (date: string) => dayjs(date).format('DD/MM/YYYY')
        },
        {
            title: 'Hasta',
            dataIndex: 'endDate',
            key: 'endDate',
            render: (date: string) => dayjs(date).format('DD/MM/YYYY')
        },
        {
            title: 'Estado',
            key: 'status',
            dataIndex: 'status',
            render: (status: string) => {
                const color = status === 'PAID' ? 'green' : status === 'PROCESSED' ? 'blue' : 'orange';
                return <Tag color={color}>{status}</Tag>;
            }
        },
        {
            title: 'Total',
            key: 'total',
            dataIndex: 'totalAmount',
            render: (amount: any) => <span>{amount ? Number(amount).toFixed(2) : '0.00'}</span>
        },
        {
            title: 'Acciones',
            key: 'actions',
            render: (_: any, record: PayrollPeriod) => (
                <Button
                    icon={<UnorderedListOutlined />}
                    onClick={() => navigate(`/hr/payroll/${record.id}`)}
                >
                    Ver Detalles
                </Button>
            )
        }
    ];

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <Title level={2}>Nómina</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
                    Generar Nómina
                </Button>
            </div>

            <Card>
                <Table
                    columns={columns}
                    dataSource={periods}
                    rowKey="id"
                    loading={isLoading}
                />
            </Card>

            <GeneratePayrollModal
                visible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
            />
        </div>
    );
};
