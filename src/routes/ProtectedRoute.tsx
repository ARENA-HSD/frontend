/**
 * HSD Arena - Protected Route Component
 * 
 * Guards routes that require authentication
 */

import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { Loader } from '@/components';
import type { OrganizationRole } from '@/types';

interface ProtectedRouteProps {
    children: ReactNode;
    requiredRole?: OrganizationRole; // Context-based role check
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
    const { user, role, isAuthenticated, isLoading } = useAuth();

    console.log('🔒 ProtectedRoute:', { isLoading, isAuthenticated, hasUser: !!user, user, role });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-page">
                <Loader text="Loading..." />
            </div>
        );
    }

    if (!isAuthenticated) {
        console.log('🔒 NOT authenticated, redirecting to /login');
        return <Navigate to="/login" replace />;
    }

    // Role check: only applies if requiredRole is specified AND user has selected an organization
    if (requiredRole && role) {
        // SUPER_ADMIN has access to everything
        if (role !== 'SUPER_ADMIN') {
            // Check if user's current role meets the requirement
            const roleHierarchy: Record<OrganizationRole, number> = {
                SUPER_ADMIN: 3,
                ADMIN: 2,
                MANAGER: 1,
            };

            if (roleHierarchy[role] < roleHierarchy[requiredRole]) {
                // User doesn't have sufficient permissions
                return <Navigate to="/" replace />;
            }
        }
    }

    return <>{children}</>;
};

export default ProtectedRoute;
