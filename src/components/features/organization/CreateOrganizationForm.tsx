/**
 * HSD Arena - Create Organization Form Component
 */

import { useCreateOrganization } from '@/hooks';
import { Input, Button } from '@/components';

interface CreateOrganizationFormProps {
    onSuccess?: () => void;
}

const CreateOrganizationForm = ({ onSuccess }: CreateOrganizationFormProps) => {
    const {
        name,
        subdomain,
        package: pkg,
        errors,
        isLoading,
        setName,
        setSubdomain,
        setPackage,
        handleSubmit,
    } = useCreateOrganization(onSuccess);

    const packages = [
        {
            value: 'FREE' as const,
            label: 'Free',
            description: '1 organization, basic features',
            color: 'border-gray-300',
        },
        {
            value: 'PRO' as const,
            label: 'Pro',
            description: 'Up to 5 organizations, advanced features',
            color: 'border-purple-500',
        },
        {
            value: 'ENTERPRISE' as const,
            label: 'Enterprise',
            description: 'Unlimited organizations, white-label',
            color: 'border-gold-500',
        },
    ];

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {errors.general && (
                <div className="bg-role-danger-light border border-role-danger rounded-lg p-3">
                    <p className="text-sm text-role-danger">{errors.general}</p>
                </div>
            )}

            <Input
                label="Organization Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={errors.name}
                placeholder="My Company"
                disabled={isLoading}
                required
                fullWidth
            />

            <Input
                label="Subdomain"
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value.toLowerCase())}
                error={errors.subdomain}
                placeholder="mycompany"
                disabled={isLoading}
                required
                fullWidth
                helperText="Lowercase letters, numbers, and hyphens only"
                suffix=".hsdarena.com"
            />

            <div>
                <label className="block text-sm font-medium text-primary mb-3">
                    Select Package
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {packages.map((p) => (
                        <button
                            key={p.value}
                            type="button"
                            onClick={() => setPackage(p.value)}
                            disabled={isLoading}
                            className={`
                p-4 rounded-lg border-2 transition-all text-left
                ${pkg === p.value
                                    ? `${p.color} bg-opacity-10`
                                    : 'border-divider hover:border-tertiary'
                                }
                ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
                        >
                            <div className="font-bold text-primary mb-1">{p.label}</div>
                            <div className="text-xs text-secondary">{p.description}</div>
                        </button>
                    ))}
                </div>
            </div>

            <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={isLoading}
            >
                {isLoading ? 'Creating...' : 'Create Organization'}
            </Button>
        </form>
    );
};

export default CreateOrganizationForm;
