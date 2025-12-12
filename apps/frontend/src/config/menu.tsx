import {
    DashboardOutlined,
    ShopOutlined,
    ShoppingOutlined,
    DollarOutlined,
    CreditCardOutlined,
    TeamOutlined,
    BankOutlined,
    BarChartOutlined,
    SettingOutlined,
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
        children: [
            {
                key: '/inventory/products',
                label: 'Productos Terminados',
            },
            {
                key: '/inventory/currencies',
                label: 'Monedas',
            },
            {
                key: '/inventory/departments',
                label: 'Departamentos',
            },
            {
                key: '/inventory/units',
                label: 'Unidades',
            },
            {
                key: '/inventory/adjustments',
                label: 'Ajustes de Inventario',
            },
            {
                key: '/inventory/services',
                label: 'Servicios',
            },
        ],
    },
    {
        key: '/sales',
        icon: <DollarOutlined />,
        label: 'Ventas',
        children: [
            {
                key: '/sales/pos',
                label: 'Punto de Venta',
            },
            {
                key: '/sales/history',
                label: 'Historial de Ventas',
            },
            {
                key: '/accounts-receivable',
                label: 'Cuentas por Cobrar',
            },
            {
                key: '/sales/cash-register',
                label: 'Caja',
            },
        ],
    },
    {
        key: '/purchases',
        icon: <ShoppingOutlined />,
        label: 'Compras',
        children: [
            {
                key: '/suppliers',
                label: 'Proveedores',
            },
            {
                key: '/purchases/history',
                label: 'Historial de Compras',
            },
        ],
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
    {
        type: 'group',
        label: '──────────────────',
        children: [],
    },
    {
        key: '/configuration',
        icon: <SettingOutlined />,
        label: 'Configuración',
        children: [
            {
                key: '/configuration/company',
                label: 'Datos de Empresa',
            },
            {
                key: '/configuration/dev-tools',
                label: 'Opciones de Desarrollador',
            },
            {
                key: '/configuration/general',
                label: 'Opciones Generales',
            },
        ],
    },
];
