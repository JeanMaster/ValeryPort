import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export const devToolsApi = {
    resetDatabase: async (): Promise<{ success: boolean; message: string }> => {
        const { data } = await axios.post(`${API_URL}/dev-tools/reset-database`);
        return data;
    },
};
