import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Paperclip, X, Plus, Trash2, FileIcon, CheckCircle2, Circle, Link as LinkIcon, Lock } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import InputError from '@/components/input-error';
import { Task } from '@/types';
import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Badge } from '@/components/ui/badge';

interface EditTaskDialogProps {
    task: Task | null;
    tasks?: Task[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditTaskDialog({ task, tasks = [], open, onOpenChange }: EditTaskDialogProps) {
    const { data, setData, put, processing, errors, reset } = useForm({
        title: task?.title || '',
        description: task?.description || '',
        status: (task?.status || 'pending') as 'pending' | 'in_progress' | 'completed',
        priority: (task?.priority || 'medium') as 'low' | 'medium' | 'high',
        due_date: task?.due_date || '',
    });

    useEffect(() => {
        if (task) {
            setData({
                title: task.title,
                description: task.description || '',
                status: task.status as 'pending' | 'in_progress' | 'completed',
                priority: (task.priority || 'medium') as 'low' | 'medium' | 'high',
                due_date: task.due_date || '',
            });
        }
    }, [task]);

    const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [selectedDependencyId, setSelectedDependencyId] = useState<string>('');

    const handleAddDependency = () => {
        if (!task || !selectedDependencyId) return;

        router.post(route('tasks.dependencies.store', task.id), {
            dependency_id: selectedDependencyId
        }, {
            preserveScroll: true,
            onSuccess: () => setSelectedDependencyId('')
        });
    };

    const handleRemoveDependency = (dependency: any) => {
        router.delete(route('tasks.dependencies.destroy', [task?.id, dependency.id]), {
            preserveScroll: true,
        });
    };

    const handleAddSubtask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!task || !newSubtaskTitle.trim()) return;

        router.post(route('tasks.subtasks.store', task.id), {
            title: newSubtaskTitle
        }, {
            preserveScroll: true,
            onSuccess: () => setNewSubtaskTitle('')
        });
    };

    const handleToggleSubtask = (subtask: any) => {
        router.put(route('subtasks.update', subtask.id), {
            is_completed: !subtask.is_completed
        }, {
            preserveScroll: true,
        });
    };

    const handleDeleteSubtask = (subtask: any) => {
        router.delete(route('subtasks.destroy', subtask.id), {
            preserveScroll: true,
        });
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!task || !e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('file', file);

        setIsUploading(true);
        router.post(route('tasks.attachments.store', task.id), formData, {
            preserveScroll: true,
            onFinish: () => setIsUploading(false),
        });
    };

    const handleDeleteAttachment = (attachment: any) => {
        router.delete(route('attachments.destroy', attachment.id), {
            preserveScroll: true,
        });
    };

    const subtasks = task?.subtasks || [];
    const attachments = task?.attachments || [];
    const dependencies = task?.dependencies || [];
    const availableTasks = tasks.filter(t => t.id !== task?.id && !dependencies.find((d: any) => d.id === t.id));

    const completedSubtasks = subtasks.filter((s: any) => s.is_completed).length;
    const progress = subtasks.length > 0 ? (completedSubtasks / subtasks.length) * 100 : 0;

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (!task) return;

        put(route('tasks.update', task.id), {
            preserveScroll: true,
            onSuccess: () => {
                onOpenChange(false);
            },
        });
    };

    if (!task) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Task</DialogTitle>
                    <DialogDescription>
                        Update task details.
                    </DialogDescription>
                </DialogHeader>

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
                            <Select value={data.status} onValueChange={(value) => setData('status', value as typeof data.status)}>
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
                            <Select value={data.priority} onValueChange={(value) => setData('priority', value as typeof data.priority)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={errors.priority} />
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

                    {/* Parent Task Section */}
                    {task.parent && (
                        <div className="mb-6 p-4 bg-muted/50 rounded-lg border">
                            <Label className="text-muted-foreground">Parent Task</Label>
                            <div className="mt-1 flex items-center gap-2">
                                <LinkIcon className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{task.parent.title}</span>
                            </div>
                        </div>
                    )}

                    {/* Subtasks Section */}
                    {subtasks.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label>Subtasks ({completedSubtasks}/{subtasks.length})</Label>
                                <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />

                            <div className="space-y-2">
                                {subtasks.map((subtask: any) => (
                                    <div key={subtask.id} className="flex items-center justify-between group p-2 rounded-md hover:bg-muted/50 border border-transparent hover:border-border transition-colors">
                                        <div className="flex items-center gap-3 flex-1">
                                            <Checkbox
                                                checked={subtask.is_completed}
                                                onCheckedChange={() => handleToggleSubtask(subtask)}
                                            />
                                            <span className={`text-sm ${subtask.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                                                {subtask.title}
                                            </span>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => handleDeleteSubtask(subtask)}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Attachments Section */}
                    <div className="space-y-4">
                        <Label>Attachments</Label>

                        <div className="grid grid-cols-2 gap-4">
                            {attachments.map((attachment: any) => (
                                <div key={attachment.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card text-card-foreground shadow-sm">
                                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                        <FileIcon className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate" title={attachment.file_name}>
                                            {attachment.file_name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {(attachment.file_size / 1024).toFixed(1)} KB
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => handleDeleteAttachment(attachment)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center gap-4">
                            <Input
                                type="file"
                                className="hidden"
                                id="file-upload"
                                onChange={handleFileUpload}
                                disabled={isUploading}
                            />
                            <Label
                                htmlFor="file-upload"
                                className={`flex items-center gap-2 px-4 py-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground cursor-pointer text-sm font-medium shadow-sm transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <Paperclip className="h-4 w-4" />
                                {isUploading ? 'Uploading...' : 'Upload File'}
                            </Label>
                        </div>
                    </div>

                    {/* Dependencies Section */}
                    <div className="space-y-4">
                        <Label>Dependencies</Label>

                        <div className="space-y-2">
                            {dependencies.map((dependency: any) => (
                                <div key={dependency.id} className="flex items-center justify-between group p-2 rounded-md border bg-muted/20">
                                    <div className="flex items-center gap-2">
                                        <Lock className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-sm font-medium">{dependency.title}</span>
                                        <Badge variant="outline" className="text-[10px] h-5">
                                            {dependency.status.replace('_', ' ')}
                                        </Badge>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => handleRemoveDependency(dependency)}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <Select value={selectedDependencyId} onValueChange={setSelectedDependencyId}>
                                <SelectTrigger className="flex-1">
                                    <SelectValue placeholder="Add blocking task..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableTasks.map((t) => (
                                        <SelectItem key={t.id} value={String(t.id)}>
                                            {t.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button type="button" size="icon" onClick={handleAddDependency} disabled={!selectedDependencyId}>
                                <LinkIcon className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4">
                        <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            Update Task
                        </Button>
                    </div>
                </form>
            </DialogContent >
        </Dialog >
    );
}
