import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SharedData, Task } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { AlertCircle, Bell, Calendar, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export function NotificationsDropdown() {
    const { notifications } = usePage<SharedData>().props;
    const [open, setOpen] = useState(false);
    const [assignmentRequests, setAssignmentRequests] = useState<any[]>([]);
    const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await axios.get(route('admin.assignment-requests'));
            setAssignmentRequests(response.data);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    const handleOpenRequestModal = (request: any) => {
        setSelectedRequest(request);
        setShowConfirmModal(true);
        setOpen(false);
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

    const totalNotifications =
        notifications.overdue.length +
        notifications.today.length +
        notifications.high_priority.length +
        assignmentRequests.length;

    const NotificationItem = ({ task, type }: { task: Task; type: 'overdue' | 'today' | 'high_priority' }) => {
        const icons = {
            overdue: <AlertCircle className="h-4 w-4 text-destructive" />,
            today: <Calendar className="h-4 w-4 text-yellow-500" />,
            high_priority: <AlertCircle className="h-4 w-4 text-blue-500" />,
        };

        const colors = {
            overdue: 'bg-destructive/10 text-destructive',
            today: 'bg-yellow-500/10 text-yellow-500',
            high_priority: 'bg-blue-500/10 text-blue-500',
        };

        const labels = {
            overdue: 'Overdue',
            today: 'Due Today',
            high_priority: 'High Priority',
        };

        return (
            <Link
                href={`${route('tasks.index')}?editTask=${task.id}`}
                className="flex items-start gap-3 p-3 hover:bg-muted/50 transition-colors rounded-lg group"
                onClick={() => setOpen(false)}
            >
                <div className={`mt-0.5 rounded-full p-1.5 ${colors[type]}`}>
                    {icons[type]}
                </div>
                <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none group-hover:text-primary transition-colors">
                        {task.title}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-medium">{labels[type]}</span>
                        <span>•</span>
                        <span>{new Date(task.due_date || '').toLocaleDateString()}</span>
                    </div>
                </div>
            </Link>
        );
    };

    return (
        <>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative h-8 w-8">
                        <Bell className="h-4 w-4" />
                        {totalNotifications > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground ring-2 ring-background animate-in zoom-in">
                                {totalNotifications}
                            </span>
                        )}
                        <span className="sr-only">Notifications</span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                    <div className="flex items-center justify-between border-b p-4">
                        <h4 className="font-semibold">Notifications</h4>
                        {totalNotifications > 0 && (
                            <span className="text-xs text-muted-foreground">
                                {totalNotifications} unread
                            </span>
                        )}
                    </div>
                    <ScrollArea className="h-[300px]">
                        {totalNotifications === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-2 p-8 text-center text-muted-foreground">
                                <CheckCircle2 className="h-8 w-8 opacity-50" />
                                <p className="text-sm">No new notifications</p>
                            </div>
                        ) : (
                            <div className="p-2 space-y-1">
                                {assignmentRequests.length > 0 && (
                                    <>
                                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                                            Admin Requests
                                        </div>
                                        {assignmentRequests.map((request) => (
                                            <div
                                                key={`req-${request.id}`}
                                                className="flex items-start gap-3 p-3 hover:bg-muted/50 transition-colors rounded-lg group cursor-pointer"
                                                onClick={() => handleOpenRequestModal(request)}
                                            >
                                                <div className="mt-0.5 rounded-full p-1.5 bg-blue-500/10 text-blue-500">
                                                    <AlertCircle className="h-4 w-4" />
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <p className="text-sm font-medium leading-none group-hover:text-primary transition-colors">
                                                        Admin Assignment Request
                                                    </p>
                                                    <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                                                        <span>{request.user.name} wants you as admin</span>
                                                        <span className="text-xs text-blue-500">Click to review</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                )}

                                {(notifications.overdue.length > 0 || notifications.today.length > 0 || notifications.high_priority.length > 0) && (
                                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">
                                        Tasks
                                    </div>
                                )}

                                {notifications.overdue.map(task => (
                                    <NotificationItem key={`overdue-${task.id}`} task={task} type="overdue" />
                                ))}
                                {notifications.today.map(task => (
                                    <NotificationItem key={`today-${task.id}`} task={task} type="today" />
                                ))}
                                {notifications.high_priority.map(task => (
                                    // Deduplicate: Don't show if already shown in overdue or today
                                    !notifications.overdue.find(t => t.id === task.id) &&
                                    !notifications.today.find(t => t.id === task.id) && (
                                        <NotificationItem key={`high-${task.id}`} task={task} type="high_priority" />
                                    )
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </PopoverContent>
            </Popover>

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
