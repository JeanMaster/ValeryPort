import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export interface Product {
    id: string;
    sku: string;
    name: string;
    description?: string;
    category?: string;
    salePrice: number;
    costPrice: number;
    stock: number;
    unit: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateProductDto {
    sku: string;
    name: string;
    description?: string;
    category?: string;
    salePrice: number;
    costPrice: number;
    stock?: number;
    unit?: string;
}

export interface UpdateProductDto extends Partial<CreateProductDto> { }

export const productsApi = {
    getAll: async (search?: string): Promise<Product[]> => {
        const params = search ? { search } : {};
        const { data } = await axios.get(`${API_URL}/products`, { params });
        return data;
    },

    getOne: async (id: string): Promise<Product> => {
        const { data } = await axios.get(`${API_URL}/products/${id}`);
        return data;
    },

    create: async (dto: CreateProductDto): Promise<Product> => {
        const { data } = await axios.post(`${API_URL}/products`, dto);
        return data;
    },

    update: async (id: string, dto: UpdateProductDto): Promise<Product> => {
        const { data } = await axios.patch(`${API_URL}/products/${id}`, dto);
        return data;
    },

    delete: async (id: string): Promise<Product> => {
        const { data } = await axios.delete(`${API_URL}/products/${id}`);
        return data;
    },
};
