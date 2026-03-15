/**
 * HSD Arena - Invitations Hook
 * 
 * Hook for managing organization invitations with user data enrichment
 */

import { useState, useCallback, useEffect } from 'react';
import * as orgService from '@/services/organization.service';
import * as userService from '@/services/user.service';
import { useAuth } from './useAuth';
import { useSubdomain } from './useSubdomain';
import { dedupeRequest, invalidateDedupedRequest } from '@/lib/requestDedup';
import type { Invitation } from '@/types';

export const useInvitations = () => {
    const { user: authUser } = useAuth();
    const orgDomain = useSubdomain();

    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const enrichInvitations = async (rawInvitations: any[]) => {
        try {
            // Fetch all users to create a mapping of ID -> Username
            // In a real production app, you might want a specialized endpoint or server-side join
            const userResponse = await dedupeRequest(
                'users:all',
                async () => userService.getAllUsers(),
                { cacheMs: 5000 }
            );
            const userMap: Record<string, string> = {};

            if (userResponse.success && userResponse.data?.users) {
                userResponse.data.users.forEach(u => {
                    userMap[u.id] = u.username;
                });
            }

            return rawInvitations.map(inv => ({
                ...inv,
                inviteeUsername: userMap[inv.inviteeId] || 'Unknown User'
            }));
        } catch (err) {
            console.error('Failed to enrich invitations:', err);
            return rawInvitations;
        }
    };

    const fetchInvitations = useCallback(async (force = false) => {
        if (!orgDomain || !authUser) return;
        const requestKey = `invitations:${orgDomain}`;

        setIsLoading(true);
        setError(null);
        try {
            const response: any = await dedupeRequest(
                requestKey,
                async () => orgService.getInvitations(orgDomain),
                { cacheMs: 3000, force }
            );

            if (response.success && response.data?.invitations) {
                const enriched = await enrichInvitations(response.data.invitations);
                setInvitations(enriched);
            } else {
                setError(response.message || 'Failed to fetch invitations');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    }, [orgDomain, authUser]);

    useEffect(() => {
        void fetchInvitations();
    }, [fetchInvitations]);

    const invite = async (username: string) => {
        if (!orgDomain || !authUser) return { success: false, message: 'Not authenticated' };
        const requestKey = `invitations:${orgDomain}`;

        setIsLoading(true);
        try {
            const response = await orgService.createInvitation(orgDomain, username);
            if (response.success) {
                invalidateDedupedRequest(requestKey);
                await fetchInvitations(true); // Refresh list
                return { success: true };
            } else {
                return { success: false, message: response.message };
            }
        } catch (err: any) {
            return { success: false, message: err.response?.data?.message || err.message };
        } finally {
            setIsLoading(false);
        }
    };

    const remove = async (invitationId: string) => {
        if (!orgDomain || !authUser) return { success: false, message: 'Not authenticated' };
        const requestKey = `invitations:${orgDomain}`;

        setIsLoading(true);
        try {
            const response = await orgService.deleteInvitation(orgDomain, invitationId);
            if (response.success) {
                setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
                invalidateDedupedRequest(requestKey);
                return { success: true };
            } else {
                return { success: false, message: response.message };
            }
        } catch (err: any) {
            return { success: false, message: err.response?.data?.message || err.message };
        } finally {
            setIsLoading(false);
        }
    };

    const updateStatus = async (invitationId: string, status: string) => {
        if (!orgDomain || !authUser) return { success: false, message: 'Not authenticated' };
        const requestKey = `invitations:${orgDomain}`;

        setIsLoading(true);
        try {
            const response = await orgService.updateInvitation(orgDomain, invitationId, status);
            if (response.success) {
                invalidateDedupedRequest(requestKey);
                await fetchInvitations(true); // Refresh list to reflect status change
                return { success: true };
            } else {
                return { success: false, message: response.message };
            }
        } catch (err: any) {
            return { success: false, message: err.response?.data?.message || err.message };
        } finally {
            setIsLoading(false);
        }
    };

    return {
        invitations,
        isLoading,
        error,
        refetch: () => fetchInvitations(true),
        invite,
        remove,
        updateStatus
    };
};
