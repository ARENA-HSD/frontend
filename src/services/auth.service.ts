/**
 * HSD Arena - Auth Service
 * 
 * Real API implementation for authentication
 */

import { post, setAuthToken, removeAuthToken } from '@/lib/axios';
import { API_ROUTES, AUTH_TOKEN_KEY, USER_DATA_KEY, CURRENT_ORG_KEY } from '@/lib/constants';
import type { AuthUser, UserOrganization, ApiResponse, User } from '@/types';

// ============================================================================
// Auth API Calls
// ============================================================================

interface LoginPayload {
    email: string;
    password: string;
}

interface RegisterPayload {
    username: string;
    email: string;
    password: string;
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
    const userData = localStorage.getItem(USER_DATA_KEY);
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
// LocalStorage Management
// ============================================================================

export const saveAuthData = (user: any, token: string): void => {
    setAuthToken(token);
    saveUserData(user);
};

export const saveUserData = (user: any): void => {
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
};

export const clearAuthData = (): void => {
    removeAuthToken();
    localStorage.removeItem(USER_DATA_KEY);
    localStorage.removeItem(CURRENT_ORG_KEY);
};

export const saveCurrentOrganization = (org: UserOrganization): void => {
    localStorage.setItem(CURRENT_ORG_KEY, JSON.stringify(org));
};

export const getCurrentOrganization = (): UserOrganization | null => {
    const orgData = localStorage.getItem(CURRENT_ORG_KEY);
    if (!orgData) return null;

    try {
        return JSON.parse(orgData);
    } catch {
        return null;
    }
};

export const clearCurrentOrganization = (): void => {
    localStorage.removeItem(CURRENT_ORG_KEY);
};