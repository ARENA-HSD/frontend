import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Trash2, Shield, Save, CheckCircle2 } from 'lucide-react';
import { useAuth, useUser } from '@/hooks';
import { Button, MainLayout } from '@/components';

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
                <div className="mb-4 border-b border-light pb-2">
                    <h1 className="text-2xl font-semibold text-primary">Profile Settings</h1>
                    <p className="text-tertiary mt-1">Manage your account and preferences.</p>
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

                <div className="space-y-12">
                    {/* Account Information */}
                    <section>
                        <div className="mb-6">
                            <h2 className="text-lg font-medium text-primary flex items-center gap-2">
                                <User className="w-4 h-4 text-tertiary" />
                                Account Information
                            </h2>
                        </div>

                        <form onSubmit={handleAccountUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-card border border-light rounded-xl p-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-secondary">name</label>
                                <input
                                    type="text"
                                    value={accountData.name}
                                    onChange={(e) => setAccountData({ ...accountData, name: e.target.value })}
                                    className="w-full bg-page border border-light rounded-lg px-4 py-2 text-primary outline-none transition-all"
                                    disabled={isUpdating}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-secondary">Email Address</label>
                                <input
                                    type="email"
                                    value={accountData.email}
                                    onChange={(e) => setAccountData({ ...accountData, email: e.target.value })}
                                    className="w-full bg-page border border-light rounded-lg px-4 py-2 text-primary focus:ring-2 focus:ring-focus outline-none transition-all"
                                    disabled={isUpdating}
                                />
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
                        <div className="mb-6">
                            <h2 className="text-lg font-medium text-primary flex items-center gap-2">
                                <Lock className="w-4 h-4 text-tertiary" />
                                Security
                            </h2>
                        </div>

                        <form onSubmit={handlePasswordUpdate} className="space-y-6 bg-card border border-light rounded-xl p-6 max-w-xl">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-secondary">New Password</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    className="w-full bg-page border border-light rounded-lg px-4 py-2 text-primary focus:ring-2 focus:ring-focus outline-none transition-all"
                                    disabled={isSecurityUpdating}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-secondary">Confirm Password</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    className="w-full bg-page border border-light rounded-lg px-4 py-2 text-primary focus:ring-2 focus:ring-focus outline-none transition-all"
                                    disabled={isSecurityUpdating}
                                />
                            </div>
                            <div className="flex justify-end">
                                <Button
                                    variant="outline"
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
                    <section className="pt-8 border-t border-light">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-role-danger-light border border-role-danger rounded-xl p-6">
                            <div>
                                <h3 className="text-lg font-medium text-role-danger">Danger Zone</h3>
                                <p className="text-sm text-role-danger mt-1" style={{ opacity: 0.8 }}>
                                    Deleting your account will permanently remove all your data.
                                </p>
                            </div>
                            <button
                                onClick={handleDeleteAccount}
                                className="px-6 py-2 btn-danger rounded-lg font-medium transition-colors shadow-sm"
                            >
                                Delete Account
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </MainLayout>
    );
};

export default ProfilePage;
