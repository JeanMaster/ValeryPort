
import axios from 'axios';
import { BASE_URL as API_URL } from './apiConfig';

export interface NetworkInfo {
    localIp: string;
    allIps: string[];
    port: number | string;
}

export const systemApi = {
    getNetworkInfo: async (): Promise<NetworkInfo> => {
        const { data } = await axios.get(`${API_URL}/system/network`);
        return data;
    }
};
