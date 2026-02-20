/**
 * HSD Arena - useManagerNavigate Hook
 * 
 * Returns a navigate function that auto-prefixes paths with /subdomain
 * when running in development (no real subdomain detected).
 * In production with real subdomains, paths are used as-is.
 */

import { useNavigate } from 'react-router-dom';
import { useSubdomain } from './useSubdomain';
import { useCallback } from 'react';

export const useManagerNavigate = () => {
    const navigate = useNavigate();
    const subdomain = useSubdomain();

    const managerNavigate = useCallback(
        (path: string, options?: { state?: any; replace?: boolean }) => {
            // If no real subdomain, prefix with /subdomain for dev routing
            const finalPath = subdomain ? path : `/subdomain${path}`;
            navigate(finalPath, options);
        },
        [navigate, subdomain]
    );

    return managerNavigate;
};
