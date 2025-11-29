import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { BreadcrumbItem, Task } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, CheckCircle2, Clock, AlertCircle, Users, BarChart3, Plus, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CreateTaskDialog } from '@/components/tasks/create-task-dialog';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
];

interface DashboardStats {
    // Admin Stats
    totalTasks?: number;
    tasksByStatus?: {
        pending: number;
        in_progress: number;
        completed: number;
    };
    overdueTasks?: number;
    recentActivity?: Task[];
    userPerformance?: { name: string; completed_tasks: number }[];

    // User Stats
    myTotalTasks?: number;
    myTasksByStatus?: {
        pending: number;
        in_progress: number;
        completed: number;
    };
    dueToday?: Task[];
    upcomingDeadlines?: Task[];
    completionRate?: number;
}

export default function DashboardIndex({ stats, isAdmin }: { stats: DashboardStats; isAdmin: boolean }) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const handleComplete = (task: Task) => {
        router.put(route('tasks.update', task.id), {
            ...task,
            status: 'completed'
        }, {
            preserveScroll: true,
            onSuccess: () => {
                // Toast notification could go here
            }
        });
    };

    const StatCard = ({ title, value, icon: Icon, description, className }: any) => (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className={`h-4 w-4 text-muted-foreground ${className}`} />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    );

    const AdminDashboard = () => (
        <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Tasks"
                    value={stats.totalTasks}
                    icon={Activity}
                    description="All tasks in the system"
                />
                <StatCard
                    title="In Progress"
                    value={stats.tasksByStatus?.in_progress}
                    icon={Clock}
                    description="Active tasks being worked on"
                    className="text-blue-500"
                />
                <StatCard
                    title="Completed"
                    value={stats.tasksByStatus?.completed}
                    icon={CheckCircle2}
                    description="Successfully finished tasks"
                    className="text-green-500"
                />
                <StatCard
                    title="Overdue"
                    value={stats.overdueTasks}
                    icon={AlertCircle}
                    description="Tasks past their deadline"
                    className="text-destructive"
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Recent Activity */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Latest task updates across the system.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {stats.recentActivity?.map((task) => (
                                <div key={task.id} className="flex items-center">
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">{task.title}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {task.user?.name} - {task.status.replace('_', ' ')}
                                        </p>
                                    </div>
                                    <div className="ml-auto font-medium text-xs text-muted-foreground">
                                        {new Date(task.updated_at).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Common administrative tasks.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Button className="w-full justify-start" onClick={() => setIsCreateOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" /> Create New Task
                        </Button>
                        <Link href={route('team.index')}>
                            <Button variant="outline" className="w-full justify-start mt-2">
                                <Users className="mr-2 h-4 w-4" /> Manage Users
                            </Button>
                        </Link>
                        <Link href={route('reports.index')}>
                            <Button variant="outline" className="w-full justify-start mt-2">
                                <BarChart3 className="mr-2 h-4 w-4" /> View Reports
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );

    const UserDashboard = () => (
        <div className="space-y-6">
            {/* Personal Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="My Tasks"
                    value={stats.myTotalTasks}
                    icon={Activity}
                    description="Total assigned to you"
                />
                <StatCard
                    title="Due Today"
                    value={stats.dueToday?.length}
                    icon={Calendar}
                    description="Tasks needing attention now"
                    className="text-yellow-500"
                />
                <StatCard
                    title="Completion Rate"
                    value={`${stats.completionRate}%`}
                    icon={BarChart3}
                    description="Your efficiency score"
                    className="text-green-500"
                />
                <StatCard
                    title="Pending"
                    value={stats.myTasksByStatus?.pending}
                    icon={Clock}
                    description="Tasks waiting to start"
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Upcoming Deadlines */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Upcoming Deadlines</CardTitle>
                        <CardDescription>Tasks due in the next 7 days.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats.upcomingDeadlines?.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No upcoming deadlines.</p>
                            ) : (
                                stats.upcomingDeadlines?.map((task) => (
                                    <div key={task.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                        <div className="space-y-1">
                                            <p className="font-medium">{task.title}</p>
                                            <p className="text-xs text-muted-foreground">
                                                Due: {new Date(task.due_date!).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                onClick={() => handleComplete(task)}
                                                title="Mark as Completed"
                                            >
                                                <CheckCircle2 className="h-4 w-4" />
                                            </Button>
                                            <Link href={`${route('tasks.index')}?editTask=${task.id}`}>
                                                <Button size="sm" variant="ghost">
                                                    View <ArrowRight className="ml-2 h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* My Progress */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>My Progress</CardTitle>
                        <CardDescription>Task completion status.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span>Completed</span>
                                <span className="font-bold">{stats.myTasksByStatus?.completed}</span>
                            </div>
                            <Progress value={(stats.myTasksByStatus?.completed! / stats.myTotalTasks!) * 100} className="h-2" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span>In Progress</span>
                                <span className="font-bold">{stats.myTasksByStatus?.in_progress}</span>
                            </div>
                            <Progress value={(stats.myTasksByStatus?.in_progress! / stats.myTotalTasks!) * 100} className="h-2 bg-blue-100" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span>Pending</span>
                                <span className="font-bold">{stats.myTasksByStatus?.pending}</span>
                            </div>
                            <Progress value={(stats.myTasksByStatus?.pending! / stats.myTotalTasks!) * 100} className="h-2 bg-gray-100" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
                        <p className="text-muted-foreground">
                            {isAdmin ? 'System Overview & Management' : 'Your Personal Task Center'}
                        </p>
                    </div>
                    {isAdmin && (
                        <Button onClick={() => setIsCreateOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" /> New Task
                        </Button>
                    )}
                </div>

                {isAdmin ? <AdminDashboard /> : <UserDashboard />}

                <CreateTaskDialog
                    open={isCreateOpen}
                    onOpenChange={setIsCreateOpen}
                />
            </div>
        </AppLayout>
    );
}
