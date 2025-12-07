import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

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
