/**
 * HSD Arena - Invitations Page
 * 
 * Page for inviting new members and managing pending invitations
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SubdomainLayout } from "@/components";
import { useInvitations } from "@/hooks";
import { UserPlus, ArrowLeft, Trash2, Clock, CheckCircle, XCircle, Calendar } from "lucide-react";
import { formatTimeAgo } from '@/lib/timeUtils';

const InvitationsPage = () => {
    const navigate = useNavigate();
    const { invitations, isLoading, error, invite, remove, updateStatus } = useInvitations();
    const [inviteUsername, setInviteUsername] = useState('');
    const [isInviting, setIsInviting] = useState(false);

    const handleSendInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteUsername.trim()) return;

        setIsInviting(true);
        const result = await invite(inviteUsername);
        setIsInviting(false);

        if (result.success) {
            setInviteUsername('');
            alert('Invitation sent successfully!');
        } else {
            alert(result.message || 'Failed to send invitation');
        }
    };

    const handleRemoveInvitation = async (id: string) => {
        if (confirm('Cancel this invitation?')) {
            const result = await remove(id);
            if (!result.success) alert(result.message || 'Failed to cancel invitation');
        }
    };

    const handleStatusUpdate = async (id: string, status: string) => {
        const result = await updateStatus(id, status);
        if (!result.success) alert(result.message || 'Failed to update status');
    };

    const getStatusIcon = (status: string) => {
        switch (status.toUpperCase()) {
            case 'PENDING': return <Clock className="w-4 h-4 text-amber-500" />;
            case 'ACCEPTED': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
            case 'REJECTED': return <XCircle className="w-4 h-4 text-red-500" />;
            default: return null;
        }
    };

    return (
        <SubdomainLayout>
            <div className="flex-1 space-y-6 overflow-auto p-4">
                {/* Header */}
                <div className="flex items-center justify-between bg-white p-6 rounded-xl shadow-sm border border-indigo-50/50">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/manager/members')}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Invitations</h2>
                            <p className="text-gray-500 text-sm">Send and manage member invitations</p>
                        </div>
                    </div>
                </div>

                {/* Invite Form */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-50/50">
                    <form onSubmit={handleSendInvite} className="flex gap-4 items-end">
                        <div className="flex-1 space-y-2">
                            <label className="text-sm font-semibold text-gray-600 block">Invite by Username</label>
                            <div className="relative">
                                <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={inviteUsername}
                                    onChange={(e) => setInviteUsername(e.target.value)}
                                    placeholder="Enter username to invite..."
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={isInviting || !inviteUsername.trim()}
                            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white px-6 py-2 rounded-lg font-bold transition-all shadow-md active:scale-95"
                        >
                            {isInviting ? 'Sending...' : 'Send Invitation'}
                        </button>
                    </form>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-100 italic">
                        {error}
                    </div>
                )}

                {/* Invitations List */}
                <div className="bg-white rounded-xl shadow-sm border border-indigo-50/50 overflow-hidden">
                    {isLoading ? (
                        <div className="p-12 text-center text-gray-500">
                            <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                            Loading invitations...
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-indigo-50">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Invitee</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Sent</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-indigo-50/50">
                                {invitations.length > 0 ? invitations.map((inv) => (
                                    <tr key={inv.id} className="hover:bg-indigo-50/20 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-semibold text-gray-900">{inv.inviteeUsername || 'Enriching...'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(inv.status)}
                                                <span className="text-sm font-medium capitalize">{inv.status.toLowerCase()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <Calendar className="w-4 h-4" />
                                                {formatTimeAgo(inv.createdAt)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            {inv.status === 'PENDING' && (
                                                <button
                                                    onClick={() => handleRemoveInvitation(inv.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Cancel Invitation"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500 italic">
                                            No active invitations.
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

export default InvitationsPage;
