/**
 * HSD Arena - useCreateOrganization Hook
 * 
 * Hook for creating new organizations
 */

import { useState } from 'react';
import { useAuth } from '@/hooks';
import type { CreateOrganizationData } from '@/types';
import { organizationService } from '@/services';

interface UseCreateOrganizationReturn {
    name: string;
    subdomain: string;
    package: 'FREE' | 'PRO' | 'ENTERPRISE';

    errors: {
        name?: string;
        subdomain?: string;
        general?: string;
    };
    isLoading: boolean;

    setName: (value: string) => void;
    setSubdomain: (value: string) => void;
    setPackage: (value: 'FREE' | 'PRO' | 'ENTERPRISE') => void;

    handleSubmit: (e: React.FormEvent) => Promise<void>;
    clearErrors: () => void;
}

export const useCreateOrganization = (onSuccess?: () => void): UseCreateOrganizationReturn => {
    const { checkAuth } = useAuth();

    const [name, setName] = useState('');
    const [subdomain, setSubdomain] = useState('');
    const [packageType, setPackage] = useState<'FREE' | 'PRO' | 'ENTERPRISE'>('FREE');

    const [errors, setErrors] = useState<UseCreateOrganizationReturn['errors']>({});
    const [isLoading, setIsLoading] = useState(false);

    const validateForm = (): boolean => {
        const newErrors: UseCreateOrganizationReturn['errors'] = {};

        if (!name) {
            newErrors.name = 'Organization name is required';
        } else if (name.length < 3) {
            newErrors.name = 'Organization name must be at least 3 characters';
        }

        if (!subdomain) {
            newErrors.subdomain = 'Subdomain is required';
        } else if (subdomain.length < 3) {
            newErrors.subdomain = 'Subdomain must be at least 3 characters';
        } else if (!/^[a-z0-9-]+$/.test(subdomain)) {
            newErrors.subdomain = 'Subdomain can only contain lowercase letters, numbers, and hyphens';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            const data: CreateOrganizationData = {
                name,
                subdomain: subdomain.toLowerCase(),
            };

            await organizationService.createOrganization(data);

            // Refresh user data to include new organization
            await checkAuth();

            onSuccess?.();
        } catch (error: any) {
            if (error.field) {
                setErrors({ [error.field]: error.message });
            } else {
                setErrors({ general: error.message || 'An error occurred. Please try again.' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const clearErrors = () => setErrors({});

    return {
        name,
        subdomain,
        package: packageType,
        errors,
        isLoading,
        setName,
        setSubdomain,
        setPackage,
        handleSubmit,
        clearErrors,
    };
};
