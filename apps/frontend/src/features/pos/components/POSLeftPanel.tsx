import { useState, useCallback, useEffect } from 'react';
import { Table, Button, Card, Select, Modal } from 'antd';
import { usePOSStore } from '../../../store/posStore';
import type { CartItem } from '../../../store/posStore';
import { productsApi } from '../../../services/productsApi';
import type { Product } from '../../../services/productsApi';
import debounce from 'lodash/debounce';
import { QuantityModal } from './QuantityModal';
import { DiscountModal } from './DiscountModal';
import { DeleteOutlined, PercentageOutlined, NumberOutlined } from '@ant-design/icons';

export const POSLeftPanel = () => {
    const {
        cart,
        activeCustomer,
        addItem,
        selectedItemId,
        selectItem,
        updateQuantity,
        removeItem,
        applyDiscount,
        totals,
        preferredSecondaryCurrency,
        exchangeRate
    } = usePOSStore();

    const [searchResults, setSearchResults] = useState<Product[]>([]);

    // Modal States
    const [isQuantityModalOpen, setIsQuantityModalOpen] = useState(false);
    const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);

    const handleSearch = useCallback(
        debounce((value: string) => {
            if (value.length > 2) {
                productsApi.getAll({ search: value }).then(setSearchResults);
            } else {
                setSearchResults([]);
            }
        }, 500),
        []
    );

    const handleSelectProduct = (_productId: string, option: any) => {
        if (option.product) {
            addItem(option.product, false); // Default to primary unit
        }
    };

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!selectedItemId) return;

            switch (e.key) {
                case 'F4':
                    e.preventDefault();
                    setIsQuantityModalOpen(true);
                    break;
                case 'F6':
                    e.preventDefault();
                    Modal.confirm({
                        title: '¿Eliminar item?',
                        content: 'Se eliminará el producto del carrito',
                        onOk: () => removeItem(selectedItemId),
                    });
                    break;
                case 'F7':
                    e.preventDefault();
                    setIsDiscountModalOpen(true);
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedItemId, removeItem]);

    const selectedCartItem = cart.find(item => item.product.id === selectedItemId);

    const columns = [
        {
            title: 'Cant.',
            dataIndex: 'quantity',
            key: 'quantity',
            width: 70,
            align: 'center' as const,
            render: (text: number) => <span style={{ fontSize: 14, fontWeight: 'bold' }}>{text}</span>
        },
        {
            title: 'Descripción',
            dataIndex: 'product',
            key: 'product',
            render: (product: any, record: CartItem) => (
                <div>
                    <span style={{ fontWeight: 'bold' }}>{product.name}</span>
                    {record.isSecondaryUnit && <div style={{ fontSize: 10, color: '#888' }}>({product.secondaryUnit?.name || 'Sec.'})</div>}
                    {record.discount > 0 && (
                        <div style={{ fontSize: 11, color: 'green' }}>
                            Desc: {record.discountPercent}% (-{record.discount.toFixed(2)})
                        </div>
                    )}
                </div>
            )
        },
        {
            title: 'Total',
            dataIndex: 'total',
            key: 'total',
            width: 90,
            align: 'right' as const,
            render: (value: number) => {
                const secondaryValue = exchangeRate > 0 ? value / exchangeRate : 0;
                return (
                    <div>
                        <div style={{ fontSize: 14 }}>{value.toFixed(2)}</div>
                        {preferredSecondaryCurrency && exchangeRate > 0 && (
                            <div style={{ fontSize: 10, color: '#888' }}>
                                {preferredSecondaryCurrency.symbol} {secondaryValue.toFixed(2)}
                            </div>
                        )}
                    </div>
                );
            }
        }
    ];

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Info Cliente & Factura bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, background: '#eee', padding: '5px 10px' }}>
                <span>Cliente: <strong style={{ color: '#ff4d4f' }}>{activeCustomer}</strong></span>
                <span>CONTADO CONTRIBUYENTE</span>
                <span>Factura: <strong style={{ color: '#ff4d4f' }}>00-00000001</strong></span>
                <Button size="small" style={{ fontSize: 10 }}>Divisas..</Button>
            </div>

            {/* Buscador */}
            <Select
                showSearch
                value={null}
                placeholder="Escanee código o busque producto"
                defaultActiveFirstOption={false}
                suffixIcon={null}
                filterOption={false}
                onSearch={handleSearch}
                onChange={handleSelectProduct}
                notFoundContent={null}
                style={{ width: '100%' }}
                size="large"
                options={(searchResults || []).map((d: Product) => ({
                    value: d.id,
                    label: `${d.sku} - ${d.name} ($${d.salePrice?.toFixed(2)})`,
                    product: d
                }))}
            />

            {/* Grid del Carrito */}
            <div style={{ flex: 1, border: '1px solid #d9d9d9', background: 'white', borderRadius: 4, overflow: 'hidden' }}>
                <Table
                    dataSource={cart}
                    columns={columns}
                    pagination={false}
                    size="small"
                    scroll={{ y: 'calc(100vh - 300px)' }}
                    rowKey={(record) => record.product.id}
                    locale={{ emptyText: 'No hay items' }}
                    rowClassName={(record) => record.product.id === selectedItemId ? 'pos-row-selected' : 'pos-row'}
                    onRow={(record) => ({
                        onClick: () => selectItem(record.product.id),
                    })}
                />
            </div>

            {/* Botones de Acción Rápida (Visual Keys) */}
            <div style={{ display: 'flex', gap: 5, overflowX: 'auto', paddingBottom: 5 }}>
                <Button
                    size="small"
                    icon={<NumberOutlined />}
                    disabled={!selectedItemId}
                    onClick={() => setIsQuantityModalOpen(true)}
                >
                    F4 Cant.
                </Button>
                <Button
                    size="small"
                    icon={<DeleteOutlined />}
                    danger
                    disabled={!selectedItemId}
                    onClick={() => removeItem(selectedItemId!)}
                >
                    F6 Eliminar
                </Button>
                <Button
                    size="small"
                    icon={<PercentageOutlined />}
                    disabled={!selectedItemId}
                    onClick={() => setIsDiscountModalOpen(true)}
                >
                    F7 Dcto
                </Button>
            </div>

            {/* Mini Totales Inferiores */}
            <Card size="small" style={{ background: '#333', color: 'white', border: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ color: 'white' }}>Sub Total</span>
                    <strong style={{ fontSize: 16, color: 'white' }}>{(totals.subtotal || 0).toFixed(2)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ color: 'white' }}>Descuento</span>
                    <strong style={{ fontSize: 16, color: 'orange' }}>{(totals.discount || 0).toFixed(2)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #555', marginTop: 5, paddingTop: 5 }}>
                    <span style={{ color: 'white' }}>Total</span>
                    <strong style={{ fontSize: 20, color: 'yellow' }}>{(totals.total || 0).toFixed(2)}</strong>
                </div>
                {preferredSecondaryCurrency && (
                    <div style={{ textAlign: 'right', marginTop: -2 }}>
                        <span style={{ fontSize: 12, color: '#aaa' }}>
                            {preferredSecondaryCurrency.symbol} {(totals.totalUsd || 0).toFixed(2)}
                        </span>
                    </div>
                )}
                <div style={{ fontSize: 11, color: '#aaa', marginTop: 5, textAlign: 'right' }}>
                    Items: {totals.itemsCount}
                </div>
            </Card>

            {/* Modals */}
            {selectedCartItem && (
                <>
                    <QuantityModal
                        open={isQuantityModalOpen}
                        currentQuantity={selectedCartItem.quantity}
                        productName={selectedCartItem.product.name}
                        onOk={(qty) => {
                            updateQuantity(selectedCartItem.product.id, qty);
                            setIsQuantityModalOpen(false);
                            // Keep focus on table or re-focus input?
                        }}
                        onCancel={() => setIsQuantityModalOpen(false)}
                    />

                    <DiscountModal
                        open={isDiscountModalOpen}
                        product={selectedCartItem.product}
                        currentPrice={selectedCartItem.price} // Use base price for calculation check
                        onOk={(percent) => {
                            applyDiscount(selectedCartItem.product.id, percent);
                            setIsDiscountModalOpen(false);
                        }}
                        onCancel={() => setIsDiscountModalOpen(false)}
                    />
                </>
            )}
        </div>
    );
};

