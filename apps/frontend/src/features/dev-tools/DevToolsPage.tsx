import { useState } from 'react';
import { Card, Button, Modal, Alert, Space, Typography, Divider, Upload, Input } from 'antd';
import { DatabaseOutlined, WarningOutlined, ReloadOutlined, DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { devToolsApi } from '../../services/devToolsApi';

const { Title, Paragraph } = Typography;

export const DevToolsPage = () => {
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    // Estados para restauración
    const [isRestoreConfirmOpen, setIsRestoreConfirmOpen] = useState(false);
    const [restoreFile, setRestoreFile] = useState<File | null>(null);
    const [confirmText, setConfirmText] = useState('');

    const resetMutation = useMutation({
        mutationFn: devToolsApi.resetDatabase,
        onSuccess: (data) => {
            Modal.success({
                title: '✅ Base de Datos Reseteada',
                content: (
                    <div>
                        <p>{data.message}</p>
                        <p style={{ marginTop: 10, fontSize: 14, color: '#666' }}>
                            <strong>Nota:</strong> Debes reiniciar el backend para aplicar los cambios.
                        </p>
                    </div>
                ),
            });
            setIsConfirmModalOpen(false);
        },
        onError: (error: any) => {
            Modal.error({
                title: '❌ Error',
                content: error.response?.data?.message || 'Error al resetear la base de datos',
            });
        },
    });

    const restoreMutation = useMutation({
        mutationFn: devToolsApi.restoreBackup,
        onSuccess: (data) => {
            Modal.success({
                title: '✅ Base de Datos Restaurada',
                content: data.message,
            });
            setIsRestoreConfirmOpen(false);
            setRestoreFile(null);
            setConfirmText('');
        },
        onError: (error: any) => {
            Modal.error({
                title: '❌ Error de Restauración',
                content: error.response?.data?.message || 'Error al restaurar la base de datos',
            });
        },
    });

    const handleResetClick = () => {
        setIsConfirmModalOpen(true);
    };

    const handleConfirmReset = () => {
        resetMutation.mutate();
    };

    const handleConfirmRestore = () => {
        if (restoreFile && confirmText === 'RESTAURAR') {
            restoreMutation.mutate(restoreFile);
        }
    };

    return (
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <Card>
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <div>
                        <Title level={3}>
                            <WarningOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
                            Opciones de Desarrollador
                        </Title>
                        <Paragraph type="secondary">
                            Herramientas para desarrollo. <strong>¡NO usar en producción!</strong>
                        </Paragraph>
                    </div>

                    <Divider />

                    <Alert
                        message="Modo Desarrollo"
                        description="Estas opciones solo están disponibles en ambiente de desarrollo y permiten realizar operaciones destructivas en la base de datos."
                        type="warning"
                        showIcon
                    />

                    <Card
                        title={
                            <Space>
                                <DatabaseOutlined />
                                <span>Resetear Base de Datos</span>
                            </Space>
                        }
                        style={{ backgroundColor: '#fff7e6', borderColor: '#ffa940' }}
                    >
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Paragraph>
                                Esta acción eliminará <strong>TODOS los datos</strong> de la base de datos y aplicará el schema actual de Prisma.
                            </Paragraph>

                            <div style={{ backgroundColor: '#fff', padding: 16, borderRadius: 4, border: '1px solid #d9d9d9' }}>
                                <strong>Se eliminarán:</strong>
                                <ul style={{ marginTop: 8, marginBottom: 0 }}>
                                    <li>Todos los clientes</li>
                                    <li>Todos los productos</li>
                                    <li>Todos los proveedores</li>
                                    <li>Todas las monedas</li>
                                    <li>Todos los departamentos</li>
                                    <li>Todas las unidades</li>
                                    <li>Configuración de empresa</li>
                                </ul>
                            </div>

                            <Alert
                                message="Útil cuando:"
                                description={
                                    <ul style={{ marginBottom: 0 }}>
                                        <li>Cambias el schema de Prisma</li>
                                        <li>Necesitas empezar desde cero</li>
                                        <li>Hay problemas con la migración</li>
                                    </ul>
                                }
                                type="info"
                                showIcon
                                style={{ marginTop: 16 }}
                            />

                            <Button
                                type="primary"
                                danger
                                size="large"
                                icon={<ReloadOutlined />}
                                onClick={handleResetClick}
                                loading={resetMutation.isPending}
                                style={{ marginTop: 16 }}
                            >
                                Resetear Base de Datos
                            </Button>
                        </Space>
                    </Card>

                    <Alert
                        message="Después de Resetear"
                        description={
                            <div>
                                <p>1. La base de datos quedará vacía con el schema actualizado</p>
                                <p>2. Debes <strong>reiniciar el backend</strong> ejecutando:</p>
                                <pre style={{ backgroundColor: '#f5f5f5', padding: 8, borderRadius: 4, marginTop: 8 }}>
                                    cd apps/backend && npm run start:dev
                                </pre>
                                <p style={{ marginTop: 8 }}>3. Recarga la página del frontend</p>
                            </div>
                        }
                        type="info"
                        showIcon
                    />
                </Space>
            </Card>

            <Card
                title={
                    <Space>
                        <DatabaseOutlined />
                        <span>Respaldo y Restauración de Base de Datos</span>
                    </Space>
                }
                style={{ marginTop: 24 }}
            >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                    {/* Sección Backup */}
                    <div>
                        <Title level={4}>1. Respaldar</Title>
                        <Paragraph>
                            Descarga una copia completa de la base de datos actual en formato SQL.
                        </Paragraph>
                        <Button
                            type="primary"
                            icon={<DownloadOutlined />}
                            onClick={() => devToolsApi.downloadBackup()}
                        >
                            Descargar Respaldo
                        </Button>
                    </div>

                    {/* Sección Restore */}
                    <div style={{ paddingLeft: 24, borderLeft: '1px solid #f0f0f0' }}>
                        <Title level={4}>2. Restaurar</Title>
                        <Paragraph>
                            Restaura una base de datos desde un archivo SQL previamente descargado.
                        </Paragraph>
                        <Alert
                            message="Peligro"
                            description="Esto borrará todos los datos actuales."
                            type="error"
                            showIcon
                            style={{ marginBottom: 16 }}
                        />

                        <Upload
                            beforeUpload={(file) => {
                                setRestoreFile(file);
                                setIsRestoreConfirmOpen(true);
                                return false; // Prevent automatic upload
                            }}
                            showUploadList={false}
                            accept=".sql"
                        >
                            <Button icon={<UploadOutlined />} danger>
                                Seleccionar Archivo para Restaurar
                            </Button>
                        </Upload>
                    </div>
                </div>
            </Card>

            {/* Modal de Confirmación de Restauración */}
            <Modal
                title={
                    <Space>
                        <WarningOutlined style={{ color: '#ff4d4f' }} />
                        <span>⚠️ Confirmar Restauración</span>
                    </Space>
                }
                open={isRestoreConfirmOpen}
                onOk={handleConfirmRestore}
                onCancel={() => {
                    setIsRestoreConfirmOpen(false);
                    setRestoreFile(null);
                    setConfirmText('');
                }}
                okText="RESTAURAR AHORA"
                cancelText="Cancelar"
                okButtonProps={{
                    danger: true,
                    loading: restoreMutation.isPending,
                    disabled: confirmText !== 'RESTAURAR'
                }}
            >
                <Space direction="vertical" style={{ width: '100%' }}>
                    <Alert
                        message="ACCIÓN DESTRUCTIVA IRREVERSIBLE"
                        description={
                            <div>
                                <p>Vas a reemplazar <strong>toda la base de datos actual</strong> con el contenido de:</p>
                                <p><strong>{restoreFile?.name}</strong></p>
                                <p>Todos los datos existentes se PERDERÁN.</p>
                            </div>
                        }
                        type="error"
                        showIcon
                    />

                    <Typography.Text>
                        Escribe <strong>RESTAURAR</strong> para confirmar:
                    </Typography.Text>
                    <Input
                        placeholder="RESTAURAR"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        status={confirmText && confirmText !== 'RESTAURAR' ? 'error' : ''}
                    />
                </Space>
            </Modal>
            <Modal
                title={
                    <Space>
                        <WarningOutlined style={{ color: '#ff4d4f' }} />
                        <span>⚠️ Confirmación Requerida</span>
                    </Space>
                }
                open={isConfirmModalOpen}
                onOk={handleConfirmReset}
                onCancel={() => setIsConfirmModalOpen(false)}
                okText="Sí, Resetear"
                cancelText="Cancelar"
                okButtonProps={{ danger: true, loading: resetMutation.isPending }}
            >
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <Alert
                        message="Esta acción es IRREVERSIBLE"
                        description="Se eliminarán todos los datos de la base de datos. Esta acción no se puede deshacer."
                        type="error"
                        showIcon
                    />

                    <Paragraph>
                        ¿Estás seguro de que deseas resetear la base de datos?
                    </Paragraph>
                </Space>
            </Modal>
        </div >
    );
};
