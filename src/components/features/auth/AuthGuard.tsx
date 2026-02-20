/**
 * HSD Arena - Auth Guard Component
 * 
 * Wrapper for protected content - shows loader while checking auth
 */

import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { Loader } from '@/components';
import type { OrganizationRole } from '@/types';

interface AuthGuardProps {
    children: ReactNode;
    requiredRole?: OrganizationRole;
}

const AuthGuard = ({ children, requiredRole }: AuthGuardProps) => {
    const { isAuthenticated, isLoading, role } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-page">
                <Loader text="Checking authentication..." />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Check role if required
    if (requiredRole && role !== requiredRole && role !== 'SUPER_ADMIN') {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default AuthGuard;
