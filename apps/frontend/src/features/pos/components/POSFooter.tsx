import { Button, Typography } from 'antd';
import {
    ShoppingCartOutlined,
    UserOutlined,
    SaveOutlined,
    ReloadOutlined,
    PoweroffOutlined
} from '@ant-design/icons';

const { Text } = Typography;

const FunctionKey = ({
    fKey,
    label,
    icon,
    color = '#fff',
    onClick
}: {
    fKey: string;
    label: string;
    icon?: React.ReactNode;
    color?: string;
    onClick?: () => void
}) => (
    <Button
        style={{
            height: '50px',
            minWidth: '90px', // Allow auto width but minimum
            display: 'flex',
            flexDirection: 'row', // Cambiar a horizontal
            alignItems: 'center',
            justifyContent: 'center',
            background: color,
            border: '1px solid #d9d9d9',
            padding: '0 15px',
            gap: 8
        }}
        onClick={onClick}
    >
        {/* F-Key pequeña en la esquina o integrada */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1 }}>
            <Text type="secondary" style={{ fontSize: 9 }}>{fKey}</Text>
            <Text strong style={{ fontSize: 11 }}>{label}</Text>
        </div>
        {/* Icono a la derecha */}
        {icon && <div style={{ fontSize: 18 }}>{icon}</div>}
    </Button>
);

export const POSFooter = () => {
    return (
        <div style={{ padding: '10px 20px', background: '#e6e6e6', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            {/* Botones Alineados a la Derecha */}
            <FunctionKey fKey="F3 Cli." label="Cliente" icon={<UserOutlined />} />
            <FunctionKey fKey="F10 Caja" label="Caja" icon={<SaveOutlined />} />
            <FunctionKey fKey="F11 Cargar" label="Cargar" icon={<ReloadOutlined />} />

            {/* Botón Totalizar Grande */}
            <Button
                type="primary"
                style={{
                    height: '50px',
                    minWidth: '200px', // Ensure visibility
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 10,
                    fontSize: 16
                }}
            >
                <ShoppingCartOutlined style={{ fontSize: 24 }} />
                <span>F9 Totalizar</span>
            </Button>

            <FunctionKey fKey="ESC Cerrar" label="Salir" icon={<PoweroffOutlined />} color="#f5f5f5" />
        </div>
    );
};
