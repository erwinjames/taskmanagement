import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';

interface Invitation {
    id: number;
    admin: {
        name: string;
    };
    email: string;
    created_at: string;
}

interface AdminAssignmentRequest {
    id: number;
    user: {
        name: string;
        email: string;
    };
    created_at: string;
}

export function NotificationBell() {
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [assignmentRequests, setAssignmentRequests] = useState<AdminAssignmentRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<AdminAssignmentRequest | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const [invitationsRes, requestsRes] = await Promise.all([
                axios.get(route('team.invitations')),
                axios.get(route('admin.assignment-requests')),
            ]);
            setInvitations(invitationsRes.data);
            setAssignmentRequests(requestsRes.data);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    const handleAcceptInvitation = async (invitationId: number) => {
        setLoading(true);
        try {
            await router.post(route('team.invitations.accept', invitationId), {}, {
                onSuccess: () => {
                    fetchNotifications();
                },
                onFinish: () => setLoading(false),
            });
        } catch (error) {
            setLoading(false);
        }
    };

    const handleRejectInvitation = async (invitationId: number) => {
        setLoading(true);
        try {
            await router.post(route('team.invitations.reject', invitationId), {}, {
                onSuccess: () => {
                    fetchNotifications();
                },
                onFinish: () => setLoading(false),
            });
        } catch (error) {
            setLoading(false);
        }
    };

    const handleOpenRequestModal = (request: AdminAssignmentRequest) => {
        setSelectedRequest(request);
        setShowConfirmModal(true);
    };

    const handleApproveRequest = async () => {
        if (!selectedRequest) return;

        setLoading(true);
        try {
            await router.post(route('admin.assignment-requests.approve', selectedRequest.id), {}, {
                onSuccess: () => {
                    fetchNotifications();
                    setShowConfirmModal(false);
                    setSelectedRequest(null);
                },
                onFinish: () => setLoading(false),
            });
        } catch (error) {
            setLoading(false);
        }
    };

    const handleRejectRequest = async () => {
        if (!selectedRequest) return;

        setLoading(true);
        try {
            await router.post(route('admin.assignment-requests.reject', selectedRequest.id), {}, {
                onSuccess: () => {
                    fetchNotifications();
                    setShowConfirmModal(false);
                    setSelectedRequest(null);
                },
                onFinish: () => setLoading(false),
            });
        } catch (error) {
            setLoading(false);
        }
    };

    const totalNotifications = invitations.length + assignmentRequests.length;

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                        <Bell className="h-5 w-5" />
                        {totalNotifications > 0 && (
                            <Badge
                                variant="destructive"
                                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                            >
                                {totalNotifications}
                            </Badge>
                        )}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                    <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {totalNotifications === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            No new notifications
                        </div>
                    ) : (
                        <>
                            {invitations.map((invitation) => (
                                <div key={`inv-${invitation.id}`} className="p-3 border-b last:border-0">
                                    <p className="text-sm font-medium mb-1">
                                        Team Invitation from {invitation.admin.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground mb-2">
                                        You've been invited to join their team
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            onClick={() => handleAcceptInvitation(invitation.id)}
                                            disabled={loading}
                                            className="flex-1"
                                        >
                                            Accept
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleRejectInvitation(invitation.id)}
                                            disabled={loading}
                                            className="flex-1"
                                        >
                                            Reject
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {assignmentRequests.map((request) => (
                                <div
                                    key={`req-${request.id}`}
                                    className="p-3 border-b last:border-0 hover:bg-muted/50 cursor-pointer transition-colors"
                                    onClick={() => handleOpenRequestModal(request)}
                                >
                                    <p className="text-sm font-medium mb-1">
                                        Admin Assignment Request
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {request.user.name} wants you as their admin
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Click to review
                                    </p>
                                </div>
                            ))}
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Admin Assignment Request</DialogTitle>
                        <DialogDescription>
                            Review and confirm this admin assignment request
                        </DialogDescription>
                    </DialogHeader>
                    {selectedRequest && (
                        <div className="py-4">
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">User</p>
                                    <p className="text-base font-semibold">{selectedRequest.user.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                                    <p className="text-base">{selectedRequest.user.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Request</p>
                                    <p className="text-base">This user wants you to be their administrator</p>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowConfirmModal(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleRejectRequest}
                            disabled={loading}
                        >
                            Reject
                        </Button>
                        <Button
                            onClick={handleApproveRequest}
                            disabled={loading}
                        >
                            Approve
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
