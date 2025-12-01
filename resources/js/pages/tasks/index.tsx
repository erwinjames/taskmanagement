import AppLayout from '@/layouts/app-layout';
import { Task, BreadcrumbItem, User } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Calendar, Pencil, Trash2, LayoutGrid, List, Archive } from 'lucide-react';
import KanbanBoard from './kanban-board';
import { useState, useEffect } from 'react';
import { CreateTaskDialog } from '@/components/tasks/create-task-dialog';
import { EditTaskDialog } from '@/components/tasks/edit-task-dialog';
import { TaskListView } from '@/components/tasks/task-list-view';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tasks',
        href: '/tasks',
    },
];

export default function TaskIndex({ tasks, auth, users }: { tasks: Task[]; auth: { user: User }; users?: User[] }) {
    const [search, setSearch] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
    const isAdmin = auth.user.role === 'admin';



    const filteredTasks = tasks.filter(task => {
        if (!search) return true;
        const searchLower = search.toLowerCase();
        return (
            task.title.toLowerCase().includes(searchLower) ||
            (task.description && task.description.toLowerCase().includes(searchLower)) ||
            (task.user && task.user.name.toLowerCase().includes(searchLower))
        );
    });

    // Auto-open edit modal if editTask query parameter is present
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const editTaskId = params.get('editTask');
        if (editTaskId) {
            const taskToEdit = tasks.find(t => t.id === parseInt(editTaskId));
            if (taskToEdit) {
                setEditingTask(taskToEdit);
                // Clean up URL
                window.history.replaceState({}, '', window.location.pathname);
            }
        }
    }, [tasks]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tasks" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 overflow-hidden">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            {isAdmin ? 'Assigned Tasks' : 'Task Board'}
                        </h2>
                        <p className="text-muted-foreground">
                            {isAdmin ? 'Tasks you have assigned to team members' : 'Manage your tasks with this interactive board.'}
                        </p>
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
                        <div className="flex items-center border rounded-md bg-background">
                            <Button
                                variant={viewMode === 'board' ? 'secondary' : 'ghost'}
                                size="icon"
                                onClick={() => setViewMode('board')}
                                className="h-9 w-9 rounded-none rounded-l-md"
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                                size="icon"
                                onClick={() => setViewMode('list')}
                                className="h-9 w-9 rounded-none rounded-r-md"
                            >
                                <List className="h-4 w-4" />
                            </Button>
                        </div>
                        <Button variant="outline" onClick={() => router.visit(route('archive.index', { tab: 'tasks' }))}>
                            <Archive className="mr-2 h-4 w-4" /> View Archive
                        </Button>
                        <Button onClick={() => setIsCreateOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" /> {isAdmin ? 'Assign Task' : 'New Task'}
                        </Button>
                    </div>
                </div>

                {isAdmin ? (
                    <div className="flex-1 overflow-auto">
                        <div className="rounded-xl border bg-card">
                            <table className="w-full">
                                <thead className="border-b bg-muted/50">
                                    <tr>
                                        <th className="p-4 text-left font-semibold">Task</th>
                                        <th className="p-4 text-left font-semibold">Assigned To</th>
                                        <th className="p-4 text-left font-semibold">Status</th>
                                        <th className="p-4 text-left font-semibold">Priority</th>
                                        <th className="p-4 text-left font-semibold">Due Date</th>
                                        <th className="p-4 text-right font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTasks.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                                No tasks found. Click "Assign Task" to create tasks for your team.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredTasks.map((task) => (
                                            <tr key={task.id} className="border-b hover:bg-muted/30 transition-colors">
                                                <td className="p-4">
                                                    <div>
                                                        <p className="font-medium">{task.title}</p>
                                                        {task.description && (
                                                            <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                                                                {task.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    {task.user && (
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                                                                {task.user.name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium">{task.user.name}</p>
                                                                <p className="text-xs text-muted-foreground">{task.user.email}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${task.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                        task.status === 'in_progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                            'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                                                        }`}>
                                                        {task.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${task.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                            'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                        }`}>
                                                        {task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : 'Medium'}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    {task.due_date ? (
                                                        <div className="flex items-center gap-1 text-sm">
                                                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                                            <span>{new Date(task.due_date).toLocaleDateString()}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-muted-foreground">-</span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setEditingTask(task)}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-destructive hover:text-destructive"
                                                            onClick={() => {
                                                                if (confirm('Are you sure you want to archive this task?')) {
                                                                    router.delete(route('tasks.destroy', task.id));
                                                                }
                                                            }}
                                                            title="Archive Task"
                                                        >
                                                            <Archive className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 overflow-hidden">
                        {viewMode === 'board' ? (
                            <KanbanBoard initialTasks={filteredTasks} search={search} />
                        ) : (
                            <TaskListView tasks={filteredTasks} />
                        )}
                    </div>
                )}

                <CreateTaskDialog
                    open={isCreateOpen}
                    onOpenChange={setIsCreateOpen}
                    users={users}
                />
                <EditTaskDialog
                    task={editingTask}
                    open={!!editingTask}
                    onOpenChange={(open) => !open && setEditingTask(null)}
                />
            </div>
        </AppLayout>
    );
}