/**
 * HSD Arena - Common Types (Based on API Documentation)
 */

// ============================================
// USER & AUTH
// ============================================

export interface User {
    id: string;
    username: string;
    email: string;
    createdAt: string;
}

export interface AuthUser extends User {
    organizations: UserOrganization[];
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    username: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    success: boolean;
    data: {
        user: User;
        token: string;
    };
    message?: string;
}

export type AuthError = {
    code: string;
    message: string;
    field?: string;
};

// ============================================
// ORGANIZATION
// ============================================

export type PackageType = 'FREE' | 'PRO' | 'ENTERPRISE';

export type OrganizationRole = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER';

export interface OrganizationBranding {
    logoUrl?: string;
    css?: string;
}

export interface Organization {
    id: string;
    name: string;
    subdomain: string;
    package: PackageType;
    createdAt: string;
    branding?: OrganizationBranding;
    ownerId?: string;
}

export interface UserOrganization {
    id: string;
    name: string;
    subdomain: string;
    package: PackageType;
    role: OrganizationRole;
    branding?: OrganizationBranding;
}

export interface CreateOrganizationData {
    name: string;
    subdomain: string;
    branding?: OrganizationBranding;
}

export interface UpdateOrganizationData {
    name?: string;
    subdomain?: string;
    branding?: OrganizationBranding;
}

// ============================================
// MEMBER
// ============================================

export interface Member {
    id?: string;
    userId: string;
    username: string;
    email: string;
    role: OrganizationRole;
    joinedAt: string;
}

export interface MemberWithUser extends Member { }

// ============================================
// INVITATION
// ============================================

export interface Invitation {
    id: string;
    orgId: string;
    inviterId: string;
    inviteeId: string;
    inviteeUsername?: string;
    status: string;
    createdAt: string;
}

// ============================================
// API RESPONSES
// ============================================

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
}
