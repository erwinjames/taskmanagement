import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { BreadcrumbItem, Task, User } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, FileText, Terminal } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reports', href: '/reports' },
];

interface TaskReport {
    id: number;
    task: Task;
    user: User;
    issue_type: string;
    description: string;
    created_at: string;
}

interface ReportsProps {
    taskReports: TaskReport[];
    logs: string[];
    isAdmin: boolean;
}

export default function ReportsIndex({ taskReports, logs, isAdmin }: ReportsProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reports" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Reports & Logs</h2>
                        <p className="text-muted-foreground">System activity and issue tracking.</p>
                    </div>
                </div>

                <Tabs defaultValue="tasks" className="w-full">
                    <TabsList>
                        <TabsTrigger value="tasks">
                            <FileText className="mr-2 h-4 w-4" />
                            Task Reports
                        </TabsTrigger>
                        {isAdmin && (
                            <TabsTrigger value="logs">
                                <Terminal className="mr-2 h-4 w-4" />
                                System Logs
                            </TabsTrigger>
                        )}
                    </TabsList>

                    <TabsContent value="tasks" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Reported Issues</CardTitle>
                                <CardDescription>Issues reported by users on specific tasks.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {taskReports.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                                        <AlertCircle className="h-8 w-8 mb-2 opacity-50" />
                                        <p>No issues reported yet.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {taskReports.map((report) => (
                                            <div key={report.id} className="flex flex-col space-y-2 border-b pb-4 last:border-0 last:pb-0">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant={report.issue_type === 'bug' ? 'destructive' : 'outline'}>
                                                            {report.issue_type}
                                                        </Badge>
                                                        <span className="font-medium">{report.task.title}</span>
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">
                                                        {new Date(report.created_at).toLocaleString()}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-muted-foreground">{report.description}</p>
                                                <div className="text-xs text-muted-foreground">
                                                    Reported by: <span className="font-medium text-foreground">{report.user.name}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {isAdmin && (
                        <TabsContent value="logs">
                            <Card>
                                <CardHeader>
                                    <CardTitle>System Logs</CardTitle>
                                    <CardDescription>Raw application logs (last 100 lines).</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ScrollArea className="h-[500px] w-full rounded-md border bg-muted p-4 font-mono text-xs">
                                        {logs.length === 0 ? (
                                            <p className="text-muted-foreground">Log file is empty or not found.</p>
                                        ) : (
                                            logs.map((line, index) => (
                                                <div key={index} className="whitespace-pre-wrap py-0.5 border-b border-border/50 last:border-0 hover:bg-background/50">
                                                    {line}
                                                </div>
                                            ))
                                        )}
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    )}
                </Tabs>
            </div>
        </AppLayout>
    );
}
