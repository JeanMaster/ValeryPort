import {
    DashboardOutlined,
    ShoppingCartOutlined,
    ShopOutlined,
    ShoppingOutlined,
    DollarOutlined,
    CreditCardOutlined,
    TeamOutlined,
    BankOutlined,
    BarChartOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';

type MenuItem = Required<MenuProps>['items'][number];

/**
 * Configuración del menú principal de navegación
 * Basado en los módulos del ERP Valery Corporativo
 */
export const menuItems: MenuItem[] = [
    {
        key: '/',
        icon: <DashboardOutlined />,
        label: 'Dashboard',
    },
    {
        key: '/inventory',
        icon: <ShopOutlined />,
        label: 'Inventario',
    },
    {
        key: '/sales',
        icon: <ShoppingCartOutlined />,
        label: 'Ventas',
    },
    {
        key: '/purchases',
        icon: <ShoppingOutlined />,
        label: 'Compras',
    },
    {
        key: '/accounts-receivable',
        icon: <DollarOutlined />,
        label: 'Cuentas por Cobrar',
    },
    {
        key: '/accounts-payable',
        icon: <CreditCardOutlined />,
        label: 'Cuentas por Pagar',
    },
    {
        key: '/hr',
        icon: <TeamOutlined />,
        label: 'Nómina',
    },
    {
        key: '/banks',
        icon: <BankOutlined />,
        label: 'Bancos',
    },
    {
        key: '/reports',
        icon: <BarChartOutlined />,
        label: 'Reportes',
    },
];
