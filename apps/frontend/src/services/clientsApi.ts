import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export interface Client {
    id: string;
    rif: string;
    comercialName: string;
    legalName?: string;
    address?: string;
    phone?: string;
    email?: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateClientDto {
    rif: string;
    comercialName: string;
    legalName?: string;
    address?: string;
    phone?: string;
    email?: string;
}

export interface UpdateClientDto extends Partial<CreateClientDto> { }

export const clientsApi = {
    getAll: async (search?: string): Promise<Client[]> => {
        const params = search ? { search } : {};
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

    delete: async (id: string): Promise<Client> => {
        const { data } = await axios.delete(`${API_URL}/clients/${id}`);
        return data;
    },
};
