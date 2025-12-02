import { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, message, Col, Row } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '../../services/productsApi';
import type { Product, CreateProductDto } from '../../services/productsApi';

interface ProductFormModalProps {
    open: boolean;
    product: Product | null;
    onClose: () => void;
}

export const ProductFormModal = ({ open, product, onClose }: ProductFormModalProps) => {
    const [form] = Form.useForm();
    const queryClient = useQueryClient();
    const isEditing = !!product;

    // Create mutation
    const createMutation = useMutation({
        mutationFn: productsApi.create,
        onSuccess: () => {
            message.success('Producto creado exitosamente');
            queryClient.invalidateQueries({ queryKey: ['products'] });
            handleClose();
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Error al crear producto');
        },
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: CreateProductDto }) =>
            productsApi.update(id, data),
        onSuccess: () => {
            message.success('Producto actualizado exitosamente');
            queryClient.invalidateQueries({ queryKey: ['products'] });
            handleClose();
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Error al actualizar producto');
        },
    });

    useEffect(() => {
        if (product) {
            form.setFieldsValue(product);
        } else {
            form.resetFields();
        }
    }, [product, form]);

    const handleClose = () => {
        form.resetFields();
        onClose();
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            if (isEditing) {
                updateMutation.mutate({ id: product.id, data: values });
            } else {
                createMutation.mutate(values);
            }
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    return (
        <Modal
            title={isEditing ? 'Editar Producto' : 'Nuevo Producto'}
            open={open}
            onOk={handleSubmit}
            onCancel={handleClose}
            confirmLoading={createMutation.isPending || updateMutation.isPending}
            okText={isEditing ? 'Actualizar' : 'Crear'}
            cancelText="Cancelar"
            width={700}
        >
            <Form
                form={form}
                layout="vertical"
                autoComplete="off"
            >
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="SKU"
                            name="sku"
                            rules={[{ required: true, message: 'El SKU es requerido' }]}
                        >
                            <Input placeholder="PROD-001" />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item
                            label="Categoría"
                            name="category"
                        >
                            <Input placeholder="Ferretería, Materiales, etc." />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item
                    label="Nombre del Producto"
                    name="name"
                    rules={[{ required: true, message: 'El nombre es requerido' }]}
                >
                    <Input placeholder="Tornillo Phillips #8" />
                </Form.Item>

                <Form.Item
                    label="Descripción"
                    name="description"
                >
                    <Input.TextArea rows={2} placeholder="Descripción detallada del producto" />
                </Form.Item>

                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item
                            label="Precio de Costo"
                            name="costPrice"
                            rules={[
                                { required: true, message: 'El precio de costo es requerido' },
                                { type: 'number', min: 0, message: 'Debe ser mayor o igual a 0' },
                            ]}
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                prefix="$"
                                precision={2}
                                placeholder="10.00"
                            />
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item
                            label="Precio de Venta"
                            name="salePrice"
                            rules={[
                                { required: true, message: 'El precio de venta es requerido' },
                                { type: 'number', min: 0, message: 'Debe ser mayor o igual a 0' },
                            ]}
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                prefix="$"
                                precision={2}
                                placeholder="15.50"
                            />
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item
                            label="Stock Inicial"
                            name="stock"
                            initialValue={0}
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                min={0}
                                precision={0}
                                placeholder="0"
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item
                    label="Unidad de Medida"
                    name="unit"
                    initialValue="UND"
                >
                    <Input placeholder="UND, KG, LTS, MTS, etc." />
                </Form.Item>
            </Form>
        </Modal>
    );
};
