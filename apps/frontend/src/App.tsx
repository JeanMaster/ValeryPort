import { useEffect, useState } from 'react';
import { Layout, Typography, Card, Button, Space, Result, Tag } from 'antd';
import {
  RocketOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DatabaseOutlined,
  CodeOutlined,
  CloudServerOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

function App() {
  const [message, setMessage] = useState<string>('Conectando con el servidor...');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    axios.get('http://localhost:3000')
      .then(res => {
        setMessage(res.data);
        setStatus('success');
      })
      .catch(err => {
        setMessage(`Error de conexión: ${err.message}`);
        setStatus('error');
      });
  }, []);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          background: '#001529',
          padding: '0 50px',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Title
          level={3}
          style={{
            color: '#fff',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <RocketOutlined /> Valery Corporativo - Web Edition
        </Title>
      </Header>

      <Content style={{ padding: '50px' }}>
        <Space direction="vertical" size="large" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>

          {/* Estado del Backend */}
          <Card title="🔌 Estado de Conectividad" bordered={false}>
            <Result
              status={status === 'loading' ? 'info' : status}
              title={
                status === 'success'
                  ? 'Backend Conectado Exitosamente'
                  : status === 'error'
                    ? 'Error de Conexión con Backend'
                    : 'Verificando conexión...'
              }
              subTitle={
                <Space direction="vertical" align="center">
                  <Text strong>{message}</Text>
                  {status === 'success' && (
                    <Text type="secondary">
                      Endpoint: <Text code>http://localhost:3000</Text>
                    </Text>
                  )}
                </Space>
              }
              icon={
                status === 'success'
                  ? <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  : status === 'error'
                    ? <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                    : undefined
              }
              extra={
                status === 'success' ? [
                  <Button type="primary" key="dashboard" disabled>
                    Ir al Dashboard
                  </Button>,
                  <Button key="docs" href="http://localhost:3000/api/docs" target="_blank">
                    Ver API Docs
                  </Button>
                ] : []
              }
            />
          </Card>

          {/* Fase 0 Completada */}
          <Card
            title={
              <Space>
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                Migración a Plan Original - Completada
              </Space>
            }
            bordered={false}
          >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Tag icon={<CodeOutlined />} color="blue">Frontend</Tag>
                <Text>React + Vite + TypeScript + Ant Design</Text>
              </div>
              <div>
                <Tag icon={<CloudServerOutlined />} color="green">Backend</Tag>
                <Text>NestJS + TypeScript + Swagger</Text>
              </div>
              <div>
                <Tag icon={<DatabaseOutlined />} color="purple">Base de Datos</Tag>
                <Text>PostgreSQL + Prisma ORM</Text>
              </div>
              <div>
                <Tag color="gold">Arquitectura</Tag>
                <Text>Monorepo con <Text code>apps/</Text> y <Text code>packages/</Text></Text>
              </div>
            </Space>
          </Card>

          {/* Stack Tecnológico */}
          <Card title="📚 Stack Tecnológico" bordered={false}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Text strong>UI Framework:</Text>
              <Text>• Ant Design 5.x - Componentes empresariales</Text>
              <Text>• Ant Design Icons - Iconografía</Text>

              <Text strong style={{ marginTop: 16, display: 'block' }}>Routing & State:</Text>
              <Text>• React Router v6 - Navegación SPA</Text>
              <Text>• TanStack Query - State management servidor</Text>

              <Text strong style={{ marginTop: 16, display: 'block' }}>Próximos Pasos:</Text>
              <Text type="secondary">• Configurar autenticación JWT</Text>
              <Text type="secondary">• Implementar módulo de usuarios</Text>
              <Text type="secondary">• Crear dashboard principal</Text>
            </Space>
          </Card>

        </Space>
      </Content>

      <Footer style={{ textAlign: 'center', background: '#f0f2f5' }}>
        <Text type="secondary">
          Valery Corporativo ©{new Date().getFullYear()} - Migración ERP Desktop a Web
        </Text>
      </Footer>
    </Layout>
  );
}

export default App;
