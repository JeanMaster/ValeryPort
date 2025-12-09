import { Layout, Typography, Row, Col, Space, Popover } from 'antd';
import { useState, useEffect } from 'react';
import { usePOSStore } from '../../../store/posStore';
import { formatVenezuelanPrice, formatVenezuelanPriceOnly } from '../../../utils/formatters';

const { Header } = Layout;
const { Title, Text } = Typography;

export const POSHeader = () => {
    const { totals, activeCustomer, preferredSecondaryCurrency, currencies, primaryCurrency } = usePOSStore();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000); // Update every second to accurate minute changes

        return () => clearInterval(timer);
    }, []);

    return (
        <Header style={{
            height: 'auto',
            minHeight: '80px',
            background: '#ffffff', // Clean white background
            padding: '10px 20px',
            borderBottom: '1px solid #f0f0f0',
            lineHeight: 'normal',
            display: 'flex',
            alignItems: 'center'
        }}>
            <Row style={{ width: '100%' }} align="middle" justify="space-between">

                {/* Izquierda: Info Contextual (Fecha, Hora, Cajero) */}
                <Col xs={24} md={12}>
                    <Space size="large" wrap>
                        <Space direction="vertical" size={0}>
                            <Text type="secondary" style={{ fontSize: 12 }}>Fecha</Text>
                            <Text strong style={{ fontSize: 16 }}>{currentTime.toLocaleDateString()}</Text>
                        </Space>
                        <Space direction="vertical" size={0}>
                            <Text type="secondary" style={{ fontSize: 12 }}>Hora</Text>
                            <Text strong style={{ fontSize: 16 }}>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                        </Space>
                        <Space direction="vertical" size={0}>
                            <Text type="secondary" style={{ fontSize: 12 }}>Cajero</Text>
                            <Text strong style={{ fontSize: 16 }}>01 - {activeCustomer}</Text>
                        </Space>
                    </Space>
                </Col>

                {/* Derecha: Totales (Diseño Moderno y Limpio) */}
                <Col xs={24} md={12} style={{ textAlign: 'right' }}>
                    <Space size="large" align="end">
                        <div style={{ textAlign: 'right' }}>
                            <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Subtotal</Text>
                            <Text style={{ fontSize: 16 }}>{formatVenezuelanPriceOnly(totals.subtotal)}</Text>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>I.V.A.</Text>
                            <Text style={{ fontSize: 16 }}>{formatVenezuelanPriceOnly(totals.tax)}</Text>
                        </div>

                        {/* Total Principal Destacado */}
                        {/* Total Principal Destacado (con Popover Multi-Moneda) */}
                        <Popover
                            placement="bottomRight"
                            title="Otras Monedas"
                            content={
                                <div style={{ minWidth: 200 }}>
                                    {/* List currencies that are NOT Primary AND NOT Preferred Secondary */}
                                    {currencies
                                        .filter(c => c.id !== primaryCurrency?.id && c.code !== preferredSecondaryCurrency?.code)
                                        .map(currency => {
                                            const rate = Number(currency.exchangeRate || 0);
                                            const amount = rate > 0 ? totals.total / rate : 0;
                                            return (
                                                <div key={currency.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f0f0f0' }}>
                                                    <span>{currency.name} ({currency.symbol})</span>
                                                    <strong style={{ color: '#1890ff' }}>{formatVenezuelanPriceOnly(amount)}</strong>
                                                </div>
                                            );
                                        })
                                    }
                                    {currencies.filter(c => c.id !== primaryCurrency?.id && c.code !== preferredSecondaryCurrency?.code).length === 0 && (
                                        <div style={{ color: '#999', fontStyle: 'italic' }}>No hay otras monedas configurada</div>
                                    )}
                                </div>
                            }
                        >
                            <div style={{
                                background: '#e6f7ff',
                                padding: '5px 15px',
                                borderRadius: 8,
                                border: '1px solid #91caff',
                                textAlign: 'right',
                                cursor: 'help'
                            }}>
                                <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Total a Pagar</Text>
                                <Title level={2} style={{ margin: 0, color: '#096dd9' }}>
                                    {formatVenezuelanPrice(totals.total, 'Bs')}
                                </Title>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    {formatVenezuelanPrice(totals.totalUsd, preferredSecondaryCurrency?.symbol || '$')}
                                </Text>
                            </div>
                        </Popover>
                    </Space>
                </Col>
            </Row>
        </Header>
    );
};
