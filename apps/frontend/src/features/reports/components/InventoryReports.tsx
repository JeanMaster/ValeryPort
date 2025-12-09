import { Card, Typography } from 'antd';

const { Title } = Typography;

export const InventoryReports = () => {
    return (
        <Card>
            <Title level={3}>Reportes de Inventario</Title>
            <p>Próximamente: Reportes de movimientos de inventario, productos con bajo stock, etc.</p>
        </Card>
    );
};