/**
 * HSD Arena - Organization Settings Page (Subdomain)
 * 
 * Allows managers to update organization details from within the subdomain.
 * Reuses OrganizationForm component with subdomain-aware data fetching.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useSubdomain } from '@/hooks';
import { organizationService } from '@/services';
import { SubdomainLayout, SEO } from '@/components';
import { OrganizationForm } from '@/components/features/organization';

const OrganizationSettingsPage = () => {
    const navigate = useNavigate();
    const { checkAuth } = useAuth();
    const subdomain = useSubdomain();

    const [initialData, setInitialData] = useState<{
        name: string;
        subdomain: string;
        branding?: {
            primary?: string;
            secondary?: string;
            logoUrl?: string;
        };
    } | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrganization = async () => {
            if (!subdomain) {
                setError('No organization detected');
                setIsFetching(false);
                return;
            }

            try {
                setIsFetching(true);
                const response = await organizationService.getOrganization(subdomain);
                if (response.data) {
                    setInitialData({
                        name: response.data.organization.name,
                        subdomain: response.data.organization.subdomain,
                        branding: response.data.organization.branding,
                    });
                }
            } catch (err: any) {
                console.error('Failed to fetch organization:', err);
                setError('Failed to load organization data');
            } finally {
                setIsFetching(false);
            }
        };

        fetchOrganization();
    }, [subdomain]);

    const handleSubmit = async (formData: {
        name: string;
        subdomain: string;
        branding: {
            primary: string;
            secondary: string;
            logoUrl?: string;
            logoBase64?: string;
        };
    }) => {
        setError(null);

        if (!subdomain) return;

        if (!formData.name?.trim()) {
            setError('Organization name is required');
            return;
        }

        if (!formData.subdomain?.trim()) {
            setError('Subdomain is required');
            return;
        }

        if ((formData.subdomain?.length || 0) < 3) {
            setError('Subdomain must be at least 3 characters');
            return;
        }

        try {
            setIsLoading(true);
            const response = await organizationService.updateOrganization(subdomain, formData);

            if (response.data) {
                // Refresh user data
                await checkAuth();

                // If subdomain changed, redirect to the new subdomain
                if (formData.subdomain !== subdomain) {
                    const port = window.location.port ? `:${window.location.port}` : '';
                    const host = window.location.hostname;

                    let newHost = '';
                    if (host.includes('localhost')) {
                        newHost = `${formData.subdomain}.localhost`;
                    } else {
                        const baseDomain = import.meta.env.VITE_BASE_DOMAIN as string | undefined;
                        const base = baseDomain || host.split('.').slice(-2).join('.');
                        newHost = `${formData.subdomain}.${base}`;
                    }

                    window.location.href = `${window.location.protocol}//${newHost}${port}/manager/settings`;
                } else {
                    // Stay on the same page, re-fetch data
                    navigate('/manager/settings');
                }
            }
        } catch (err: any) {
            console.error('Failed to update organization:', err);
            const status = err?.response?.status;
            const backendMessage = err?.response?.data?.message;
            const message = status >= 500
                ? 'Görsel yükleme sırasında bir hata oluştu.'
                : backendMessage || err?.message || 'Failed to update organization';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        navigate('/manager/quizzes');
    };

    return (
        <SubdomainLayout>
            <SEO
                title="Organization Settings"
                description="Update your organization details, subdomain and branding."
                noIndex
            />
            {isFetching ? (
                <div className="max-w-2xl mx-auto text-center py-12 text-gray-500">
                    Loading organization data...
                </div>
            ) : (
                <OrganizationForm
                    initialData={initialData}
                    onSubmit={handleSubmit}
                    isLoading={isLoading}
                    error={error}
                    title="Organization Settings"
                    description="Update your organization details"
                    submitButtonText="Save Changes"
                    onCancel={handleBack}
                />
            )}
        </SubdomainLayout>
    );
};

export default OrganizationSettingsPage;
