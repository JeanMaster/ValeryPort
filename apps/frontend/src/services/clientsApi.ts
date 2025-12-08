import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export interface Client {
    id: string; // "V-12345678"
    name: string;
    address?: string;
    phone?: string;
    hasWhatsapp?: boolean;
    email?: string;
    social1?: string;
    social2?: string;
    social3?: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateClientDto {
    id: string;
    name: string;
    address?: string;
    phone?: string;
    hasWhatsapp?: boolean;
    email?: string;
    social1?: string;
    social2?: string;
    social3?: string;
}

export interface UpdateClientDto extends Partial<CreateClientDto> { }

export const clientsApi = {
    getAll: async (search?: string): Promise<Client[]> => {
        const params = new URLSearchParams();
        if (search) params.append('search', search);

        const { data } = await axios.get(`${API_URL}/clients`, { params });
        return data;
    },

    getOne: async (id: string): Promise<Client> => {
        const { data } = await axios.get(`${API_URL}/clients/${id}`);
        return data;
    },

    create: async (dto: CreateClientDto): Promise<Client> => {
        const { data } = await axios.post(`${API_URL}/clients`, dto);
        return data;
    },

    update: async (id: string, dto: UpdateClientDto): Promise<Client> => {
        const { data } = await axios.patch(`${API_URL}/clients/${id}`, dto);
        return data;
    },

    delete: async (id: string): Promise<void> => {
        await axios.delete(`${API_URL}/clients/${id}`);
    },
};
