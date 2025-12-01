import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Projects', href: '/projects' },
    { title: 'New Project', href: '/projects/create' },
];

export default function ProjectsCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        status: 'active',
        priority: 'medium',
        start_date: '',
        end_date: '',
        deadline: '',
        budget: '',
        color: '#3b82f6',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('projects.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="New Project" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="mx-auto w-full max-w-2xl">
                    <Card>
                        <CardHeader>
                            <CardTitle>Create New Project</CardTitle>
                            <CardDescription>
                                Add a new project to track tasks and progress.
                            </CardDescription>
                        </CardHeader>
                        <form onSubmit={submit}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Project Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g. Website Redesign"
                                        required
                                    />
                                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Describe the project goals..."
                                    />
                                    {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="status">Status</Label>
                                        <Select
                                            value={data.status}
                                            onValueChange={(value) => setData('status', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="on_hold">On Hold</SelectItem>
                                                <SelectItem value="completed">Completed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.status && <p className="text-sm text-destructive">{errors.status}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="priority">Priority</Label>
                                        <Select
                                            value={data.priority}
                                            onValueChange={(value) => setData('priority', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select priority" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="low">Low</SelectItem>
                                                <SelectItem value="medium">Medium</SelectItem>
                                                <SelectItem value="high">High</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.priority && <p className="text-sm text-destructive">{errors.priority}</p>}
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Start Date</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal",
                                                        !data.start_date && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {data.start_date ? format(new Date(data.start_date), "PPP") : <span>Pick a date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={data.start_date ? new Date(data.start_date) : undefined}
                                                    onSelect={(date) => setData('start_date', date ? date.toISOString() : '')}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Deadline</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal",
                                                        !data.deadline && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {data.deadline ? format(new Date(data.deadline), "PPP") : <span>Pick a date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={data.deadline ? new Date(data.deadline) : undefined}
                                                    onSelect={(date) => setData('deadline', date ? date.toISOString() : '')}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="budget">Budget</Label>
                                    <Input
                                        id="budget"
                                        type="number"
                                        value={data.budget}
                                        onChange={(e) => setData('budget', e.target.value)}
                                        placeholder="0.00"
                                    />
                                    {errors.budget && <p className="text-sm text-destructive">{errors.budget}</p>}
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end gap-2">
                                <Button variant="ghost" asChild>
                                    <a href={route('projects.index')}>Cancel</a>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    Create Project
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
