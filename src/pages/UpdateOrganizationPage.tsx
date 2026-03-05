/**
 * HSD Arena - Create Organization Page
 * 
 * Form to create a new organization via POST /org/
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks';
import { organizationService } from '@/services';
import { MainLayout, Button } from '@/components';
import type { Organization, UpdateOrganizationData } from '@/types';

const UpdateOrganizationPage = () => {
    const navigate = useNavigate();
    const { user, checkAuth } = useAuth();
    const { subdomain: currentSubdomain } = useParams();

    const [formData, setFormData] = useState<UpdateOrganizationData>({
        name: '',
        subdomain: '',
        branding: {},
    });

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
                    setFormData({
                        name: response.data.organization.name,
                        subdomain: response.data.organization.subdomain,
                        branding: response.data.organization.branding || {},
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

    const handleSubdomainChange = (value: string) => {
        // Only allow lowercase letters, numbers, and hyphens
        const sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
        setFormData({ ...formData, subdomain: sanitized });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 text-secondary hover:text-primary mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Organizations
                    </button>
                    <h1 className="text-3xl font-bold text-primary">Update Organization</h1>
                    <p className="text-secondary mt-2">
                        Update your organization details
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* Loading State */}
                {isFetching && (
                    <div className="text-center py-12 text-gray-500">
                        Loading organization data...
                    </div>
                )}

                {/* Form */}
                {!isFetching && (
                    <form onSubmit={handleSubmit} className="card p-8">
                        <div className="space-y-6">
                            {/* Organization Name */}
                            <div>
                                <label className="block text-sm font-semibold text-primary mb-2">
                                    Organization Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name || ''}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="My Organization"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            {/* Subdomain */}
                            <div>
                                <label className="block text-sm font-semibold text-primary mb-2">
                                    Subdomain *
                                </label>
                                <div className="flex items-center">
                                    <input
                                        type="text"
                                        value={formData.subdomain || ''}
                                        onChange={(e) => handleSubdomainChange(e.target.value)}
                                        placeholder="my-org"
                                        className="flex-1 border border-gray-300 rounded-l-lg px-4 py-3 text-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        required
                                    />
                                    <div className="bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg px-4 py-3 text-gray-500">
                                        .hsdarena.com
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">
                                    Only lowercase letters, numbers, and hyphens allowed
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 mt-8">
                            <button
                                type="button"
                                onClick={handleBack}
                                disabled={isLoading}
                                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-8 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {isLoading ? 'Updating...' : 'Update Organization'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </MainLayout>
    );
};

export default UpdateOrganizationPage;
