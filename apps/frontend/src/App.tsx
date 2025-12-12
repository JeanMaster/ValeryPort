import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { DashboardPage } from './pages/DashboardPage';
import { ModulePage } from './pages/ModulePage';
import { ClientsPage } from './features/clients/ClientsPage';
import { SuppliersPage } from './features/purchases/SuppliersPage';
import { PurchasesPage } from './features/purchases/PurchasesPage';
import { ProductsPage } from './features/products/ProductsPage';
import { CompanySettingsPage } from './features/company-settings/CompanySettingsPage';
import { GeneralOptionsPage } from './features/company-settings/GeneralOptionsPage';
import { DepartmentsPage } from './features/departments/DepartmentsPage';
import { UnitsPage } from './features/units/UnitsPage';
import { CurrenciesPage } from './features/currencies/CurrenciesPage';
import { DevToolsPage } from './features/dev-tools/DevToolsPage';
import { POSPage } from './features/pos/POSPage';
import { ReturnsPage } from './features/returns/ReturnsPage';
import { CashRegisterPage } from './features/cash-register/CashRegisterPage';
import { InventoryAdjustmentsPage } from './features/inventory-adjustments/InventoryAdjustmentsPage';
import { AccountsReceivablePage } from './features/accounts-receivable/AccountsReceivablePage';
import { ReportsPage } from './features/reports/ReportsPage';
import {
  ShopOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
  CreditCardOutlined,
  TeamOutlined,
  BankOutlined,
} from '@ant-design/icons';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="clients" element={<ClientsPage />} />
        <Route path="inventory/products" element={<ProductsPage />} />
        <Route path="inventory/currencies" element={<CurrenciesPage />} />
        <Route path="inventory/departments" element={<DepartmentsPage />} />
        <Route path="inventory/units" element={<UnitsPage />} />
        <Route path="/inventory/adjustments" element={<InventoryAdjustmentsPage />} />

        <Route path="inventory/services" element={<ModulePage title="Servicios (En Construcción)" icon={<ShopOutlined />} />} />
        <Route path="suppliers" element={<SuppliersPage />} />
        <Route path="sales" element={<ModulePage title="Ventas" icon={<ShoppingCartOutlined />} />} />
        <Route path="sales/pos" element={<POSPage />} />
        <Route path="sales/returns" element={<ReturnsPage />} />
        <Route path="sales/cash-register" element={<CashRegisterPage />} />
        <Route path="purchases" element={<ModulePage title="Compras" icon={<ShoppingOutlined />} />} />
        <Route path="purchases/history" element={<PurchasesPage />} />
        <Route path="accounts-receivable" element={<AccountsReceivablePage />} />
        <Route path="accounts-payable" element={<ModulePage title="Cuentas por Pagar" icon={<CreditCardOutlined />} />} />
        <Route path="hr" element={<ModulePage title="Nómina" icon={<TeamOutlined />} />} />
        <Route path="banks" element={<ModulePage title="Bancos" icon={<BankOutlined />} />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="configuration/company" element={<CompanySettingsPage />} />
        <Route path="configuration/dev-tools" element={<DevToolsPage />} />
        <Route path="configuration/general" element={<GeneralOptionsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>

    </Routes>
  );
}

export default App;
