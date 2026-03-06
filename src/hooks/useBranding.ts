/**
 * HSD Arena - useBranding Hook
 * 
 * Fetches organization branding (primary/secondary colors) from the API
 * and applies them as CSS custom properties (--color-3 and --color-4).
 * 
 * These override the default palette while themes (dark/ocean/light)
 * only change surface/text colors, so brand colors persist across themes.
 */

import { useEffect, useState } from 'react';
import { organizationService } from '@/services';
import type { OrganizationBranding } from '@/types';

export const useBranding = (subdomain: string | null) => {
    const [branding, setBranding] = useState<OrganizationBranding | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!subdomain) return;

        const fetchBranding = async () => {
            setIsLoading(true);
            try {
                const response = await organizationService.getOrganization(subdomain);
                const r = response as any;
                const org = r?.data?.organization || r?.data || r;
                const brandingData = org?.branding;

                if (brandingData) {
                    setBranding(brandingData);
                }
            } catch (error) {
                console.warn('Could not fetch organization branding:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBranding();
    }, [subdomain]);

    // Apply branding colors as CSS custom properties
    useEffect(() => {
        const root = document.documentElement;

        if (branding?.primary) {
            root.style.setProperty('--color-3', branding.primary);
        }
        if (branding?.secondary) {
            root.style.setProperty('--color-4', branding.secondary);
        }

        // Cleanup: remove inline styles when component unmounts
        return () => {
            root.style.removeProperty('--color-3');
            root.style.removeProperty('--color-4');
        };
    }, [branding]);

    return { branding, isLoading };
};
