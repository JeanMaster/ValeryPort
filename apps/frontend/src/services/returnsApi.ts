import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export interface ReturnItem {
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
    restockQuantity: number;
}

export interface Return {
    id: string;
    creditNoteNumber: string;
    originalSaleId: string;
    originalSale: {
        id: string;
        invoiceNumber: string;
        date: string;
        total: number;
        client?: {
            id: string;
            name: string;
        };
    };
    returnType: 'REFUND' | 'EXCHANGE_SAME' | 'EXCHANGE_DIFFERENT';
    reason: 'DEFECTIVE' | 'UNSATISFIED' | 'ERROR' | 'EXPIRED' | 'OTHER';
    productCondition: 'EXCELLENT' | 'GOOD' | 'DEFECTIVE' | 'DAMAGED';
    refundAmount: number;
    refundMethod?: 'CASH' | 'TRANSFER' | 'CREDIT_NOTE';
    newSaleId?: string;
    newSale?: any;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
    requestedBy?: string;
    approvedBy?: string;
    approvedAt?: string;
    notes?: string;
    items: ReturnItem[];
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateReturnItemDto {
    productId: string;
    quantity: number;
    unitPrice: number;
    total: number;
    restockQuantity: number;
}

export interface CreateReturnDto {
    originalSaleId: string;
    returnType: 'REFUND' | 'EXCHANGE_SAME' | 'EXCHANGE_DIFFERENT';
    reason: 'DEFECTIVE' | 'UNSATISFIED' | 'ERROR' | 'EXPIRED' | 'OTHER';
    productCondition: 'EXCELLENT' | 'GOOD' | 'DEFECTIVE' | 'DAMAGED';
    items: CreateReturnItemDto[];
    refundAmount: number;
    refundMethod?: 'CASH' | 'TRANSFER' | 'CREDIT_NOTE';
    notes?: string;
    requestedBy?: string;
}

export interface ReturnFilters {
    status?: string;
    returnType?: string;
    startDate?: string;
    endDate?: string;
}

export interface ValidationResult {
    eligible: boolean;
    message?: string;
}

export const returnsApi = {
    create: async (dto: CreateReturnDto): Promise<Return> => {
        const { data } = await axios.post(`${API_URL}/returns`, dto);
        return data;
    },

    getAll: async (filters?: ReturnFilters): Promise<Return[]> => {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.returnType) params.append('returnType', filters.returnType);
        if (filters?.startDate) params.append('startDate', filters.startDate);
        if (filters?.endDate) params.append('endDate', filters.endDate);

        const { data } = await axios.get(`${API_URL}/returns?${params.toString()}`);
        return data;
    },

    getOne: async (id: string): Promise<Return> => {
        const { data } = await axios.get(`${API_URL}/returns/${id}`);
        return data;
    },

    approve: async (id: string, approvedBy: string): Promise<Return> => {
        const { data } = await axios.patch(`${API_URL}/returns/${id}/approve`, { approvedBy });
        return data;
    },

    reject: async (id: string, reason: string): Promise<Return> => {
        const { data } = await axios.patch(`${API_URL}/returns/${id}/reject`, { reason });
        return data;
    },

    process: async (id: string): Promise<Return> => {
        const { data } = await axios.post(`${API_URL}/returns/${id}/process`);
        return data;
    },

    validate: async (saleId: string, items: CreateReturnItemDto[]): Promise<ValidationResult> => {
        const { data } = await axios.post(`${API_URL}/returns/validate`, { saleId, items });
        return data;
    }
};
