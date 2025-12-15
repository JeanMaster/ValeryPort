
import { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, DatePicker, Select, message, Space } from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { expensesApi, type CreateExpenseDto } from '../../../services/expensesApi';
import { currenciesApi } from '../../../services/currenciesApi';
import { formatVenezuelanPrice } from '../../../utils/formatters';

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
    { value: 'USDT', label: 'USDT (Binance)' },
];

export const CreateExpenseModal = ({ open, onCancel }: CreateExpenseModalProps) => {
    const [form] = Form.useForm();
    const queryClient = useQueryClient();
    const [loading, setLoading] = useState(false);

    // Watch fields for calculations
    const selectedCurrencyId = Form.useWatch('currencyId', form);
    const amount = Form.useWatch('amount', form);
    const exchangeRate = Form.useWatch('exchangeRate', form);

    // Fetch currencies
    const { data: currencies = [] } = useQuery({
        queryKey: ['currencies'],
        queryFn: currenciesApi.getAll,
    });

    // Set default values when modal opens
    useEffect(() => {
        if (open && currencies.length > 0) {
            // Default to USD usually if available, or Primary
            const primary = currencies.find(c => c.isPrimary);

            // Try to set USD as default if primary is VES, because user said options are usually USD
            const usd = currencies.find(c => c.code === 'USD');
            const defaultCurrency = usd || primary || currencies[0];

            form.setFieldValue('currencyId', defaultCurrency.id);

            // Set Exchange Rate: Always attempt to set the USD Rate (Secondary)
            const usdCurrency = currencies.find(c => c.code === 'USD');
            if (usdCurrency) {
                form.setFieldValue('exchangeRate', usdCurrency.exchangeRate || 1);
            } else {
                form.setFieldValue('exchangeRate', 1);
            }
        }
    }, [open, currencies, form]);

    // Update rate when currency changes? 
    // NO. If we are in Venezuela, the rate is "The Rate". 
    // It doesn't change because I decided to pay in Bs. The Rate today is 50.
    // If I pay in Bs, Rate is 50. If I pay in $, Rate is 50.
    // So we REMOVE the logic that overwrites the rate when switching currency.
    // UNLESS the user switches to Euro? 
    // Let's assume the user knows what they are doing. 
    // We only set the default on load.
    const handleCurrencyChange = () => {
        // Do nothing to the rate. Preserve the manually entered or default system rate.
    };

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
            const selectedCurrency = currencies.find(c => c.id === values.currencyId);
            const expenseData: CreateExpenseDto = {
                description: values.description,
                amount: Number(values.amount),
                currencyCode: selectedCurrency?.code || 'VES',
                exchangeRate: Number(values.exchangeRate),
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

    // Calculate equivalent
    const selectedCurrencyObj = currencies.find(c => c.id === selectedCurrencyId);
    let conversionPreview = null;

    // Logic: 
    // If currency is NOT primary (e.g. USD), show equivalent in Primary (VES) = amount * rate.
    // If currency IS primary (VES), show equivalent in Secondary (USD) = amount / rate (assuming rate is stored as VES/USD).
    // The user said: "1000 bs and rate is 500 per $, that is 2 dollars". So Rate is VES per USD.

    if (selectedCurrencyObj && amount && exchangeRate) {
        if (selectedCurrencyObj.isPrimary) {
            // It's VES. Convert to USD (assuming USD is secondary with rate > 1)
            // Find secondary currency
            const secondary = currencies.find(c => !c.isPrimary);
            if (secondary) {
                // Usually secondary rate in system is stored on the secondary currency.
                // If VES is primary (rate 1), USD is secondary (rate 50).
                // We are inputting VES amount.
                // Wait, if I am selecting VES, the exchange rate field should probably be disabled or 1?
                // No, in hyperinflation, the rate changes daily.
                // If I pay in Bs, the rate doesn't really matter for the transaction itself, but for REPORTING in USD.
                // So if I pay 500 Bs, and rate is 50, that's $10.
                // So conversion = amount / rate (if rate is Bs/$).
                const usdAmount = amount / exchangeRate; // Simplified assumption
                conversionPreview = `Equivalente en Divisa: ${formatVenezuelanPrice(usdAmount, '$')}`;
            }
        } else {
            // It's USD. Convert to VES.
            const vesAmount = amount * exchangeRate;
            conversionPreview = `Equivalente en Bs: ${formatVenezuelanPrice(vesAmount, 'Bs.')}`;
        }
    }

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

                <Space style={{ display: 'flex', marginBottom: 0 }} align="start" size={16}>
                    <Form.Item
                        name="currencyId"
                        label="Moneda de Pago"
                        rules={[{ required: true }]}
                        style={{ width: '140px' }}
                    >
                        <Select
                            options={currencies.map(c => ({
                                value: c.id,
                                label: c.code
                            }))}
                            onChange={handleCurrencyChange}
                        />
                    </Form.Item>

                    <Form.Item
                        name="amount"
                        label="Monto"
                        rules={[{ required: true, message: 'Requerido' }]}
                        style={{ width: '140px' }}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            min={0.01}
                            precision={2}

                        />
                    </Form.Item>

                    <Form.Item
                        name="exchangeRate"
                        label="Tasa de Cambio"
                        rules={[{ required: true, message: 'Requerido' }]}
                        style={{ width: '140px' }}
                        help={conversionPreview}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            min={0.0001}
                            precision={4}
                        />
                    </Form.Item>
                </Space>

                <Form.Item
                    name="date"
                    label="Fecha"
                    rules={[{ required: true, message: 'Seleccione la fecha' }]}
                >
                    <DatePicker style={{ width: '100%' }} />
                </Form.Item>

                <Space style={{ display: 'flex' }} align="start" size={16}>
                    <Form.Item
                        name="category"
                        label="Categoría"
                        rules={[{ required: true }]}
                        style={{ width: '220px' }}
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
                        style={{ width: '220px' }}
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
