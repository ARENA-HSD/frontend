/**
 * HSD Arena - Auth Context
 * 
 * Global authentication state. Organization context is derived from the subdomain URL.
 */

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import Cookies from 'js-cookie';
import type { AuthUser, UserOrganization } from '@/types';
import { authService, organizationService } from '@/services';
import { AUTH_TOKEN_KEY } from '@/lib/constants';

interface LoginCredentials {
    email: string;
    password: string;
    cfTurnstileToken: string;
}

interface RegisterData {
    username: string;
    email: string;
    password: string;
    cfTurnstileToken: string;
}

interface AuthContextValue {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const checkAuth = async () => {
        try {
            const token = Cookies.get(AUTH_TOKEN_KEY);
            const currentUser = authService.getCurrentUser();

            if (!token || !currentUser) {
                setUser(null);
                setIsLoading(false);
                return;
            }

            setUser(currentUser);
        } catch (error) {
            setUser(null);
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
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            await authService.logout();
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    // Check auth on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const value: AuthContextValue = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        checkAuth,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within AuthProvider');
    }
    return context;
}