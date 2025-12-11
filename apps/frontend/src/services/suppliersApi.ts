import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export interface Supplier {
    id: string;
    rif: string;
    comercialName: string;
    legalName?: string;
    contactName?: string;
    address?: string;
    phone?: string;
    email?: string;
    category?: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateSupplierDto {
    rif: string;
    comercialName: string;
    legalName?: string;
    contactName?: string;
    address?: string;
    phone?: string;
    email?: string;
    category?: string;
    active?: boolean;
}

export interface UpdateSupplierDto extends Partial<CreateSupplierDto> { }

export const suppliersApi = {
    getAll: async (search?: string, active: boolean = true): Promise<Supplier[]> => {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        params.append('active', String(active));

        const response = await axios.get(`${API_URL}/suppliers`, { params });
        return response.data;
    },

    getById: async (id: string): Promise<Supplier> => {
        const response = await axios.get(`${API_URL}/suppliers/${id}`);
        return response.data;
    },

    create: async (data: CreateSupplierDto): Promise<Supplier> => {
        const response = await axios.post(`${API_URL}/suppliers`, data);
        return response.data;
    },

    update: async (id: string, data: UpdateSupplierDto): Promise<Supplier> => {
        const response = await axios.patch(`${API_URL}/suppliers/${id}`, data);
        return response.data;
    },

    remove: async (id: string): Promise<Supplier> => {
        const response = await axios.delete(`${API_URL}/suppliers/${id}`);
        return response.data;
    },
};
