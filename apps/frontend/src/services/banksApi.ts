
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export interface BankAccount {
    id: string;
    bankName: string;
    accountNumber: string;
    accountType: string;
    holderName: string;
    holderId: string;
    currencyId: string;
    currency: {
        id: string;
        name: string;
        symbol: string;
        isPrimary: boolean;
    };
    balance: number;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateBankAccountDto {
    bankName: string;
    accountNumber: string;
    accountType: string;
    holderName: string;
    holderId: string;
    currencyId: string;
    initialBalance?: number;
}

export interface UpdateBankAccountDto {
    bankName?: string;
    accountNumber?: string;
    accountType?: string;
    holderName?: string;
    holderId?: string;
    currencyId?: string;
    active?: boolean;
}

export const banksApi = {
    getAll: async (search?: string): Promise<BankAccount[]> => {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        const { data } = await axios.get(`${API_URL}/banks`, { params });
        return data;
    },

    getOne: async (id: string): Promise<BankAccount> => {
        const { data } = await axios.get(`${API_URL}/banks/${id}`);
        return data;
    },

    create: async (dto: CreateBankAccountDto): Promise<BankAccount> => {
        const { data } = await axios.post(`${API_URL}/banks`, dto);
        return data;
    },

    update: async (id: string, dto: UpdateBankAccountDto): Promise<BankAccount> => {
        const { data } = await axios.patch(`${API_URL}/banks/${id}`, dto);
        return data;
    },

    delete: async (id: string): Promise<void> => {
        await axios.delete(`${API_URL}/banks/${id}`);
    },
};
