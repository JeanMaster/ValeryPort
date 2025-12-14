import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export interface Employee {
    id: string;
    firstName: string;
    lastName: string;
    identification: string;
    email?: string;
    phone?: string;
    address?: string;
    position: string;
    department?: string;
    baseSalary: number;
    currency?: string;
    userId?: string;
    isActive: boolean;
    paymentFrequency: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
    user?: {
        username: string;
    };
}

export const employeesApi = {
    findAll: async (): Promise<Employee[]> => {
        const response = await axios.get(`${API_URL}/hr/employees`);
        return response.data;
    },

    findOne: async (id: string): Promise<Employee> => {
        const response = await axios.get(`${API_URL}/hr/employees/${id}`);
        return response.data;
    },

    create: async (data: Partial<Employee>): Promise<Employee> => {
        const response = await axios.post(`${API_URL}/hr/employees`, data);
        return response.data;
    },

    update: async (id: string, data: Partial<Employee>): Promise<Employee> => {
        const response = await axios.patch(`${API_URL}/hr/employees/${id}`, data);
        return response.data;
    },

    remove: async (id: string): Promise<void> => {
        await axios.delete(`${API_URL}/hr/employees/${id}`);
    }
};
