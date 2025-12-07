import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '../services/productsApi';
import { companySettingsApi } from '../services/companySettingsApi';
import { currenciesApi } from '../services/currenciesApi';

export interface CartItem {
    product: Product;
    quantity: number;
    price: number;
    tax: number;
    discount: number; // Monto de descuento aplicado
    discountPercent: number; // Porcentaje de descuento (0-100)
    total: number;
    isSecondaryUnit: boolean;
}

interface POSState {
    cart: CartItem[];
    activeCustomer: string;
    selectedItemId: string | null;
    totals: {
        subtotal: number;
        discount: number; // Total descuentos
        tax: number;
        total: number;
        totalUsd: number; // This will now represent Total in Secondary Currency
        itemsCount: number;
    };
    exchangeRate: number;
    preferredSecondaryCurrency: { symbol: string, code: string } | null;

    // Actions
    addItem: (product: Product, isSecondary: boolean) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    selectItem: (itemId: string | null) => void;
    applyDiscount: (productId: string, percent: number) => void;
    clearCart: () => void;
    setExchangeRate: (rate: number) => void;
    setCustomer: (customer: string) => void;
    calculateTotals: () => void;
    initialize: () => Promise<void>;
}

export const usePOSStore = create<POSState>()(
    persist(
        (set, get) => ({
            cart: [],
            activeCustomer: 'CONTADO',
            selectedItemId: null,
            totals: {
                subtotal: 0,
                discount: 0,
                tax: 0,
                total: 0,
                totalUsd: 0,
                itemsCount: 0,
            },
            exchangeRate: 0,
            preferredSecondaryCurrency: null,

            addItem: (product, isSecondary) => {
                const { cart } = get();
                const existingItem = cart.find(
                    (item) => item.product.id === product.id && item.isSecondaryUnit === isSecondary
                );

                const price = isSecondary
                    ? (product.secondarySalePrice || 0)
                    : Number(product.salePrice);

                if (existingItem) {
                    get().updateQuantity(product.id, existingItem.quantity + 1);
                } else {
                    const newItem: CartItem = {
                        product,
                        quantity: 1,
                        price,
                        tax: 0,
                        discount: 0,
                        discountPercent: 0,
                        total: price * 1,
                        isSecondaryUnit: isSecondary,
                    };

                    const newCart = [...cart, newItem];
                    set({ cart: newCart, selectedItemId: product.id });
                    get().calculateTotals();
                }
            },

            removeItem: (productId) => {
                const { cart, selectedItemId } = get();
                const newCart = cart.filter((item) => item.product.id !== productId);

                let newSelected = selectedItemId;
                if (selectedItemId === productId) {
                    newSelected = null;
                }

                set({ cart: newCart, selectedItemId: newSelected });
                get().calculateTotals();
            },

            updateQuantity: (productId, quantity) => {
                const { cart } = get();
                if (quantity <= 0) {
                    get().removeItem(productId);
                    return;
                }

                const newCart = cart.map((item) => {
                    if (item.product.id === productId) {
                        const subtotalLine = item.price * quantity;
                        const discountAmount = subtotalLine * (item.discountPercent / 100);

                        return {
                            ...item,
                            quantity,
                            discount: discountAmount,
                            total: subtotalLine - discountAmount,
                        };
                    }
                    return item;
                });

                set({ cart: newCart });
                get().calculateTotals();
            },

            selectItem: (itemId) => {
                set({ selectedItemId: itemId });
            },

            applyDiscount: (productId, percent) => {
                const { cart } = get();

                const newCart = cart.map((item) => {
                    if (item.product.id === productId) {
                        const subtotalLine = item.price * item.quantity;
                        const discountAmount = subtotalLine * (percent / 100);

                        return {
                            ...item,
                            discountPercent: percent,
                            discount: discountAmount,
                            total: subtotalLine - discountAmount
                        };
                    }
                    return item;
                });

                set({ cart: newCart });
                get().calculateTotals();
            },

            clearCart: () => {
                set({
                    cart: [],
                    selectedItemId: null,
                    totals: { subtotal: 0, discount: 0, tax: 0, total: 0, totalUsd: 0, itemsCount: 0 }
                });
            },

            setExchangeRate: (rate) => {
                set({ exchangeRate: rate });
                get().calculateTotals();
            },

            setCustomer: (customer) => {
                set({ activeCustomer: customer });
            },

            calculateTotals: () => {
                const { cart, exchangeRate } = get();

                const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
                const totalDiscount = cart.reduce((acc, item) => acc + item.discount, 0);
                const tax = 0; // Implement tax later

                const total = subtotal - totalDiscount + tax;
                const itemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

                const totalUsd = exchangeRate > 0 ? total / exchangeRate : 0;

                set({
                    totals: {
                        subtotal,
                        discount: totalDiscount,
                        tax,
                        total,
                        totalUsd,
                        itemsCount
                    }
                });
            },

            initialize: async () => {
                try {
                    const settings = await companySettingsApi.getSettings();

                    if (settings.preferredSecondaryCurrencyId) {
                        const currency = await currenciesApi.getOne(settings.preferredSecondaryCurrencyId);
                        if (currency) {
                            set({
                                preferredSecondaryCurrency: { symbol: currency.symbol, code: currency.code },
                                exchangeRate: Number(currency.exchangeRate || 0)
                            });
                        }
                    }
                    get().calculateTotals();
                } catch (error) {
                    console.error("Failed to initialize POS store", error);
                }
            }
        }),
        {
            name: 'pos-storage',
            onRehydrateStorage: () => (state) => {
                state?.initialize();
            }
        }
    )
);
