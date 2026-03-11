/**
 * HSD Arena - Organization Card Component
 * 
 * Card display for organization with access button
 */

import { useState } from 'react';
import type { UserOrganization } from '@/types';
import { Button } from '@/components';
import { organizationService } from '@/services';
import { useNavigate } from 'react-router-dom';
import { Edit2, Trash2 } from 'lucide-react';

interface OrganizationCardProps {
    organization: UserOrganization;
    onAccess: (org: UserOrganization) => void;
    onRefresh: () => void;
}

const OrganizationCard = ({ organization, onAccess, onRefresh }: OrganizationCardProps) => {
    const { id, name, subdomain, package: pkg, role } = organization;
    const { deleteOrganization } = organizationService;
    const navigate = useNavigate();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleUpdateOrganization = () => {
        navigate(`/organizations/${subdomain}/update`);
    };

    const handleDelete = async () => {
        if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

        try {
            setIsDeleting(true);
            await deleteOrganization(subdomain);
            onRefresh();
        } catch (error) {
            console.error('Failed to delete organization:', error);
            alert('Failed to delete organization');
        } finally {
            setIsDeleting(false);
        }
    };

    const roleColors = {
        SUPER_ADMIN: 'text-role-danger',
        ADMIN: 'text-role-warning',
        MANAGER: 'text-role-info',
    };

    const packageColors = {
        FREE: 'bg-page text-secondary',
        PRO: 'bg-role-secondary-light text-role-secondary',
        ENTERPRISE: 'bg-role-warning-light text-role-warning',
    };

    return (
        <div className="card hover:shadow-lg transition-all duration-200">
            {/* Header with name and package badge */}
            <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-['Titan_One',sans-serif] text-primary mb-1 truncate">{name}</h3>
                    <p className=" text-sm truncate">
                        {subdomain}.quizstrike.com.tr
                    </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase whitespace-nowrap ${packageColors[pkg]}`}>
                        {pkg}
                    </span>
                    <div>
                        <button
                            className="p-1 text-tertiary hover:text-role-primary hover:bg-role-primary-light rounded"
                            onClick={handleUpdateOrganization}
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                            className="p-1 text-tertiary hover:text-role-danger hover:bg-role-danger-light rounded disabled:opacity-50"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

            </div>

            {/* Footer with role and access button */}
            <div className="flex items-center justify-between gap-4 pt-3 border-t border-divider">
                <div className="flex items-center gap-2 min-w-0">
                    <span className="text-tertiary text-sm whitespace-nowrap">Your role:</span>
                    <span className={`font-semibold text-sm truncate ${roleColors[role]}`}>
                        {role === 'SUPER_ADMIN' ? 'Owner' : role}
                    </span>
                </div>

                <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onAccess(organization)}
                    className="whitespace-nowrap"
                >
                    Access →
                </Button>
            </div>
        </div>
    );
};

export default OrganizationCard;
