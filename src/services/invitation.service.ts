import { get, patch } from '@/lib/axios';
import { API_ROUTES } from '@/lib/constants';
import type { ApiResponse } from '@/types';

export const getMyInvitations = async (): Promise<ApiResponse<any>> => {
    return await get<ApiResponse<any>>(API_ROUTES.MY_INVITATIONS);
};

export const respondToInvitation = async (invitationId: string, status: 'ACCEPTED' | 'REJECTED'): Promise<ApiResponse<any>> => {
    return await patch<ApiResponse<any>>(API_ROUTES.MY_INVITATION_BY_ID(invitationId), { status });
};
