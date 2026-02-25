/**
 * HSD Arena - Auth Context
 * 
 * Global authentication state following "Global Passport" + Context Switching model
 */

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { AuthUser, UserOrganization, OrganizationRole } from '@/types';
import { authService, organizationService } from '@/services';
import { useSubdomain } from '@/hooks';
import { CURRENT_ORG_KEY } from '@/lib/constants';

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
    const subdomain = useSubdomain();
    
    const selectOrganization = (org: UserOrganization) => {
        setCurrentOrganization(org);
        setRole(org.role);
        try {
            localStorage.setItem(CURRENT_ORG_KEY, JSON.stringify(org));
        } catch (e) {
            // ignore storage errors
        }
    };

    const checkAuth = async () => {
        try {
            // If an organization payload was passed via URL (redirect from main domain), persist it
            try {
                const urlInit = new URL(window.location.href);
                const orgParamInit = urlInit.searchParams.get('org');
                if (orgParamInit) {
                    try {
                        const parsedInit = JSON.parse(decodeURIComponent(orgParamInit));
                        if (parsedInit && parsedInit.subdomain) {
                            selectOrganization(parsedInit as UserOrganization);
                        }
                    } catch (e) {
                        // ignore
                    }
                    urlInit.searchParams.delete('org');
                    window.history.replaceState({}, '', urlInit.toString());
                }
            } catch (e) {
                // ignore URL parse errors
            }
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
            } else {
                // If no saved organization and we're on a subdomain, try to auto-select
                // the organization that matches the current hostname subdomain.
                // First, check if an organization payload was passed via URL (redirect from main domain)
                try {
                    const url = new URL(window.location.href);
                    const orgParam = url.searchParams.get('org');
                    if (orgParam) {
                        try {
                            const parsed = JSON.parse(decodeURIComponent(orgParam));
                            // basic validation
                            if (parsed && parsed.subdomain) {
                                selectOrganization(parsed as UserOrganization);
                            }
                        } catch (e) {
                            // ignore parse errors
                        }

                        // remove the org param from the URL to clean up
                        url.searchParams.delete('org');
                        window.history.replaceState({}, '', url.toString());
                    } else if (subdomain && currentUser?.organizations && Array.isArray(currentUser.organizations)) {
                        const matched = currentUser.organizations.find((o: UserOrganization) => o.subdomain === subdomain);
                        if (matched) {
                            selectOrganization(matched);
                        }
                    }
                } catch (e) {
                    // ignore URL parsing errors and fallback to subdomain matching
                    if (subdomain && currentUser?.organizations && Array.isArray(currentUser.organizations)) {
                        const matched = currentUser.organizations.find((o: UserOrganization) => o.subdomain === subdomain);
                        if (matched) {
                            selectOrganization(matched);
                        }
                    }
                }
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
                        selectOrganization(org);
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
