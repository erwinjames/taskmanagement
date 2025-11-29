import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SharedData, Task } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { AlertCircle, Bell, Calendar, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

export function NotificationsDropdown() {
    const { notifications } = usePage<SharedData>().props;
    const [open, setOpen] = useState(false);

    const totalNotifications =
        notifications.overdue.length +
        notifications.today.length +
        notifications.high_priority.length;

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
    );
}
