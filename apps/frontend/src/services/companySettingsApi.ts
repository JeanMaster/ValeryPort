import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export interface CompanySettings {
    id: string;
    name: string;
    rif: string;
    logoUrl?: string;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateCompanySettingsDto {
    name: string;
    rif: string;
    logoUrl?: string;
}

export const companySettingsApi = {
    getSettings: async (): Promise<CompanySettings> => {
        const { data } = await axios.get(`${API_URL}/company-settings`);
        return data;
    },

    updateSettings: async (dto: UpdateCompanySettingsDto): Promise<CompanySettings> => {
        const { data } = await axios.put(`${API_URL}/company-settings`, dto);
        return data;
    },
};
