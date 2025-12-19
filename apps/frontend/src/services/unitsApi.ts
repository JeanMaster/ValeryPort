import axios from 'axios';

import { BASE_URL as API_URL } from './apiConfig';

export interface Unit {
    id: string;
    name: string;
    abbreviation: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateUnitDto {
    name: string;
    abbreviation: string;
}

export interface UpdateUnitDto {
    name?: string;
    abbreviation?: string;
}

export const unitsApi = {
    getAll: async (): Promise<Unit[]> => {
        const { data } = await axios.get(`${API_URL}/units`);
        return data;
    },

    getOne: async (id: string): Promise<Unit> => {
        const { data } = await axios.get(`${API_URL}/units/${id}`);
        return data;
    },

    create: async (dto: CreateUnitDto): Promise<Unit> => {
        const { data } = await axios.post(`${API_URL}/units`, dto);
        return data;
    },

    update: async (id: string, dto: UpdateUnitDto): Promise<Unit> => {
        const { data } = await axios.patch(`${API_URL}/units/${id}`, dto);
        return data;
    },

    delete: async (id: string): Promise<void> => {
        await axios.delete(`${API_URL}/units/${id}`);
    },
};
