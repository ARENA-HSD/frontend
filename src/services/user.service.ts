/**
 * HSD Arena - Quiz Service
 * 
 * Real API implementation for quiz CRUD operations
 */

import { get, post, patch, del } from '@/lib/axios';
import { API_ROUTES } from '@/lib/constants';
import type {
    Quiz,
    CreateQuizData,
    UpdateQuizData,
    ApiResponse,
    User
} from '@/types';

// ============================================================================
// Quiz API Calls
// ============================================================================

interface GetAllUsersResponse {
    success: boolean;
    data: {
        users: User[];
    };
    message?: string;
}

interface UpdateUserRequest {
    username?: string;
    email?: string;
    password?: string;
}

interface UpdateUserResponse {
    success: boolean;
    data: {
        user: User;
    };
    message?: string;
}

export const getAllUsers = async (): Promise<GetAllUsersResponse> => {
    return await get<GetAllUsersResponse>(API_ROUTES.USERS + '/');
};

export const getUser = async (userId: string): Promise<UpdateUserResponse> => {
    return await get<UpdateUserResponse>(API_ROUTES.USER_BY_ID(userId));
};

export const updateUser = async (
    userId: string,
    data: UpdateUserRequest
): Promise<UpdateUserResponse> => {
    return await patch<UpdateUserResponse>(API_ROUTES.USER_BY_ID(userId), data);
};

export const deleteUser = async (userId: string): Promise<ApiResponse<void>> => {
    return await del<ApiResponse<void>>(API_ROUTES.USER_BY_ID(userId));
};