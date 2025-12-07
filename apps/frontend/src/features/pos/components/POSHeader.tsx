import { Layout, Typography, Row, Col, Space } from 'antd';
import { usePOSStore } from '../../../store/posStore';

const { Header } = Layout;
const { Title, Text } = Typography;

export const POSHeader = () => {
    const { totals, activeCustomer, preferredSecondaryCurrency } = usePOSStore();

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
                            <Text strong style={{ fontSize: 16 }}>{new Date().toLocaleDateString()}</Text>
                        </Space>
                        <Space direction="vertical" size={0}>
                            <Text type="secondary" style={{ fontSize: 12 }}>Hora</Text>
                            <Text strong style={{ fontSize: 16 }}>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
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
                            <Text style={{ fontSize: 16 }}>{totals.subtotal.toFixed(2)}</Text>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>I.V.A.</Text>
                            <Text style={{ fontSize: 16 }}>{totals.tax.toFixed(2)}</Text>
                        </div>

                        {/* Total Principal Destacado */}
                        <div style={{
                            background: '#e6f7ff',
                            padding: '5px 15px',
                            borderRadius: 8,
                            border: '1px solid #91caff',
                            textAlign: 'right'
                        }}>
                            <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Total a Pagar</Text>
                            <Title level={2} style={{ margin: 0, color: '#096dd9' }}>
                                {totals.total.toFixed(2)} <span style={{ fontSize: 14 }}>Bs</span>
                            </Title>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                {preferredSecondaryCurrency?.symbol || '$'} {totals.totalUsd.toFixed(2)}
                            </Text>
                        </div>
                    </Space>
                </Col>
            </Row>
        </Header>
    );
};
