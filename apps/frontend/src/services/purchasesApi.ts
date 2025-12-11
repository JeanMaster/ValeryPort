import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export interface PurchaseItem {
    id: string;
    productId: string;
    product: {
        id: string;
        name: string;
        sku: string;
    };
    quantity: number;
    cost: number;
    total: number;
    oldCost?: number;
}

export interface Purchase {
    id: string;
    supplierId: string;
    supplier: {
        id: string;
        comercialName: string;
        rif: string;
    };
    invoiceDate: string;
    invoiceNumber?: string;
    subtotal: number;
    taxAmount: number;
    total: number;
    currencyCode: string;
    exchangeRate: number;
    status: string;
    items: PurchaseItem[];
    createdAt: string;
}

export interface CreatePurchaseItemDto {
    productId: string;
    quantity: number;
    cost: number;
}

export interface CreatePurchaseDto {
    supplierId: string;
    invoiceDate: Date;
    invoiceNumber?: string;
    items: CreatePurchaseItemDto[];
    currencyCode?: string;
    exchangeRate?: number;
}

export const purchasesApi = {
    getAll: async (): Promise<Purchase[]> => {
        const response = await axios.get(`${API_URL}/purchases`);
        return response.data;
    },

    getById: async (id: string): Promise<Purchase> => {
        const response = await axios.get(`${API_URL}/purchases/${id}`);
        return response.data;
    },

    create: async (data: CreatePurchaseDto): Promise<Purchase> => {
        const response = await axios.post(`${API_URL}/purchases`, data);
        return response.data;
    },
};
