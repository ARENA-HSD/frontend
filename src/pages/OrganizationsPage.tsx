/**
 * HSD Arena - Organizations Page
 * 
 * Main dashboard showing user's organizations (fetched from API)
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { organizationService } from '@/services';
import { OrganizationCard } from '@/components';
import { Button, MainLayout } from '@/components';
import type { UserOrganization, Organization } from '@/types';

const OrganizationsPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [organizations, setOrganizations] = useState<UserOrganization[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchOrganizations();
    }, []);

    const fetchOrganizations = async () => {
        try {
            setIsLoading(true);
            const response = await organizationService.getUserOrganizations();
            const r = response as any;

            // API returns: { success, data: { organizations: [...] } }
            const rawOrgs: any[] =
                Array.isArray(response) ? response :
                    Array.isArray(r?.data?.organizations) ? r.data.organizations :
                        Array.isArray(r?.data) ? r.data :
                            (r?.data?.id ? [r.data] : []);

            const orgs: UserOrganization[] = rawOrgs.map((org: any) => ({
                id: org.id || org._id,
                name: org.name,
                subdomain: org.subdomain,
                package: org.package || 'FREE',
                role: org.role || 'MANAGER',
                branding: org.branding,
            }));
            setOrganizations(orgs);
        } catch (error) {
            console.error('Failed to fetch organizations:', error);
            // Fallback to user context data
            setOrganizations(user?.organizations || []);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAccessOrganization = (org: UserOrganization) => {
        // Redirect to the real subdomain
        const port = window.location.port ? `:${window.location.port}` : '';
        const host = window.location.hostname;

        let newHost = '';
        if (host.includes('localhost')) {
            newHost = `${org.subdomain}.localhost`;
        } else {
            // production
            const parts = host.split('.');
            if (parts.length > 2) {
                newHost = `${org.subdomain}.${parts.slice(-2).join('.')}`;
            } else {
                newHost = `${org.subdomain}.${host}`;
            }
        }

        window.location.href = `${window.location.protocol}//${newHost}${port}/manager/quizzes`;
    };

    const handleCreateNew = () => {
        navigate('/organizations/create');
    };

    return (
        <MainLayout>
            <div className="max-w-5xl mx-auto px-4 py-12 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-['Titan_One',sans-serif] text-primary">
                            Your Organizations
                        </h1>
                        <p className="text-lg">
                            Select an organization to access or create a new one
                        </p>
                    </div>

                    <Button
                        variant="secondary"
                        onClick={handleCreateNew}
                        className="px-6 pb-3 pt-2 flex items-center justify-center font-bold gap-2"
                    >
                        + <div className="font-['Titan_One',sans-serif] font-thin pt-1">Create New</div>
                    </Button>
                </div>

                {/* Loading */}
                {isLoading && (
                    <div className="text-center py-12 text-tertiary">
                        Loading organizations...
                    </div>
                )}

                {/* Organizations List */}
                {!isLoading && organizations.length === 0 ? (
                    <div className="card text-center py-12">
                        <div className="text-6xl mb-4">🏢</div>
                        <h2 className="text-xl font-bold text-primary mb-2">
                            No Organizations Yet
                        </h2>
                        <p className="text-secondary mb-6">
                            Create your first organization to get started
                        </p>
                        <Button variant="primary" onClick={handleCreateNew}>
                            Create Organization
                        </Button>
                    </div>
                ) : (
                    !isLoading && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {organizations.map((org) => (
                                <OrganizationCard
                                    key={org.id}
                                    organization={org}
                                    onAccess={handleAccessOrganization}
                                    onRefresh={fetchOrganizations}
                                />
                            ))}
                        </div>
                    )
                )}
            </div>
        </MainLayout>
    );
};

export default OrganizationsPage;