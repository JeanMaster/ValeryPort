import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export interface Department {
    id: string;
    name: string;
    description?: string;
    parentId?: string;
    parent?: {
        id: string;
        name: string;
    };
    children?: Department[];
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateDepartmentDto {
    name: string;
    description?: string;
    parentId?: string;
}

export interface UpdateDepartmentDto {
    name?: string;
    description?: string;
    parentId?: string;
}

export const departmentsApi = {
    getAll: async (): Promise<Department[]> => {
        const { data } = await axios.get(`${API_URL}/departments`);
        return data;
    },

    getTree: async (): Promise<Department[]> => {
        const { data } = await axios.get(`${API_URL}/departments/tree`);
        return data;
    },

    getOne: async (id: string): Promise<Department> => {
        const { data } = await axios.get(`${API_URL}/departments/${id}`);
        return data;
    },

    create: async (dto: CreateDepartmentDto): Promise<Department> => {
        const { data } = await axios.post(`${API_URL}/departments`, dto);
        return data;
    },

    update: async (id: string, dto: UpdateDepartmentDto): Promise<Department> => {
        const { data } = await axios.patch(`${API_URL}/departments/${id}`, dto);
        return data;
    },

    delete: async (id: string): Promise<void> => {
        await axios.delete(`${API_URL}/departments/${id}`);
    },
};
