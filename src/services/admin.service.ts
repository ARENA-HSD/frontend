import { del, get, patch } from '@/lib/axios';
import axios from 'axios';
import { API_ROUTES } from '@/lib/constants';
import { dedupeRequest } from '@/lib/requestDedup';

interface PaginationQuery {
    limit?: number;
    offset?: number;
}

const ADMIN_DEDUPE_CACHE_MS = 1200;

const buildQueryKey = (query: PaginationQuery = {}): string => {
    const limit = query.limit ?? 20;
    const offset = query.offset ?? 0;
    return `limit=${limit}&offset=${offset}`;
};

export interface AdminUser {
    id: string;
    username: string;
    email: string;
    role: 'USER' | 'WEB_ADMIN';
    createdAt: string;
}

export interface AdminOrganization {
    id: string;
    name: string;
    subdomain: string;
    branding?: Record<string, string>;
    ownerId: string;
    ownerUsername: string;
    ownerEmail: string;
    createdAt: string;
}

interface AdminUsersResponse {
    success: boolean;
    data: {
        users: AdminUser[];
        total: number;
    };
    message?: string;
}

interface AdminOrganizationsResponse {
    success: boolean;
    data: {
        organizations: AdminOrganization[];
        total: number;
    };
    message?: string;
}

interface AdminUserResponse {
    success: boolean;
    data: {
        user: AdminUser;
    };
    message?: string;
}

interface AdminDeletedEntityResponse {
    success: boolean;
    data: {
        id: string;
    };
    message?: string;
}

interface AdminInfoResponse {
    success: boolean;
    data: {
        userCount: number;
        organizationCount: number;
        quizCount: number;
    };
    message?: string;
}

export interface UpdateAdminUserPayload {
    role?: 'USER' | 'WEB_ADMIN';
    username?: string;
    email?: string;
}

export interface UpdateAdminOrganizationPayload {
    name?: string;
    subdomain?: string;
    branding?: Record<string, string>;
}

export const getAdminUsers = async (
    query: PaginationQuery = {}
): Promise<AdminUsersResponse> => {
    const key = `admin:users:list:${buildQueryKey(query)}`;
    return await dedupeRequest(
        key,
        () => get<AdminUsersResponse>(API_ROUTES.ADMIN_USERS, query),
        { cacheMs: ADMIN_DEDUPE_CACHE_MS }
    );
};

export const searchAdminUsers = async (
    q: string,
    query: PaginationQuery = {}
): Promise<AdminUsersResponse> => {
    const normalizedQuery = q.trim().toLowerCase();
    const key = `admin:users:search:q=${normalizedQuery}:${buildQueryKey(query)}`;

    return await dedupeRequest(
        key,
        () =>
            get<AdminUsersResponse>(API_ROUTES.ADMIN_USERS_SEARCH, {
                q,
                ...query,
            }),
        { cacheMs: ADMIN_DEDUPE_CACHE_MS }
    );
};

export const getAdminInfo = async (): Promise<AdminInfoResponse> => {
    const key = 'admin:info';
    return await dedupeRequest(
        key,
        () => get<AdminInfoResponse>(API_ROUTES.ADMIN_INFO),
        { cacheMs: ADMIN_DEDUPE_CACHE_MS }
    );
};

export const updateAdminUser = async (
    userId: string,
    payload: UpdateAdminUserPayload
): Promise<AdminUserResponse> => {
    return await patch<AdminUserResponse>(API_ROUTES.ADMIN_USER_BY_ID(userId), payload);
};

export const deleteAdminUser = async (
    userId: string
): Promise<AdminDeletedEntityResponse> => {
    return await del<AdminDeletedEntityResponse>(API_ROUTES.ADMIN_USER_BY_ID(userId));
};

export const getAdminOrganizations = async (
    query: PaginationQuery = {}
): Promise<AdminOrganizationsResponse> => {
    const key = `admin:organizations:list:${buildQueryKey(query)}`;
    return await dedupeRequest(
        key,
        () => get<AdminOrganizationsResponse>(API_ROUTES.ADMIN_ORGANIZATIONS, query),
        { cacheMs: ADMIN_DEDUPE_CACHE_MS }
    );
};

export const updateAdminOrganization = async (
    organizationId: string,
    payload: UpdateAdminOrganizationPayload
): Promise<{ success: boolean; message?: string }> => {
    return await patch<{ success: boolean; message?: string }>(
        API_ROUTES.ADMIN_ORGANIZATION_BY_ID(organizationId),
        payload
    );
};

export const deleteAdminOrganization = async (
    organizationId: string
): Promise<AdminDeletedEntityResponse> => {
    return await del<AdminDeletedEntityResponse>(
        API_ROUTES.ADMIN_ORGANIZATION_BY_ID(organizationId)
    );
};

export const getAdminErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        const status = error.response?.status;

        if (status === 400) {
            return 'Validation failed. Please check your input values.';
        }
        if (status === 401) {
            return 'Unauthorized. Please login again.';
        }
        if (status === 403) {
            return 'Forbidden. WEB_ADMIN permission is required.';
        }
        if (status === 404) {
            return 'Requested user or organization was not found.';
        }
        if (status === 409) {
            return 'Conflict detected. Username, email, or subdomain already exists.';
        }
    }

    if (error instanceof Error && error.message) {
        return error.message;
    }

    return 'Unexpected error occurred.';
};
