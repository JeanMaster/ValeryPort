import { Modal, InputNumber, Button, Space, Alert, Typography } from 'antd';
import { useEffect, useRef, useState } from 'react';
import type { Product } from '../../../services/productsApi';

interface DiscountModalProps {
    open: boolean;
    product: Product | null;
    currentPrice: number;
    onOk: (percent: number) => void;
    onCancel: () => void;
}

export const DiscountModal = ({ open, product, currentPrice, onOk, onCancel }: DiscountModalProps) => {
    const [percent, setPercent] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<any>(null);

    useEffect(() => {
        if (open) {
            setPercent(0);
            setError(null);
            setTimeout(() => {
                inputRef.current?.focus();
            }, 50);
        }
    }, [open]);

    const calculateNewPrice = (p: number) => {
        return currentPrice - (currentPrice * (p / 100));
    };

    const validate = (val: number): string | null => {
        if (!product) return null;

        // 1. Max 30% discount
        if (val > 30) {
            return "El descuento máximo permitido es 30%";
        }

        // 2. Price cannot go below cost
        const newPrice = calculateNewPrice(val);
        // FIXME: Check if using secondary unit cost if necessary. 
        // For simplicity assuming primary unit cost as base or handling it upstream. 
        // Ideally we pass the 'baseCost' prop to this modal to be unit-agnostic.
        if (newPrice < product.costPrice) {
            return `El precio final (${newPrice.toFixed(2)}) es menor al costo`;
        }

        return null;
    };

    const handleSubmit = () => {
        const validationError = validate(percent);
        if (validationError) {
            setError(validationError);
            return;
        }
        onOk(percent);
    };

    const handleChange = (val: number | null) => {
        const newVal = val || 0;
        setPercent(newVal);
        const err = validate(newVal);
        setError(err);
    };

    return (
        <Modal
            title="Aplicar Descuento (%)"
            open={open}
            onOk={handleSubmit}
            onCancel={onCancel}
            width={300}
            footer={null}
            centered
        >
            <div style={{ textAlign: 'center' }}>
                <p style={{ marginBottom: 15, fontWeight: 'bold' }}>{product?.name}</p>

                <Space direction="vertical" style={{ width: '100%' }}>
                    <InputNumber
                        ref={inputRef}
                        value={percent}
                        onChange={handleChange}
                        min={0}
                        max={100}
                        size="large"
                        style={{ width: '100%' }}
                        onPressEnter={handleSubmit}
                        addonAfter="%"
                        status={error ? 'error' : ''}
                    />

                    {error && (
                        <Alert
                            message={error}
                            type="error"
                            showIcon
                            style={{ textAlign: 'left', fontSize: 12 }}
                        />
                    )}

                    <div style={{ marginTop: 10, background: '#f5f5f5', padding: 8, borderRadius: 4 }}>
                        <Typography.Text type="secondary" style={{ fontSize: 12 }}>Precio Final: </Typography.Text>
                        <Typography.Text strong>
                            {calculateNewPrice(percent).toFixed(2)}
                        </Typography.Text>
                    </div>

                    <div style={{ marginTop: 15, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                        <Button onClick={onCancel}>Cancelar</Button>
                        <Button
                            type="primary"
                            onClick={handleSubmit}
                            disabled={!!error}
                        >
                            Aplicar
                        </Button>
                    </div>
                </Space>
            </div>
        </Modal>
    );
};
