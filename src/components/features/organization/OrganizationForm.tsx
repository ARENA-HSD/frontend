import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

interface OrganizationFormProps {
    initialData?: {
        name: string;
        subdomain: string;
        branding?: {
            primary?: string;
            secondary?: string;
            logoUrl?: string;
        };
    };
    onSubmit: (data: {
        name: string;
        subdomain: string;
        branding: {
            primary: string;
            secondary: string;
            logoUrl: string
        }
    }) => Promise<void>;
    isLoading: boolean;
    error: string | null;
    title: string;
    description: string;
    submitButtonText: string;
    onCancel: () => void;
}

const OrganizationForm = ({
    initialData,
    onSubmit,
    isLoading,
    error,
    title,
    description,
    submitButtonText,
    onCancel
}: OrganizationFormProps) => {
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        subdomain: initialData?.subdomain || '',
        branding: {
            primary: initialData?.branding?.primary || '#97abf5',
            secondary: initialData?.branding?.secondary || '#ffffff',
            logoUrl: initialData?.branding?.logoUrl || '',
        }
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                subdomain: initialData.subdomain,
                branding: {
                    primary: initialData.branding?.primary || '#97abf5',
                    secondary: initialData.branding?.secondary || '#ffffff',
                    logoUrl: initialData.branding?.logoUrl || '',
                }
            });
        }
    }, [initialData]);

    const handleSubdomainChange = (value: string) => {
        const sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
        setFormData({ ...formData, subdomain: sanitized });
    };

    const handleBrandingChange = (key: string, value: string) => {
        setFormData({
            ...formData,
            branding: {
                ...formData.branding,
                [key]: value
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={onCancel}
                    className="flex items-center gap-2 text-secondary hover:text-primary mb-4 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Organizations
                </button>
                <h1 className="text-3xl font-bold text-primary">{title}</h1>
                <p className="text-secondary mt-2">
                    {description}
                </p>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-role-danger-light border border-role-danger text-role-danger px-4 py-3 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="card p-8">
                <div className="space-y-6">
                    {/* Organization Name */}
                    <div>
                        <label className="block text-sm font-semibold text-primary mb-2">
                            Organization Name *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="My Organization"
                            className="w-full border border-light rounded-lg px-4 py-3 text-lg"
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
                                value={formData.subdomain}
                                onChange={(e) => handleSubdomainChange(e.target.value)}
                                placeholder="my-org"
                                className="flex-1 border border-light rounded-l-lg px-4 py-3 text-lg"
                                required
                            />
                            <div className="bg-page border border-l-0 border-light rounded-r-lg px-4 py-3 text-tertiary">
                                .hsdarena.com
                            </div>
                        </div>
                        <p className="text-sm text-tertiary mt-1">
                            Only lowercase letters, numbers, and hyphens allowed
                        </p>
                    </div>

                    <div className="pt-4 border-t border-light">
                        <h3 className="text-lg font-semibold text-primary mb-4">Branding</h3>

                        <div className="space-y-4">
                            {/* Logo URL */}
                            <div>
                                <label className="block text-sm font-semibold text-primary mb-2">
                                    Logo URL
                                </label>
                                <input
                                    type="url"
                                    value={formData.branding.logoUrl}
                                    onChange={(e) => handleBrandingChange('logoUrl', e.target.value)}
                                    placeholder="https://example.com/logo.png"
                                    className="w-full border border-light rounded-lg px-4 py-2 text-primary"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Primary Color */}
                                <div>
                                    <label className="block text-sm font-semibold text-primary mb-2">
                                        Primary Color
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            value={formData.branding.primary}
                                            onChange={(e) => handleBrandingChange('primary', e.target.value)}
                                            className="h-10 w-12 p-1 border border-light rounded bg-card cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={formData.branding.primary}
                                            onChange={(e) => handleBrandingChange('primary', e.target.value)}
                                            className="flex-1 border border-light rounded-lg px-3 py-2 text-sm text-primary"
                                        />
                                    </div>
                                </div>

                                {/* Secondary Color */}
                                <div>
                                    <label className="block text-sm font-semibold text-primary mb-2">
                                        Secondary Color
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            value={formData.branding.secondary}
                                            onChange={(e) => handleBrandingChange('secondary', e.target.value)}
                                            className="h-10 w-12 p-1 border border-light rounded bg-card cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={formData.branding.secondary}
                                            onChange={(e) => handleBrandingChange('secondary', e.target.value)}
                                            className="flex-1 border border-light rounded-lg px-3 py-2 text-sm text-primary focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 mt-8">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isLoading}
                        className="px-6 py-2.5 bg-page text-secondary rounded-lg font-medium hover:opacity-80 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-8 py-2.5 btn-primary rounded-lg font-semibold disabled:opacity-50"
                    >
                        {isLoading ? 'Processing...' : submitButtonText}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default OrganizationForm;
