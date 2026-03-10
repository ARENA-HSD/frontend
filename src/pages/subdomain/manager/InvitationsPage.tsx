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

    const getAvatarColor = (name: string) => {
        const colors = [
            'bg-role-warning text-inverse',
            'bg-role-primary text-inverse',
            'bg-role-danger text-inverse',
            'bg-role-success text-inverse',
            'bg-role-secondary text-inverse',
        ];
        let hash = 0;
        if (name) {
            for (let i = 0; i < name.length; i++) {
                hash = name.charCodeAt(i) + ((hash << 5) - hash);
            }
        }
        return colors[Math.abs(hash) % colors.length];
    };

    return (
        <SubdomainLayout>
            <SEO
                title="Invitations"
                description="Send and manage member invitations for your organization."
                noIndex
            />
            <div className="w-full flex flex-col h-full overflow-hidden p-2 lg:p-8">

                {/* Header Section */}
                <div className="flex items-center mb-8 gap-4">
                    <button
                        onClick={() => navigate('/manager/members')}
                        className="p-2 -ml-2 text-primary hover:bg-page rounded-full transition-colors flex items-center justify-center cursor-pointer active:scale-95"
                    >
                        <ArrowLeft className="w-8 h-8 stroke-[3]" />
                    </button>
                    <h1 className="text-4xl font-black text-primary">Invitations</h1>
                </div>

                {error && (
                    <div className="bg-role-danger-light text-role-danger p-4 rounded-lg border border-role-danger italic mb-6">
                        {error}
                    </div>
                )}

                {/* Invite Form */}
                <div className="mb-8">
                    <label className="text-lg font-bold text-primary block mb-3">Invite by Username</label>
                    <form onSubmit={handleSendInvite} className="flex gap-4 items-center">
                        <div className="flex-1 relative max-w-xl">
                            <input
                                type="text"
                                value={inviteUsername}
                                onChange={(e) => setInviteUsername(e.target.value)}
                                placeholder="Enter username to invite..."
                                className="w-full px-6 py-4 bg-transparent border-2 border-light focus:border-[var(--btn-primary-bg)] rounded-full outline-none transition-colors text-primary font-medium text-lg placeholder:text-tertiary"
                            />
                        </div>
                        <Button
                            variant="primary"
                            type="submit"
                            disabled={isInviting || !inviteUsername.trim()}
                            className="rounded-full font-bold px-8 py-4 text-lg hover:-translate-y-0.5 transition-transform whitespace-nowrap shadow-xl shadow-[color-mix(in_srgb,var(--btn-primary-bg),transparent_70%)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:-translate-y-0"
                        >
                            {isInviting ? 'Sending...' : 'Send Invitation'}
                        </Button>
                    </form>
                </div>

                {/* Invitations List Section */}
                <div className="flex-1 overflow-y-auto pb-8 scrollbar-hide mt-4">
                    {isLoading ? (
                        <div className="p-12 text-center text-tertiary">
                            <div className="animate-spin w-8 h-8 border-4 border-focus border-t-transparent rounded-full mx-auto mb-4"></div>
                            Loading invitations...
                        </div>
                    ) : (
                        <div className="w-full">
                            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 pb-2 border-b border-light text-sm font-bold text-primary uppercase tracking-wider mb-4">
                                <div>INVITEE</div>
                                <div className="w-40 text-left">STATUS</div>
                                <div className="w-32 text-left">SENT</div>
                                <div className="w-20 text-right">ACTIONS</div>
                            </div>

                            <div className="flex flex-col gap-0">
                                {invitations.length > 0 ? invitations.map((inv) => (
                                    <div key={inv.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center py-4 border-b border-light hover:bg-page transition-colors px-2 -mx-2 rounded-lg">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${getAvatarColor(inv.inviteeUsername || '')}`}>
                                                {(inv.inviteeUsername || 'U').substring(0, 2).toUpperCase()}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-primary text-xl leading-tight">
                                                    {inv.inviteeUsername || 'Enriching...'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="w-40 flex items-center justify-start">
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(inv.status)}
                                                <span className={`text-base font-semibold capitalize ${inv.status.toUpperCase() === 'ACCEPTED' ? 'text-emerald-500' :
                                                    inv.status.toUpperCase() === 'PENDING' ? 'text-amber-500' :
                                                        'text-red-500'
                                                    }`}>
                                                    {inv.status.toLowerCase()}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="w-32 flex items-center justify-start text-base text-secondary font-medium">
                                            {formatTimeAgo(inv.createdAt)}
                                        </div>

                                        <div className="w-20 flex justify-end">
                                            <button
                                                onClick={() => handleRemoveInvitation(inv.id)}
                                                className="p-2 text-tertiary hover:text-role-danger hover:bg-role-danger-light rounded-lg transition-colors bg-card border border-light hover:border-role-danger"
                                                title="Cancel Invitation"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="py-12 text-center text-tertiary italic">
                                        No active invitations.
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

export default InvitationsPage;