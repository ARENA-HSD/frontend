/**
 * HSD Arena - Organization Service
 * 
 * Real API implementation for organization CRUD operations
 */

import { get, post, patch, del } from '@/lib/axios';
import { API_ROUTES } from '@/lib/constants';
import type {
    Organization,
    UserOrganization,
    CreateOrganizationData,
    UpdateOrganizationData,
    ApiResponse,
    MemberWithUser,
} from '@/types';

// ============================================================================
// Organization API Calls
// ============================================================================

/**
 * Create new organization
 */
export const createOrganization = async (
    data: CreateOrganizationData
): Promise<ApiResponse<Organization>> => {
    return await post<ApiResponse<Organization>>(API_ROUTES.ORGANIZATIONS + '/', data);
};

/**
 * Get all organizations for current user
 */
export const getUserOrganizations = async (): Promise<ApiResponse<Organization[]>> => {
    return await get<ApiResponse<Organization[]>>(API_ROUTES.ORGANIZATIONS + '/');
};

/**
 * Get single organization by domain
 */
export const getOrganization = async (orgDomain: string): Promise<ApiResponse<Organization>> => {
    return await get<ApiResponse<Organization>>(API_ROUTES.ORGANIZATION_BY_DOMAIN(orgDomain));
};

/**
 * Update organization
 */
export const updateOrganization = async (
    orgDomain: string,
    data: UpdateOrganizationData
): Promise<ApiResponse<Organization>> => {
    return await patch<ApiResponse<Organization>>(
        API_ROUTES.ORGANIZATION_BY_DOMAIN(orgDomain),
        data
    );
};

/**
 * Delete organization
 */
export const deleteOrganization = async (orgDomain: string): Promise<ApiResponse<void>> => {
    return await del<ApiResponse<void>>(API_ROUTES.ORGANIZATION_BY_DOMAIN(orgDomain));
};

/**
 * Get organization members
 */
export const getMembers = async (orgDomain: string): Promise<ApiResponse<MemberWithUser[]>> => {
    return await get<ApiResponse<MemberWithUser[]>>(API_ROUTES.MEMBERS(orgDomain));
};

/**
 * Invite user to organization
 */
export const createInvitation = async (
    orgDomain: string,
    inviteeUsername: string
): Promise<ApiResponse<any>> => {
    return await post<ApiResponse<any>>(
        API_ROUTES.INVITATIONS(orgDomain),
        { inviteeUsername }
    );
};

/**
 * Get all invitations for organization
 */
export const getInvitations = async (orgDomain: string): Promise<ApiResponse<any[]>> => {
    return await get<ApiResponse<any[]>>(API_ROUTES.INVITATIONS(orgDomain));
};

/**
 * Delete invitation
 */
export const deleteInvitation = async (
    orgDomain: string,
    invitationId: string
): Promise<ApiResponse<void>> => {
    return await del<ApiResponse<void>>(API_ROUTES.INVITATION_BY_ID(orgDomain, invitationId));
};

/**
 * Update invitation status
 */
export const updateInvitation = async (
    orgDomain: string,
    invitationId: string,
    status: string
): Promise<ApiResponse<any>> => {
    return await patch<ApiResponse<any>>(
        API_ROUTES.INVITATION_BY_ID(orgDomain, invitationId),
        { status }
    );
};
