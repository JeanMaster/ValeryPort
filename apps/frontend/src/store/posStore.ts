import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '../services/productsApi';
import { companySettingsApi } from '../services/companySettingsApi';
import { currenciesApi, type Currency } from '../services/currenciesApi';
import { salesApi, type CreateSaleDto } from '../services/salesApi';

export interface CartItem {
    product: Product;
    quantity: number;
    price: number;
    tax: number;
    discount: number; // Monto de descuento aplicado
    discountPercent: number; // Porcentaje de descuento (0-100)
    total: number;
    isSecondaryUnit: boolean;
    originalCurrencyCode?: string; // Code of the currency the product was bought in
}

interface POSState {
    cart: CartItem[];
    activeCustomer: string;
    customerId: string | null;
    selectedItemId: string | null;
    totals: {
        subtotal: number;
        discount: number; // Total descuentos
        tax: number;
        total: number;
        totalUsd: number; // This will now represent Total in Secondary Currency
        itemsCount: number;
    };
    exchangeRate: number; // Rate of Preferred Secondary Currency
    preferredSecondaryCurrency: Currency | null;
    currencies: Currency[]; // All available currencies
    primaryCurrency: Currency | null;

    // Actions
    addItem: (product: Product, isSecondary: boolean) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    updateItemPrice: (productId: string, newPrice: number) => void;
    selectItem: (itemId: string | null) => void;
    applyDiscount: (productId: string, percent: number) => void;
    clearCart: () => void;
    resetPOS: () => void;
    setExchangeRate: (rate: number) => void;
    setCustomer: (customer: { id: string; name: string } | string) => void;
    calculateTotals: () => void;
    initialize: () => Promise<void>;
    processSale: (paymentData: any) => Promise<void>;

    // Helpers
    calculatePriceInPrimary: (product: Product, isSecondaryUnit: boolean) => number;
    calculateCostInPrimary: (product: Product, isSecondaryUnit: boolean) => number;
    calculatePriceInCurrency: (priceInPrimary: number, targetCurrencyId: string) => number;
}

