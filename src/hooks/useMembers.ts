/**
 * HSD Arena - Members Hook
 * 
 * Hook for managing organization members
 */

import { useState, useCallback, useEffect } from 'react';
import * as orgService from '@/services/organization.service';
import { useAuth } from './useAuth';
import { useSubdomain } from './useSubdomain';
import type { MemberWithUser } from '@/types';

export const useMembers = () => {
    const { user: authUser } = useAuth();
    const orgDomain = useSubdomain();

    const [members, setMembers] = useState<MemberWithUser[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchMembers = useCallback(async () => {
        if (!orgDomain || !authUser) return;

        setIsLoading(true);
        setError(null);
        try {
            const response: any = await orgService.getMembers(orgDomain);
            console.log('Members API Response:', response);

            if (response.success && response.data?.members) {
                console.log(response.data.members);
                setMembers(response.data.members);
            } else {
                setError(response.message || 'Failed to fetch members');
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    }, [orgDomain, authUser]);

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    const changeRole = async (memberId: string, role: string) => {
        if (!orgDomain || !authUser) return { success: false, message: 'Not authenticated' };

        setIsLoading(true);
        try {
            const response = await orgService.changeMemberRole(orgDomain, memberId, role);
            if (response.success && response.data) {
                setMembers(prev => prev.map(m => m.id === memberId ? response.data! : m));
                return { success: true };
            } else {
                return { success: false, message: response.message };
            }
        } catch (err: any) {
            return { success: false, message: err.message };
        } finally {
            setIsLoading(false);
        }
    };

    const remove = async (memberId: string) => {
        if (!orgDomain || !authUser) return { success: false, message: 'Not authenticated' };

        setIsLoading(true);
        try {
            const response = await orgService.removeMember(orgDomain, memberId);
            if (response.success) {
                setMembers(prev => prev.filter(m => m.id !== memberId));
                return { success: true };
            } else {
                return { success: false, message: response.message };
            }
        } catch (err: any) {
            return { success: false, message: err.message };
        } finally {
            setIsLoading(false);
        }
    };

    return {
        members,
        isLoading,
        error,
        refetch: fetchMembers,
        changeRole,
        remove
    };
};
