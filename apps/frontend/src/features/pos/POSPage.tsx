import { Layout } from 'antd';
import { POSHeader } from './components/POSHeader';
import { POSLeftPanel } from './components/POSLeftPanel';
import { POSRightPanel } from './components/POSRightPanel';
import { POSFooter } from './components/POSFooter';

const { Content, Sider, Footer } = Layout;

export const POSPage = () => {
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
                        <POSFooter />
                    </Footer>
                </Layout>
            </Layout>
        </Layout>
    );
};
