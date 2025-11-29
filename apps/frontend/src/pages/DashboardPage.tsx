import { Card, Typography } from 'antd';
import { DashboardOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

export const DashboardPage = () => {
    return (
        <Card>
            <Title level={2}>
                <DashboardOutlined /> Dashboard
            </Title>
            <Paragraph>
                Bienvenido al sistema Valery Corporativo - Versión Web.
            </Paragraph>
            <Paragraph type="secondary">
                Este es el panel principal donde se mostrará información resumida de todos los módulos.
            </Paragraph>
        </Card>
    );
};
