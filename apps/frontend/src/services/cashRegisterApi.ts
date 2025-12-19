import axios from 'axios';

import { BASE_URL as API_URL } from './apiConfig';

export interface CashRegister {
    id: string;
    name: string;
    location?: string;
    isActive: boolean;
}

export interface CashMovement {
    id: string;
    sessionId: string;
    type: 'SALE' | 'EXPENSE' | 'DEPOSIT' | 'WITHDRAWAL' | 'OPENING' | 'CLOSING';
    amount: number;
    currencyCode: string;
    description: string;
    notes?: string;
    performedBy: string;
    saleId?: string;
    sale?: any;
    createdAt: string;
}

export interface CashSession {
    id: string;
    registerId: string;
    register: CashRegister;
    openedBy: string;
    closedBy?: string;
    openedAt: string;
    closedAt?: string;
    status: 'OPEN' | 'CLOSED';
    openingBalance: number;
    openingNotes?: string;
    expectedBalance?: number;
    actualBalance?: number;
    variance?: number;
    closingNotes?: string;
    movements: CashMovement[];
}

export interface OpenSessionDto {
    registerId: string;
    openingBalance: number;
    openedBy?: string;
    openingNotes?: string;
}

export interface CloseSessionDto {
    actualBalance: number;
    closedBy?: string;
    closingNotes?: string;
}

export interface CreateMovementDto {
    sessionId: string;
    type: 'EXPENSE' | 'DEPOSIT' | 'WITHDRAWAL';
    amount: number;
    currencyCode?: string;
    description: string;
    notes?: string;
    performedBy?: string;
}

export const cashRegisterApi = {
    getMainRegister: async (): Promise<CashRegister> => {
        const { data } = await axios.get(`${API_URL}/cash-register/registers/main`);
        return data;
    },

    openSession: async (dto: OpenSessionDto): Promise<CashSession> => {
        const { data } = await axios.post(`${API_URL}/cash-register/sessions/open`, dto);
        return data;
    },

    closeSession: async (sessionId: string, dto: CloseSessionDto): Promise<CashSession> => {
        const { data } = await axios.post(`${API_URL}/cash-register/sessions/${sessionId}/close`, dto);
        return data;
    },

    getActiveSession: async (registerId?: string): Promise<CashSession | null> => {
        const params = registerId ? `?registerId=${registerId}` : '';
        const { data } = await axios.get(`${API_URL}/cash-register/sessions/active${params}`);
        return data;
    },

    getSession: async (id: string): Promise<CashSession> => {
        const { data } = await axios.get(`${API_URL}/cash-register/sessions/${id}`);
        return data;
    },

    listSessions: async (filters?: any): Promise<CashSession[]> => {
        const params = new URLSearchParams();
        if (filters?.registerId) params.append('registerId', filters.registerId);
        if (filters?.status) params.append('status', filters.status);
        if (filters?.startDate) params.append('startDate', filters.startDate);
        if (filters?.endDate) params.append('endDate', filters.endDate);

        const { data } = await axios.get(`${API_URL}/cash-register/sessions?${params.toString()}`);
        return data;
    },

    createMovement: async (dto: CreateMovementDto): Promise<CashMovement> => {
        const { data } = await axios.post(`${API_URL}/cash-register/movements`, dto);
        return data;
    }
};
