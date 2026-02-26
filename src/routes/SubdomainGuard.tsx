/**
 * HSD Arena - Subdomain Guard Component
 * 
 * Ensures subdomain exists and is valid
 */

import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useSubdomain } from '@/hooks';

interface SubdomainGuardProps {
    children: ReactNode;
}

const SubdomainGuard = ({ children }: SubdomainGuardProps) => {
    const subdomain = useSubdomain();

    // If no subdomain, redirect to main domain
    if (!subdomain) {
        window.location.href = window.location.origin.replace(/^https?:\/\/[^.]+\./, 'http://');
        return null;
    }

    // TODO: Validate organization exists and is active when API is ready
    const organizationExists = true; // Mock for now

    if (!organizationExists) {
        return <Navigate to="/organization-not-found" replace />;
    }

    return <>{children}</>;
};

export default SubdomainGuard;