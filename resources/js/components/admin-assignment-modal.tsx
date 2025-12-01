import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { router } from '@inertiajs/react';
import { useState } from 'react';

interface AdminAssignmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    requestId: number;
    userName: string;
}

export default function AdminAssignmentModal({
    isOpen,
    onClose,
    requestId,
    userName,
}: AdminAssignmentModalProps) {
    const [processing, setProcessing] = useState(false);

    const handleApprove = () => {
        setProcessing(true);
        router.post(
            route('admin.assignment-requests.approve', requestId),
            {},
            {
                onSuccess: () => {
                    setProcessing(false);
                    onClose();
                },
                onError: () => {
                    setProcessing(false);
                },
            }
        );
    };

    const handleReject = () => {
        setProcessing(true);
        router.post(
            route('admin.assignment-requests.reject', requestId),
            {},
            {
                onSuccess: () => {
                    setProcessing(false);
                    onClose();
                },
                onError: () => {
                    setProcessing(false);
                },
            }
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Admin Assignment Request</DialogTitle>
                    <DialogDescription>
                        <strong>{userName}</strong> has requested you to be their administrator.
                        Do you accept this request?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={handleReject}
                        disabled={processing}
                    >
                        Reject
                    </Button>
                    <Button onClick={handleApprove} disabled={processing}>
                        Approve
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
