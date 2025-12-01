import AdminAssignmentModal from '@/components/admin-assignment-modal';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import axios from 'axios';
import { type ReactNode, useEffect, useState } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => {
    const [assignmentRequest, setAssignmentRequest] = useState<{
        id: number;
        user: { name: string };
    } | null>(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const requestId = params.get('admin_request_id');

        if (requestId) {
            axios.get(route('admin.assignment-requests.show', requestId))
                .then((response) => {
                    setAssignmentRequest(response.data);
                })
                .catch((error) => {
                    console.error('Failed to fetch assignment request', error);
                });
        }
    }, []);

    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
            {children}
            {assignmentRequest && (
                <AdminAssignmentModal
                    isOpen={!!assignmentRequest}
                    onClose={() => setAssignmentRequest(null)}
                    requestId={assignmentRequest.id}
                    userName={assignmentRequest.user.name}
                />
            )}
        </AppLayoutTemplate>
    );
};
