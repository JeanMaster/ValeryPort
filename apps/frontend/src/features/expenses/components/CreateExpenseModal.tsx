import { useState } from 'react';
import { Modal, Form, Input, InputNumber, DatePicker, Select, message, Space } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { expensesApi, type CreateExpenseDto } from '../../../services/expensesApi';
import { usePOSStore } from '../../../store/posStore';

interface CreateExpenseModalProps {
    open: boolean;
    onCancel: () => void;
}

const EXPENSE_CATEGORIES = [
    'SERVICIOS',
    'NOMINA',
    'MANTENIMIENTO',
    'ALQUILER',
    'PROVEEDORES',
    'TRANSPORTE',
    'MARKETING',
    'IMPUESTOS',
    'OTROS'
];

const PAYMENT_METHODS = [
    { value: 'CASH', label: 'Efectivo' },
    { value: 'TRANSFER', label: 'Transferencia' },
    { value: 'PAGO_MOVIL', label: 'Pago Móvil' },
    { value: 'DEBIT', label: 'Tarjeta Débito' },
    { value: 'CREDIT', label: 'Tarjeta Crédito' },
    { value: 'ZELLE', label: 'Zelle' },
];

export const CreateExpenseModal = ({ open, onCancel }: CreateExpenseModalProps) => {
    const [form] = Form.useForm();
    const queryClient = useQueryClient();
    const { primaryCurrency } = usePOSStore();
    const [loading, setLoading] = useState(false);

    const createExpenseMutation = useMutation({
        mutationFn: expensesApi.create,
        onSuccess: () => {
            message.success('Gasto registrado exitosamente');
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            form.resetFields();
            onCancel();
        },
        onError: (error) => {
            message.error('Error al registrar el gasto');
            console.error(error);
        }
    });

    const handleSubmit = async (values: any) => {
        setLoading(true);
        try {
            const expenseData: CreateExpenseDto = {
                description: values.description,
                amount: Number(values.amount),
                date: values.date ? values.date.toISOString() : undefined,
                category: values.category,
                paymentMethod: values.paymentMethod,
                reference: values.reference,
                notes: values.notes,
            };
            await createExpenseMutation.mutateAsync(expenseData);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Registrar Nuevo Gasto"
            open={open}
            onCancel={onCancel}
            onOk={() => form.submit()}
            confirmLoading={loading}
            okText="Registrar"
            cancelText="Cancelar"
            width={600}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                    date: dayjs(),
                    paymentMethod: 'CASH',
                    category: 'OTROS'
                }}
            >
                <Form.Item
                    name="description"
                    label="Descripción del Gasto"
                    rules={[{ required: true, message: 'La descripción es obligatoria' }]}
                >
                    <Input placeholder="Ej. Pago servicio internet" autoFocus />
                </Form.Item>

                <Space style={{ display: 'flex' }} align="start">
                    <Form.Item
                        name="amount"
                        label={`Monto (${primaryCurrency?.symbol || 'Bs.'})`}
                        rules={[{ required: true, message: 'Ingrese el monto' }]}
                        style={{ width: '200px' }}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            min={0.01}
                            precision={2}
                            placeholder="0.00"
                        />
                    </Form.Item>

                    <Form.Item
                        name="date"
                        label="Fecha"
                        rules={[{ required: true, message: 'Seleccione la fecha' }]}
                        style={{ width: '200px' }}
                    >
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                </Space>

                <Space style={{ display: 'flex' }} align="start">
                    <Form.Item
                        name="category"
                        label="Categoría"
                        rules={[{ required: true }]}
                        style={{ width: '200px' }}
                    >
                        <Select
                            options={EXPENSE_CATEGORIES.map(c => ({ value: c, label: c }))}
                            showSearch
                        />
                    </Form.Item>

                    <Form.Item
                        name="paymentMethod"
                        label="Método de Pago"
                        rules={[{ required: true }]}
                        style={{ width: '200px' }}
                    >
                        <Select options={PAYMENT_METHODS} />
                    </Form.Item>
                </Space>

                <Form.Item
                    name="reference"
                    label="Número de Referencia (Opcional)"
                >
                    <Input placeholder="Ej. 12345678" />
                </Form.Item>

                <Form.Item
                    name="notes"
                    label="Notas Adicionales"
                >
                    <Input.TextArea rows={2} />
                </Form.Item>
            </Form>
        </Modal>
    );
};
