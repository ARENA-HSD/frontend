/**
 * HSD Arena - useSubdomain Hook
 * 
 * Detects if current URL is a subdomain
 */

import { useMemo } from 'react';

export const useSubdomain = (): string | null => {
    return useMemo(() => {
        const hostname = window.location.hostname;

        // Development mode: support ?subdomain=xxx parameter
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            const urlParams = new URLSearchParams(window.location.search);
            const devSubdomain = urlParams.get('subdomain');

            // If subdomain parameter exists, use it
            if (devSubdomain) {
                return devSubdomain;
            }

            // Otherwise, check if there's a subdomain prefix (e.g., org1.localhost)
            // This won't work in most browsers without hosts file modification
            return null;
        }

        // Extract subdomain from hostname
        const parts = hostname.split('.');

        // If only 2 parts (e.g., hsdarena.com), no subdomain
        if (parts.length <= 2) {
            return null;
        }

        // Return first part as subdomain
        return parts[0];
    }, []);
};
