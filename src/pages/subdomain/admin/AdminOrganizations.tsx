import { useCallback, useEffect, useMemo, useState } from 'react';
import { Building2, Pencil, Trash2 } from 'lucide-react';
import { AdminLayout } from '@/components/layout';
import { Button, Input, Modal, SEO, TitleHeader } from '@/components';
import { useSubdomain } from '@/hooks';
import { NotFoundPage } from '@/pages';
import { adminService } from '@/services';
import {
    getAdminErrorMessage,
    type AdminOrganization,
} from '@/services/admin.service';

const PAGE_SIZE = 20;

type StatusType = 'success' | 'error' | null;

const AdminOrganizationsPage = () => {
    const subdomain = useSubdomain();

    const [organizations, setOrganizations] = useState<AdminOrganization[]>([]);
    const [total, setTotal] = useState(0);
    const [offset, setOffset] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const [statusMessage, setStatusMessage] = useState('');
    const [statusType, setStatusType] = useState<StatusType>(null);

    const [editingOrganization, setEditingOrganization] = useState<AdminOrganization | null>(null);
    const [editName, setEditName] = useState('');
    const [editSubdomain, setEditSubdomain] = useState('');
    const [brandingPrimary, setBrandingPrimary] = useState('');
    const [brandingSecondary, setBrandingSecondary] = useState('');
    const [brandingLogoUrl, setBrandingLogoUrl] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const currentPage = Math.floor(offset / PAGE_SIZE) + 1;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    const hasPrevious = offset > 0;
    const hasNext = offset + PAGE_SIZE < total;

    const pageMetaText = useMemo(() => {
        if (total === 0) {
            return 'No organizations found.';
        }

        const start = offset + 1;
        const end = Math.min(offset + organizations.length, total);
        return `${start}-${end} of ${total} organizations`;
    }, [offset, organizations.length, total]);

    const showStatus = (message: string, type: Exclude<StatusType, null>) => {
        setStatusMessage(message);
        setStatusType(type);
    };

    const loadOrganizations = useCallback(async (nextOffset = 0) => {
        setIsLoading(true);

        try {
            const response = await adminService.getAdminOrganizations({
                limit: PAGE_SIZE,
                offset: nextOffset,
            });

            setOrganizations(response.data.organizations);
            setTotal(response.data.total);
            setOffset(nextOffset);
        } catch (error) {
            showStatus(getAdminErrorMessage(error), 'error');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadOrganizations(0);
    }, [loadOrganizations]);

    if (subdomain !== 'admin') {
        return <NotFoundPage />;
    }

    const openEditModal = (organization: AdminOrganization) => {
        const branding = organization.branding ?? {};

        setEditingOrganization(organization);
        setEditName(organization.name);
        setEditSubdomain(organization.subdomain);
        setBrandingPrimary(branding.primary ?? '');
        setBrandingSecondary(branding.secondary ?? '');
        setBrandingLogoUrl(branding.logoUrl ?? '');
    };

    const closeEditModal = () => {
        setEditingOrganization(null);
        setEditName('');
        setEditSubdomain('');
        setBrandingPrimary('');
        setBrandingSecondary('');
        setBrandingLogoUrl('');
    };

    const handleUpdateOrganization = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!editingOrganization) return;

        const brandingPayload: Record<string, string> = {};

        if (brandingPrimary.trim()) {
            brandingPayload.primary = brandingPrimary.trim();
        }
        if (brandingSecondary.trim()) {
            brandingPayload.secondary = brandingSecondary.trim();
        }
        if (brandingLogoUrl.trim()) {
            brandingPayload.logoUrl = brandingLogoUrl.trim();
        }

        setIsSaving(true);

        try {
            await adminService.updateAdminOrganization(editingOrganization.id, {
                name: editName.trim(),
                subdomain: editSubdomain.trim(),
                branding: Object.keys(brandingPayload).length > 0 ? brandingPayload : undefined,
            });

            closeEditModal();
            showStatus('Organization updated successfully.', 'success');
            await loadOrganizations(offset);
        } catch (error) {
            showStatus(getAdminErrorMessage(error), 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteOrganization = async (organization: AdminOrganization) => {
        const isConfirmed = window.confirm(`Delete organization ${organization.name}?`);
        if (!isConfirmed) {
            return;
        }

        try {
            await adminService.deleteAdminOrganization(organization.id);
            showStatus('Organization deleted successfully.', 'success');

            const nextOffset = organizations.length === 1 && offset > 0
                ? Math.max(0, offset - PAGE_SIZE)
                : offset;

            await loadOrganizations(nextOffset);
        } catch (error) {
            showStatus(getAdminErrorMessage(error), 'error');
        }
    };

    return (
        <AdminLayout>
            <SEO
                title="Admin Organizations"
                description="Manage all organizations as web admin."
                noIndex
            />

            <div className="w-full h-full flex flex-col overflow-hidden">
                <TitleHeader
                    title="Admin Organizations"
                    description="Update organization profile and remove organizations platform-wide."
                />

                {statusType && (
                    <div
                        className={`mb-4 rounded-lg border p-3 text-sm italic ${statusType === 'success'
                            ? 'border-role-success bg-role-success-light text-role-success'
                            : 'border-role-danger bg-role-danger-light text-role-danger'
                            }`}
                    >
                        {statusMessage}
                    </div>
                )}

                <div className="rounded-2xl border border-light bg-card p-4 flex-1 min-h-0 flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between pb-3 border-b border-light">
                        <p className="text-sm text-secondary font-medium">{pageMetaText}</p>
                        <div className="text-sm text-tertiary">Page {currentPage} / {totalPages}</div>
                    </div>

                    {isLoading ? (
                        <div className="flex-1 flex items-center justify-center text-tertiary">
                            <div className="animate-spin w-8 h-8 border-4 border-focus border-t-transparent rounded-full" />
                        </div>
                    ) : (
                        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide mt-3">
                            <div className="grid grid-cols-[1.3fr_1fr_1.2fr_1.2fr_auto] gap-3 px-2 pb-2 border-b border-light text-xs uppercase tracking-wider text-primary font-semibold">
                                <span>Organization</span>
                                <span>Subdomain</span>
                                <span>Owner</span>
                                <span>Created</span>
                                <span className="text-right">Actions</span>
                            </div>

                            {organizations.length === 0 ? (
                                <div className="py-10 text-center text-tertiary italic">No organizations found.</div>
                            ) : (
                                organizations.map((organization) => (
                                    <div
                                        key={organization.id}
                                        className="grid grid-cols-[1.3fr_1fr_1.2fr_1.2fr_auto] gap-3 px-2 py-3 border-b border-light hover:bg-page rounded-lg items-center"
                                    >
                                        <div className="min-w-0">
                                            <span className="font-semibold text-primary truncate block">{organization.name}</span>
                                            <span className="text-sm text-tertiary truncate block">{organization.id}</span>
                                        </div>
                                        <span className="text-secondary truncate">{organization.subdomain}</span>
                                        <div className="min-w-0">
                                            <span className="text-secondary truncate block">{organization.ownerUsername}</span>
                                            <span className="text-sm text-tertiary truncate block">{organization.ownerEmail}</span>
                                        </div>
                                        <span className="text-sm text-tertiary">
                                            {new Date(organization.createdAt).toLocaleDateString()}
                                        </span>
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                type="button"
                                                className="p-2 rounded-lg border border-light bg-page text-secondary hover:text-primary"
                                                onClick={() => openEditModal(organization)}
                                                title="Edit organization"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                className="p-2 rounded-lg border border-light bg-page text-secondary hover:text-role-danger"
                                                onClick={() => {
                                                    void handleDeleteOrganization(organization);
                                                }}
                                                title="Delete organization"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    <div className="pt-4 mt-3 border-t border-light flex items-center justify-end gap-2">
                        <Button
                            variant="outline"
                            className="px-4 py-2"
                            disabled={!hasPrevious || isLoading}
                            onClick={() => {
                                void loadOrganizations(Math.max(0, offset - PAGE_SIZE));
                            }}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="secondary"
                            className="px-4 py-2"
                            disabled={!hasNext || isLoading}
                            onClick={() => {
                                void loadOrganizations(offset + PAGE_SIZE);
                            }}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={!!editingOrganization}
                onClose={closeEditModal}
                title="Update Organization"
                size="lg"
            >
                <form onSubmit={handleUpdateOrganization} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Name"
                            value={editName}
                            onChange={(event) => setEditName(event.target.value)}
                            required
                        />
                        <Input
                            label="Subdomain"
                            value={editSubdomain}
                            onChange={(event) => setEditSubdomain(event.target.value)}
                            required
                        />
                    </div>

                    <div className="pt-1 pb-1">
                        <div className="inline-flex items-center rounded-full border border-light bg-page px-3 py-1.5 text-sm text-secondary">
                            <Building2 className="w-4 h-4 mr-1.5" />
                            Branding (optional)
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Primary Color"
                            value={brandingPrimary}
                            onChange={(event) => setBrandingPrimary(event.target.value)}
                            placeholder="#111111"
                        />
                        <Input
                            label="Secondary Color"
                            value={brandingSecondary}
                            onChange={(event) => setBrandingSecondary(event.target.value)}
                            placeholder="#ffffff"
                        />
                    </div>

                    <Input
                        label="Logo URL"
                        value={brandingLogoUrl}
                        onChange={(event) => setBrandingLogoUrl(event.target.value)}
                        placeholder="https://..."
                    />

                    <div className="pt-2 flex items-center justify-end gap-2">
                        <Button type="button" variant="outline" onClick={closeEditModal}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="secondary" loading={isSaving}>
                            Save Changes
                        </Button>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
};

export default AdminOrganizationsPage;
