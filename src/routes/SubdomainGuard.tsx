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
        const protocol = window.location.protocol;
        const host = window.location.host;
        // This shouldn't happen normally because router.tsx only uses SubdomainGuard in subdomainRouter
        // But just in case, strip the first subdomain part
        const parts = host.split('.');
        if (parts.length > 2 || host.endsWith('.localhost')) {
            parts.shift();
        }
        window.location.href = `${protocol}//${parts.join('.')}`;
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
