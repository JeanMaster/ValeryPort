
/**
 * Centralized API configuration for ValeryPort
 * 
 * Logic priority:
 * 1. localStorage.getItem('CUSTOM_API_URL') - For UI switching (Local/LAN/Remote)
 * 2. import.meta.env.VITE_API_URL - For build-time environment variables
 * 3. Default fallback (http://localhost:3000/api) 
 */

const getApiBaseUrl = () => {
    // Check for custom override (set via UI Settings)
    const customUrl = localStorage.getItem('CUSTOM_API_URL');
    if (customUrl) return customUrl;

    // Check for environment variable
    const envUrl = (import.meta as any).env?.VITE_API_URL || (import.meta as any).env?.VITE_APP_URL;
    if (envUrl) return envUrl;

    // Default development fallback
    return 'http://localhost:3000/api';
};

export const BASE_URL = getApiBaseUrl();

export const setCustomApiUrl = (url: string | null) => {
    if (url) {
        localStorage.setItem('CUSTOM_API_URL', url);
    } else {
        localStorage.removeItem('CUSTOM_API_URL');
    }
};

export const getConnectionMode = (): 'local' | 'lan' | 'remote' => {
    const url = BASE_URL;
    if (url.includes('localhost') || url.includes('127.0.0.1')) return 'local';

    // Check if it's an IP (common for LAN)
    const ipPattern = /\d+\.\d+\.\d+\.\d+/;
    if (ipPattern.test(url)) return 'lan';

    return 'remote';
};
