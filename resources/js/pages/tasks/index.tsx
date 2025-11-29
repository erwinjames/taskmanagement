import AppLayout from '@/layouts/app-layout';
import { Task, BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import KanbanBoard from './kanban-board';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tasks',
        href: '/tasks',
    },
];

export default function TaskIndex({ tasks }: { tasks: Task[] }) {
    const [search, setSearch] = useState('');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tasks" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 overflow-hidden">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Task Board</h2>
                        <p className="text-muted-foreground">Manage your tasks with this interactive board.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search tasks..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                        <Link href={route('tasks.create')}>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> New Task
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden">
                    <KanbanBoard initialTasks={tasks} search={search} />
                </div>
            </div>
        </AppLayout>
    );
}
