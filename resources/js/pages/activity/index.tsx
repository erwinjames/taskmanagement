import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';
import { formatDistanceToNow } from 'date-fns';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Activity', href: '/activity' },
];

interface Activity {
    id: number;
    user_id: number | null;
    type: string;
    subject_type: string | null;
    subject_id: number | null;
    description: string | null;
    properties: any;
    created_at: string;
    user?: {
        id: number;
        name: string;
        email: string;
    };
    subject?: {
        id: number;
        name?: string;
        title?: string;
    };
}

interface PaginatedActivities {
    data: Activity[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Props {
    activities: PaginatedActivities;
}

export default function ActivityIndex({ activities }: Props) {
    const getActionBadgeColor = (type: string) => {
        switch (type) {
            case 'created':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'updated':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            case 'deleted':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Activity" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Activity</h2>
                        <p className="text-muted-foreground">View recent activity logs.</p>
                    </div>
                </div>

                <div className="rounded-xl border bg-card">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b bg-muted/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        User
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        Action
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        Subject
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        Description
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        Time
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {activities.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                                            No activity logs found.
                                        </td>
                                    </tr>
                                ) : (
                                    activities.data.map((activity) => (
                                        <tr key={activity.id} className="hover:bg-muted/50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium">
                                                    {activity.user?.name || 'System'}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {activity.user?.email || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getActionBadgeColor(
                                                        activity.type
                                                    )}`}
                                                >
                                                    {activity.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {activity.subject_type
                                                    ? activity.subject_type.split('\\').pop()
                                                    : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                {activity.description || 'No description'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                                {formatDistanceToNow(new Date(activity.created_at), {
                                                    addSuffix: true,
                                                })}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination info */}
                    {activities.data.length > 0 && (
                        <div className="border-t px-6 py-4">
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <div>
                                    Showing {(activities.current_page - 1) * activities.per_page + 1} to{' '}
                                    {Math.min(
                                        activities.current_page * activities.per_page,
                                        activities.total
                                    )}{' '}
                                    of {activities.total} activities
                                </div>
                                <div>
                                    Page {activities.current_page} of {activities.last_page}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
