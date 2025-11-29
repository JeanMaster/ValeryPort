import { Card, Typography, Empty } from 'antd';

const { Title } = Typography;

interface ModulePageProps {
    title: string;
    icon: React.ReactNode;
}

/**
 * Componente genérico para páginas de módulos en construcción
 */
export const ModulePage = ({ title, icon }: ModulePageProps) => {
    return (
        <Card>
            <Title level={2}>
                {icon} {title}
            </Title>
            <Empty
                description="Módulo en construcción"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
        </Card>
    );
};
