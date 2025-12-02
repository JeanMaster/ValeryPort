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
}

export interface UpdateSupplierDto extends Partial<CreateSupplierDto> { }

export const suppliersApi = {
    getAll: async (search?: string): Promise<Supplier[]> => {
        const params = search ? { search } : {};
        const { data } = await axios.get(`${API_URL}/suppliers`, { params });
        return data;
    },

    getOne: async (id: string): Promise<Supplier> => {
        const { data } = await axios.get(`${API_URL}/suppliers/${id}`);
        return data;
    },

    create: async (dto: CreateSupplierDto): Promise<Supplier> => {
        const { data } = await axios.post(`${API_URL}/suppliers`, dto);
        return data;
    },

    update: async (id: string, dto: UpdateSupplierDto): Promise<Supplier> => {
        const { data } = await axios.patch(`${API_URL}/suppliers/${id}`, dto);
        return data;
    },

    delete: async (id: string): Promise<Supplier> => {
        const { data } = await axios.delete(`${API_URL}/suppliers/${id}`);
        return data;
    },
};
