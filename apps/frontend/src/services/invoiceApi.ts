import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const invoiceApi = {
    /**
     * Get the next invoice number (for display purposes)
     */
    getNextInvoiceNumber: async (): Promise<string> => {
        const response = await axios.get(`${API_URL}/invoice/next`);
        return response.data.invoiceNumber;
    },

    /**
     * Get current invoice counter details
     */
    getCurrentCounter: async () => {
        const response = await axios.get(`${API_URL}/invoice/counter`);
        return response.data;
    }
};
