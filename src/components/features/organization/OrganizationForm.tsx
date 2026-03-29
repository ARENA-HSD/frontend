import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui';
import { MEDIA_UPLOAD_CONSTRAINTS } from '@/lib/constants';

const FRONTEND_MEDIA_TYPE_ERROR = 'Sadece jpeg, png, webp veya gif görseller yüklenebilir.';
const FRONTEND_MEDIA_SIZE_ERROR = 'Görsel boyutu en fazla 3 MB olabilir.';

type LogoAction = 'unchanged' | 'new' | 'remove';

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
            logoUrl?: string;
            logoBase64?: string;
        };
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
        }
    });
    const [logoPreview, setLogoPreview] = useState(initialData?.branding?.logoUrl || '');
    const [logoAction, setLogoAction] = useState<LogoAction>('unchanged');
    const [logoBase64, setLogoBase64] = useState('');
    const [logoError, setLogoError] = useState<string | null>(null);
    const [isPreparingLogo, setIsPreparingLogo] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                subdomain: initialData.subdomain,
                branding: {
                    primary: initialData.branding?.primary || '#97abf5',
                    secondary: initialData.branding?.secondary || '#ffffff',
                }
            });
            setLogoPreview(initialData.branding?.logoUrl || '');
            setLogoAction('unchanged');
            setLogoBase64('');
            setLogoError(null);
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

    const readFileAsDataURL = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = () => {
                if (typeof reader.result === 'string') {
                    resolve(reader.result);
                    return;
                }
                reject(new Error('Invalid file content'));
            };

            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    };

    const handleLogoFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        setLogoError(null);

        if (!MEDIA_UPLOAD_CONSTRAINTS.ALLOWED_MIME_TYPES.includes(file.type as (typeof MEDIA_UPLOAD_CONSTRAINTS.ALLOWED_MIME_TYPES)[number])) {
            setLogoError(FRONTEND_MEDIA_TYPE_ERROR);
            event.target.value = '';
            return;
        }

        if (file.size > MEDIA_UPLOAD_CONSTRAINTS.MAX_IMAGE_SIZE_BYTES) {
            setLogoError(FRONTEND_MEDIA_SIZE_ERROR);
            event.target.value = '';
            return;
        }

        setIsPreparingLogo(true);

        try {
            const dataURL = await readFileAsDataURL(file);
            setLogoPreview(dataURL);
            setLogoBase64(dataURL);
            setLogoAction('new');
        } catch (error) {
            console.error('Failed to prepare logo:', error);
            setLogoError('Görsel dosyası okunamadı. Lütfen tekrar deneyin.');
        } finally {
            setIsPreparingLogo(false);
            event.target.value = '';
        }
    };

    const handleRemoveLogo = () => {
        setLogoPreview('');
        setLogoBase64('');
        setLogoAction('remove');
        setLogoError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (logoError) {
            return;
        }

        const payload: {
            name: string;
            subdomain: string;
            branding: {
                primary: string;
                secondary: string;
                logoUrl?: string;
                logoBase64?: string;
            };
        } = {
            name: formData.name,
            subdomain: formData.subdomain,
            branding: {
                primary: formData.branding.primary,
                secondary: formData.branding.secondary,
            },
        };

        if (logoAction === 'new' && logoBase64) {
            payload.branding.logoBase64 = logoBase64;
        }

        if (logoAction === 'remove' && initialData?.branding?.logoUrl) {
            payload.branding.logoUrl = '';
        }

        await onSubmit(payload);
        setLogoBase64('');
        if (logoAction === 'new') {
            setLogoAction('unchanged');
        }
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
                                .quizstrike.com.tr
                            </div>
                        </div>
                        <p className="text-sm text-tertiary mt-1">
                            Only lowercase letters, numbers, and hyphens allowed
                        </p>
                    </div>

                    <div className="pt-4 border-t border-light">
                        <h3 className="text-lg font-semibold text-primary mb-4">Branding</h3>

                        <div className="space-y-4">
                            {/* Logo Upload */}
                            <div>
                                <label className="block text-sm font-semibold text-primary mb-2">
                                    Logo
                                </label>
                                {logoPreview && (
                                    <div className="mb-3 w-24 h-24 border border-light rounded-lg overflow-hidden bg-page">
                                        <img src={logoPreview} alt="Organization logo preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                    <input
                                        type="file"
                                        accept={MEDIA_UPLOAD_CONSTRAINTS.ALLOWED_MIME_TYPES.join(',')}
                                        onChange={(event) => {
                                            void handleLogoFileChange(event);
                                        }}
                                        disabled={isPreparingLogo || isLoading}
                                        className="w-full border border-light rounded-lg px-4 py-2 text-primary"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleRemoveLogo}
                                        disabled={isPreparingLogo || isLoading || (!logoPreview && !initialData?.branding?.logoUrl)}
                                        className="whitespace-nowrap"
                                    >
                                        Remove logo
                                    </Button>
                                </div>
                                <p className="text-sm text-tertiary mt-2">
                                    Maksimum {MEDIA_UPLOAD_CONSTRAINTS.MAX_IMAGE_SIZE_MB} MB. Desteklenen formatlar: jpeg, png, webp, gif.
                                </p>
                                {isPreparingLogo && (
                                    <p className="text-sm text-secondary mt-1">Görsel hazırlanıyor...</p>
                                )}
                                {logoError && (
                                    <p className="text-sm text-role-danger mt-1">{logoError}</p>
                                )}
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
                    <Button
                        type="button"
                        onClick={onCancel}
                        disabled={isLoading}
                        variant="secondary"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isLoading}
                        variant="primary"
                    >
                        {isLoading ? 'Processing...' : submitButtonText}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default OrganizationForm;
