import { useState, useEffect, useRef } from 'react';
import { Modal, Radio, InputNumber, Button, Row, Col, Typography, Divider, Space, Card } from 'antd';
import { DollarOutlined, CreditCardOutlined, QrcodeOutlined, NumberOutlined } from '@ant-design/icons';
import { usePOSStore } from '../../../store/posStore';

const { Title, Text } = Typography;

interface CheckoutModalProps {
    open: boolean;
    onCancel: () => void;
    onProcess: (paymentData: any) => void;
}

const PAYMENT_METHODS = [
    { key: 'CASH', label: 'Efectivo', icon: <DollarOutlined /> },
    { key: 'DEBIT', label: 'T. Débito', icon: <CreditCardOutlined /> },
    { key: 'CREDIT', label: 'T. Crédito', icon: <CreditCardOutlined /> },
    { key: 'BIOPAGO', label: 'BioPago', icon: <QrcodeOutlined /> },
    { key: 'ZELLE', label: 'Zelle', icon: <DollarOutlined /> },
];

export const CheckoutModal = ({ open, onCancel, onProcess }: CheckoutModalProps) => {
    const { totals, preferredSecondaryCurrency, exchangeRate } = usePOSStore();
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [tenderedAmount, setTenderedAmount] = useState<number | null>(null);
    const inputRef = useRef<any>(null);

    // Reset state when opening
    useEffect(() => {
        if (open) {
            setPaymentMethod('CASH');
            setTenderedAmount(null);
            // Focus input after a short delay to ensure modal animation finishes
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [open]);

    // Calcular cambio
    const totalToPay = totals.total;
    const tendered = tenderedAmount || 0;
    const change = tendered - totalToPay;
    const isSufficient = tendered >= totalToPay - 0.01; // Tolerance for float

    // Calculo cambio en divisa
    const changeUsd = exchangeRate > 0 ? change / exchangeRate : 0;

    const handleProcess = () => {
        if (!isSufficient && paymentMethod === 'CASH') return;

        onProcess({
            method: paymentMethod,
            amount: totalToPay,
            tendered: tendered,
            change: change > 0 ? change : 0,
            currencyRate: exchangeRate
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleProcess();
        }
    };

    return (
        <Modal
            title={<Title level={4} style={{ margin: 0 }}>Procesar Pago</Title>}
            open={open}
            onCancel={onCancel}
            footer={null}
            width={700}
            centered
            maskClosable={false}
        >
            <Row gutter={24}>
                {/* Columna Izquierda: Métodos de Pago */}
                <Col span={10}>
                    <Text strong>Forma de Pago</Text>
                    <div style={{ marginTop: 10 }}>
                        <Radio.Group
                            value={paymentMethod}
                            onChange={e => {
                                setPaymentMethod(e.target.value);
                                // Si seleccionan tarjeta, asumimos pago exacto por defecto
                                if (e.target.value !== 'CASH') {
                                    setTenderedAmount(totals.total);
                                } else {
                                    setTenderedAmount(null);
                                    setTimeout(() => inputRef.current?.focus(), 50);
                                }
                            }}
                            style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
                        >
                            {PAYMENT_METHODS.map(method => (
                                <Radio.Button
                                    key={method.key}
                                    value={method.key}
                                    style={{ height: 50, display: 'flex', alignItems: 'center', width: '100%' }}
                                >
                                    <Space>
                                        {method.icon}
                                        {method.label}
                                    </Space>
                                </Radio.Button>
                            ))}
                        </Radio.Group>
                    </div>
                </Col>

                {/* Columna Derecha: Totales y Cambio */}
                <Col span={14}>
                    <Card bordered={false} style={{ background: '#f5f5f5' }}>
                        <div style={{ textAlign: 'right', marginBottom: 20 }}>
                            <Text type="secondary">Total a Pagar</Text>
                            <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                                Bs {totalToPay.toFixed(2)}
                            </Title>
                            {preferredSecondaryCurrency && (
                                <Text type="secondary">
                                    {preferredSecondaryCurrency.symbol} {totals.totalUsd.toFixed(2)} (Tasa: {exchangeRate})
                                </Text>
                            )}
                        </div>

                        <Divider />

                        <div style={{ marginBottom: 20 }}>
                            <Text strong>Monto Recibido</Text>
                            <InputNumber
                                ref={inputRef}
                                style={{ width: '100%', marginTop: 5 }}
                                size="large"
                                value={tenderedAmount}
                                onChange={val => setTenderedAmount(val)}
                                prefix="Bs"
                                placeholder="0.00"
                                onKeyDown={handleKeyDown}
                                autoFocus
                            />
                        </div>

                        <div style={{ textAlign: 'right' }}>
                            <Text>Cambio / Vuelto</Text>
                            <Title level={3} style={{ margin: 0, color: change >= 0 ? 'green' : 'red' }}>
                                Bs {change > 0 ? change.toFixed(2) : '0.00'}
                            </Title>
                            {preferredSecondaryCurrency && change > 0 && (
                                <Text type="secondary">
                                    {preferredSecondaryCurrency.symbol} {changeUsd.toFixed(2)}
                                </Text>
                            )}
                            {!isSufficient && paymentMethod === 'CASH' && (
                                <div style={{ color: 'red', marginTop: 5 }}>Monto insuficiente</div>
                            )}
                        </div>
                    </Card>

                    <Row gutter={16} style={{ marginTop: 20 }}>
                        <Col span={12}>
                            <Button size="large" block onClick={onCancel}>
                                Cancelar (Esc)
                            </Button>
                        </Col>
                        <Col span={12}>
                            <Button
                                type="primary"
                                size="large"
                                block
                                onClick={handleProcess}
                                disabled={!isSufficient && paymentMethod === 'CASH'}
                                icon={<NumberOutlined />}
                            >
                                Procesar (F9)
                            </Button>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Modal>
    );
};
