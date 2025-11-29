import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { DashboardPage } from './pages/DashboardPage';
import { ModulePage } from './pages/ModulePage';
import {
  ShopOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
  DollarOutlined,
  CreditCardOutlined,
  TeamOutlined,
  BankOutlined,
  BarChartOutlined,
} from '@ant-design/icons';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="inventory" element={<ModulePage title="Inventario" icon={<ShopOutlined />} />} />
        <Route path="sales" element={<ModulePage title="Ventas" icon={<ShoppingCartOutlined />} />} />
        <Route path="purchases" element={<ModulePage title="Compras" icon={<ShoppingOutlined />} />} />
        <Route path="accounts-receivable" element={<ModulePage title="Cuentas por Cobrar" icon={<DollarOutlined />} />} />
        <Route path="accounts-payable" element={<ModulePage title="Cuentas por Pagar" icon={<CreditCardOutlined />} />} />
        <Route path="hr" element={<ModulePage title="Nómina" icon={<TeamOutlined />} />} />
        <Route path="banks" element={<ModulePage title="Bancos" icon={<BankOutlined />} />} />
        <Route path="reports" element={<ModulePage title="Reportes" icon={<BarChartOutlined />} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
