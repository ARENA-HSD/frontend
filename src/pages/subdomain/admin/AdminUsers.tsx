import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pencil, Trash2, Search, ShieldCheck } from 'lucide-react';
import { AdminLayout } from '@/components/layout';
import { Button, Input, Modal, SEO, TitleHeader } from '@/components';
import { useSubdomain } from '@/hooks';
import { NotFoundPage } from '@/pages';
import { adminService } from '@/services';
import { getAdminErrorMessage, type AdminUser } from '@/services/admin.service';

const PAGE_SIZE = 20;

type StatusType = 'success' | 'error' | null;

const AdminUsersPage = () => {
    const subdomain = useSubdomain();

    const [users, setUsers] = useState<AdminUser[]>([]);
    const [total, setTotal] = useState(0);
    const [offset, setOffset] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const [searchInput, setSearchInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const [statusMessage, setStatusMessage] = useState('');
    const [statusType, setStatusType] = useState<StatusType>(null);

    const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
    const [editUsername, setEditUsername] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [editRole, setEditRole] = useState<'USER' | 'WEB_ADMIN'>('USER');
    const [isSaving, setIsSaving] = useState(false);

    const currentPage = Math.floor(offset / PAGE_SIZE) + 1;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    const hasPrevious = offset > 0;
    const hasNext = offset + PAGE_SIZE < total;

    const pageMetaText = useMemo(() => {
        if (total === 0) {
            return 'No users found.';
        }

        const start = offset + 1;
        const end = Math.min(offset + users.length, total);
        return `${start}-${end} of ${total} users`;
    }, [offset, total, users.length]);

    const showStatus = (message: string, type: Exclude<StatusType, null>) => {
        setStatusMessage(message);
        setStatusType(type);
    };

    const loadUsers = useCallback(async (nextOffset = 0, query = '') => {
        setIsLoading(true);

        try {
            const response = query.trim()
                ? await adminService.searchAdminUsers(query.trim(), {
                    limit: PAGE_SIZE,
                    offset: nextOffset,
                })
                : await adminService.getAdminUsers({
                    limit: PAGE_SIZE,
                    offset: nextOffset,
                });

            setUsers(response.data.users);
            setTotal(response.data.total);
            setOffset(nextOffset);
        } catch (error) {
            showStatus(getAdminErrorMessage(error), 'error');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadUsers(0, '');
    }, [loadUsers]);

    if (subdomain !== 'admin') {
        return <NotFoundPage />;
    }

    const handleSearchSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSearchQuery(searchInput);
        await loadUsers(0, searchInput);
    };

    const handleClearSearch = async () => {
        setSearchInput('');
        setSearchQuery('');
        await loadUsers(0, '');
    };

    const openEditModal = (user: AdminUser) => {
        setEditingUser(user);
        setEditUsername(user.username);
        setEditEmail(user.email);
        setEditRole(user.role);
    };

    const closeEditModal = () => {
        setEditingUser(null);
        setEditUsername('');
        setEditEmail('');
        setEditRole('USER');
    };

    const handleUpdateUser = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!editingUser) return;

        setIsSaving(true);

        try {
            await adminService.updateAdminUser(editingUser.id, {
                username: editUsername.trim(),
                email: editEmail.trim(),
                role: editRole,
            });

            closeEditModal();
            showStatus('User updated successfully.', 'success');
            await loadUsers(offset, searchQuery);
        } catch (error) {
            showStatus(getAdminErrorMessage(error), 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteUser = async (user: AdminUser) => {
        const isConfirmed = window.confirm(`Delete user ${user.username}?`);
        if (!isConfirmed) {
            return;
        }

        try {
            await adminService.deleteAdminUser(user.id);
            showStatus('User deleted successfully.', 'success');

            const nextOffset = users.length === 1 && offset > 0
                ? Math.max(0, offset - PAGE_SIZE)
                : offset;

            await loadUsers(nextOffset, searchQuery);
        } catch (error) {
            showStatus(getAdminErrorMessage(error), 'error');
        }
    };

    return (
        <AdminLayout>
            <SEO
                title="Admin Users"
                description="Search, edit and delete users as web admin."
                noIndex
            />

            <div className="w-full h-full flex flex-col overflow-hidden">
                <TitleHeader
                    title="Admin Users"
                    description="Search, edit role and manage user accounts platform-wide."
                />

                <form onSubmit={handleSearchSubmit} className="mb-4 grid grid-cols-1 lg:grid-cols-[1fr_auto_auto] gap-3">
                    <Input
                        value={searchInput}
                        onChange={(event) => setSearchInput(event.target.value)}
                        placeholder="Search by username or email"
                        className="px-4 py-2.5"
                    />
                    <Button type="submit" variant="secondary" className="px-5 py-2.5 font-semibold">
                        <Search className="w-4 h-4 mr-2" />
                        Search
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        className="px-5 py-2.5 font-semibold"
                        onClick={() => {
                            void handleClearSearch();
                        }}
                        disabled={!searchInput.trim() && !searchQuery.trim()}
                    >
                        Clear
                    </Button>
                </form>

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
                            <div className="grid grid-cols-[1.2fr_1.6fr_auto_auto_auto] gap-3 px-2 pb-2 border-b border-light text-xs uppercase tracking-wider text-primary font-semibold">
                                <span>Username</span>
                                <span>Email</span>
                                <span>Role</span>
                                <span>Created</span>
                                <span className="text-right">Actions</span>
                            </div>

                            {users.length === 0 ? (
                                <div className="py-10 text-center text-tertiary italic">No users found.</div>
                            ) : (
                                users.map((user) => (
                                    <div
                                        key={user.id}
                                        className="grid grid-cols-[1.2fr_1.6fr_auto_auto_auto] gap-3 px-2 py-3 border-b border-light hover:bg-page rounded-lg items-center"
                                    >
                                        <span className="font-semibold text-primary truncate">{user.username}</span>
                                        <span className="text-secondary truncate">{user.email}</span>
                                        <span className="inline-flex items-center rounded-full bg-page border border-light px-3 py-1 text-xs font-semibold text-primary">
                                            <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                                            {user.role}
                                        </span>
                                        <span className="text-sm text-tertiary">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </span>
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                type="button"
                                                className="p-2 rounded-lg border border-light bg-page text-secondary hover:text-primary"
                                                onClick={() => openEditModal(user)}
                                                title="Edit user"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                className="p-2 rounded-lg border border-light bg-page text-secondary hover:text-role-danger"
                                                onClick={() => {
                                                    void handleDeleteUser(user);
                                                }}
                                                title="Delete user"
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
                                void loadUsers(Math.max(0, offset - PAGE_SIZE), searchQuery);
                            }}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="secondary"
                            className="px-4 py-2"
                            disabled={!hasNext || isLoading}
                            onClick={() => {
                                void loadUsers(offset + PAGE_SIZE, searchQuery);
                            }}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={!!editingUser}
                onClose={closeEditModal}
                title="Update User"
                size="md"
            >
                <form onSubmit={handleUpdateUser} className="space-y-4">
                    <Input
                        label="Username"
                        value={editUsername}
                        onChange={(event) => setEditUsername(event.target.value)}
                        required
                    />
                    <Input
                        label="Email"
                        value={editEmail}
                        onChange={(event) => setEditEmail(event.target.value)}
                        type="email"
                        required
                    />

                    <div className="flex flex-col gap-2">
                        <label className="text-primary text-md font-medium">Role</label>
                        <select
                            className="w-full px-4 py-2 rounded-full border border-divider bg-input text-primary focus:outline-none focus:ring-2 focus:ring-role-primary"
                            value={editRole}
                            onChange={(event) => setEditRole(event.target.value as 'USER' | 'WEB_ADMIN')}
                        >
                            <option value="USER">USER</option>
                            <option value="WEB_ADMIN">WEB_ADMIN</option>
                        </select>
                    </div>

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

export default AdminUsersPage;
