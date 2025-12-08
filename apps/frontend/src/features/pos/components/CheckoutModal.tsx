import React, { useState, useEffect } from 'react';
import { Modal, Button, Row, Col, Typography, Table, InputNumber, Space, Card } from 'antd';
import {
    DollarOutlined,
    CreditCardOutlined,
    BankOutlined,
    MobileOutlined,
    DeleteOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';
import { usePOSStore } from '../../../store/posStore';

const { Title, Text } = Typography;

interface PaymentEntry {
    id: string;
    method: string;
    methodLabel: string;
    amount: number; // Amount in Bs (always converted to primary currency)
    currencySymbol: string;
    originalAmount?: number; // Original amount if paid in foreign currency
    originalCurrency?: string;
}

interface CheckoutModalProps {
    open: boolean;
    onCancel: () => void;
    onProcess: (paymentData: any) => void;
}

export const CheckoutModal = ({ open, onCancel, onProcess }: CheckoutModalProps): React.ReactElement => {
    const { totals, preferredSecondaryCurrency, currencies, primaryCurrency } = usePOSStore();

    const [payments, setPayments] = useState<PaymentEntry[]>([]);
    const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
    const [inputAmount, setInputAmount] = useState<number | null>(null);
    const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

    // Calculate remaining amount
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const remaining = Math.max(0, totals.total - totalPaid);
    const isFullyPaid = remaining < 0.01; // Tolerance for floating point

    // Reset state when modal opens
    useEffect(() => {
        if (open) {
            setPayments([]);
            setSelectedPaymentId(null);
            setInputAmount(null);
            setSelectedMethod(null);
        }
    }, [open]);

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!open) return;

            // Ctrl+F6 to delete selected payment
            if (e.ctrlKey && e.key === 'F6' && selectedPaymentId) {
                removePayment(selectedPaymentId);
            }

            // F9 to process sale (if fully paid)
            if (e.key === 'F9' && isFullyPaid) {
                handleProcessSale();
            }

            // Esc to cancel
            if (e.key === 'Escape') {
                onCancel();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [open, selectedPaymentId, isFullyPaid, payments]);

    const addPayment = (method: string, methodLabel: string, currencyId?: string) => {
        if (!inputAmount || inputAmount <= 0) return;
        if (isFullyPaid) return; // Don't allow more payments if already paid

        let amountInBs = inputAmount;
        let originalAmount = inputAmount;
        let originalCurrency = primaryCurrency?.symbol || 'Bs';
        let currencySymbol = primaryCurrency?.symbol || 'Bs';

        // If paying in foreign currency, convert to Bs
        if (currencyId && currencyId !== primaryCurrency?.id) {
            const currency = currencies.find(c => c.id === currencyId);
            if (currency && currency.exchangeRate) {
                originalAmount = inputAmount;
                originalCurrency = currency.symbol;
                amountInBs = inputAmount * currency.exchangeRate; // Convert to Bs
                currencySymbol = currency.symbol;
            }
        }

        // Don't allow payment that exceeds remaining
        if (amountInBs > remaining) {
            amountInBs = remaining;
        }

        const newPayment: PaymentEntry = {
            id: Date.now().toString(),
            method,
            methodLabel,
            amount: amountInBs,
            currencySymbol,
            originalAmount: currencyId ? originalAmount : undefined,
            originalCurrency: currencyId ? originalCurrency : undefined
        };

        setPayments([...payments, newPayment]);
        setInputAmount(null);
        setSelectedMethod(null);
    };

    const removePayment = (id: string) => {
        setPayments(payments.filter(p => p.id !== id));
        if (selectedPaymentId === id) {
            setSelectedPaymentId(null);
        }
    };

    const handleProcessSale = () => {
        if (!isFullyPaid) return;

        // Prepare payment data for backend
        const paymentData = {
            payments: payments.map(p => ({
                method: p.method,
                amount: p.amount,
                originalAmount: p.originalAmount,
                originalCurrency: p.originalCurrency
            })),
            total: totals.total,
            totalPaid,
            change: totalPaid - totals.total
        };

        onProcess(paymentData);
    };

    // Payment method buttons configuration
    const bsPaymentMethods = [
        { key: 'CASH', label: 'F1 Efectivo', icon: <DollarOutlined />, shortcut: 'F1' },
        { key: 'DEBIT', label: 'F2 T. Débito', icon: <CreditCardOutlined />, shortcut: 'F2' },
        { key: 'CREDIT', label: 'F3 T. Crédito', icon: <CreditCardOutlined />, shortcut: 'F3' },
        { key: 'TRANSFER', label: 'F5 Transferencia', icon: <BankOutlined />, shortcut: 'F5' },
        { key: 'MOBILE', label: 'F4 Pago Móvil', icon: <MobileOutlined />, shortcut: 'F4' },
    ];

    // Get available foreign currencies (excluding primary)
    const foreignCurrencies = currencies.filter(c => !c.isPrimary && c.active);

    // Table columns for payment breakdown
    const columns = [
        {
            title: 'Forma de Pago',
            dataIndex: 'methodLabel',
            key: 'methodLabel',
        },
        {
            title: 'Monto',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount: number, record: PaymentEntry) => (
                <div>
                    <div>{primaryCurrency?.symbol} {amount.toFixed(2)}</div>
                    {record.originalCurrency && record.originalAmount && (
                        <Text type="secondary" style={{ fontSize: '0.85em' }}>
                            ({record.originalCurrency} {record.originalAmount.toFixed(2)})
                        </Text>
                    )}
                </div>
            ),
        },
        {
            title: 'Monto al Cambio',
            dataIndex: 'amount',
            key: 'converted',
            render: (amount: number) => (
                <Text>{primaryCurrency?.symbol} {amount.toFixed(2)}</Text>
            ),
        },
    ];

    return (
        <Modal
            title={null}
            open={open}
            onCancel={onCancel}
            footer={null}
            width={1200}
            centered
            maskClosable={false}
            styles={{ body: { padding: 0 } }}
        >
            {/* Header with totals */}
            <div style={{
                background: '#f0f2f5',
                padding: '20px 24px',
                borderBottom: '2px solid #d9d9d9'
            }}>
                <Row gutter={24}>
                    <Col span={12}>
                        <div>
                            <Text type="secondary">Cliente:</Text>
                            <Title level={5} style={{ margin: '4px 0' }}>
                                {usePOSStore.getState().activeCustomer}
                            </Title>
                        </div>
                    </Col>
                    <Col span={12} style={{ textAlign: 'right' }}>
                        <div>
                            <Text type="secondary">Factura:</Text>
                            <Title level={5} style={{ margin: '4px 0' }}>
                                00-00000001
                            </Title>
                        </div>
                    </Col>
                </Row>
            </div>

            {/* Total and Remaining Display */}
            <div style={{
                background: '#fff',
                padding: '24px',
                borderBottom: '1px solid #f0f0f0'
            }}>
                <Row gutter={24}>
                    <Col span={12}>
                        <Card size="small" style={{ background: '#e6f7ff', border: '1px solid #91d5ff' }}>
                            <Text type="secondary">Total a Pagar</Text>
                            <Title level={2} style={{ margin: '8px 0', color: '#1890ff' }}>
                                {primaryCurrency?.symbol} {totals.total.toFixed(2)}
                            </Title>
                            {preferredSecondaryCurrency && (
                                <Text type="secondary">
                                    {preferredSecondaryCurrency.symbol} {totals.totalUsd.toFixed(2)}
                                </Text>
                            )}
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Card size="small" style={{
                            background: isFullyPaid ? '#f6ffed' : '#fff2e8',
                            border: isFullyPaid ? '1px solid #b7eb8f' : '1px solid #ffbb96'
                        }}>
                            <Text type="secondary">Restante a Pagar</Text>
                            <Title level={2} style={{
                                margin: '8px 0',
                                color: isFullyPaid ? '#52c41a' : '#fa8c16'
                            }}>
                                {primaryCurrency?.symbol} {remaining.toFixed(2)}
                            </Title>
                            {preferredSecondaryCurrency && (
                                <Text type="secondary">
                                    {preferredSecondaryCurrency.symbol} {(remaining / (preferredSecondaryCurrency.exchangeRate || 1)).toFixed(2)}
                                </Text>
                            )}
                        </Card>
                    </Col>
                </Row>
            </div>

            {/* Main content area */}
            <div style={{ padding: '24px' }}>
                <Row gutter={24}>
                    {/* Left side - Payment methods */}
                    <Col span={10}>
                        <Title level={5}>Formas de Pago</Title>

                        {/* Amount input */}
                        <div style={{ marginBottom: 16 }}>
                            <Text strong>Monto a Pagar</Text>
                            <InputNumber
                                style={{ width: '100%', marginTop: 8 }}
                                size="large"
                                value={inputAmount}
                                onChange={setInputAmount}
                                prefix={selectedMethod?.startsWith('CURRENCY_')
                                    ? currencies.find(c => c.id === selectedMethod.replace('CURRENCY_', ''))?.symbol
                                    : primaryCurrency?.symbol}
                                placeholder="0.00"
                                disabled={isFullyPaid}
                                min={0}
                                max={selectedMethod?.startsWith('CURRENCY_')
                                    ? remaining / (currencies.find(c => c.id === selectedMethod.replace('CURRENCY_', ''))?.exchangeRate || 1)
                                    : remaining}
                            />
                        </div>

                        {/* Bs Payment Methods */}
                        <div style={{ marginBottom: 16 }}>
                            <Text type="secondary" style={{ fontSize: '0.9em' }}>Pagos en {primaryCurrency?.name || 'Bolívares'}</Text>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
                                {bsPaymentMethods.map(method => (
                                    <Button
                                        key={method.key}
                                        size="large"
                                        icon={method.icon}
                                        onClick={() => {
                                            setSelectedMethod(method.key);
                                            addPayment(method.key, method.label);
                                        }}
                                        disabled={isFullyPaid || !inputAmount || inputAmount <= 0}
                                        style={{
                                            height: 60,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <div>{method.label}</div>
                                        <Text type="secondary" style={{ fontSize: '0.75em' }}>
                                            {primaryCurrency?.symbol} {(inputAmount || 0).toFixed(2)}
                                        </Text>
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Foreign Currency Payments */}
                        {foreignCurrencies.length > 0 && (
                            <div>
                                <Text type="secondary" style={{ fontSize: '0.9em' }}>Pagos en Divisas</Text>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
                                    {foreignCurrencies.map((currency, index) => (
                                        <Button
                                            key={currency.id}
                                            size="large"
                                            icon={<DollarOutlined />}
                                            onClick={() => {
                                                setSelectedMethod(`CURRENCY_${currency.id}`);
                                                addPayment(`CURRENCY_${currency.code}`, `CT+F${index + 9} ${currency.code}`, currency.id);
                                            }}
                                            disabled={isFullyPaid || !inputAmount || inputAmount <= 0}
                                            style={{
                                                height: 60,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <div>CT+F{index + 9} {currency.code}</div>
                                            <Text type="secondary" style={{ fontSize: '0.75em' }}>
                                                {currency.symbol} {(inputAmount || 0).toFixed(2)}
                                            </Text>
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </Col>

                    {/* Right side - Payment breakdown */}
                    <Col span={14}>
                        <div style={{ marginBottom: 16 }}>
                            <Title level={5}>Desglose del Pago</Title>
                            <Table
                                dataSource={payments}
                                columns={columns}
                                rowKey="id"
                                pagination={false}
                                size="small"
                                rowSelection={{
                                    type: 'radio',
                                    selectedRowKeys: selectedPaymentId ? [selectedPaymentId] : [],
                                    onChange: (selectedKeys) => {
                                        setSelectedPaymentId(selectedKeys[0] as string);
                                    },
                                }}
                                locale={{ emptyText: 'No hay pagos registrados' }}
                                style={{ marginTop: 8 }}
                            />
                        </div>

                        {selectedPaymentId && (
                            <Button
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => removePayment(selectedPaymentId)}
                                style={{ marginBottom: 16 }}
                            >
                                Ctrl + F6 Eliminar la forma de pago seleccionada
                            </Button>
                        )}

                        {/* Summary */}
                        <Card size="small" style={{ background: '#fafafa' }}>
                            <Row>
                                <Col span={12}>
                                    <Text strong>Total Pagado:</Text>
                                </Col>
                                <Col span={12} style={{ textAlign: 'right' }}>
                                    <Text strong>{primaryCurrency?.symbol} {totalPaid.toFixed(2)}</Text>
                                </Col>
                            </Row>
                            <Row style={{ marginTop: 8 }}>
                                <Col span={12}>
                                    <Text strong>Cambio/Vuelto:</Text>
                                </Col>
                                <Col span={12} style={{ textAlign: 'right' }}>
                                    <Text strong style={{ color: totalPaid > totals.total ? 'green' : 'inherit' }}>
                                        {primaryCurrency?.symbol} {Math.max(0, totalPaid - totals.total).toFixed(2)}
                                    </Text>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>
            </div>

            {/* Footer buttons */}
            <div style={{
                padding: '16px 24px',
                borderTop: '1px solid #f0f0f0',
                background: '#fafafa'
            }}>
                <Row gutter={16}>
                    <Col span={12}>
                        <Button size="large" block onClick={onCancel}>
                            Esc Cancelar
                        </Button>
                    </Col>
                    <Col span={12}>
                        <Button
                            type="primary"
                            size="large"
                            block
                            onClick={handleProcessSale}
                            disabled={!isFullyPaid}
                            icon={<CheckCircleOutlined />}
                        >
                            F9 Registrar
                        </Button>
                    </Col>
                </Row>
            </div>
        </Modal>
    );
};
