import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Trash2, Shield, Save, CheckCircle2 } from 'lucide-react';
import { useAuth, useUser } from '@/hooks';
import { Button, Input, MainLayout } from '@/components';

const ProfilePage = () => {
    const navigate = useNavigate();
    const { user: authUser, logout } = useAuth();
    const { user, isLoading, error, update, remove } = useUser(authUser?.id);

    // Form States
    const [accountData, setAccountData] = useState({
        name: '',
        email: ''
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Feedback States
    const [updateStatus, setUpdateStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });
    const [isUpdating, setIsUpdating] = useState(false);
    const [isSecurityUpdating, setIsSecurityUpdating] = useState(false);

    useEffect(() => {
        if (user) {
            setAccountData({
                name: user.username || '',
                email: user.email || ''
            });
        }
    }, [user]);

    const handleAccountUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdating(true);
        setUpdateStatus({ type: null, message: '' });

        const result = await update({
            name: accountData.name,
            email: accountData.email
        });

        if (result.success) {
            setUpdateStatus({ type: 'success', message: 'Profile updated successfully!' });
        } else {
            setUpdateStatus({ type: 'error', message: result.message || 'Failed to update profile' });
        }
        setIsUpdating(false);
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setUpdateStatus({ type: 'error', message: 'New passwords do not match' });
            return;
        }

        setIsSecurityUpdating(true);
        setUpdateStatus({ type: null, message: '' });

        const result = await update({
            password: passwordData.newPassword
        });

        if (result.success) {
            setUpdateStatus({ type: 'success', message: 'Password updated successfully!' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } else {
            setUpdateStatus({ type: 'error', message: result.message || 'Failed to update password' });
        }
        setIsSecurityUpdating(false);
    };

    const handleDeleteAccount = async () => {
        if (window.confirm('Are you sure you want to delete your account? This action is permanent and cannot be undone.')) {
            const result = await remove();
            if (result.success) {
                await logout();
                navigate('/login');
            } else {
                setUpdateStatus({ type: 'error', message: result.message || 'Failed to delete account' });
            }
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Member';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
        });
    };

    if (isLoading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-focus"></div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="max-w-5xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="mb-4 pb-2">
                    <h1 className="font-['Titan_One',sans-serif] font-thin text-4xl text-primary">Profile Settings</h1>
                    <p className="mt-1">Manage your account and preferences.</p>
                </div>

                {/* Status Message */}
                {updateStatus.type && (
                    <div className={`mb-8 p-4 rounded-lg flex items-center gap-3 border ${updateStatus.type === 'success'
                        ? 'bg-role-success-light border-role-success text-role-success'
                        : 'bg-role-danger-light border-role-danger text-role-danger'
                        }`}>
                        {updateStatus.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                        <p className="text-sm font-medium">{updateStatus.message}</p>
                    </div>
                )}

                <div className="space-y-6">
                    {/* Account Information */}
                    <section>

                        <form onSubmit={handleAccountUpdate} className="space-y-4 bg-card border border-[var(--btn-secondary-bg)] rounded-2xl p-6">
                            <h2 className="font-['Titan_One',sans-serif] font-thin text-xl text-primary flex items-center gap-2">
                                Account Information
                            </h2>
                            <div className="mb-6 flex w-full justify-between gap-6">
                                <div className="space-y-2 w-full">
                                    <label className="text-sm font-medium">Name</label>
                                    <Input
                                        type="text"
                                        className="rounded-xl border border-[var(--btn-primary-bg)] shadow-[0_6px_12px_-2px_var(--btn-primary-bg)]"
                                        value={accountData.name}
                                        onChange={(e) => setAccountData({ ...accountData, name: e.target.value })}
                                        disabled={isUpdating}
                                    />
                                </div>
                                <div className="space-y-2 w-full">
                                    <label className="text-sm font-medium">Email Address</label>
                                    <Input
                                        type="email"
                                        className="rounded-xl border border-[var(--btn-primary-bg)] shadow-[0_6px_12px_-2px_var(--btn-primary-bg)]"
                                        value={accountData.email}
                                        onChange={(e) => setAccountData({ ...accountData, email: e.target.value })}
                                        disabled={isUpdating}
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2 flex justify-end">
                                <Button
                                    variant="primary"
                                    type="submit"
                                    loading={isUpdating}
                                    className="px-6"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Changes
                                </Button>
                            </div>

                        </form>
                    </section>

                    {/* Security */}
                    <section>

                        <form onSubmit={handlePasswordUpdate} className="space-y-4 bg-card border border-[var(--btn-secondary-bg)] rounded-2xl p-6">
                            <h2 className="font-['Titan_One',sans-serif] font-thin text-xl text-primary flex items-center">
                                Security
                            </h2>
                            <div className="mb-6 flex w-full justify-between gap-6">
                                <div className="space-y-2 w-full">
                                    <label className="text-sm font-medium">New Password</label>
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        className="rounded-xl border border-[var(--btn-primary-bg)] shadow-[0_6px_12px_-2px_var(--btn-primary-bg)]"
                                        disabled={isSecurityUpdating}
                                    />
                                </div>
                                <div className="space-y-2 w-full">
                                    <label className="text-sm font-medium">Confirm Password</label>
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        className="rounded-xl border border-[var(--btn-primary-bg)] shadow-[0_6px_12px_-2px_var(--btn-primary-bg)]"
                                        disabled={isSecurityUpdating}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    loading={isSecurityUpdating}
                                    className="px-6"
                                >
                                    Update Password
                                </Button>
                            </div>
                        </form>
                    </section>

                    {/* Danger Zone */}
                    <section>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-role-danger-light border border-role-danger rounded-2xl p-6">
                            <div>
                                <h3 className="font-['Titan_One',sans-serif] font-thin text-xl font-bold text-role-danger">Danger Zone</h3>
                                <p className="text-sm font-medium text-role-danger mt-1" style={{ opacity: 0.8 }}>
                                    Deleting your account will permanently remove all your data.
                                </p>
                            </div>
                            <Button
                                onClick={handleDeleteAccount}
                                variant="danger"
                            >
                                Delete Account
                            </Button>
                        </div>
                    </section>
                </div>
            </div>
        </MainLayout>
    );
};

export default ProfilePage;
