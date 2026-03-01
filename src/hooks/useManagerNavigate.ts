/**
 * HSD Arena - useManagerNavigate Hook
 * 
 * Simply returns standard navigate function now that we use real subdomains.
 */

import { useNavigate } from 'react-router-dom';

export const useManagerNavigate = () => {
    const navigate = useNavigate();
    return navigate;
};
