import { Modal, Descriptions, Table, Tag } from 'antd';
import type { Invoice } from '../../../services/invoicesApi';
import { formatVenezuelanPrice } from '../../../utils/formatters';
import dayjs from 'dayjs';

interface ClientStatementModalProps {
    visible: boolean;
    clientName: string;
    invoices: Invoice[];
    onClose: () => void;
}

export const ClientStatementModal: React.FC<ClientStatementModalProps> = ({
    visible,
    clientName,
    invoices,
    onClose,
}) => {
    const totalDebt = invoices.reduce((sum, inv) => sum + Number(inv.balance), 0);
    const totalPaid = invoices.reduce((sum, inv) => sum + Number(inv.paidAmount), 0);
    const totalAmount = invoices.reduce((sum, inv) => sum + Number(inv.total), 0);

    const columns = [
        {
            title: 'Factura',
            dataIndex: 'number',
            key: 'number',
        },
        {
            title: 'Fecha',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
        },
        {
            title: 'Vencimiento',
            dataIndex: 'dueDate',
            key: 'dueDate',
            render: (date: string) => date ? dayjs(date).format('DD/MM/YYYY') : '-',
        },
        {
            title: 'Estado',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                const colors: Record<string, string> = {
                    PENDING: 'orange',
                    PARTIAL: 'blue',
                    PAID: 'green',
                    OVERDUE: 'red',
                };
                const labels: Record<string, string> = {
                    PENDING: 'Pendiente',
                    PARTIAL: 'Parcial',
                    PAID: 'Pagada',
                    OVERDUE: 'Vencida',
                };
                return <Tag color={colors[status]}>{labels[status] || status}</Tag>;
            },
        },
        {
            title: 'Total',
            dataIndex: 'total',
            key: 'total',
            align: 'right' as const,
            render: (amount: number) => `Bs. ${formatVenezuelanPrice(amount)}`,
        },
        {
            title: 'Pagado',
            dataIndex: 'paidAmount',
            key: 'paidAmount',
            align: 'right' as const,
            render: (amount: number) => `Bs. ${formatVenezuelanPrice(amount)}`,
        },
        {
            title: 'Balance',
            dataIndex: 'balance',
            key: 'balance',
            align: 'right' as const,
            render: (amount: number) => (
                <strong style={{ color: amount > 0 ? '#ff4d4f' : '#52c41a' }}>
                    Bs. {formatVenezuelanPrice(amount)}
                </strong>
            ),
        },
    ];

    return (
        <Modal
            title={`Estado de Cuenta - ${clientName}`}
            open={visible}
            onCancel={onClose}
            footer={null}
            width={1000}
        >
            <Descriptions bordered column={3} style={{ marginBottom: 16 }}>
                <Descriptions.Item label="Total Facturado">
                    Bs. {formatVenezuelanPrice(totalAmount)}
                </Descriptions.Item>
                <Descriptions.Item label="Total Pagado">
                    <span style={{ color: '#52c41a' }}>Bs. {formatVenezuelanPrice(totalPaid)}</span>
                </Descriptions.Item>
                <Descriptions.Item label="Balance Pendiente">
                    <strong style={{ color: '#ff4d4f', fontSize: 16 }}>
                        Bs. {formatVenezuelanPrice(totalDebt)}
                    </strong>
                </Descriptions.Item>
            </Descriptions>

            <Table
                dataSource={invoices}
                columns={columns}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                expandable={{
                    expandedRowRender: (record) => (
                        <div style={{ padding: '8px 24px' }}>
                            <strong>Pagos Realizados:</strong>
                            {record.payments && record.payments.length > 0 ? (
                                <ul style={{ marginTop: 8 }}>
                                    {record.payments.map((payment) => (
                                        <li key={payment.id}>
                                            {dayjs(payment.paymentDate).format('DD/MM/YYYY HH:mm')} -
                                            Bs. {formatVenezuelanPrice(payment.amount)} -
                                            {payment.paymentMethod}
                                            {payment.reference && ` (Ref: ${payment.reference})`}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p style={{ marginTop: 8, color: '#999' }}>No hay pagos registrados</p>
                            )}
                        </div>
                    ),
                }}
            />
        </Modal>
    );
};
