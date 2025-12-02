import { useEffect } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clientsApi } from '../../services/clientsApi';
import type { Client, CreateClientDto } from '../../services/clientsApi';

interface ClientFormModalProps {
    open: boolean;
    client: Client | null;
    onClose: () => void;
}

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
        if (client) {
            form.setFieldsValue(client);
        } else {
            form.resetFields();
        }
    }, [client, form]);

    const handleClose = () => {
        form.resetFields();
        onClose();
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            if (isEditing) {
                updateMutation.mutate({ id: client.id, data: values });
            } else {
                createMutation.mutate(values);
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
            width={600}
        >
            <Form
                form={form}
                layout="vertical"
                autoComplete="off"
            >
                <Form.Item
                    label="RIF"
                    name="rif"
                    rules={[
                        { required: true, message: 'El RIF es requerido' },
                        { min: 10, max: 12, message: 'El RIF debe tener entre 10 y 12 caracteres' },
                    ]}
                >
                    <Input placeholder="J-12345678-9" />
                </Form.Item>

                <Form.Item
                    label="Nombre Comercial"
                    name="comercialName"
                    rules={[{ required: true, message: 'El nombre comercial es requerido' }]}
                >
                    <Input placeholder="Ferretería El Tornillo" />
                </Form.Item>

                <Form.Item
                    label="Razón Social"
                    name="legalName"
                >
                    <Input placeholder="Ferretería El Tornillo C.A." />
                </Form.Item>

                <Form.Item
                    label="Dirección"
                    name="address"
                >
                    <Input.TextArea rows={2} placeholder="Av. Principal, Caracas" />
                </Form.Item>

                <Form.Item
                    label="Teléfono"
                    name="phone"
                >
                    <Input placeholder="+58 412-1234567" />
                </Form.Item>

                <Form.Item
                    label="Email"
                    name="email"
                    rules={[{ type: 'email', message: 'Email inválido' }]}
                >
                    <Input placeholder="contacto@cliente.com" />
                </Form.Item>
            </Form>
        </Modal>
    );
};
