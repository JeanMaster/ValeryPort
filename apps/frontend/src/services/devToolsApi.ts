import axios from 'axios';

import { BASE_URL as API_URL } from './apiConfig';

export const devToolsApi = {
    resetDatabase: async (): Promise<{ success: boolean; message: string }> => {
        const { data } = await axios.post(`${API_URL}/dev-tools/reset-database`);
        return data;
    },

    downloadBackup: () => {
        // Trigger browser download by opening the URL
        window.open(`${API_URL}/dev-tools/backup`, '_blank');
    },

    restoreBackup: async (file: File): Promise<{ success: boolean; message: string }> => {
        const formData = new FormData();
        formData.append('file', file);

        const { data } = await axios.post(`${API_URL}/dev-tools/restore`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return data;
    },
};
