import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Calendar', href: '/calendar' },
];

export default function CalendarIndex() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Calendar" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Calendar</h2>
                        <p className="text-muted-foreground">View your schedule.</p>
                    </div>
                </div>

                <div className="rounded-xl border bg-card p-6">
                    {/* Add your calendar content here */}
                    <p className="text-muted-foreground">Customize your calendar content here...</p>
                </div>
            </div>
        </AppLayout>
    );
}
