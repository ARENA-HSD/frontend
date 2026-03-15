/**
 * HSD Arena - Auth Service
 * 
 * Real API implementation for authentication
 */

import { post, setAuthToken, removeAuthToken, getCookieDomain } from '@/lib/axios';
import Cookies from 'js-cookie';
import { API_ROUTES, USER_DATA_KEY } from '@/lib/constants';
import type { AuthUser } from '@/types';

// ============================================================================
// Auth API Calls
// ============================================================================

interface LoginPayload {
    email: string;
    password: string;
    cfTurnstileToken?: string;
}

interface RegisterPayload {
    username: string;
    email: string;
    password: string;
    cfTurnstileToken: string;
}

interface LoginResponse {
    success: boolean;
    data: {
        user: any;
        token: string;
    };
    message?: string;
}

/**
 * Login with email and password
 */
export const login = async (credentials: LoginPayload): Promise<{ user: AuthUser; token: string }> => {
    const response = await post<LoginResponse>(API_ROUTES.LOGIN, credentials);

    if (!response.success || !response.data) {
        throw new Error(response.message || 'Login failed');
    }

    const { user, token } = response.data;

    // Save auth data
    setAuthToken(token);
    saveUserData(user);

    // Build AuthUser with organizations
    const authUser = buildAuthUser(user);

    return { user: authUser, token };
};

/**
 * Register new user
 */
export const register = async (data: RegisterPayload): Promise<{ user: AuthUser; token: string }> => {
    const response = await post<LoginResponse>(API_ROUTES.REGISTER, data);

    if (!response.success || !response.data) {
        throw new Error(response.message || 'Registration failed');
    }

    const { user, token } = response.data;

    // Save auth data
    setAuthToken(token);
    saveUserData(user);

    // Build AuthUser with organizations
    const authUser = buildAuthUser(user);

    return { user: authUser, token };
};

/**
 * Logout - clear all stored data
 */
export const logout = async (): Promise<void> => {
    removeAuthToken();
    clearAuthData();
};

/**
 * Get current user from stored data
 */
export const getCurrentUser = (): AuthUser | null => {
    const userData = Cookies.get(USER_DATA_KEY);
    if (!userData) return null;

    try {
        const parsed = JSON.parse(userData);
        return buildAuthUser(parsed);
    } catch {
        return null;
    }
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Build AuthUser from API user data
 * API may return user with or without organizations
 */
const buildAuthUser = (apiUser: any): AuthUser => {
    const user: AuthUser = {
        id: apiUser.id || apiUser._id,
        username: apiUser.username,
        email: apiUser.email,
        createdAt: apiUser.createdAt || new Date().toISOString(),
        organizations: [],
    };

    // If API returns organizations, map them
    if (apiUser.organizations && Array.isArray(apiUser.organizations)) {
        user.organizations = apiUser.organizations.map((org: any) => ({
            id: org.id || org._id,
            name: org.name,
            subdomain: org.subdomain,
            package: org.package || 'FREE',
            role: org.role || 'MANAGER',
            branding: org.branding,
        }));
    }

    return user;
};

// ============================================================================
// Cookie Management
// ============================================================================

export const saveAuthData = (user: any, token: string): void => {
    setAuthToken(token);
    saveUserData(user);
};

export const saveUserData = (user: any): void => {
    Cookies.set(USER_DATA_KEY, JSON.stringify(user), { domain: getCookieDomain(), expires: 7 });
};

export const clearAuthData = (): void => {
    removeAuthToken();
    Cookies.remove(USER_DATA_KEY, { domain: getCookieDomain() });
};