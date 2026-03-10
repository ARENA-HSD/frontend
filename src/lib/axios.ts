/**
 * HSD Arena - Axios Configuration
 * 
 * Configures axios instance with subdomain detection, authentication,
 * and mock response handling when API is unavailable.
 */

import axios, { AxiosError } from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import {
    API_BASE_URL,
    AUTH_TOKEN_KEY,
    USE_MOCK_API,
    MOCK_API_DELAY,
    ERROR_MESSAGES,
} from './constants';
import Cookies from 'js-cookie';

// ============================================================================
// Axios Instance
// ============================================================================

const axiosInstance: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Extract subdomain from current URL
 * Returns null for main domain
 * 
 * Examples:
 * - hsd.localhost:5173 → 'hsd'
 * - hsd.hsdarena.com → 'hsd'
 * - localhost:5173 → null
 * - hsdarena.com → null
 */
export const getSubdomain = (): string | null => {
    const hostname = window.location.hostname;

    // Development: localhost or 127.0.0.1
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return null;
    }

    // Check for subdomain.localhost pattern (e.g., hsd.localhost)
    const localhostMatch = hostname.match(/^([a-z0-9-]+)\.localhost$/i);
    if (localhostMatch) {
        return localhostMatch[1];
    }

    // Use VITE_BASE_DOMAIN if set (handles multi-part TLDs like .com.tr)
    const baseDomain = import.meta.env.VITE_BASE_DOMAIN as string | undefined;
    if (baseDomain) {
        if (hostname === baseDomain) {
            return null;
        }
        if (hostname.endsWith(`.${baseDomain}`)) {
            const subdomain = hostname.slice(0, hostname.length - baseDomain.length - 1);
            return subdomain === 'www' ? null : subdomain;
        }
        return null;
    }

    // Fallback: extract subdomain from hostname by part count
    const parts = hostname.split('.');

    // If only domain.tld (2 parts), no subdomain
    if (parts.length <= 2) {
        return null;
    }

    // If subdomain.domain.tld (3+ parts), first part is subdomain
    // Skip 'www' as it's not a true subdomain for our purposes
    const subdomain = parts[0];
    return subdomain === 'www' ? null : subdomain;
};

/**
 * Get cookie domain for cross-subdomain sharing
 */
export const getCookieDomain = (): string | undefined => {
    const hostname = window.location.hostname;
    
    // Tarayıcıların "localhost" domaininde cookie reddetmesini önlemek için
    // dev ortamında (localhost veya IP ise) domain belirtecini undefined bırakıyoruz.
    if (hostname.includes('localhost') || hostname === '127.0.0.1') {
        return undefined; // undefined bırakırsak mevcutta bulunduğu origin'e yazar
    }

    // Use VITE_BASE_DOMAIN if set (handles multi-part TLDs like .com.tr)
    const baseDomain = import.meta.env.VITE_BASE_DOMAIN as string | undefined;
    if (baseDomain) {
        return `.${baseDomain}`;
    }

    // Fallback: production senaryosu (örn: subdomain.domain.com -> .domain.com)
    const parts = hostname.split('.');
    if (parts.length > 2) {
        return '.' + parts.slice(-2).join('.');
    }

    return undefined;
};

/**
 * Get auth token from cookies
 */
const getAuthToken = (): string | undefined => {
    return Cookies.get(AUTH_TOKEN_KEY);
};

/**
 * Set auth token in cookies
 */
export const setAuthToken = (token: string): void => {
    Cookies.set(AUTH_TOKEN_KEY, token, { 
        domain: getCookieDomain(),
        expires: 7 // 7 days
    });
};

/**
 * Remove auth token from cookies
 */
export const removeAuthToken = (): void => {
    Cookies.remove(AUTH_TOKEN_KEY, { domain: getCookieDomain() });
};

/**
 * Simulate network delay for mock responses
 */
const simulateDelay = (): Promise<void> => {
    if (!USE_MOCK_API) return Promise.resolve();

    const delay = Math.random() * (MOCK_API_DELAY.MAX - MOCK_API_DELAY.MIN) + MOCK_API_DELAY.MIN;
    return new Promise(resolve => setTimeout(resolve, delay));
};

