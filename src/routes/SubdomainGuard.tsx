/**
 * HSD Arena - Subdomain Guard Component
 * 
 * Ensures subdomain exists and is valid
 */

import { type ReactNode, useEffect } from 'react';
import { useSubdomain, useBranding } from '@/hooks';
import { Loader } from '@/components';
import { NotFoundPage } from '@/pages';

interface SubdomainGuardProps {
    children: ReactNode;
}

const SubdomainGuard = ({ children }: SubdomainGuardProps) => {
    const subdomain = useSubdomain();
    const isAdminSubdomain = subdomain === 'admin';

    // Fetches branding and organization validity in a single deduplicated request
    const { isLoading: isCheckingOrganization, organizationExists } = useBranding(
        isAdminSubdomain ? null : subdomain,
    );

    useEffect(() => {
        if (!subdomain) {
            window.location.href = window.location.origin.replace(/^https?:\/\/[^.]+\./, 'http://');
        }
    }, [subdomain]);

    // If no subdomain, redirect to main domain
    if (!subdomain) {
        return null;
    }

    // `admin` is a reserved system subdomain, not an organization domain.
    if (isAdminSubdomain) {
        return <>{children}</>;
    }

    if (isCheckingOrganization) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-page">
                <Loader text="Organization checking..." />
            </div>
        );
    }

    if (!organizationExists) {
        return <NotFoundPage />;
    }

    return <>{children}</>;
};

export default SubdomainGuard;