export const usePOSStore = create<POSState>()(
    persist(
        (set, get) => ({
            cart: [],
            activeCustomer: 'CONTADO',
            customerId: null,
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
            currencies: [],
            primaryCurrency: null,

            calculatePriceInPrimary: (product: Product, isSecondaryUnit: boolean) => {
                const { currencies, primaryCurrency } = get();

                // Get the raw price from product
                let rawPrice = isSecondaryUnit
                    ? (product.secondarySalePrice || 0)
                    : Number(product.salePrice);

                // If no currencies loaded yet, return raw price (fallback)
                if (!currencies.length || !primaryCurrency) return rawPrice;

                // If product currency is same as primary, return price as is
                if (product.currencyId === primaryCurrency.id) {
                    return rawPrice;
                }

                // If product currency is different, convert to Primary
                // Find product currency rate
                const productCurrency = currencies.find(c => c.id === product.currencyId);

                if (productCurrency) {
                    // Assumption: Rates are "Bs per Unit" (e.g. 50 Bs/$)
                    const rate = Number(productCurrency.exchangeRate || 0);
                    if (rate > 0) {
                        return rawPrice * rate;
                    }
                }
                return rawPrice;
            },

            calculateCostInPrimary: (product: Product, isSecondaryUnit: boolean) => {
                const { currencies, primaryCurrency } = get();

                let rawCost = isSecondaryUnit
                    ? (product.secondaryCostPrice || 0)
                    : Number(product.costPrice);

                if (!currencies.length || !primaryCurrency) return rawCost;

                if (product.currencyId === primaryCurrency.id) {
                    return rawCost;
                }

                const productCurrency = currencies.find(c => c.id === product.currencyId);
                if (productCurrency) {
                    const rate = Number(productCurrency.exchangeRate || 0);
                    if (rate > 0) {
                        return rawCost * rate;
                    }
                }
                return rawCost;
            },

            calculatePriceInCurrency: (priceInPrimary: number, targetCurrencyId: string) => {
                const { currencies, primaryCurrency } = get();

                if (!currencies.length || !primaryCurrency) return priceInPrimary;

                // If target is primary currency, return as is
                if (targetCurrencyId === primaryCurrency.id) {
                    return priceInPrimary;
                }

                // Find target currency
                const targetCurrency = currencies.find(c => c.id === targetCurrencyId);
                if (targetCurrency && targetCurrency.exchangeRate) {
                    const rate = Number(targetCurrency.exchangeRate);
                    if (rate > 0) {
                        // Convert from primary to target currency
                        // If rate is 130 Bs/USD, then 156 Bs / 130 = 1.2 USD
                        return priceInPrimary / rate;
                    }
                }

                return priceInPrimary;
            },

            addItem: (product, isSecondary) => {
                const { cart, calculatePriceInPrimary } = get();
                const existingItem = cart.find(
                    (item) => item.product.id === product.id && item.isSecondaryUnit === isSecondary
                );

                // Calculate price normalized to Primary Currency (Bs)
                const priceInPrimary = calculatePriceInPrimary(product, isSecondary);

                if (existingItem) {
                    get().updateQuantity(product.id, existingItem.quantity + 1);
                } else {
                    const newItem: CartItem = {
                        product,
                        quantity: 1,
                        price: priceInPrimary,
                        tax: 0,
                        discount: 0,
                        discountPercent: 0,
                        total: priceInPrimary * 1,
                        isSecondaryUnit: isSecondary,
                        originalCurrencyCode: product.currency?.name // keeping for reference
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

            updateItemPrice: (productId, newPrice) => {
                const { cart } = get();
                const newCart = cart.map((item) => {
                    if (item.product.id === productId) {
                        return {
                            ...item,
                            price: newPrice,
                            total: newPrice * item.quantity - (item.discount || 0) // Re-calculate total. Warning: Validation for discount?
                            // Discount logic might need revisit if it was percent based.
                            // If discountPercent > 0, we should maintain percent?
                            // Yes, let's recalculate discount if percent exists.
                        };
                    }
                    return item;
                });

                // Recalculate discounts properly
                const finalCart = newCart.map(item => {
                    if (item.product.id === productId) {
                        const subtotal = item.price * item.quantity;
                        const discountAmount = subtotal * (item.discountPercent / 100);
                        return {
                            ...item,
                            discount: discountAmount,
                            total: subtotal - discountAmount
                        };
                    }
                    return item;
                });

                set({ cart: finalCart });
                get().calculateTotals();
            },

            resetPOS: () => {
                set({
                    cart: [],
                    selectedItemId: null,
                    activeCustomer: 'CONTADO',
                    totals: { subtotal: 0, discount: 0, tax: 0, total: 0, totalUsd: 0, itemsCount: 0 }
                });
            },

            setExchangeRate: (rate) => {
                set({ exchangeRate: rate });
                get().calculateTotals();
            },

            setCustomer: (customer) => {
                if (typeof customer === 'string') {
                    set({ activeCustomer: customer, customerId: null });
                } else {
                    set({ activeCustomer: customer.name, customerId: customer.id });
                }
            },

            calculateTotals: () => {
                const { cart, exchangeRate } = get();

                const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
                const totalDiscount = cart.reduce((acc, item) => acc + item.discount, 0);
                const tax = 0; // Implement tax later

                const total = subtotal - totalDiscount + tax;
                const itemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

                // Calculate Total in Secondary Currency (e.g. USD)
                // If total is in Bs (600) and rate is 260 Bs/$, result is 2.30 $
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
                    // 1. Fetch Company Settings
                    const settings = await companySettingsApi.getSettings();

                    // 2. Fetch All Currencies
                    const allCurrencies = await currenciesApi.getAll();
                    const primary = allCurrencies.find(c => c.isPrimary) || null;

                    let secondaryRate = 0;
                    let secondaryDetails = null;

                    // 3. Setup Secondary Currency Rate
                    if (settings.preferredSecondaryCurrencyId) {
                        const secondary = allCurrencies.find(c => c.id === settings.preferredSecondaryCurrencyId);
                        if (secondary) {
                            secondaryRate = Number(secondary.exchangeRate || 0);
                            secondaryDetails = secondary;
                        }
                    }

                    set({
                        currencies: allCurrencies,
                        primaryCurrency: primary,
                        preferredSecondaryCurrency: secondaryDetails,
                        exchangeRate: secondaryRate
                    });

                    get().calculateTotals();
                } catch (error) {
                    console.error("Failed to initialize POS store", error);
                }
            },

            processSale: async (paymentData: any) => {
                const { cart, totals, customerId } = get();

                // Handle multiple payments - combine them into a single payment method string
                let paymentMethod = 'MIXED';
                let tendered = paymentData.totalPaid || 0;
                let change = paymentData.change || 0;

                // If only one payment, use that method
                if (paymentData.payments && paymentData.payments.length === 1) {
                    paymentMethod = paymentData.payments[0].method;
                    tendered = paymentData.payments[0].amount;
                } else if (paymentData.payments && paymentData.payments.length > 1) {
                    // Multiple payments - create a description
                    paymentMethod = paymentData.payments
                        .map((p: any) => `${p.method}:${p.amount.toFixed(2)}`)
                        .join(', ');
                }

                const saleDto: CreateSaleDto = {
                    clientId: customerId || undefined,
                    items: cart.map(item => ({
                        productId: item.product.id,
                        quantity: item.quantity,
                        unitPrice: item.price,
                        total: item.total
                    })),
                    subtotal: totals.subtotal,
                    discount: totals.discount,
                    tax: totals.tax,
                    total: totals.total,
                    paymentMethod: paymentMethod,
                    tendered: tendered,
                    change: change
                };

                try {
                    await salesApi.create(saleDto);
                    // Clear cart on success
                    get().clearCart();
                    // Reset customer to CONTADO
                    set({ activeCustomer: 'CONTADO', customerId: null });
                } catch (error) {
                    console.error('Error processing sale:', error);
                    throw error; // Re-throw to handle in component
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