// ============================================================================
// Request Interceptor
// ============================================================================

axiosInstance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        // Add authentication token if available
        const token = getAuthToken();
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Add subdomain to headers for backend routing
        const subdomain = getSubdomain();
        if (subdomain && config.headers) {
            config.headers['X-Organization-Domain'] = subdomain;
        }

        // Log request in development
        if (import.meta.env.DEV) {
            console.log('📤 API Request:', {
                method: config.method?.toUpperCase(),
                url: config.url,
                subdomain,
                data: config.data,
            });
        }

        return config;
    },
    (error: AxiosError) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
    }
);

// ============================================================================
// Response Interceptor
// ============================================================================

axiosInstance.interceptors.response.use(
    async (response: AxiosResponse) => {
        // Simulate delay for mock mode
        await simulateDelay();

        // Log response in development
        if (import.meta.env.DEV) {
            console.log('📥 API Response:', {
                url: response.config.url,
                status: response.status,
                data: response.data,
            });
        }

        return response;
    },
    async (error: AxiosError) => {
        // Simulate delay even for errors
        await simulateDelay();

        // Handle different error types
        if (error.response) {
            // Server responded with error status
            const status = error.response.status;

            switch (status) {
                case 401:
                    // Unauthorized - log which request failed
                    console.warn('⚠️ 401 Unauthorized:', error.config?.method?.toUpperCase(), error.config?.url);

                    // Only redirect if this is NOT a login/register request itself
                    const requestUrl = error.config?.url || '';
                    const isAuthRequest = requestUrl.includes('/login') || requestUrl.includes('/register');

                    if (!isAuthRequest) {
                        // Don't hard redirect - let components handle the error
                        // Only clear token if we're sure it's invalid
                        console.warn('⚠️ API returned 401 - token may be invalid');
                    }
                    break;

                case 403:
                    // Forbidden - insufficient permissions
                    console.error('❌ Forbidden:', ERROR_MESSAGES.UNAUTHORIZED);
                    break;

                case 404:
                    // Not found
                    console.error('❌ Not Found:', ERROR_MESSAGES.NOT_FOUND);
                    break;

                case 500:
                case 502:
                case 503:
                    // Server error
                    console.error('❌ Server Error:', ERROR_MESSAGES.SERVER_ERROR);
                    break;
            }

            // Log error details in development
            if (import.meta.env.DEV) {
                console.error('📛 API Error Response:', {
                    url: error.config?.url,
                    status,
                    data: error.response.data,
                });
            }
        } else if (error.request) {
            // Request made but no response received
            console.error('❌ Network Error:', ERROR_MESSAGES.NETWORK_ERROR);

            if (import.meta.env.DEV) {
                console.error('📛 No Response:', error.request);
            }
        } else {
            // Error in setting up request
            console.error('❌ Request Setup Error:', error.message);
        }

        return Promise.reject(error);
    }
);

// ============================================================================
// API Helper Functions
// ============================================================================

/**
 * Generic GET request
 */
export const get = async <T>(url: string, params?: any): Promise<T> => {
    const response = await axiosInstance.get<T>(url, { params });
    return response.data;
};

/**
 * Generic POST request
 */
export const post = async <T>(url: string, data?: any): Promise<T> => {
    const response = await axiosInstance.post<T>(url, data);
    return response.data;
};

/**
 * Generic PATCH request
 */
export const patch = async <T>(url: string, data?: any): Promise<T> => {
    const response = await axiosInstance.patch<T>(url, data);
    return response.data;
};

/**
 * Generic DELETE request
 */
export const del = async <T>(url: string): Promise<T> => {
    const response = await axiosInstance.delete<T>(url);
    return response.data;
};

/**
 * Generic PUT request
 */
export const put = async <T>(url: string, data?: any): Promise<T> => {
    const response = await axiosInstance.put<T>(url, data);
    return response.data;
};

// ============================================================================
// Export
// ============================================================================

export default axiosInstance;