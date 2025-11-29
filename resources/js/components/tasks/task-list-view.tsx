import { Task } from '@/types';
import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Pencil, Trash2, AlertCircle, CheckCircle2, Circle, Clock } from 'lucide-react';
import { EditTaskDialog } from '@/components/tasks/edit-task-dialog';
import { CreateReportDialog } from '@/components/reports/create-report-dialog';

interface TaskListViewProps {
    tasks: Task[];
}

export function TaskListView({ tasks }: TaskListViewProps) {
    const [selectedTasks, setSelectedTasks] = useState<number[]>([]);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [reportingTask, setReportingTask] = useState<Task | null>(null);

    const toggleSelectAll = () => {
        if (selectedTasks.length === tasks.length) {
            setSelectedTasks([]);
        } else {
            setSelectedTasks(tasks.map(t => t.id));
        }
    };

    const toggleSelect = (id: number) => {
        if (selectedTasks.includes(id)) {
            setSelectedTasks(selectedTasks.filter(tId => tId !== id));
        } else {
            setSelectedTasks([...selectedTasks, id]);
        }
    };

    const handleBulkDelete = () => {
        if (confirm(`Are you sure you want to delete ${selectedTasks.length} tasks?`)) {
            // In a real app, we'd have a bulk delete endpoint.
            // For now, we'll just loop (not ideal for large sets, but works for MVP)
            // Or better, add a bulk delete endpoint. 
            // Let's assume we added a bulk endpoint or we can just iterate.
            // Given the constraints, I'll use a simple loop or a new endpoint if I had one.
            // I'll implement a bulk endpoint in TaskController if I can, but for now let's just use the existing destroy one by one or add a bulk method.
            // Actually, I didn't add a bulk endpoint in the plan. I should probably add one or just iterate.
            // Iterating is slow. Let's add a bulk action endpoint to TaskController later if needed.
            // For now, I'll just use router.visit with method delete for multiple? No.
            // Let's just implement a simple bulk update/delete logic in the controller if I can.
            // Wait, I can add a `bulk` method to TaskController.

            router.post(route('tasks.bulk_action'), {
                ids: selectedTasks,
                action: 'delete'
            }, {
                onSuccess: () => setSelectedTasks([])
            });
        }
    };

    const handleBulkStatus = (status: string) => {
        router.post(route('tasks.bulk_action'), {
            ids: selectedTasks,
            action: 'update_status',
            value: status
        }, {
            onSuccess: () => setSelectedTasks([])
        });
    };

    return (
        <div className="space-y-4">
            {selectedTasks.length > 0 && (
                <div className="flex items-center justify-between bg-muted/50 p-4 rounded-lg border">
                    <span className="font-medium">{selectedTasks.length} tasks selected</span>
                    <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleBulkStatus('completed')}>
                            Mark as Completed
                        </Button>
                        <Button size="sm" variant="destructive" onClick={handleBulkDelete}>
                            Delete Selected
                        </Button>
                    </div>
                </div>
            )}

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">
                                <Checkbox
                                    checked={selectedTasks.length === tasks.length && tasks.length > 0}
                                    onCheckedChange={toggleSelectAll}
                                />
                            </TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Assigned To</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tasks.map((task) => (
                            <TableRow key={task.id}>
                                <TableCell>
                                    <Checkbox
                                        checked={selectedTasks.includes(task.id)}
                                        onCheckedChange={() => toggleSelect(task.id)}
                                    />
                                </TableCell>
                                <TableCell className="font-medium">{task.title}</TableCell>
                                <TableCell>
                                    <Badge variant={
                                        task.status === 'completed' ? 'default' :
                                            task.status === 'in_progress' ? 'secondary' :
                                                'outline'
                                    }>
                                        {task.status.replace('_', ' ')}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={
                                        task.priority === 'high' ? 'border-red-200 text-red-700 bg-red-50' :
                                            task.priority === 'medium' ? 'border-yellow-200 text-yellow-700 bg-yellow-50' :
                                                'border-blue-200 text-blue-700 bg-blue-50'
                                    }>
                                        {task.priority}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {task.due_date ? new Date(task.due_date).toLocaleDateString() : '-'}
                                </TableCell>
                                <TableCell>
                                    {task.user ? (
                                        <div className="flex items-center gap-2">
                                            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                                                {task.user.name.charAt(0)}
                                            </div>
                                            <span className="text-sm">{task.user.name}</span>
                                        </div>
                                    ) : '-'}
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => setEditingTask(task)}>
                                                <Pencil className="mr-2 h-4 w-4" /> Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setReportingTask(task)}>
                                                <AlertCircle className="mr-2 h-4 w-4" /> Report Issue
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive" onClick={() => {
                                                if (confirm('Delete task?')) router.delete(route('tasks.destroy', task.id));
                                            }}>
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <EditTaskDialog
                task={editingTask}
                tasks={tasks}
                open={!!editingTask}
                onOpenChange={(open) => !open && setEditingTask(null)}
            />

            <CreateReportDialog
                task={reportingTask}
                open={!!reportingTask}
                onOpenChange={(open) => !open && setReportingTask(null)}
            />
        </div>
    );
}
