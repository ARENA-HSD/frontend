/**
 * HSD Arena - Invitations Page
 * 
 * Page for inviting new members and managing pending invitations
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, SubdomainLayout, SEO } from "@/components";
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
            <SEO
                title="Invitations"
                description="Send and manage member invitations for your organization."
                noIndex
            />
            <div className="flex-1 space-y-6 overflow-auto p-4">
                {/* Header */}
                <div className="flex items-center justify-between bg-card p-6 rounded-xl shadow-sm border border-light">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/manager/members')}
                            className="p-2 text-tertiary hover:text-secondary hover:bg-page rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <div>
                            <h2 className="text-2xl font-bold text-primary">Invitations</h2>
                            <p className="text-tertiary text-sm">Send and manage member invitations</p>
                        </div>
                    </div>
                </div>

                {/* Invite Form */}
                <div className="bg-card p-6 rounded-xl shadow-sm border border-light">
                    <form onSubmit={handleSendInvite} className="flex gap-4 items-end">
                        <div className="flex-1 space-y-2">
                            <label className="text-sm font-semibold text-secondary block">Invite by Username</label>
                            <div className="relative">
                                <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiary" />
                                <input
                                    type="text"
                                    value={inviteUsername}
                                    onChange={(e) => setInviteUsername(e.target.value)}
                                    placeholder="Enter username to invite..."
                                    className="w-full pl-10 pr-4 py-2 bg-page border border-light rounded-lg outline-none transition-all"
                                />
                            </div>
                        </div>
                        <Button
                            type="submit"
                            disabled={isInviting || !inviteUsername.trim()}
                            variant="primary"
                        >
                            {isInviting ? 'Sending...' : 'Send Invitation'}
                        </Button>
                    </form>
                </div>

                {error && (
                    <div className="bg-role-danger-light text-role-danger p-4 rounded-lg border border-role-danger italic">
                        {error}
                    </div>
                )}

                {/* Invitations List */}
                <div className="bg-card rounded-xl shadow-sm border border-light overflow-hidden">
                    {isLoading ? (
                        <div className="p-12 text-center text-tertiary">
                            <div className="animate-spin w-8 h-8 border-4 border-focus border-t-transparent rounded-full mx-auto mb-4"></div>
                            Loading invitations...
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-page border-b border-light">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-tertiary uppercase tracking-wider">Invitee</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-tertiary uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-tertiary uppercase tracking-wider">Sent</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-light">
                                {invitations.length > 0 ? invitations.map((inv) => (
                                    <tr key={inv.id} className="hover:bg-role-primary-light/20 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-semibold text-primary">{inv.inviteeUsername || 'Enriching...'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(inv.status)}
                                                <span className="text-sm font-medium capitalize">{inv.status.toLowerCase()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-sm text-tertiary">
                                                <Calendar className="w-4 h-4" />
                                                {formatTimeAgo(inv.createdAt)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            {inv.status === 'PENDING' && (
                                                <button
                                                    onClick={() => handleRemoveInvitation(inv.id)}
                                                    className="p-2 text-tertiary hover:text-role-danger hover:bg-role-danger-light rounded-lg transition-colors"
                                                    title="Cancel Invitation"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-tertiary italic">
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