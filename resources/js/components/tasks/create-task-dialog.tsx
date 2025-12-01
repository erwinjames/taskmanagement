import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { useState } from 'react';
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
import { User } from '@/types';
import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface CreateTaskDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    users?: User[];
    initialDate?: Date | null;
}

export function CreateTaskDialog({ open, onOpenChange, users = [], initialDate }: CreateTaskDialogProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        description: '',
        status: 'pending' as 'pending' | 'in_progress' | 'completed',
        priority: 'medium' as 'low' | 'medium' | 'high',
        due_date: initialDate ? initialDate.toISOString().split('T')[0] : '',
        assigned_to: '',
        subtasks: [] as string[],
    });

    const [newSubtask, setNewSubtask] = useState('');

    const handleAddSubtask = () => {
        if (!newSubtask.trim()) return;
        setData('subtasks', [...data.subtasks, newSubtask]);
        setNewSubtask('');
    };

    const handleRemoveSubtask = (index: number) => {
        const newSubtasks = [...data.subtasks];
        newSubtasks.splice(index, 1);
        setData('subtasks', newSubtasks);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('tasks.store'), {
            onSuccess: () => {
                reset();
                onOpenChange(false);
            },
        });
    };

    // Update due_date when initialDate changes or dialog opens
    const [prevOpen, setPrevOpen] = useState(false);
    if (open !== prevOpen) {
        setPrevOpen(open);
        if (open && initialDate) {
            setData('due_date', initialDate.toISOString().split('T')[0]);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create Task</DialogTitle>
                    <DialogDescription>
                        Add a new task to your list.
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
                                onChange={(e) => setNewSubtask(e.target.value)}
                                placeholder="Add a subtask..."
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddSubtask();
                                    }
                                }}
                            />
                            <Button type="button" size="icon" onClick={handleAddSubtask} disabled={!newSubtask.trim()}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>

                        {data.subtasks.length > 0 && (
                            <div className="space-y-2">
                                {data.subtasks.map((subtask, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 rounded-md border bg-muted/20">
                                        <span className="text-sm">{subtask}</span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => handleRemoveSubtask(index)}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-4">
                        <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            Create Task
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog >
    );
}
