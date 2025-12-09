import { Card, Typography } from 'antd';

const { Title } = Typography;

export const FinancialReports = () => {
    return (
        <Card>
            <Title level={3}>Reportes Financieros</Title>
            <p>Próximamente: Reportes de ganancias, pérdidas, flujo de caja, etc.</p>
        </Card>
    );
};