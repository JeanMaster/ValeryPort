import { useState } from 'react';
import {
    Modal,
    Steps,
    Input,
    Button,
    Table,
    InputNumber,
    Select,
    Radio,
    Space,
    Typography,
    Form,
    message,
    Spin,
    Alert,
    Checkbox
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { salesApi, type Sale } from '../../../services/salesApi';
import { returnsApi, type CreateReturnDto, type CreateReturnItemDto } from '../../../services/returnsApi';
import { formatVenezuelanPrice } from '../../../utils/formatters';
import dayjs from 'dayjs';

const { Title } = Typography;
const { TextArea } = Input;

interface CreateReturnModalProps {
    open: boolean;
    onCancel: () => void;
    onSuccess: () => void;
}

interface SelectedItem extends CreateReturnItemDto {
    productName: string;
    productSku: string;
}

export const CreateReturnModal = ({ open, onCancel, onSuccess }: CreateReturnModalProps) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [sale, setSale] = useState<Sale | null>(null);
    const [loading, setLoading] = useState(false);
    const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
    const [returnType, setReturnType] = useState<'REFUND' | 'EXCHANGE_SAME' | 'EXCHANGE_DIFFERENT'>('REFUND');
    const [reason, setReason] = useState<string>('DEFECTIVE');
    const [condition, setCondition] = useState<string>('GOOD');
    const [refundMethod, setRefundMethod] = useState<string>('CASH');
    const [notes, setNotes] = useState('');

    const resetModal = () => {
        setCurrentStep(0);
        setInvoiceNumber('');
        setSale(null);
        setSelectedItems([]);
        setReturnType('REFUND');
        setReason('DEFECTIVE');
        setCondition('GOOD');
        setRefundMethod('CASH');
        setNotes('');
    };

    const handleCancel = () => {
        resetModal();
        onCancel();
    };

    // Step 1: Search invoice
    const handleSearchInvoice = async () => {
        if (!invoiceNumber.trim()) {
            message.error('Ingresa un número de factura');
            return;
        }

        setLoading(true);
        try {
            const sales = await salesApi.getAll();
            const foundSale = sales.find(s => s.invoiceNumber === invoiceNumber.trim());

            if (!foundSale) {
                message.error('Factura no encontrada');
                setSale(null);
                return;
            }

            // Validate eligibility
            const saleDate = new Date(foundSale.date);
            const today = new Date();
            const daysDiff = Math.floor((today.getTime() - saleDate.getTime()) / (1000 * 60 * 60 * 24));

            if (daysDiff > 30) {
                message.warning('Esta factura supera los 30 días. Verifica la política de devolución.');
            }

            setSale(foundSale);
            setCurrentStep(1);
        } catch (error) {
            message.error('Error al buscar la factura');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Select items
    const handleItemSelection = (checked: boolean, item: any) => {
        if (checked) {
            // Defensive check for product data
            if (!item.product) {
                message.error('Datos de producto no disponibles');
                return;
            }

            const newItem: SelectedItem = {
                productId: item.productId,
                productName: item.product.name,
                productSku: item.product.sku,
                quantity: Number(item.quantity),
                unitPrice: Number(item.unitPrice),
                total: Number(item.total)
            };
            setSelectedItems([...selectedItems, newItem]);
        } else {
            setSelectedItems(selectedItems.filter(i => i.productId !== item.productId));
        }
    };

    const updateItemQuantity = (productId: string, quantity: number) => {
        setSelectedItems(selectedItems.map(item =>
            item.productId === productId
                ? { ...item, quantity, total: quantity * item.unitPrice }
                : item
        ));
    };


    // Step 3: Choose return type
    const handleNext = () => {
        if (currentStep === 1 && selectedItems.length === 0) {
            message.error('Selecciona al menos un item para devolver');
            return;
        }
        setCurrentStep(currentStep + 1);
    };

    // Step 4: Submit
    const handleSubmit = async () => {
        if (!sale) return;

        const refundAmount = selectedItems.reduce((sum, item) => sum + item.total, 0);

        const dto: CreateReturnDto = {
            originalSaleId: sale.id,
            returnType,
            reason: reason as any,
            productCondition: condition as any,
            items: selectedItems.map(({ productName, productSku, ...item }) => item),
            refundAmount,
            refundMethod: returnType === 'REFUND' ? refundMethod as any : undefined,
            notes,
            requestedBy: 'Usuario' // TODO: Get from auth
        };

        setLoading(true);
        try {
            await returnsApi.create(dto);
            message.success('Devolución creada exitosamente');
            resetModal();
            onSuccess();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Error al crear devolución');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const itemsColumns = [
        {
            title: 'Producto',
            key: 'product',
            render: (_: any, record: any) => (
                <div>
                    <div><strong>{record.product?.name || 'Producto sin datos'}</strong></div>
                    <div style={{ fontSize: 11, color: '#888' }}>{record.product?.sku || ''}</div>
                </div>
            )
        },
        {
            title: 'Cant. Original',
            dataIndex: 'quantity',
            key: 'originalQty',
            width: 100,
            render: (qty: number) => Number(qty).toFixed(0)
        },
        {
            title: 'Precio Unit.',
            dataIndex: 'unitPrice',
            key: 'unitPrice',
            width: 100,
            render: (price: number) => formatVenezuelanPrice(Number(price))
        },
        {
            title: 'Total',
            dataIndex: 'total',
            key: 'total',
            width: 100,
            render: (total: number) => formatVenezuelanPrice(Number(total))
        },
        {
            title: 'Devolver',
            key: 'select',
            width: 80,
            render: (_: any, record: any) => (
                <Checkbox
                    checked={selectedItems.some(i => i.productId === record.productId)}
                    onChange={(e) => handleItemSelection(e.target.checked, record)}
                />
            )
        }
    ];

    const selectedItemsColumns = [
        ...itemsColumns.filter(col => col.key !== 'select'),
        {
            title: 'Cant. Devolver',
            key: 'returnQty',
            width: 120,
            render: (_: any, record: SelectedItem) => (
                <InputNumber
                    min={1}
                    max={record.quantity}
                    value={record.quantity}
                    onChange={(value) => updateItemQuantity(record.productId, value || 1)}
                    size="small"
                />
            )
        },
    ];

    const steps = [
        {
            title: 'Buscar Factura',
            content: (
                <div style={{ padding: '20px 0' }}>
                    <Space.Compact style={{ width: '100%' }}>
                        <Input
                            placeholder="Número de factura (ej: FAC-00000001)"
                            value={invoiceNumber}
                            onChange={(e) => setInvoiceNumber(e.target.value)}
                            onPressEnter={handleSearchInvoice}
                            size="large"
                        />
                        <Button
                            type="primary"
                            icon={<SearchOutlined />}
                            onClick={handleSearchInvoice}
                            loading={loading}
                            size="large"
                        >
                            Buscar
                        </Button>
                    </Space.Compact>

                    {sale && (
                        <Alert
                            message="Factura encontrada"
                            description={
                                <div style={{ marginTop: 10 }}>
                                    <p><strong>Factura:</strong> {sale.invoiceNumber}</p>
                                    <p><strong>Fecha:</strong> {dayjs(sale.date).format('DD/MM/YYYY HH:mm')}</p>
                                    <p><strong>Cliente:</strong> {sale.client?.name || 'Cliente General'}</p>
                                    <p><strong>Total:</strong> {formatVenezuelanPrice(Number(sale.total))}</p>
                                    <p><strong>Items:</strong> {sale.items.length}</p>
                                </div>
                            }
                            type="success"
                            showIcon
                            style={{ marginTop: 16 }}
                        />
                    )}
                </div>
            )
        },
        {
            title: 'Seleccionar Items',
            content: (
                <div>
                    <Title level={5}>Items de la factura</Title>
                    <Table
                        dataSource={sale?.items || []}
                        columns={itemsColumns}
                        rowKey="id"
                        pagination={false}
                        size="small"
                    />

                    {selectedItems.length > 0 && (
                        <div style={{ marginTop: 20 }}>
                            <Title level={5}>Items seleccionados para devolución</Title>
                            <Table
                                dataSource={selectedItems}
                                columns={selectedItemsColumns}
                                rowKey="productId"
                                pagination={false}
                                size="small"
                            />
                        </div>
                    )}
                </div>
            )
        },
        {
            title: 'Tipo de Devolución',
            content: (
                <div>
                    <Form layout="vertical">
                        <Form.Item label="Tipo de Devolución">
                            <Radio.Group value={returnType} onChange={(e) => setReturnType(e.target.value)}>
                                <Space direction="vertical">
                                    <Radio value="REFUND">Reembolso (devolver dinero)</Radio>
                                    <Radio value="EXCHANGE_SAME">Cambio por mismo producto</Radio>
                                    <Radio value="EXCHANGE_DIFFERENT">Cambio por producto diferente</Radio>
                                </Space>
                            </Radio.Group>
                        </Form.Item>

                        <Form.Item label="Razón de la devolución">
                            <Select value={reason} onChange={setReason}>
                                <Select.Option value="DEFECTIVE">Producto defectuoso</Select.Option>
                                <Select.Option value="UNSATISFIED">Cliente insatisfecho</Select.Option>
                                <Select.Option value="ERROR">Error en la venta</Select.Option>
                                <Select.Option value="EXPIRED">Producto vencido</Select.Option>
                                <Select.Option value="OTHER">Otro</Select.Option>
                            </Select>
                        </Form.Item>

                        <Form.Item label="Condición del producto">
                            <Select value={condition} onChange={setCondition}>
                                <Select.Option value="EXCELLENT">Excelente</Select.Option>
                                <Select.Option value="GOOD">Buena</Select.Option>
                                <Select.Option value="DEFECTIVE">Defectuoso</Select.Option>
                                <Select.Option value="DAMAGED">Dañado</Select.Option>
                            </Select>
                        </Form.Item>

                        {returnType === 'REFUND' && (
                            <Form.Item label="Método de reembolso">
                                <Select value={refundMethod} onChange={setRefundMethod}>
                                    <Select.Option value="CASH">Efectivo</Select.Option>
                                    <Select.Option value="TRANSFER">Transferencia</Select.Option>
                                    <Select.Option value="CREDIT_NOTE">Nota de crédito</Select.Option>
                                </Select>
                            </Form.Item>
                        )}

                        <Form.Item label="Notas adicionales">
                            <TextArea
                                rows={3}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Observaciones sobre la devolución..."
                            />
                        </Form.Item>
                    </Form>
                </div>
            )
        },
        {
            title: 'Confirmar',
            content: (
                <div>
                    <Alert
                        message="Resumen de la devolución"
                        description={
                            <div style={{ marginTop: 10 }}>
                                <p><strong>Factura:</strong> {sale?.invoiceNumber}</p>
                                <p><strong>Tipo:</strong> {
                                    returnType === 'REFUND' ? 'Reembolso' :
                                        returnType === 'EXCHANGE_SAME' ? 'Cambio por mismo producto' :
                                            'Cambio por producto diferente'
                                }</p>
                                <p><strong>Items a devolver:</strong> {selectedItems.length}</p>
                                <p><strong>Monto total:</strong> {formatVenezuelanPrice(
                                    selectedItems.reduce((sum, item) => sum + item.total, 0)
                                )}</p>
                                {returnType === 'REFUND' && (
                                    <p><strong>Método de reembolso:</strong> {
                                        refundMethod === 'CASH' ? 'Efectivo' :
                                            refundMethod === 'TRANSFER' ? 'Transferencia' :
                                                'Nota de crédito'
                                    }</p>
                                )}
                            </div>
                        }
                        type="info"
                        showIcon
                    />
                </div>
            )
        }
    ];

    return (
        <Modal
            title="Nueva Devolución"
            open={open}
            onCancel={handleCancel}
            width={900}
            footer={
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button onClick={handleCancel}>Cancelar</Button>
                    <Space>
                        {currentStep > 0 && (
                            <Button onClick={() => setCurrentStep(currentStep - 1)}>
                                Atrás
                            </Button>
                        )}
                        {currentStep < steps.length - 1 && currentStep > 0 && (
                            <Button type="primary" onClick={handleNext}>
                                Siguiente
                            </Button>
                        )}
                        {currentStep === steps.length - 1 && (
                            <Button type="primary" onClick={handleSubmit} loading={loading}>
                                Crear Devolución
                            </Button>
                        )}
                    </Space>
                </div>
            }
        >
            <Steps current={currentStep} items={steps.map(s => ({ title: s.title }))} style={{ marginBottom: 24 }} />

            {loading && currentStep === 0 ? (
                <div style={{ textAlign: 'center', padding: 50 }}>
                    <Spin size="large" />
                </div>
            ) : (
                steps[currentStep].content
            )}
        </Modal>
    );
};
