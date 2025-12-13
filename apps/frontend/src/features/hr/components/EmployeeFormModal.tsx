import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, Switch, message, Divider } from 'antd';
import { employeesApi } from '../services/employeesApi';
import type { Employee } from '../services/employeesApi';
import { useQueryClient, useMutation } from '@tanstack/react-query';

interface Props {
    visible: boolean;
    onClose: () => void;
    employee?: Employee | null;
}

export const EmployeeFormModal: React.FC<Props> = ({ visible, onClose, employee }) => {
    const [form] = Form.useForm();
    const queryClient = useQueryClient();
    const isEditing = !!employee;

    useEffect(() => {
        if (visible) {
            if (employee) {
                form.setFieldsValue(employee);
            } else {
                form.resetFields();
                form.setFieldsValue({ isActive: true, currency: 'VES' });
            }
        }
    }, [visible, employee, form]);

    const mutation = useMutation({
        mutationFn: (values: any) => {
            if (isEditing && employee) {
                return employeesApi.update(employee.id, values);
            }
            return employeesApi.create(values);
        },
        onSuccess: () => {
            message.success(`Empleado ${isEditing ? 'actualizado' : 'creado'} correctamente`);
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            onClose();
        },
        onError: () => {
            message.error('Error al guardar empleado');
        }
    });

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            mutation.mutate(values);
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    return (
        <Modal
            title={isEditing ? 'Editar Empleado' : 'Nuevo Empleado'}
            open={visible}
            onOk={handleOk}
            onCancel={onClose}
            confirmLoading={mutation.isPending}
            width={700}
        >
            <Form form={form} layout="vertical">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <Form.Item name="firstName" label="Nombres" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="lastName" label="Apellidos" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <Form.Item name="identification" label="Cédula / DNI" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="email" label="Correo Electrónico">
                        <Input type="email" />
                    </Form.Item>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <Form.Item name="phone" label="Teléfono">
                        <Input />
                    </Form.Item>
                    <Form.Item name="address" label="Dirección">
                        <Input />
                    </Form.Item>
                </div>

                <Divider orientation={"left" as any}>Datos Laborales</Divider>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <Form.Item name="position" label="Cargo" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="department" label="Departamento">
                        <Input />
                    </Form.Item>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <Form.Item name="baseSalary" label="Sueldo Base Mensual" rules={[{ required: true }]}>
                        <InputNumber
                            style={{ width: '100%' }}
                            precision={2}
                            addonBefore={
                                <Form.Item name="currency" noStyle>
                                    <Select style={{ width: 80 }}>
                                        <Select.Option value="VES">Bs</Select.Option>
                                        <Select.Option value="USD">$</Select.Option>
                                    </Select>
                                </Form.Item>
                            }
                        />
                    </Form.Item>

                    <Form.Item name="isActive" label="Estado" valuePropName="checked">
                        <Switch checkedChildren="Activo" unCheckedChildren="Inactivo" />
                    </Form.Item>
                </div>
            </Form>
        </Modal>
    );
};
