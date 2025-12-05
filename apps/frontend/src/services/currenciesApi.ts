import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export interface Currency {
    id: string;
    name: string;
    code: string;
    symbol: string;
    isPrimary: boolean;
    exchangeRate: number | null;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCurrencyDto {
    name: string;
    code: string;
    symbol: string;
    isPrimary: boolean;
    exchangeRate?: number;
}

export interface UpdateCurrencyDto {
    name?: string;
    code?: string;
    symbol?: string;
    isPrimary?: boolean;
    exchangeRate?: number;
}

export const currenciesApi = {
    getAll: async (): Promise<Currency[]> => {
        const { data } = await axios.get(`${API_URL}/currencies`);
        return data;
    },

    getOne: async (id: string): Promise<Currency> => {
        const { data } = await axios.get(`${API_URL}/currencies/${id}`);
        return data;
    },

    create: async (dto: CreateCurrencyDto): Promise<Currency> => {
        const { data } = await axios.post(`${API_URL}/currencies`, dto);
        return data;
    },

    update: async (id: string, dto: UpdateCurrencyDto): Promise<Currency> => {
        const { data } = await axios.patch(`${API_URL}/currencies/${id}`, dto);
        return data;
    },

    delete: async (id: string): Promise<void> => {
        await axios.delete(`${API_URL}/currencies/${id}`);
    },
};
