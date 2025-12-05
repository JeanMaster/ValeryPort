import { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Checkbox, message, Alert } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { currenciesApi } from '../../services/currenciesApi';
import type { Currency, CreateCurrencyDto, UpdateCurrencyDto } from '../../services/currenciesApi';

interface CurrencyFormModalProps {
    open: boolean;
    currency: Currency | null;
    onClose: () => void;
}

export const CurrencyFormModal = ({ open, currency, onClose }: CurrencyFormModalProps) => {
    const [form] = Form.useForm();
    const queryClient = useQueryClient();

    // Create mutation
    const createMutation = useMutation({
        mutationFn: currenciesApi.create,
        onSuccess: () => {
            message.success('Moneda creada exitosamente');
            queryClient.invalidateQueries({ queryKey: ['currencies'] });
            onClose();
            form.resetFields();
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Error al crear moneda');
        },
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: UpdateCurrencyDto }) =>
            currenciesApi.update(id, dto),
        onSuccess: () => {
            message.success('Moneda actualizada exitosamente');
            queryClient.invalidateQueries({ queryKey: ['currencies'] });
            onClose();
            form.resetFields();
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Error al actualizar moneda');
        },
    });

    // Load form data when editing
    useEffect(() => {
        if (currency) {
            form.setFieldsValue({
                name: currency.name,
                code: currency.code,
                symbol: currency.symbol,
                isPrimary: currency.isPrimary,
                exchangeRate: currency.exchangeRate,
            });
        } else {
            form.resetFields();
            form.setFieldsValue({ isPrimary: false });
        }
    }, [currency, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const dto: CreateCurrencyDto = {
                name: values.name,
                code: values.code,
                symbol: values.symbol,
                isPrimary: values.isPrimary || false,
                exchangeRate: values.isPrimary ? undefined : values.exchangeRate,
            };

            if (currency) {
                updateMutation.mutate({ id: currency.id, dto });
            } else {
                createMutation.mutate(dto);
            }
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    // Watch isPrimary changes
    const isPrimary = Form.useWatch('isPrimary', form);

    return (
        <Modal
            title={currency ? 'Editar Moneda' : 'Nueva Moneda'}
            open={open}
            onOk={handleSubmit}
            onCancel={onClose}
            confirmLoading={createMutation.isPending || updateMutation.isPending}
            okText={currency ? 'Actualizar' : 'Crear'}
            cancelText="Cancelar"
            width={600}
        >
            <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
                <Form.Item
                    label="Nombre"
                    name="name"
                    rules={[{ required: true, message: 'El nombre es requerido' }]}
                >
                    <Input placeholder="Ej: Dólar Americano, Bolívar" />
                </Form.Item>

                <Form.Item
                    label="Código (ISO 4217)"
                    name="code"
                    rules={[{ required: true, message: 'El código es requerido' }]}
                >
                    <Input placeholder="Ej: USD, VES, EUR" maxLength={3} style={{ textTransform: 'uppercase' }} />
                </Form.Item>

                <Form.Item
                    label="Símbolo"
                    name="symbol"
                    rules={[{ required: true, message: 'El símbolo es requerido' }]}
                >
                    <Input placeholder="Ej: $, Bs, €" maxLength={5} />
                </Form.Item>

                <Form.Item name="isPrimary" valuePropName="checked">
                    <Checkbox>
                        <strong>Es la moneda principal</strong>
                        <div style={{ fontSize: 12, color: '#888' }}>
                            La moneda principal es la base para las tasas de cambio
                        </div>
                    </Checkbox>
                </Form.Item>

                {isPrimary && (
                    <Alert
                        message="Esta moneda será marcada como principal"
                        description="Si ya existe otra moneda principal, será desmarcada automáticamente."
                        type="info"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />
                )}

                {!isPrimary && (
                    <Form.Item
                        label="Tasa de Cambio"
                        name="exchangeRate"
                        rules={[
                            { required: !isPrimary, message: 'La tasa de cambio es requerida para monedas secundarias' },
                            { type: 'number', min: 0.0001, message: 'La tasa debe ser mayor a 0' },
                        ]}
                        help="¿Cuántas unidades de la moneda principal equivalen a 1 unidad de esta moneda? Ej: 1 USD = 100 Bs"
                    >
                        <InputNumber
                            placeholder="Ej: 100.00"
                            style={{ width: '100%' }}
                            precision={4}
                            min={0.0001}
                        />
                    </Form.Item>
                )}
            </Form>
        </Modal>
    );
};
