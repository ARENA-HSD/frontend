/**
 * HSD Arena - useSubdomain Hook
 * 
 * Detects if current URL is a subdomain
 */

import { useMemo } from 'react';

export const useSubdomain = (): string | null => {
    return useMemo(() => {
        const hostname = window.location.hostname;

        // Check for .localhost pattern (e.g. org1.localhost)
        const localhostMatch = hostname.match(/^([a-z0-9-]+)\.localhost$/i);
        if (localhostMatch) {
            return localhostMatch[1];
        }

        // Development mode: main localhost or IP
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
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