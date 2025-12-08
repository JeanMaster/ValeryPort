import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export interface SaleItem {
    id: string;
    productId: string;
    product: {
        id: string;
        name: string;
        sku: string;
    };
    quantity: number;
    unitPrice: number;
    total: number;
}

export interface Sale {
    id: string;
    date: string;
    clientId?: string;
    client?: {
        id: string;
        name: string;
    };
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    paymentMethod: string;
    tendered?: number;
    change?: number;
    items: SaleItem[];
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateSaleDto {
    clientId?: string;
    items: {
        productId: string;
        quantity: number;
        unitPrice: number;
        total: number;
    }[];
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    paymentMethod: string;
    tendered?: number;
    change?: number;
}

export const salesApi = {
    getAll: async (): Promise<Sale[]> => {
        const { data } = await axios.get(`${API_URL}/sales`);
        return data;
    },

    getOne: async (id: string): Promise<Sale> => {
        const { data } = await axios.get(`${API_URL}/sales/${id}`);
        return data;
    },

    create: async (dto: CreateSaleDto): Promise<Sale> => {
        const { data } = await axios.post(`${API_URL}/sales`, dto);
        return data;
    },
};