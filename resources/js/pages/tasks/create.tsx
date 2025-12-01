import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, User, Project } from '@/types';
import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import InputError from '@/components/input-error';
import { FormEventHandler } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tasks',
        href: '/tasks',
    },
    {
        title: 'Create Task',
        href: '/tasks/create',
    },
];

interface Props {
    users?: User[];
    projects?: Project[];
}

export default function TaskCreate({ users = [], projects = [] }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        due_date: '',
        assigned_to: '',
        project_id: '',
        subtasks: [] as string[],
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('tasks.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Task" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Create Task</h2>
                        <p className="text-muted-foreground">Add a new task to your list.</p>
                    </div>
                </div>

                <div className="max-w-2xl rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                required
                                autoFocus
                                placeholder="Task title"
                            />
                            <InputError message={errors.title} />
                        </div>

                        {users.length > 0 && (
                            <div className="grid gap-2">
                                <Label htmlFor="assigned_to">Assign To</Label>
                                <Select value={data.assigned_to} onValueChange={(value) => setData('assigned_to', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a user" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {users.map((user) => (
                                            <SelectItem key={user.id} value={String(user.id)}>
                                                {user.name} ({user.email})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.assigned_to} />
                            </div>
                        )}

                        {projects.length > 0 && (
                            <div className="grid gap-2">
                                <Label htmlFor="project_id">Project (Optional)</Label>
                                <Select value={data.project_id} onValueChange={(value) => setData('project_id', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select project" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">No Project</SelectItem>
                                        {projects.map((project) => (
                                            <SelectItem key={project.id} value={String(project.id)}>
                                                {project.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.project_id} />
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Task description (optional)"
                                className="min-h-[100px]"
                            />
                            <InputError message={errors.description} />
                        </div>

                        <div className="grid gap-6 md:grid-cols-3">
                            <div className="grid gap-2">
                                <Label htmlFor="status">Status</Label>
                                <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="in_progress">In Progress</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.status} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="priority">Priority</Label>
                                <Select value={data.priority} onValueChange={(value) => setData('priority', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.priority} /> // This line might need to be added to the errors object in useForm if it's not automatically handled, but typically Inertia handles server-side validation errors automatically.
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="due_date">Due Date</Label>
                                <Input
                                    id="due_date"
                                    type="date"
                                    value={data.due_date}
                                    onChange={(e) => setData('due_date', e.target.value)}
                                />
                                <InputError message={errors.due_date} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>Subtasks</Label>
                            {data.subtasks.map((subtask, index) => (
                                <div key={index} className="flex gap-2">
                                    <Input
                                        value={subtask}
                                        onChange={(e) => {
                                            const newSubtasks = [...data.subtasks];
                                            newSubtasks[index] = e.target.value;
                                            setData('subtasks', newSubtasks);
                                        }}
                                        placeholder={`Subtask ${index + 1}`}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => {
                                            const newSubtasks = data.subtasks.filter((_, i) => i !== index);
                                            setData('subtasks', newSubtasks);
                                        }}
                                    >
                                        <span className="sr-only">Remove</span>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="h-4 w-4"
                                        >
                                            <path d="M18 6 6 18" />
                                            <path d="m6 6 12 12" />
                                        </svg>
                                    </Button>
                                </div>
                            ))}
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setData('subtasks', [...data.subtasks, ''])}
                                className="w-full"
                            >
                                Add Subtask
                            </Button>
                            <InputError message={errors.subtasks} />
                        </div>

                        <div className="flex justify-end gap-4">
                            <Link href={route('tasks.index')}>
                                <Button variant="outline" type="button">
                                    Cancel
                                </Button>
                            </Link>
                            <Button type="submit" disabled={processing}>
                                Create Task
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
