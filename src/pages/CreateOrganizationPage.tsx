/**
 * HSD Arena - Create Organization Page
 * 
 * Form to create a new organization via POST /org/
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { organizationService } from '@/services';
import { MainLayout, SEO } from '@/components';
import { OrganizationForm } from '@/components/features/organization';

const CreateOrganizationPage = () => {
    const navigate = useNavigate();
    const { checkAuth } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

        if (!formData.name.trim()) {
            setError('Organization name is required');
            return;
        }

        if (!formData.subdomain.trim()) {
            setError('Subdomain is required');
            return;
        }

        if (formData.subdomain.length < 3) {
            setError('Subdomain must be at least 3 characters');
            return;
        }

        try {
            setIsLoading(true);
            const response = await organizationService.createOrganization(formData);

            if (response.data) {
                // Refresh user data
                await checkAuth();

                // Navigate to organizations list
                navigate('/organizations');
            }
        } catch (err: any) {
            console.error('Failed to create organization:', err);
            const status = err?.response?.status;
            const backendMessage = err?.response?.data?.message;
            const message = status >= 500
                ? 'Görsel yükleme sırasında bir hata oluştu.'
                : backendMessage || err?.message || 'Failed to create organization';
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
            <SEO
                title="Create Organization"
                description="Set up a new Quiz Strike organization to manage quizzes and invite your team."
                noIndex
            />
            <OrganizationForm
                onSubmit={handleSubmit}
                isLoading={isLoading}
                error={error}
                title="Create Organization"
                description="Set up a new organization to manage quizzes"
                submitButtonText="Create Organization"
                onCancel={handleBack}
            />
        </MainLayout>
    );
};

export default CreateOrganizationPage;
