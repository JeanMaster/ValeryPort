import { useState } from 'react';
import { Card, Tabs } from 'antd';
import { InventoryReports } from './components/InventoryReports';
import { FinancialReports } from './components/FinancialReports';

export const ReportsPage = () => {
    const [activeTab, setActiveTab] = useState('inventory');

    const tabItems = [
        {
            key: 'inventory',
            label: 'Inventario',
            children: <InventoryReports />
        },
        {
            key: 'financial',
            label: 'Financiero',
            children: <FinancialReports />
        }
    ];

    return (
        <Card
            title="Reportes"
            style={{ margin: '16px' }}
        >
            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={tabItems}
                size="large"
            />
        </Card>
    );
};