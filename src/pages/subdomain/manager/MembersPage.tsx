/**
 * HSD Arena - Members Page
 * 
 * Members page
 */

import { useNavigate } from 'react-router-dom';
import { SubdomainLayout } from "@/components";
import { useMembers } from "@/hooks";
import { Trash2, UserPlus, Shield } from "lucide-react";

const MembersPage = () => {
    const navigate = useNavigate();
    const { members, isLoading, error, changeRole, remove } = useMembers();

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
                <div className="flex items-center justify-between bg-white p-6 rounded-xl shadow-sm border border-indigo-50/50">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Members</h2>
                        <p className="text-gray-500 text-sm">Manage who has access to this organization</p>
                    </div>
                    <button
                        onClick={handleInviteClick}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
                    >
                        <UserPlus className="w-5 h-5" />
                        Manage Invitations
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-100 italic">
                        {error}
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm border border-indigo-50/50 overflow-hidden">
                    {isLoading ? (
                        <div className="p-12 text-center text-gray-500">
                            <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                            Loading members...
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-indigo-50">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-indigo-50/50">
                                {members.length > 0 ? members.map((member, idx) => (
                                    <tr key={idx} className="hover:bg-indigo-50/20 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold">
                                                    {(member as any).username?.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-900">{(member as any).username}</div>
                                                    <div className="text-sm text-gray-500">{(member as any).email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Shield className="w-4 h-4 text-indigo-500" />
                                                <select
                                                    value={member.role}
                                                    onChange={(e) => handleRoleChange((member as any).userId || member.id, e.target.value)}
                                                    className="bg-transparent border-none text-sm font-medium text-gray-700 focus:ring-0 cursor-pointer hover:text-indigo-600 p-0"
                                                >
                                                    <option value="MANAGER">Manager</option>
                                                    <option value="ADMIN">Admin</option>
                                                    <option value="SUPER_ADMIN">Super Admin</option>
                                                </select>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <button
                                                onClick={() => handleRemoveMember((member as any).userId || member.id, (member as any).username)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Remove Member"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-12 text-center text-gray-500 italic">
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