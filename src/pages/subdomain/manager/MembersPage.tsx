/**
 * HSD Arena - Members Page
 * 
 * Members page
 */

import { useNavigate } from 'react-router-dom';
import { Button, SubdomainLayout, SEO } from "@/components";
import { useMembers } from "@/hooks";
import { authService } from '@/services';
import { Trash2, UserPlus, Shield } from "lucide-react";
import { useState, useEffect } from 'react';
import TitleHeader from '@/components/layout/TitleHeader';

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




    // Function to assign a consistent colorful background base on username
    const getAvatarColor = (name: string) => {
        const colors = [
            'bg-role-warning text-inverse',
            'bg-role-primary text-inverse',
            'bg-role-danger text-inverse',
            'bg-role-success text-inverse',
            'bg-role-secondary text-inverse',
        ];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    return (
        <SubdomainLayout>
            <SEO
                title="Team Members"
                description="Manage who has access to your organization on Quiz Strike."
                noIndex
            />
            <div className="w-full flex flex-col h-full overflow-hidden">

                <TitleHeader title='Members' description='Manage who has access to this organization.' isButton buttonText='Manage Invitations' buttonIcon='+' onClick={handleInviteClick} />


                {error && (
                    <div className="bg-role-danger-light text-role-danger p-4 rounded-lg border border-role-danger italic mb-6">
                        {error}
                    </div>
                )}

                {/* Table Section */}
                <div className="flex-1 min-h-0 overflow-hidden">
                    {isLoading ? (
                        <div className="p-12 text-center text-tertiary">
                            <div className="animate-spin w-8 h-8 border-4 border-focus border-t-transparent rounded-full mx-auto mb-4"></div>
                            Loading members...
                        </div>
                    ) : (
                        <div className="w-full h-full flex flex-col overflow-hidden">
                            <div className="grid grid-cols-[1fr_auto_auto] gap-4 pb-2 border-b border-light text-sm font-bold text-primary uppercase tracking-wider">
                                <div>USER</div>
                                <div className="w-48">ROLE</div>
                                <div className="w-16 text-right">ACTIONS</div>
                            </div>

                            <div className="flex flex-col gap-0 overflow-y-auto scrollbar-hide">
                                {members.length > 0 ? members.map((member, idx) => (
                                    <div key={idx} className="grid grid-cols-[1fr_auto_auto] gap-4 items-center py-4 border-b border-light hover:bg-page transition-colors px-2 rounded-lg">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${getAvatarColor(member.username || 'U')}`}>
                                                {member.username?.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-primary text-xl leading-tight">
                                                    {member.username}
                                                </span>
                                                <span className="text-secondary text-base">
                                                    {member.email}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="w-48">
                                            {currentUser?.id === member.userId || roleHierarchy[currentUserRole as keyof typeof roleHierarchy] < roleHierarchy[member.role as keyof typeof roleHierarchy] ? (
                                                <div className="bg-card border border-light rounded-xl px-4 py-2 text-primary font-medium w-full min-w-[140px]">
                                                    {member.role === "SUPER_ADMIN" ? "Super Admin" : member.role === "ADMIN" ? "Admin" : "Manager"}
                                                </div>
                                            ) : (
                                                <select
                                                    value={member.role}
                                                    onChange={(e) => handleRoleChange(member.userId, e.target.value)}
                                                    className="bg-card border border-light rounded-xl px-4 py-2 text-primary font-medium w-full focus:ring-2 focus:ring-focus focus:border-transparent outline-none min-w-[140px]"
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

                                        <div className="w-16 flex justify-end">
                                            <button
                                                onClick={() => handleRemoveMember(member.userId, member.username)}
                                                className="p-2 text-tertiary hover:text-role-danger hover:bg-role-danger-light rounded-lg transition-colors bg-card border border-light hover:border-role-danger"
                                                title="Remove Member"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="py-12 text-center text-tertiary italic">
                                        No members found.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </SubdomainLayout>
    );
};

export default MembersPage;