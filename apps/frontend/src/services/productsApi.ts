import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export interface Product {
    id: string;
    sku: string;
    name: string;
    description?: string;
    categoryId: string;
    category: {
        id: string;
        name: string;
    };
    subcategoryId?: string;
    subcategory?: {
        id: string;
        name: string;
    };
    currencyId: string;
    currency: {
        id: string;
        name: string;
        symbol: string;
    };
    costPrice: number;
    salePrice: number;
    offerPrice?: number;
    wholesalePrice?: number;
    stock: number;
    unitId: string;
    unit: {
        id: string;
        name: string;
        abbreviation: string;
    };
    secondaryUnitId?: string;
    secondaryUnit?: {
        id: string;
        name: string;
        abbreviation: string;
    };
    unitsPerSecondaryUnit?: number;
    secondaryCostPrice?: number;
    secondarySalePrice?: number;
    secondaryOfferPrice?: number;
    secondaryWholesalePrice?: number;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateProductDto {
    sku: string;
    name: string;
    description?: string;
    categoryId: string;
    subcategoryId?: string;
    currencyId: string;
    costPrice: number;
    salePrice: number;
    offerPrice?: number;
    wholesalePrice?: number;
    stock?: number;
    unitId: string;
    secondaryUnitId?: string;
    unitsPerSecondaryUnit?: number;
    secondaryCostPrice?: number;
    secondarySalePrice?: number;
    secondaryOfferPrice?: number;
    secondaryWholesalePrice?: number;
}

export interface UpdateProductDto {
    sku?: string;
    name?: string;
    description?: string;
    categoryId?: string;
    subcategoryId?: string;
    currencyId?: string;
    costPrice?: number;
    salePrice?: number;
    offerPrice?: number;
    wholesalePrice?: number;
    stock?: number;
    unitId?: string;
    secondaryUnitId?: string;
    unitsPerSecondaryUnit?: number;
    secondaryCostPrice?: number;
    secondarySalePrice?: number;
    secondaryOfferPrice?: number;
    secondaryWholesalePrice?: number;
}

export const productsApi = {
    getAll: async (): Promise<Product[]> => {
        const { data } = await axios.get(`${API_URL}/products`);
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

    delete: async (id: string): Promise<void> => {
        await axios.delete(`${API_URL}/products/${id}`);
    },
};
