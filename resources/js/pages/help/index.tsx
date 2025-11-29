import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Help', href: '/help' },
];

export default function HelpIndex() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Help" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Help & Support</h2>
                        <p className="text-muted-foreground">Get help and support.</p>
                    </div>
                </div>

                <div className="rounded-xl border bg-card p-6">
                    {/* Add your help content here */}
                    <p className="text-muted-foreground">Customize your help content here...</p>
                </div>
            </div>
        </AppLayout>
    );
}
