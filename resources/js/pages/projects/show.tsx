import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { BreadcrumbItem, Project, Task } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, CheckCircle2, Clock, Edit, Trash2, Users } from 'lucide-react';
import { format } from 'date-fns';

interface Props {
    project: Project & {
        tasks?: Task[];
    };
}

export default function ProjectsShow({ project }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Projects', href: '/projects' },
        { title: project.name, href: `/projects/${project.id}` },
    ];

    const completedPercentage = project.tasks_count > 0
        ? Math.round((project.completed_tasks_count / project.tasks_count) * 100)
        : 0;

    const pendingTasks = project.tasks_count - project.completed_tasks_count;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={project.name} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <h2 className="text-2xl font-bold tracking-tight">{project.name}</h2>
                            <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                                {project.status}
                            </Badge>
                            <Badge variant="outline">{project.priority}</Badge>
                        </div>
                        <p className="text-muted-foreground">{project.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={route('projects.edit', project.id)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive"
                            onClick={() => {
                                if (confirm('Are you sure you want to delete this project?')) {
                                    router.delete(route('projects.destroy', project.id));
                                }
                            }}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{project.tasks_count}</div>
                            <p className="text-xs text-muted-foreground">
                                {project.completed_tasks_count} completed
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Progress</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{completedPercentage}%</div>
                            <Progress value={completedPercentage} className="mt-2" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{project.members?.length || 0}</div>
                            <div className="flex -space-x-2 mt-2">
                                {project.members?.slice(0, 5).map((member) => (
                                    <Avatar key={member.id} className="h-8 w-8 border-2 border-background">
                                        <AvatarImage src={member.profile_photo_url as string || undefined} />
                                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Deadline</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {project.deadline ? format(new Date(project.deadline), 'MMM dd') : 'N/A'}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {project.deadline ? format(new Date(project.deadline), 'yyyy') : 'No deadline set'}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Project Details */}
                <Tabs defaultValue="tasks" className="w-full">
                    <TabsList>
                        <TabsTrigger value="tasks">Tasks</TabsTrigger>
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="team">Team</TabsTrigger>
                    </TabsList>

                    <TabsContent value="tasks" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Project Tasks</CardTitle>
                                <CardDescription>
                                    Manage tasks for this project
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {project.tasks && project.tasks.length > 0 ? (
                                    <div className="space-y-2">
                                        {project.tasks.map((task) => (
                                            <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <div className={`h-2 w-2 rounded-full ${task.status === 'completed' ? 'bg-green-500' :
                                                            task.status === 'in_progress' ? 'bg-blue-500' :
                                                                'bg-gray-300'
                                                        }`} />
                                                    <div>
                                                        <p className="font-medium">{task.title}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {task.status} • {task.priority}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={route('tasks.edit', task.id)}>View</Link>
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-muted-foreground py-8">
                                        No tasks yet. Create tasks and assign them to this project.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="details" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Project Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Start Date</p>
                                        <p className="text-sm">
                                            {project.start_date ? format(new Date(project.start_date), 'PPP') : 'Not set'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">End Date</p>
                                        <p className="text-sm">
                                            {project.end_date ? format(new Date(project.end_date), 'PPP') : 'Not set'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Budget</p>
                                        <p className="text-sm">
                                            {project.budget ? `$${Number(project.budget).toLocaleString()}` : 'Not set'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Created</p>
                                        <p className="text-sm">
                                            {format(new Date(project.created_at), 'PPP')}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="team" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Team Members</CardTitle>
                                <CardDescription>
                                    People working on this project
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {project.members && project.members.length > 0 ? (
                                    <div className="space-y-3">
                                        {project.members.map((member) => (
                                            <div key={member.id} className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={member.profile_photo_url as string || undefined} />
                                                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{member.name}</p>
                                                    <p className="text-sm text-muted-foreground">{member.email}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-muted-foreground py-8">
                                        No team members assigned yet.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
