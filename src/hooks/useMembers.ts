/**
 * HSD Arena - Members Hook
 * 
 * Hook for managing organization members
 */

import { useState, useCallback, useEffect } from 'react';
import * as orgService from '@/services/organization.service';
import { useAuth } from './useAuth';
import { useSubdomain } from './useSubdomain';
import { dedupeRequest, invalidateDedupedRequest } from '@/lib/requestDedup';
import type { MemberWithUser } from '@/types';

export const useMembers = () => {
    const { user: authUser } = useAuth();
    const orgDomain = useSubdomain();

    const [members, setMembers] = useState<MemberWithUser[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchMembers = useCallback(async (force = false) => {
        if (!orgDomain || !authUser) return;
        const requestKey = `members:${orgDomain}`;

        setIsLoading(true);
        setError(null);
        try {
            const response: any = await dedupeRequest(
                requestKey,
                async () => orgService.getMembers(orgDomain),
                { cacheMs: 3000, force }
            );
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
        void fetchMembers();
    }, [fetchMembers]);

    const changeRole = async (memberId: string, role: string) => {
        if (!orgDomain || !authUser) return { success: false, message: 'Not authenticated' };
        const requestKey = `members:${orgDomain}`;

        setIsLoading(true);
        try {
            const response = await orgService.changeMemberRole(orgDomain, memberId, role);
            if (response.success) {
                // Update the state using the old data structure so populated user data is preserved
                setMembers(prev => prev.map(m => m.userId === memberId || m.id === memberId ? { ...m, role: role as any } : m));
                invalidateDedupedRequest(requestKey);
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
        const requestKey = `members:${orgDomain}`;

        setIsLoading(true);
        try {
            const response = await orgService.removeMember(orgDomain, memberId);
            if (response.success) {
                setMembers(prev => prev.filter(m => m.id !== memberId));
                invalidateDedupedRequest(requestKey);
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
        refetch: () => fetchMembers(true),
        changeRole,
        remove
    };
};
