import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Archive', href: '/archive' },
];

export default function ArchiveIndex() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Archive" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Archive</h2>
                        <p className="text-muted-foreground">View archived items.</p>
                    </div>
                </div>

                <div className="rounded-xl border bg-card p-6">
                    {/* Add your archive content here */}
                    <p className="text-muted-foreground">Customize your archive content here...</p>
                </div>
            </div>
        </AppLayout>
    );
}
