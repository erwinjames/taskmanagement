import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Project, User } from '@/types';
import { usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Props {
    projects: {
        data: Project[];
        links: any[];
        total: number;
    };
    users: User[];
}

export default function ProjectsIndex({ projects, users }: Props) {
    const user = usePage().props.auth.user;
    const [isOpen, setIsOpen] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        description: '',
        status: 'active',
        priority: 'medium',
        start_date: '',
        deadline: '',
        budget: '',
        color: '#3b82f6',
        assigned_to: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('projects.store'), {
            onSuccess: () => {
                setIsOpen(false);
                reset();
            },
        });
    };

    return (
        <AppLayout breadcrumbs={[]}>
            <Head title="Projects" />
            <div className="p-6 w-full">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Projects</h1>
                        <p className="text-gray-500 dark:text-gray-400">Manage your projects and track progress.</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => router.visit(route('archive.index', { tab: 'projects' }))}
                            className="inline-flex items-center px-4 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md font-semibold text-xs text-gray-700 dark:text-gray-300 uppercase tracking-widest shadow-sm hover:bg-gray-50 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150"
                        >
                            View Archive
                        </button>

                        <Dialog open={isOpen} onOpenChange={setIsOpen}>
                            <DialogTrigger asChild>
                                <button className="inline-flex items-center px-4 py-2 bg-gray-900 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150">
                                    New Project
                                </button>
                            </DialogTrigger>
                            <DialogHeader>
                                <DialogTitle>Create New Project</DialogTitle>
                                <DialogDescription>
                                    Add a new project to track tasks and progress.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit}>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <label htmlFor="name" className="text-sm font-medium">
                                            Project Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="name"
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="e.g. Website Redesign"
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                                    </div>

                                    {user.role === 'admin' && (
                                        <div className="space-y-2">
                                            <label htmlFor="assigned_to" className="text-sm font-medium">
                                                Assign Project To (Admin Only)
                                            </label>
                                            <select
                                                id="assigned_to"
                                                value={data.assigned_to}
                                                onChange={(e) => setData('assigned_to', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="">Myself</option>
                                                {users.map((u) => (
                                                    <option key={u.id} value={u.id}>
                                                        {u.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <label htmlFor="description" className="text-sm font-medium">
                                            Description
                                        </label>
                                        <textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="Describe the project goals..."
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label htmlFor="status" className="text-sm font-medium">
                                                Status
                                            </label>
                                            <select
                                                id="status"
                                                value={data.status}
                                                onChange={(e) => setData('status', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="active">Active</option>
                                                <option value="on_hold">On Hold</option>
                                                <option value="completed">Completed</option>
                                            </select>
                                            {errors.status && <p className="text-sm text-red-600">{errors.status}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor="priority" className="text-sm font-medium">
                                                Priority
                                            </label>
                                            <select
                                                id="priority"
                                                value={data.priority}
                                                onChange={(e) => setData('priority', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="low">Low</option>
                                                <option value="medium">Medium</option>
                                                <option value="high">High</option>
                                            </select>
                                            {errors.priority && <p className="text-sm text-red-600">{errors.priority}</p>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label htmlFor="start_date" className="text-sm font-medium">
                                                Start Date
                                            </label>
                                            <input
                                                id="start_date"
                                                type="date"
                                                value={data.start_date}
                                                onChange={(e) => setData('start_date', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor="deadline" className="text-sm font-medium">
                                                Deadline
                                            </label>
                                            <input
                                                id="deadline"
                                                type="date"
                                                value={data.deadline}
                                                onChange={(e) => setData('deadline', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="budget" className="text-sm font-medium">
                                            Budget
                                        </label>
                                        <input
                                            id="budget"
                                            type="number"
                                            step="0.01"
                                            value={data.budget}
                                            onChange={(e) => setData('budget', e.target.value)}
                                            placeholder="0.00"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {errors.budget && <p className="text-sm text-red-600">{errors.budget}</p>}
                                    </div>
                                </div>
                                <DialogFooter>
                                    <button
                                        type="button"
                                        onClick={() => setIsOpen(false)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {processing ? 'Creating...' : 'Create Project'}
                                    </button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="bg-white dark:bg-zinc-900 shadow-sm rounded-lg border border-gray-200 dark:border-zinc-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-800">
                            <thead className="bg-gray-50 dark:bg-zinc-800/50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                                        Project Name
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                                        Priority
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                                        Progress
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                                        Deadline
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-zinc-900 divide-y divide-gray-200 dark:divide-zinc-800">
                                {projects.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                            No projects found. Click "New Project" to create one.
                                        </td>
                                    </tr>
                                ) : (
                                    projects.data.map((project) => (
                                        <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <Link href={route('projects.show', project.id)} className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                                                        {project.name}
                                                    </Link>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 max-w-xs">
                                                        {project.description}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${project.status === 'active' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                                                    project.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                                    }`}>
                                                    {project.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">
                                                {project.priority}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                <div className="flex items-center">
                                                    <span className="mr-2">{project.completed_tasks_count}/{project.tasks_count}</span>
                                                    <div className="w-16 bg-gray-200 dark:bg-zinc-700 rounded-full h-1.5">
                                                        <div
                                                            className="bg-blue-600 h-1.5 rounded-full"
                                                            style={{ width: `${project.tasks_count > 0 ? (project.completed_tasks_count / project.tasks_count) * 100 : 0}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {project.deadline ? new Date(project.deadline).toLocaleDateString() : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link href={route('projects.edit', project.id)} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 mr-4">
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => {
                                                        if (confirm('Are you sure you want to archive this project?')) {
                                                            router.delete(route('projects.destroy', project.id));
                                                        }
                                                    }}
                                                    className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                                                >
                                                    Archive
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
