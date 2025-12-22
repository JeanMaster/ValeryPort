import { useState } from 'react';
import { Card, Tabs } from 'antd';
import { InventoryReports } from './components/InventoryReports';
import { FinancialReports } from './components/FinancialReports';
import { BalanceReports } from './components/BalanceReports';

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
        },
        {
            key: 'balance',
            label: 'Balance General',
            children: <BalanceReports />
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