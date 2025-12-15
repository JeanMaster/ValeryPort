
import { Modal, Form, Input, InputNumber, Select, message, Divider } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { purchasesApi } from '../../../services/purchasesApi';
import type { Purchase } from '../../../services/purchasesApi';
import { formatVenezuelanPrice } from '../../../utils/formatters';

interface RegisterPurchasePaymentModalProps {
    open: boolean;
    purchase: Purchase | null;
    onClose: () => void;
}

export const RegisterPurchasePaymentModal = ({ open, purchase, onClose }: RegisterPurchasePaymentModalProps) => {
    const [form] = Form.useForm();
    const queryClient = useQueryClient();

    const registerPaymentMutation = useMutation({
        mutationFn: purchasesApi.registerPayment,
        onSuccess: () => {
            message.success('Pago registrado exitosamente');
            queryClient.invalidateQueries({ queryKey: ['purchases'] });
            onClose();
            form.resetFields();
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Error al registrar pago');
        },
    });

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (purchase) {
                registerPaymentMutation.mutate({
                    purchaseId: purchase.id,
                    amount: values.amount,
                    paymentMethod: values.paymentMethod,
                    reference: values.reference,
                    notes: values.notes,
                });
            }
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    if (!purchase) return null;

    return (
        <Modal
            title="Registrar Pago a Proveedor"
            open={open}
            onOk={handleSubmit}
            onCancel={onClose}
            confirmLoading={registerPaymentMutation.isPending}
            okText="Registrar Pago"
            cancelText="Cancelar"
        >
            <div style={{ marginBottom: 16 }}>
                <p><strong>Proveedor:</strong> {purchase.supplier.comercialName}</p>
                <p><strong>Factura:</strong> {purchase.invoiceNumber || 'N/A'}</p>
                <p>
                    <strong>Saldo Pendiente:</strong>
                    <span style={{ color: 'red', marginLeft: 8 }}>
                        {purchase.currencyCode} {formatVenezuelanPrice(purchase.balance)}
                    </span>
                </p>
            </div>

            <Divider />

            <Form form={form} layout="vertical">
                <Form.Item
                    label="Monto a Pagar"
                    name="amount"
                    rules={[
                        { required: true, message: 'Requerido' },
                        { type: 'number', min: 0.01, message: 'Debe ser mayor a 0' },
                        {
                            validator: (_, value) => {
                                if (value > purchase.balance + 0.01) { // Tolerance
                                    return Promise.reject('El monto excede el saldo pendiente');
                                }
                                return Promise.resolve();
                            }
                        }
                    ]}
                    initialValue={purchase.balance}
                >
                    <InputNumber
                        style={{ width: '100%' }}
                        precision={2}
                        prefix={purchase.currencyCode === 'USD' ? '$' : 'Bs'}
                    />
                </Form.Item>

                <Form.Item
                    label="Método de Pago"
                    name="paymentMethod"
                    rules={[{ required: true, message: 'Requerido' }]}
                    initialValue="TRANSFER"
                >
                    <Select
                        options={[
                            { value: 'CASH', label: 'Efectivo' },
                            { value: 'TRANSFER', label: 'Transferencia' },
                            { value: 'PAGO_MOVIL', label: 'Pago Móvil' },
                            { value: 'ZELLE', label: 'Zelle' },
                            { value: 'USDT', label: 'USDT (Binance)' },
                        ]}
                    />
                </Form.Item>

                <Form.Item label="Referencia / Comprobante" name="reference">
                    <Input placeholder="Ej: 123456" />
                </Form.Item>

                <Form.Item label="Notas" name="notes">
                    <Input.TextArea rows={2} />
                </Form.Item>
            </Form>
        </Modal>
    );
};
