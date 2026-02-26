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

    // Production: check for subdomain.domain.tld pattern
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
 * Get auth token from localStorage
 */
const getAuthToken = (): string | null => {
    return localStorage.getItem(AUTH_TOKEN_KEY);
};

/**
 * Set auth token in localStorage
 */
export const setAuthToken = (token: string): void => {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
};

/**
 * Remove auth token from localStorage
 */
export const removeAuthToken = (): void => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
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