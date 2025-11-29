import { Button } from '@/components/ui/button';
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

interface CreateReportDialogProps {
    task: Task | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateReportDialog({ task, open, onOpenChange }: CreateReportDialogProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        task_id: task?.id || 0,
        issue_type: '',
        description: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (!task) return;

        post(route('reports.store'), {
            onSuccess: () => {
                reset();
                onOpenChange(false);
            },
        });
    };

    if (!task) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Report Issue</DialogTitle>
                    <DialogDescription>
                        Report an issue with task: <span className="font-medium">{task.title}</span>
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-6">
                    {/* Hidden Task ID */}
                    <input type="hidden" value={task.id} />

                    <div className="grid gap-2">
                        <Label htmlFor="issue_type">Issue Type</Label>
                        <Select value={data.issue_type} onValueChange={(value) => setData('issue_type', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select issue type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="bug">Bug / Error</SelectItem>
                                <SelectItem value="blocker">Blocker</SelectItem>
                                <SelectItem value="clarification">Need Clarification</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError message={errors.issue_type} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Describe the issue in detail..."
                            className="min-h-[100px]"
                        />
                        <InputError message={errors.description} />
                    </div>

                    <div className="flex justify-end gap-4">
                        <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing} variant="destructive">
                            Submit Report
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
