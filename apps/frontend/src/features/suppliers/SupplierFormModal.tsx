import { useEffect } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { suppliersApi } from '../../services/suppliersApi';
import type { Supplier, CreateSupplierDto } from '../../services/suppliersApi';

interface SupplierFormModalProps {
    open: boolean;
    supplier: Supplier | null;
    onClose: () => void;
}

export const SupplierFormModal = ({ open, supplier, onClose }: SupplierFormModalProps) => {
    const [form] = Form.useForm();
    const queryClient = useQueryClient();
    const isEditing = !!supplier;

    // Create mutation
    const createMutation = useMutation({
        mutationFn: suppliersApi.create,
        onSuccess: () => {
            message.success('Proveedor creado exitosamente');
            queryClient.invalidateQueries({ queryKey: ['suppliers'] });
            handleClose();
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Error al crear proveedor');
        },
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: CreateSupplierDto }) =>
            suppliersApi.update(id, data),
        onSuccess: () => {
            message.success('Proveedor actualizado exitosamente');
            queryClient.invalidateQueries({ queryKey: ['suppliers'] });
            handleClose();
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Error al actualizar proveedor');
        },
    });

    useEffect(() => {
        if (supplier) {
            form.setFieldsValue(supplier);
        } else {
            form.resetFields();
        }
    }, [supplier, form]);

    const handleClose = () => {
        form.resetFields();
        onClose();
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            if (isEditing) {
                updateMutation.mutate({ id: supplier.id, data: values });
            } else {
                createMutation.mutate(values);
            }
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    return (
        <Modal
            title={isEditing ? 'Editar Proveedor' : 'Nuevo Proveedor'}
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
                    <Input placeholder="J-98765432-1" />
                </Form.Item>

                <Form.Item
                    label="Nombre Comercial"
                    name="comercialName"
                    rules={[{ required: true, message: 'El nombre comercial es requerido' }]}
                >
                    <Input placeholder="Distribuidora ABC" />
                </Form.Item>

                <Form.Item
                    label="Razón Social"
                    name="legalName"
                >
                    <Input placeholder="Distribuidora ABC C.A." />
                </Form.Item>

                <Form.Item
                    label="Nombre de Contacto"
                    name="contactName"
                >
                    <Input placeholder="Juan Pérez" />
                </Form.Item>

                <Form.Item
                    label="Categoría"
                    name="category"
                >
                    <Input placeholder="Materiales, Servicios, etc." />
                </Form.Item>

                <Form.Item
                    label="Dirección"
                    name="address"
                >
                    <Input.TextArea rows={2} placeholder="Zona Industrial, Caracas" />
                </Form.Item>

                <Form.Item
                    label="Teléfono"
                    name="phone"
                >
                    <Input placeholder="+58 212-9876543" />
                </Form.Item>

                <Form.Item
                    label="Email"
                    name="email"
                    rules={[{ type: 'email', message: 'Email inválido' }]}
                >
                    <Input placeholder="ventas@proveedor.com" />
                </Form.Item>
            </Form>
        </Modal>
    );
};
