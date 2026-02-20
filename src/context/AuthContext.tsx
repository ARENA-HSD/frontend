/**
 * HSD Arena - Auth Context
 * 
 * Global authentication state following "Global Passport" + Context Switching model
 */

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { AuthUser, UserOrganization, OrganizationRole } from '@/types';
import { authService, organizationService } from '@/services';

interface LoginCredentials {
    email: string;
    password: string;
}

interface RegisterData {
    username: string;
    email: string;
    password: string;
}

interface AuthContextValue {
    user: AuthUser | null;
    currentOrganization: UserOrganization | null;
    role: OrganizationRole | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
    selectOrganization: (org: UserOrganization) => void;
    clearOrganizationContext: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [currentOrganization, setCurrentOrganization] = useState<UserOrganization | null>(null);
    const [role, setRole] = useState<OrganizationRole | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const checkAuth = async () => {
        try {
            // Check if we have a token - that's enough to be authenticated
            const token = localStorage.getItem('hsd_arena_auth_token');
            const currentUser = authService.getCurrentUser();

            if (!token || !currentUser) {
                setUser(null);
                setCurrentOrganization(null);
                setRole(null);
                setIsLoading(false);
                return;
            }

            setUser(currentUser);

            // Restore selected organization from localStorage
            const savedOrg = authService.getCurrentOrganization();
            if (savedOrg) {
                setCurrentOrganization(savedOrg);
                setRole(savedOrg.role);
            }
        } catch (error) {
            setUser(null);
            setCurrentOrganization(null);
            setRole(null);
            authService.clearAuthData();
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (credentials: LoginCredentials) => {
        setIsLoading(true);
        try {
            const response = await authService.login(credentials);
            setUser(response.user);

            // Fetch user's organizations after login
            try {
                const orgsResponse = await organizationService.getUserOrganizations();
                if (orgsResponse.success && orgsResponse.data) {
                    const orgsWithRole: UserOrganization[] = orgsResponse.data.map(org => ({
                        id: org.id,
                        name: org.name,
                        subdomain: org.subdomain,
                        package: org.package,
                        role: (org as any).role || 'MANAGER',
                        branding: org.branding,
                    }));

                    const updatedUser = { ...response.user, organizations: orgsWithRole };
                    setUser(updatedUser);
                    authService.saveUserData(updatedUser);

                    // Auto-select first organization if only one
                    if (orgsWithRole.length === 1) {
                        const org = orgsWithRole[0];
                        setCurrentOrganization(org);
                        setRole(org.role);
                        authService.saveCurrentOrganization(org);
                    }
                }
            } catch {
                // User may not have any organizations yet, that's ok
            }
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (data: RegisterData) => {
        setIsLoading(true);
        try {
            const response = await authService.register(data);
            setUser(response.user);
            // No auto-select because new users have no organizations
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            await authService.logout();
            setUser(null);
            setCurrentOrganization(null);
            setRole(null);
        } finally {
            setIsLoading(false);
        }
    };

    const selectOrganization = (org: UserOrganization) => {
        setCurrentOrganization(org);
        setRole(org.role);
        authService.saveCurrentOrganization(org);
    };

    const clearOrganizationContext = () => {
        setCurrentOrganization(null);
        setRole(null);
        authService.clearCurrentOrganization();
    };

    // Check auth on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const value: AuthContextValue = {
        user,
        currentOrganization,
        role,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        checkAuth,
        selectOrganization,
        clearOrganizationContext,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within AuthProvider');
    }
    return context;
};
