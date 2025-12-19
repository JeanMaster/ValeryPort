import { useEffect } from 'react';
import { Card, Form, Button, Select, Skeleton, message, Alert, Switch, InputNumber } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { companySettingsApi } from '../../services/companySettingsApi';
import { currenciesApi } from '../../services/currenciesApi';

// Sub-componente del formulario
const GeneralOptionsForm = ({ settings, onSubmit, isUpdating }: { settings: any, onSubmit: (values: any) => void, isUpdating: boolean }) => {
    const [form] = Form.useForm();

    const { data: currencies, isLoading: isLoadingCurrencies } = useQuery({
        queryKey: ['currencies'],
        queryFn: currenciesApi.getAll,
    });

    useEffect(() => {
        if (settings) {
            console.log('Settings loaded:', settings);
            form.setFieldsValue({
                preferredSecondaryCurrencyId: settings.preferredSecondaryCurrencyId,
                autoUpdateRates: settings.autoUpdateRates,
                updateFrequency: settings.updateFrequency || 60,
            });
        }
    }, [settings, form]);

    const secondaryCurrencies = currencies?.filter(c => !c.isPrimary && c.active) || [];

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={onSubmit}
            style={{ maxWidth: 600 }}
        >
            <Alert
                message="Configuración de Moneda Secundaria"
                description="Seleccione la moneda secundaria que se utilizará por defecto en el Punto de Venta (POS) para mostrar precios referenciales."
                type="info"
                showIcon
                style={{ marginBottom: 24 }}
            />

            <Form.Item
                label="Moneda Secundaria Preferida (POS)"
                name="preferredSecondaryCurrencyId"
                extra="Esta moneda se mostrará junto a la moneda principal en el grid de productos y carrito del POS."
            >
                <Select
                    placeholder="Seleccione una moneda"
                    size="large"
                    loading={isLoadingCurrencies}
                    allowClear
                >
                    {secondaryCurrencies.map(currency => (
                        <Select.Option key={currency.id} value={currency.id}>
                            {currency.name} ({currency.symbol}) - Tasa: {currency.exchangeRate}
                        </Select.Option>
                    ))}
                </Select>
            </Form.Item>

            <Alert
                message="Automatización de Tasas"
                description="Active esta opción para actualizar automáticamente las tasas de cambio de las monedas configuradas (ej. USDT desde Binance P2P)."
                type="warning"
                showIcon
                style={{ marginBottom: 24, marginTop: 24 }}
            />

            <Form.Item
                label="Activar Actualización Automática"
                name="autoUpdateRates"
                valuePropName="checked"
                style={{ marginBottom: 12 }}
            >
                <Switch />
            </Form.Item>

            <Form.Item
                label="Frecuencia de Actualización (Minutos)"
                name="updateFrequency"
                rules={[{ required: true, message: 'Ingrese la frecuencia' }]}
            >
                <InputNumber min={5} max={1440} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item>
                <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    icon={<SaveOutlined />}
                    loading={isUpdating}
                >
                    Guardar Configuración
                </Button>
            </Form.Item>
        </Form>
    );
};

export const GeneralOptionsPage = () => {
    const queryClient = useQueryClient();

    // Fetch settings
    const { data: settings, isLoading } = useQuery({
        queryKey: ['company-settings'],
        queryFn: companySettingsApi.getSettings,
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: companySettingsApi.updateSettings,
        onSuccess: () => {
            message.success('Opciones generales actualizadas exitosamente');
            queryClient.invalidateQueries({ queryKey: ['company-settings'] });
            // También invalidar POS store si es necesario (se hará via fetch al montar POS)
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Error al actualizar opciones');
        },
    });

    const handleSubmit = (values: any) => {
        // Mantenemos los valores existentes y solo actualizamos lo nuevo
        if (!settings) return;

        updateMutation.mutate({
            name: settings.name,
            rif: settings.rif,
            logoUrl: settings.logoUrl,
            ...values,
        });
    };

    return (
        <div style={{ padding: 24 }}>
            <Card title="Opciones Generales del Sistema">
                {isLoading ? (
                    <Skeleton active paragraph={{ rows: 6 }} />
                ) : (
                    <GeneralOptionsForm
                        settings={settings}
                        onSubmit={handleSubmit}
                        isUpdating={updateMutation.isPending}
                    />
                )}
            </Card>
        </div>
    );
};
