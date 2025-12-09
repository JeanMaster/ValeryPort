import { useState, useEffect } from 'react';
import { Layout, message } from 'antd';
import { POSHeader } from './components/POSHeader';
import { POSLeftPanel } from './components/POSLeftPanel';
import { POSRightPanel } from './components/POSRightPanel';
import { POSFooter } from './components/POSFooter';
import { CheckoutModal } from './components/CheckoutModal';
import { ClientSelectionModal } from './components/ClientSelectionModal';
import { usePOSStore } from '../../store/posStore';

const { Content, Sider, Footer } = Layout;

export const POSPage = () => {
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    const { processSale, setCustomer } = usePOSStore();

    const handleCheckoutProcess = async (paymentData: any) => {
        try {
            const invoiceNumber = await processSale(paymentData);
            message.success(`Venta procesada exitosamente. Factura: ${invoiceNumber}`);
            setIsCheckoutOpen(false);
        } catch (error) {
            message.error('Error al procesar la venta');
            console.error('Sale processing error:', error);
        }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'F3') {
            e.preventDefault();
            setIsClientModalOpen(true);
        } else if (e.key === 'F9') {
            e.preventDefault();
            setIsCheckoutOpen(true);
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <Layout style={{ height: '100vh', overflow: 'hidden' }}>
            {/* Header Superior (Datos Empresa y Totales) */}
            <POSHeader />

            <Layout style={{ height: 'calc(100vh - 80px)' }}> {/* Resto de la altura menos header aprox */}
                {/* Panel Izquierdo (Carrito y Buscador) - Altura completa */}
                <Sider
                    width="40%"
                    style={{
                        background: '#f0f2f5',
                        padding: '10px 10px 10px 20px',
                        borderRight: '1px solid #d9d9d9',
                        height: '100%',
                        overflow: 'hidden'
                    }}
                >
                    <POSLeftPanel />
                </Sider>

                {/* Columna Derecha (Grid + Footer) */}
                <Layout style={{ height: '100%' }}>
                    {/* Grid de Productos */}
                    <Content style={{ background: '#f0f2f5', padding: '10px 20px 10px 10px', flex: 1, overflow: 'hidden' }}>
                        <div style={{
                            background: '#e6e6e6',
                            height: '100%',
                            borderRadius: 8,
                            padding: 10,
                            border: '1px solid #d9d9d9',
                            overflow: 'hidden'
                        }}>
                            <POSRightPanel />
                        </div>
                    </Content>

                    {/* Footer (Solo columna derecha) */}
                    <Footer style={{ padding: 0, background: 'transparent' }}>
                        <POSFooter
                            onClientClick={() => setIsClientModalOpen(true)}
                            onCheckoutClick={() => setIsCheckoutOpen(true)}
                        />
                    </Footer>
                </Layout>
            </Layout>

            <CheckoutModal
                open={isCheckoutOpen}
                onCancel={() => setIsCheckoutOpen(false)}
                onProcess={handleCheckoutProcess}
            />

            <ClientSelectionModal
                open={isClientModalOpen}
                onSelect={(client) => {
                    setCustomer(client);
                    setIsClientModalOpen(false);
                }}
                onCancel={() => setIsClientModalOpen(false)}
            />
        </Layout>
    );
};
