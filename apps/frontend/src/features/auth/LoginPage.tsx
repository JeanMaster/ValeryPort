import { useState } from 'react';
import { Form, Input, Button, Card, Typography, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from './AuthProvider';
import axios from 'axios';

const { Title } = Typography;
const API_URL = 'http://localhost:3000/api';

export const LoginPage = () => {
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const onFinish = async (values: any) => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.post(`${API_URL}/auth/login`, {
                username: values.username,
                password: values.password
            });

            const { access_token, user } = response.data;
            login(access_token, user);
        } catch (err) {
            console.error('Login failed', err);
            setError('Usuario o contraseña incorrectos');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            background: '#f0f2f5'
        }}>
            <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <Title level={3}>ValeryPort ERP</Title>
                    <Typography.Text type="secondary">Inicia sesión para continuar</Typography.Text>
                </div>

                {error && (
                    <Alert
                        message={error}
                        type="error"
                        showIcon
                        style={{ marginBottom: 24 }}
                    />
                )}

                <Form
                    name="login"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    layout="vertical"
                    size="large"
                >
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: 'Ingresa tu usuario' }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Usuario" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Ingresa tu contraseña' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Contraseña" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block loading={loading}>
                            Ingresar
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};
