import { useState, useEffect } from 'react';
import { Layout, Menu, Typography, Avatar, Space, Button, Dropdown } from 'antd';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserOutlined,
    BellOutlined,
    LogoutOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { menuItems } from '../../config/menu';
import type { AppMenuItem } from '../../config/menu';
import { companySettingsApi } from '../../services/companySettingsApi';
import { useAuth } from '../../features/auth/AuthProvider';
import type { MenuProps } from 'antd';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

/**
 * MainLayout - Layout principal de la aplicación
 * 
 * Características:
 * - Sidebar colapsable con menú de navegación
 * - Header con logo, notificaciones y perfil de usuario
 * - Área de contenido que renderiza las rutas hijas
 */
export const MainLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [companyName, setCompanyName] = useState('Valery');
    const [companyLogo, setCompanyLogo] = useState<string | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        // Cargar preferencia del usuario desde localStorage
        const saved = localStorage.getItem('theme');
        return saved === 'light' ? false : true; // default dark
    });
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout, hasRole, hasPermission } = useAuth();
    const [filteredMenuItems, setFilteredMenuItems] = useState<MenuProps['items']>([]);

    useEffect(() => {
        const filterItems = (items: AppMenuItem[]): any[] => {
            return items.reduce((acc: any[], item) => {
                // Verificar roles
                if (item.roles && item.roles.length > 0) {
                    const hasAllowedRole = item.roles.some(role => hasRole(role));
                    if (!hasAllowedRole) return acc;
                }

                // Verificar permisos
                if (item.permissions && item.permissions.length > 0) {
                    const hasAllowedPermission = item.permissions.some(permission => hasPermission(permission));
                    if (!hasAllowedPermission) return acc;
                }

                // Si tiene hijos, filtrarlos recursivamente
                if (item.children) {
                    const filteredChildren = filterItems(item.children);
                    // Si después de filtrar no quedan hijos y no es un link directo, quizás ocultarlo?
                    // Por ahora mantendremos el padre si pasa sus propios checks
                    if (filteredChildren.length > 0 || (item.key && !item.children.length)) {
                        acc.push({ ...item, children: filteredChildren.length > 0 ? filteredChildren : undefined });
                    } else if (item.children.length > 0 && filteredChildren.length === 0) {
                        // Si tenía hijos y todos fueron filtrados, no mostrar el padre (ej. submenu Configuración vacío)
                        return acc;
                    } else {
                        acc.push({ ...item, children: undefined });
                    }
                } else {
                    acc.push(item);
                }

                return acc;
            }, []);
        };

        const visibleItems = filterItems(menuItems);
        // Cast to any to avoid strict MenuProps mismatch with custom AppMenuItem props
        setFilteredMenuItems(visibleItems as MenuProps['items']);

    }, [user, hasRole, hasPermission]);

    // Cargar configuración de empresa
    useEffect(() => {
        companySettingsApi.getSettings().then(settings => {
            setCompanyName(settings.name);
            if (settings.logoUrl) {
                setCompanyLogo(settings.logoUrl);
            }
        }).catch(err => {
            console.error('Error loading company settings:', err);
        });
    }, []);

    // Guardar preferencia de tema
    useEffect(() => {
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    const handleMenuClick = ({ key }: { key: string }) => {
        navigate(key);
    };

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                theme={isDarkMode ? 'dark' : 'light'}
                style={{
                    overflow: 'auto',
                    height: '100vh',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    bottom: 0,
                }}
            >
                <div style={{
                    height: 64,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    paddingLeft: collapsed ? 0 : 16,
                    paddingRight: collapsed ? 0 : 16,
                    color: isDarkMode ? '#fff' : '#000',
                    background: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                    gap: 12,
                }}>
                    {companyLogo && !collapsed && (
                        <img
                            src={companyLogo}
                            alt="Logo"
                            style={{
                                height: '100%',
                                width: 'auto',
                                maxHeight: 48,
                                aspectRatio: '1',
                                objectFit: 'cover',
                                borderRadius: '50%',
                                border: `2px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
                            }}
                        />
                    )}
                    {companyLogo && collapsed && (
                        <img
                            src={companyLogo}
                            alt="Logo"
                            style={{
                                height: '100%',
                                width: 'auto',
                                maxHeight: 40,
                                aspectRatio: '1',
                                objectFit: 'cover',
                                borderRadius: '50%',
                                border: `2px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
                            }}
                        />
                    )}
                    {!collapsed && (
                        <span style={{
                            fontSize: collapsed ? 18 : 18,
                            fontWeight: 'bold',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}>
                            {collapsed ? companyName.charAt(0) : companyName}
                        </span>
                    )}
                </div>
                <Menu
                    theme={isDarkMode ? 'dark' : 'light'}
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={filteredMenuItems}
                    onClick={handleMenuClick}
                />
            </Sider>

            <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'margin-left 0.2s' }}>
                <Header style={{
                    padding: '0 24px',
                    background: isDarkMode ? '#001529' : '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}>
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{ fontSize: '16px', width: 64, height: 64, color: isDarkMode ? '#fff' : '#000' }}
                    />

                    <Space size="large">
                        <Button
                            type="text"
                            icon={isDarkMode ? <span>☀️</span> : <span>🌙</span>}
                            onClick={toggleTheme}
                            size="large"
                            title={isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}
                            style={{ color: isDarkMode ? '#fff' : '#000' }}
                        />
                        <Button type="text" icon={<BellOutlined />} size="large" style={{ color: isDarkMode ? '#fff' : '#000' }} />
                        <Dropdown menu={{
                            items: [
                                {
                                    key: 'logout',
                                    label: 'Cerrar Sesión',
                                    icon: <LogoutOutlined />,
                                    onClick: logout,
                                    danger: true
                                }
                            ]
                        }}>
                            <Space style={{ cursor: 'pointer' }}>
                                <Avatar icon={<UserOutlined />} />
                                <Text strong style={{ color: isDarkMode ? '#fff' : '#000' }}>
                                    {user?.name || 'Usuario'}
                                </Text>
                            </Space>
                        </Dropdown>
                    </Space>
                </Header>

                <Content style={{
                    margin: location.pathname.includes('/pos') ? '0' : '24px 16px',
                    padding: location.pathname.includes('/pos') ? 0 : 24,
                    background: '#fff',
                    minHeight: 280,
                }}>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};
