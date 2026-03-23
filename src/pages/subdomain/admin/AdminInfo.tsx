import { useEffect, useState } from 'react';
import { Users, Building2, ClipboardList } from 'lucide-react';
import { NotFoundPage } from '@/pages';
import { AdminLayout } from '@/components/layout';
import { SEO, TitleHeader } from '@/components';
import { useSubdomain } from '@/hooks';
import { adminService } from '@/services';
import { getAdminErrorMessage } from '@/services/admin.service';

const AdminPage = () => {
    const subdomain = useSubdomain();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState({ userCount: 0, organizationCount: 0, quizCount: 0 });

    const loadStats = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await adminService.getAdminInfo();
            setStats(response.data);
        } catch (err) {
            setError(getAdminErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void loadStats();
    }, []);

    if (subdomain !== 'admin') {
        return <NotFoundPage />;
    }

    return (
        <AdminLayout>
            <SEO
                title="Admin Info"
                description="Web admin dashboard with platform user and organization metrics."
                noIndex
            />

            <div className="w-full h-full flex flex-col overflow-hidden">
                <TitleHeader
                    title="Admin Info"
                    description="Platform-wide user and organization summary."
                />

                {error && (
                    <div className="mb-6 rounded-lg border border-role-danger bg-role-danger-light p-4 text-role-danger italic">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <section className="rounded-2xl border border-light bg-card p-6 shadow-sm">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm uppercase tracking-wider text-tertiary font-semibold">Users</p>
                                <h2 className="mt-3 text-4xl font-black text-primary">
                                    {isLoading ? '...' : stats.userCount}
                                </h2>
                                <p className="mt-2 text-secondary">Total registered users in the system.</p>
                            </div>
                            <div className="rounded-full bg-page p-3 border border-light">
                                <Users className="w-6 h-6 text-primary" />
                            </div>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-light bg-card p-6 shadow-sm">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm uppercase tracking-wider text-tertiary font-semibold">Organizations</p>
                                <h2 className="mt-3 text-4xl font-black text-primary">
                                    {isLoading ? '...' : stats.organizationCount}
                                </h2>
                                <p className="mt-2 text-secondary">Total organizations created on the platform.</p>
                            </div>
                            <div className="rounded-full bg-page p-3 border border-light">
                                <Building2 className="w-6 h-6 text-primary" />
                            </div>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-light bg-card p-6 shadow-sm">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm uppercase tracking-wider text-tertiary font-semibold">Quizzes</p>
                                <h2 className="mt-3 text-4xl font-black text-primary">
                                    {isLoading ? '...' : stats.quizCount}
                                </h2>
                                <p className="mt-2 text-secondary">Total quizzes created across all organizations.</p>
                            </div>
                            <div className="rounded-full bg-page p-3 border border-light">
                                <ClipboardList className="w-6 h-6 text-primary" />
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminPage;
