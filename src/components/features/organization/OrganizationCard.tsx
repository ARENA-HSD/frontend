/**
 * HSD Arena - Organization Card Component
 * 
 * Card display for organization with access button
 */

import type { UserOrganization } from '@/types';
import { Button } from '@/components';

interface OrganizationCardProps {
    organization: UserOrganization;
    onAccess: (org: UserOrganization) => void;
}

const OrganizationCard = ({ organization, onAccess }: OrganizationCardProps) => {
    const { name, subdomain, package: pkg, role } = organization;

    const roleColors = {
        SUPER_ADMIN: 'text-role-danger',
        ADMIN: 'text-role-warning',
        MANAGER: 'text-role-info',
    };

    const packageColors = {
        FREE: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
        PRO: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
        ENTERPRISE: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    };

    return (
        <div className="card hover:shadow-lg transition-all duration-200">
            {/* Header with name and package badge */}
            <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-primary mb-1 truncate">{name}</h3>
                    <p className="text-secondary text-sm truncate">
                        {subdomain}.hsdarena.com
                    </p>
                </div>

                <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase whitespace-nowrap ${packageColors[pkg]}`}>
                    {pkg}
                </span>
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
