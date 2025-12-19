import axios from 'axios';

import { BASE_URL as API_URL } from './apiConfig';

export interface InventoryAdjustment {
    id: string;
    productId: string;
    product: {
        id: string;
        name: string;
        sku: string;
        stock: number;
    };
    type: 'INCREASE' | 'DECREASE';
    quantity: number;
    previousStock: number;
    newStock: number;
    reason: 'DAMAGE' | 'LOSS' | 'ERROR' | 'INITIAL' | 'RETURN' | 'TRANSFER' | 'OTHER';
    notes?: string;
    performedBy: string;
    createdAt: string;
}

export interface CreateAdjustmentDto {
    productId: string;
    type: 'INCREASE' | 'DECREASE';
    quantity: number;
    reason: 'DAMAGE' | 'LOSS' | 'ERROR' | 'INITIAL' | 'RETURN' | 'TRANSFER' | 'OTHER';
    notes?: string;
    performedBy?: string;
}

export const inventoryAdjustmentsApi = {
    create: async (dto: CreateAdjustmentDto): Promise<InventoryAdjustment> => {
        const { data } = await axios.post(`${API_URL}/inventory-adjustments`, dto);
        return data;
    },

    findAll: async (filters?: {
        productId?: string;
        type?: string;
        reason?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<InventoryAdjustment[]> => {
        const params = new URLSearchParams();
        if (filters?.productId) params.append('productId', filters.productId);
        if (filters?.type) params.append('type', filters.type);
        if (filters?.reason) params.append('reason', filters.reason);
        if (filters?.startDate) params.append('startDate', filters.startDate);
        if (filters?.endDate) params.append('endDate', filters.endDate);

        const { data } = await axios.get(`${API_URL}/inventory-adjustments?${params.toString()}`);
        return data;
    },

    findOne: async (id: string): Promise<InventoryAdjustment> => {
        const { data } = await axios.get(`${API_URL}/inventory-adjustments/${id}`);
        return data;
    },

    findByProduct: async (productId: string): Promise<InventoryAdjustment[]> => {
        const { data } = await axios.get(`${API_URL}/inventory-adjustments/product/${productId}`);
        return data;
    }
};
