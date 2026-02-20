/**
 * HSD Arena - useAuth Hook
 * 
 * Main hook for accessing auth context
 */

import { useAuthContext } from '../context';

export const useAuth = () => {
    return useAuthContext();
};
