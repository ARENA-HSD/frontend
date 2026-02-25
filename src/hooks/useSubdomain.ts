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

            if (devSubdomain) {
                return devSubdomain;
            }
            return null;
        }

        // Extract subdomain from hostname
        const parts = hostname.split('.');

        // Handle localhost subdomains (e.g., efe.localhost)
        if (hostname.endsWith('.localhost')) {
            if (parts.length >= 2 && parts[0] !== 'www') {
                return parts[0];
            }
            return null;
        }

        // For production (e.g., efe.arena.com)
        // If only 2 parts (e.g., arena.com), no subdomain
        if (parts.length <= 2) {
            return null;
        }

        // Return first part as subdomain
        const subdomain = parts[0];
        
        // Ignore 'www' as a subdomain
        if (subdomain === 'www') {
            return null;
        }

        return subdomain;
    }, []);
};
