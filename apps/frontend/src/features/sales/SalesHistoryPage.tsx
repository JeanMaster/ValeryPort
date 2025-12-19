import { Card } from 'antd';
import { SalesReports } from '../reports/components/SalesReports';

export const SalesHistoryPage = () => {
    return (
        <div style={{ padding: 24 }}>
            <Card title="Historial de Ventas">
                <SalesReports />
            </Card>
        </div>
    );
};
