import { useState, useEffect } from 'react';
import { Button, MainLayout, SEO } from '@/components';
import { MailboxIcon, CheckCircle2, XCircle, Building2 } from 'lucide-react';
import { getMyInvitations, respondToInvitation } from '@/services/invitation.service';
import TitleHeader from '@/components/layout/TitleHeader';

interface Invitation {
    id: string;
    orgId: string;
    orgName: string;
    orgSubdomain: string;
    inviterUsername: string;
    status: string;
    createdAt: string;
}

const MyInvitationsPage = () => {
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null); // invitationId

    const fetchInvitations = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await getMyInvitations();
            if (response.success && response.data?.invitations) {
                setInvitations(response.data.invitations);
            } else {
                setError(response.message || 'Failed to fetch invitations');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred while fetching invitations');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchInvitations();
    }, []);

    const handleAction = async (invitationId: string, status: 'ACCEPTED' | 'REJECTED') => {
        setActionLoading(invitationId);
        try {
            const response = await respondToInvitation(invitationId, status);
            if (response.success) {
                // Remove the handled invitation from the list
                setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
            } else {
                alert(response.message || `Failed to ${status.toLowerCase()} invitation`);
            }
        } catch (err: any) {
            alert(err.message || 'An error occurred');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <MainLayout>
            <SEO
                title="My Invitations"
                description="View and respond to organization invitations on Quiz Strike."
                noIndex
            />
            <div className="max-w-5xl mx-auto w-full">
                <TitleHeader title='My Invitations' description='Manage pending invitations across all organizations.' />

                {error && (
                    <div className="bg-role-danger-light text-role-danger p-4 rounded-xl border border-role-danger mb-6">
                        {error}
                    </div>
                )}

                {isLoading ? (
                    <div className="bg-card border border-light rounded-xl p-12 text-center flex flex-col items-center justify-center">
                        <div className="animate-spin w-8 h-8 border-4 border-focus border-t-transparent rounded-full mb-4"></div>
                        <p className="text-tertiary">Loading your invitations...</p>
                    </div>
                ) : invitations.length > 0 ? (
                    <div className="grid gap-4">
                        {invitations.map(invitation => (
                            <div key={invitation.id} className="card border border-light rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-secondary transition-colors shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-role-primary-light rounded-xl flex items-center justify-center shrink-0">
                                        <Building2 className="w-6 h-6 text-role-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-primary">{invitation.orgName}</h3>
                                        <p>
                                            <span className="text-sm">Invited by: </span>
                                            <span className="font-bold text-primary">{invitation.inviterUsername}</span>
                                        </p>
                                        <p className="text-xs mt-1">
                                            {new Date(invitation.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    <Button
                                        onClick={() => handleAction(invitation.id, 'REJECTED')}
                                        disabled={actionLoading === invitation.id}
                                        variant="secondary"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        Reject
                                    </Button>
                                    <Button
                                        onClick={() => handleAction(invitation.id, 'ACCEPTED')}
                                        disabled={actionLoading === invitation.id}
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                        Accept
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-card border border-light rounded-xl p-12 text-center flex flex-col items-center justify-center min-h-[40vh]">
                        <div className="w-16 h-16 bg-role-primary-light rounded-full flex items-center justify-center mb-6">
                            <MailboxIcon className="w-8 h-8 text-role-primary opacity-50" />
                        </div>
                        <h2 className="text-xl font-medium text-primary mb-2">No pending invitations</h2>
                        <p className="text-tertiary max-w-md">
                            You don't have any pending invitations right now. When an organization invites you, it will appear here.
                        </p>
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default MyInvitationsPage;
