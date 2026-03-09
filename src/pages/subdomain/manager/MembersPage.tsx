/**
 * HSD Arena - Members Page
 * 
 * Members page
 */

import { useNavigate } from 'react-router-dom';
import { Button, SubdomainLayout } from "@/components";
import { useMembers } from "@/hooks";
import { authService } from '@/services';
import { Trash2, UserPlus, Shield } from "lucide-react";
import { useState, useEffect } from 'react';

const MembersPage = () => {
    const navigate = useNavigate();
    const { members, isLoading, error, changeRole, remove } = useMembers();
    const currentUser = authService.getCurrentUser();
    const [currentUserRole, setCurrentUserRole] = useState("MANAGER");
    const roleHierarchy = {
        "SUPER_ADMIN": 3,
        "ADMIN": 2,
        "MANAGER": 1
    };

    useEffect(() => {
        if (currentUser) {
            members.forEach((member) => {
                if (member.userId === currentUser.id) {
                    setCurrentUserRole(member.role);
                }
            });
        }
    }, [currentUser]);

    const handleInviteClick = () => {
        navigate('/manager/invitations');
    };

    const handleRoleChange = async (memberId: string, newRole: string) => {
        const result = await changeRole(memberId, newRole);
        if (!result.success) {
            alert(result.message || 'Failed to update role');
        }
    };

    const handleRemoveMember = async (memberId: string, username: string) => {
        if (confirm(`Are you sure you want to remove ${username} from this organization?`)) {
            const result = await remove(memberId);
            if (!result.success) {
                alert(result.message || 'Failed to remove member');
            }
        }
    };




    return (
        <SubdomainLayout>
            <div className="flex-1 space-y-6 overflow-auto p-4">
                <div className="flex items-center justify-between bg-card p-6 rounded-xl shadow-sm border border-light">
                    <div>
                        <h2 className="text-2xl font-bold text-primary">Members</h2>
                        <p className="text-tertiary text-sm">Manage who has access to this organization</p>
                    </div>
                    <Button
                        onClick={handleInviteClick}
                        variant="primary"
                    >
                        <UserPlus className="w-5 h-5" />
                        Manage Invitations
                    </Button>
                </div>

                {error && (
                    <div className="bg-role-danger-light text-role-danger p-4 rounded-lg border border-role-danger italic">
                        {error}
                    </div>
                )}

                <div className="bg-card rounded-xl shadow-sm border border-light overflow-hidden">
                    {isLoading ? (
                        <div className="p-12 text-center text-tertiary">
                            <div className="animate-spin w-8 h-8 border-4 border-focus border-t-transparent rounded-full mx-auto mb-4"></div>
                            Loading members...
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-page border-b border-light">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-tertiary uppercase tracking-wider">User</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-tertiary uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-light">
                                {members.length > 0 ? members.map((member, idx) => (
                                    <tr key={idx} className="hover:bg-role-primary-light/20 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-role-primary-light text-role-primary rounded-full flex items-center justify-center font-bold">
                                                    {member.username?.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-primary">{member.username}</div>
                                                    <div className="text-sm text-tertiary">{member.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Shield className="w-4 h-4 text-role-primary" />
                                                {currentUser?.id === member.userId || roleHierarchy[currentUserRole] < roleHierarchy[member.role] ? (
                                                    <div className="bg-transparent border-none text-sm font-medium text-secondary focus:ring-0 cursor-pointer hover:text-role-primary p-0">
                                                        {member.role === "SUPER_ADMIN" ? (
                                                            <span>Super Admin</span>
                                                        ) : member.role === "ADMIN" ? (
                                                            <span>Admin</span>
                                                        ) : (
                                                            <span>Manager</span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <select
                                                        value={member.role}
                                                        onChange={(e) => handleRoleChange(member.userId, e.target.value)}
                                                        className="bg-transparent border-none text-sm font-medium text-secondary focus:ring-0 cursor-pointer hover:text-role-primary p-0"
                                                    >
                                                        {currentUserRole === "SUPER_ADMIN" ? (
                                                            <>
                                                                <option value="SUPER_ADMIN">Super Admin</option>
                                                                <option value="ADMIN">Admin</option>
                                                                <option value="MANAGER">Manager</option>
                                                            </>
                                                        ) : currentUserRole === "ADMIN" ? (
                                                            <>
                                                                <option value="ADMIN">Admin</option>
                                                                <option value="MANAGER">Manager</option>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <option value="MANAGER">Manager</option>
                                                            </>
                                                        )}
                                                    </select>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <button
                                                onClick={() => handleRemoveMember(member.userId, member.username)}
                                                className="p-2 text-tertiary hover:text-role-danger hover:bg-role-danger-light rounded-lg transition-colors"
                                                title="Remove Member"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>


                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-12 text-center text-tertiary italic">
                                            No members found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </SubdomainLayout>
    );
};

export default MembersPage;