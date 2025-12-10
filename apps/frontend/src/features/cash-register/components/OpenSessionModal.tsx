import { Modal, Form, InputNumber, Input, message } from 'antd';
import { useState } from 'react';
import { cashRegisterApi, type OpenSessionDto } from '../../../services/cashRegisterApi';

const { TextArea } = Input;

interface OpenSessionModalProps {
    open: boolean;
    registerId: string;
    onCancel: () => void;
    onSuccess: () => void;
}

export const OpenSessionModal = ({ open, registerId, onCancel, onSuccess }: OpenSessionModalProps) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            const dto: OpenSessionDto = {
                registerId,
                openingBalance: values.openingBalance,
                openedBy: values.openedBy || 'Usuario',
                openingNotes: values.notes
            };

            await cashRegisterApi.openSession(dto);
            message.success('Caja abierta exitosamente');
            form.resetFields();
            onSuccess();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Error al abrir caja');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onCancel();
    };

    return (
        <Modal
            title="Abrir Caja"
            open={open}
            onCancel={handleCancel}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText="Abrir Caja"
            cancelText="Cancelar"
            width={500}
        >
            <Form
                form={form}
                layout="vertical"
                style={{ marginTop: 20 }}
            >
                <Form.Item
                    name="openingBalance"
                    label="Saldo Inicial"
                    rules={[
                        { required: true, message: 'Ingresa el saldo inicial' },
                        { type: 'number', min: 0, message: 'Debe ser mayor o igual a 0' }
                    ]}
                >
                    <InputNumber
                        style={{ width: '100%' }}
                        placeholder="0.00"
                        min={0}
                        precision={2}
                        prefix="Bs."
                        size="large"
                    />
                </Form.Item>

                <Form.Item
                    name="openedBy"
                    label="Responsable"
                    rules={[{ required: true, message: 'Ingresa el nombre del responsable' }]}
                    initialValue="Usuario"
                >
                    <Input placeholder="Nombre del cajero" />
                </Form.Item>

                <Form.Item
                    name="notes"
                    label="Notas (opcional)"
                >
                    <TextArea
                        rows={3}
                        placeholder="Observaciones sobre la apertura..."
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};
