import { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Checkbox, message, Row, Col, Divider } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clientsApi } from '../../services/clientsApi';
import type { Client, CreateClientDto } from '../../services/clientsApi';
import { WhatsAppOutlined, InstagramOutlined, FacebookOutlined, TwitterOutlined } from '@ant-design/icons';

interface ClientFormModalProps {
    open: boolean;
    client: Client | null;
    onClose: () => void;
}

const { Option } = Select;

export const ClientFormModal = ({ open, client, onClose }: ClientFormModalProps) => {
    const [form] = Form.useForm();
    const queryClient = useQueryClient();
    const isEditing = !!client;

    // Create mutation
    const createMutation = useMutation({
        mutationFn: clientsApi.create,
        onSuccess: () => {
            message.success('Cliente creado exitosamente');
            queryClient.invalidateQueries({ queryKey: ['clients'] });
            handleClose();
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Error al crear cliente');
        },
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: CreateClientDto }) =>
            clientsApi.update(id, data),
        onSuccess: () => {
            message.success('Cliente actualizado exitosamente');
            queryClient.invalidateQueries({ queryKey: ['clients'] });
            handleClose();
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Error al actualizar cliente');
        },
    });

    useEffect(() => {
        if (open) {
            if (client) {
                // Split ID if editing
                const [prefix, number] = client.id.split('-');
                form.setFieldsValue({
                    ...client,
                    idPrefix: prefix,
                    idNumber: number,
                });
            } else {
                form.resetFields();
                form.setFieldsValue({ idPrefix: 'V', hasWhatsapp: false });
            }
        }
    }, [open, client, form]);

    const handleClose = () => {
        form.resetFields();
        onClose();
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            // Combine Prefix and Number
            const fullId = `${values.idPrefix}-${values.idNumber}`;

            const payload: CreateClientDto = {
                id: fullId,
                name: values.name,
                address: values.address,
                phone: values.phone,
                hasWhatsapp: values.hasWhatsapp,
                email: values.email,
                social1: values.social1,
                social2: values.social2,
                social3: values.social3,
            };

            if (isEditing) {
                // Note: ID cannot be changed in update usually if it's PK
                // If ID is changed, it might break reference. 
                // Currently Backend uses ID as key. If we change it, it's a new record or needs specific handling.
                // Assuming ID not editable on Edit for safety, or we handle it in backend.
                // For now, let's DISABLE id editing if (isEditing)
                updateMutation.mutate({ id: client.id, data: payload });
            } else {
                createMutation.mutate(payload);
            }
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    return (
        <Modal
            title={isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}
            open={open}
            onOk={handleSubmit}
            onCancel={handleClose}
            confirmLoading={createMutation.isPending || updateMutation.isPending}
            okText={isEditing ? 'Actualizar' : 'Crear'}
            cancelText="Cancelar"
            width={700}
            centered
        >
            <Form
                form={form}
                layout="vertical"
                autoComplete="off"
            >
                <Row gutter={16} align="middle">
                    {/* ID Selection */}
                    <Col span={6}>
                        <Form.Item
                            label="Tipo"
                            name="idPrefix"
                            rules={[{ required: true, message: 'Requerido' }]}
                        >
                            <Select disabled={isEditing}>
                                <Option value="V">V</Option>
                                <Option value="E">E</Option>
                                <Option value="J">J</Option>
                                <Option value="G">G</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={18}>
                        <Form.Item
                            label="Documento / RIF"
                            name="idNumber"
                            rules={[
                                { required: true, message: 'El número es requerido' },
                                { pattern: /^\d+$/, message: 'Solo números' }
                            ]}
                        >
                            <Input placeholder="12345678" disabled={isEditing} />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item
                    label="Nombre y Apellido / Razón Social"
                    name="name"
                    rules={[{ required: true, message: 'El nombre es requerido' }]}
                >
                    <Input placeholder="Juan Pérez / Empresa S.A." />
                </Form.Item>

                <Form.Item
                    label="Dirección"
                    name="address"
                >
                    <Input.TextArea rows={2} placeholder="Av. Principal, Edif. Central..." />
                </Form.Item>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Teléfono"
                            name="phone"
                            style={{ marginBottom: 0 }}
                        >
                            <Input placeholder="0412-1234567" addonAfter={
                                <Form.Item name="hasWhatsapp" valuePropName="checked" noStyle>
                                    <Checkbox><WhatsAppOutlined style={{ color: 'green' }} /></Checkbox>
                                </Form.Item>
                            } />
                        </Form.Item>
                        <div style={{ fontSize: 11, color: '#888', marginBottom: 15 }}>Marque si tiene Whatsapp</div>

                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[{ type: 'email', message: 'Email inválido' }]}
                        >
                            <Input placeholder="cliente@email.com" />
                        </Form.Item>
                    </Col>
                </Row>

                <Divider orientation="left" style={{ margin: '15px 0' }}>Redes Sociales (Opcional)</Divider>

                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item name="social1" placeholder="Instagram">
                            <Input prefix={<InstagramOutlined style={{ color: '#E1306C' }} />} placeholder="Usuario" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="social2" placeholder="Facebook">
                            <Input prefix={<FacebookOutlined style={{ color: '#4267B2' }} />} placeholder="Usuario" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="social3" placeholder="Twitter/X">
                            <Input prefix={<TwitterOutlined />} placeholder="Usuario" />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};
