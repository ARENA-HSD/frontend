/**
 * HSD Arena - Organizations Page
 * 
 * Main dashboard showing user's organizations (fetched from API)
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { organizationService } from '@/services';
import { dedupeRequest, invalidateDedupedRequest } from '@/lib/requestDedup';
import { OrganizationCard, Button, MainLayout, SEO, TitleHeader } from '@/components';
import type { UserOrganization, Organization } from '@/types';

const OrganizationsPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [organizations, setOrganizations] = useState<UserOrganization[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchOrganizations = useCallback(async (force = false) => {
        const requestKey = 'main:organizations:list';
        try {
            setIsLoading(true);
            const response = await dedupeRequest(
                requestKey,
                async () => organizationService.getUserOrganizations(),
                { cacheMs: 3000, force }
            );
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
    }, [user]);

    useEffect(() => {
        void fetchOrganizations();
    }, [fetchOrganizations]);

    const handleAccessOrganization = (org: UserOrganization) => {
        // Redirect to the real subdomain
        const port = window.location.port ? `:${window.location.port}` : '';
        const host = window.location.hostname;

        let newHost = '';
        if (host.includes('localhost')) {
            newHost = `${org.subdomain}.localhost`;
        } else {
            // production
            const baseDomain = import.meta.env.VITE_BASE_DOMAIN as string | undefined;
            const base = baseDomain || host.split('.').slice(-2).join('.');
            newHost = `${org.subdomain}.${base}`;
        }

        window.location.href = `${window.location.protocol}//${newHost}${port}/manager/quizzes`;
    };

    const handleCreateNew = () => {
        navigate('/organizations/create');
    };

    return (
        <MainLayout>
            <SEO
                title="My Organizations"
                description="Manage your Quiz Strike organizations and access your team dashboards."
                noIndex
            />
            <div className="max-w-5xl mx-auto space-y-6">
                <TitleHeader title='Your Organizations' description='Select an organization to access or create a new one' isButton buttonText='Create New' buttonIcon='+' onClick={handleCreateNew} />

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
                                    onRefresh={() => {
                                        invalidateDedupedRequest('main:organizations:list');
                                        void fetchOrganizations(true);
                                    }}
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