import { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Upload, message, Space } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { companySettingsApi } from '../../services/companySettingsApi';

export const CompanySettingsPage = () => {
    const [form] = Form.useForm();
    const queryClient = useQueryClient();
    const [logoUrl, setLogoUrl] = useState<string>('');

    // Fetch settings
    const { data: settings, isLoading } = useQuery({
        queryKey: ['company-settings'],
        queryFn: companySettingsApi.getSettings,
    });

    // Update form when settings load
    useEffect(() => {
        if (settings) {
            form.setFieldsValue({
                name: settings.name,
                rif: settings.rif,
            });
            if (settings.logoUrl) {
                setLogoUrl(settings.logoUrl);
            }
        }
    }, [settings, form]);

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: companySettingsApi.updateSettings,
        onSuccess: () => {
            message.success('Configuración actualizada exitosamente');
            queryClient.invalidateQueries({ queryKey: ['company-settings'] });
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Error al actualizar configuración');
        },
    });

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            updateMutation.mutate({
                ...values,
                logoUrl: logoUrl || undefined,
            });
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    // Handle logo upload (simulado - convertir a base64)
    const handleLogoChange = (info: any) => {
        const file = info.file.originFileObj || info.file;
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                setLogoUrl(result);
                message.success('Logo cargado. Guarda los cambios para aplicar.');
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <Card title="Datos de Empresa" loading={isLoading}>
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                style={{ maxWidth: 600 }}
            >
                <Form.Item
                    label="Nombre de la Empresa"
                    name="name"
                    rules={[{ required: true, message: 'El nombre es requerido' }]}
                >
                    <Input placeholder="Valery Corporativo" size="large" />
                </Form.Item>

                <Form.Item
                    label="RIF / ID"
                    name="rif"
                    rules={[{ required: true, message: 'El RIF es requerido' }]}
                >
                    <Input placeholder="J-12345678-9" size="large" />
                </Form.Item>

                <Form.Item label="Logo de la Empresa">
                    <Space direction="vertical" style={{ width: '100%' }}>
                        {logoUrl && (
                            <div style={{
                                border: '1px solid #d9d9d9',
                                borderRadius: 8,
                                padding: 16,
                                textAlign: 'center',
                                background: '#fafafa',
                            }}>
                                <img
                                    src={logoUrl}
                                    alt="Logo"
                                    style={{
                                        width: '120px',
                                        height: '120px',
                                        objectFit: 'contain',
                                        borderRadius: '50%',
                                        border: '3px solid #1890ff',
                                    }}
                                />
                            </div>
                        )}
                        <Upload
                            accept="image/*"
                            maxCount={1}
                            beforeUpload={() => false}
                            onChange={handleLogoChange}
                            showUploadList={false}
                        >
                            <Button icon={<UploadOutlined />} size="large">
                                {logoUrl ? 'Cambiar Logo' : 'Subir Logo'}
                            </Button>
                        </Upload>
                        <span style={{ color: '#8c8c8c', fontSize: 12 }}>
                            Recomendado: Imagen cuadrada para mejor visualización circular
                        </span>
                    </Space>
                </Form.Item>

                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        size="large"
                        loading={updateMutation.isPending}
                    >
                        Guardar Cambios
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
};
