/**
 * HSD Arena - Update Organization Page
 * 
 * Form to update an existing organization via PATCH /org/:subdomain
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { organizationService } from '@/services';
import { MainLayout } from '@/components';
import { OrganizationForm } from '@/components/features/organization';

const UpdateOrganizationPage = () => {
    const navigate = useNavigate();
    const { checkAuth } = useAuth();
    const { subdomain: currentSubdomain } = useParams();

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
            if (!currentSubdomain) {
                setError('No organization specified');
                setIsFetching(false);
                return;
            }

            try {
                setIsFetching(true);
                const response = await organizationService.getOrganization(currentSubdomain);
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
    }, [currentSubdomain]);

    const handleSubmit = async (formData: {
        name: string;
        subdomain: string;
        branding: {
            primary: string;
            secondary: string;
            logoUrl: string
        }
    }) => {
        setError(null);

        if (!currentSubdomain) return;

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
            const response = await organizationService.updateOrganization(currentSubdomain, formData);

            if (response.data) {
                // Refresh user data
                await checkAuth();

                // Navigate to organizations list
                navigate('/organizations');
            }
        } catch (err: any) {
            console.error('Failed to update organization:', err);
            const message = err?.response?.data?.message || err?.message || 'Failed to update organization';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        navigate('/organizations');
    };

    return (
        <MainLayout>
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
                    title="Update Organization"
                    description="Update your organization details"
                    submitButtonText="Update Organization"
                    onCancel={handleBack}
                />
            )}
        </MainLayout>
    );
};

export default UpdateOrganizationPage;
