import axios from 'axios';
const API_URL = 'http://localhost:3000/api';

export interface Expense {
    id: string;
    description: string;
    amount: number;
    currencyCode: string;
    exchangeRate: number;
    date: string;
    category: string;
    paymentMethod: string;
    reference?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateExpenseDto {
    description: string;
    amount: number;
    currencyCode: string;
    exchangeRate: number;
    date?: string;
    category: string;
    paymentMethod: string;
    reference?: string;
    notes?: string;
}

export interface UpdateExpenseDto extends Partial<CreateExpenseDto> { }

export const expensesApi = {
    getAll: async (): Promise<Expense[]> => {
        const response = await axios.get(`${API_URL}/expenses`);
        // Convert string amounts to numbers if necessary (Prisma decimals come as strings frequently, but Nest Transform might handle it)
        // For now trusting it comes as number or string we can parse
        return response.data;
    },

    create: async (data: CreateExpenseDto): Promise<Expense> => {
        const response = await axios.post(`${API_URL}/expenses`, data);
        return response.data;
    },

    update: async (id: string, data: UpdateExpenseDto): Promise<Expense> => {
        const response = await axios.patch(`${API_URL}/expenses/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await axios.delete(`${API_URL}/expenses/${id}`);
    }
};
