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
import axios from 'axios';
import { organizationService } from '@/services';
import type { OrganizationBranding } from '@/types';

interface OrganizationMeta {
    branding: OrganizationBranding | null;
    organizationExists: boolean;
}

const orgMetaCache = new Map<string, OrganizationMeta>();
const orgMetaInFlight = new Map<string, Promise<OrganizationMeta>>();

const getOrganizationMeta = async (subdomain: string): Promise<OrganizationMeta> => {
    const cached = orgMetaCache.get(subdomain);
    if (cached) {
        return cached;
    }

    const inFlight = orgMetaInFlight.get(subdomain);
    if (inFlight) {
        return inFlight;
    }

    const request = (async () => {
        try {
            const response = await organizationService.getOrganization(subdomain);
            const r = response as any;
            const org = r?.data?.organization || r?.data || r;
            const meta: OrganizationMeta = {
                branding: org?.branding || null,
                organizationExists: true,
            };

            orgMetaCache.set(subdomain, meta);
            return meta;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                const meta: OrganizationMeta = {
                    branding: null,
                    organizationExists: false,
                };
                orgMetaCache.set(subdomain, meta);
                return meta;
            }

            throw error;
        } finally {
            orgMetaInFlight.delete(subdomain);
        }
    })();

    orgMetaInFlight.set(subdomain, request);
    return request;
};

export const useBranding = (subdomain: string | null) => {
    const [branding, setBranding] = useState<OrganizationBranding | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [organizationExists, setOrganizationExists] = useState<boolean>(true);

    useEffect(() => {
        if (!subdomain) {
            setBranding(null);
            setOrganizationExists(true);
            setIsLoading(false);
            return;
        }

        let isMounted = true;

        const fetchBranding = async () => {
            setIsLoading(true);
            try {
                const meta = await getOrganizationMeta(subdomain);

                if (isMounted) {
                    setBranding(meta.branding);
                    setOrganizationExists(meta.organizationExists);
                }
            } catch (error) {
                console.warn('Could not fetch organization branding:', error);
                if (isMounted) {
                    setOrganizationExists(true);
                    setBranding(null);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchBranding();

        return () => {
            isMounted = false;
        };
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

    return { branding, isLoading, organizationExists };
};
