/**
 * HSD Arena - User Hooks
 * 
 * Hooks for user-related API operations with authentication control
 */

import { useState, useCallback, useEffect } from 'react';
import * as userService from '@/services/user.service';
import { useAuth } from '@/hooks/useAuth';
import { dedupeRequest, invalidateDedupedRequest } from '@/lib/requestDedup';
import type { User } from '@/types';

/**
 * Hook for fetching and managing multiple users
 */
export const useUsers = () => {
    const { user: authUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = useCallback(async () => {
        if (!authUser) {
            setError('Authentication required');
            return;
        }

        const requestKey = 'main:users:list';

        setIsLoading(true);
        setError(null);
        try {
            const response = await dedupeRequest(
                requestKey,
                async () => userService.getAllUsers(),
                { cacheMs: 3000 }
            );
            if (response.success && response.data) {
                setUsers(response.data.users);
            } else {
                setError(response.message || 'Failed to fetch users');
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    }, [authUser]);

    useEffect(() => {
        if (authUser) {
            fetchUsers();
        }
    }, [authUser, fetchUsers]);

    return {
        users,
        isLoading,
        error: authUser ? error : 'Please login to view users',
        refetch: fetchUsers
    };
};

/**
 * Hook for managing a single user's data and operations
 */
export const useUser = (userId?: string) => {
    const { user: authUser } = useAuth();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchUser = useCallback(async (id: string, force = false) => {
        if (!authUser) {
            setError('Authentication required');
            return;
        }

        const requestKey = `main:user:${id}`;

        setIsLoading(true);
        setError(null);
        try {
            const response = await dedupeRequest(
                requestKey,
                async () => userService.getUser(id),
                { cacheMs: 3000, force }
            );
            if (response.success && response.data) {
                setUser(response.data.user);
            } else {
                setError(response.message || 'Failed to fetch user');
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    }, [authUser]);

    useEffect(() => {
        if (userId && authUser) {
            fetchUser(userId);
        }
    }, [userId, authUser, fetchUser]);

    const update = async (data: any) => {
        if (!authUser) return { success: false, message: 'Authentication required' };
        if (!userId) return { success: false, message: 'No user ID provided' };

        setIsLoading(true);
        setError(null);
        try {
            const response = await userService.updateUser(userId, data);
            if (response.success && response.data) {
                setUser(response.data.user);
                invalidateDedupedRequest(`main:user:${userId}`);
                return { success: true, data: response.data };
            } else {
                setError(response.message || 'Failed to update user');
                return { success: false, message: response.message };
            }
        } catch (err: any) {
            const msg = err.message || 'An unexpected error occurred';
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setIsLoading(false);
        }
    };

    const remove = async () => {
        if (!authUser) return { success: false, message: 'Authentication required' };
        if (!userId) return { success: false, message: 'No user ID provided' };

        setIsLoading(true);
        setError(null);
        try {
            const response = await userService.deleteUser(userId);
            if (response.success) {
                setUser(null);
                invalidateDedupedRequest(`main:user:${userId}`);
                return { success: true };
            } else {
                setError(response.message || 'Failed to delete user');
                return { success: false, message: response.message };
            }
        } catch (err: any) {
            const msg = err.message || 'An unexpected error occurred';
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setIsLoading(false);
        }
    };

    return {
        user,
        isLoading,
        error: authUser ? error : 'Please login to perform user operations',
        refetch: () => userId && fetchUser(userId, true),
        update,
        remove
    };
};
