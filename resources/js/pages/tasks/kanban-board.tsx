import { Task } from '@/types';
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';
import { router } from '@inertiajs/react';
import { Calendar, Clock, CheckCircle2, Circle, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface KanbanBoardProps {
    initialTasks: Task[];
    search?: string;
}

const COLUMNS = {
    pending: { title: 'To Do', color: 'bg-zinc-100 dark:bg-zinc-900', icon: Circle },
    in_progress: { title: 'In Progress', color: 'bg-blue-50/50 dark:bg-blue-950/20', icon: Clock },
    completed: { title: 'Completed', color: 'bg-green-50/50 dark:bg-green-950/20', icon: CheckCircle2 },
};

export default function KanbanBoard({ initialTasks, search = '' }: KanbanBoardProps) {
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    useEffect(() => {
        setTasks(initialTasks);
    }, [initialTasks]);

    const onDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        const newTasks = Array.from(tasks);
        const movedTask = newTasks.find(t => t.id === Number(draggableId));

        if (!movedTask) return;

        // Optimistic update
        const updatedTask = { ...movedTask, status: destination.droppableId as Task['status'] };

        // Remove from old position
        const sourceColumnTasks = newTasks.filter(t => t.status === source.droppableId);
        const destColumnTasks = newTasks.filter(t => t.status === destination.droppableId);

        // Calculate new order
        // This is a simplified reordering for UI, backend handles exact indices
        const otherTasks = newTasks.filter(t => t.id !== movedTask.id);
        const newTaskList = [...otherTasks, updatedTask];

        setTasks(newTaskList);

        // Prepare data for backend
        // We need to send the new order of ALL tasks in the destination column
        // plus the moved task with its new status

        // Re-calculate the order for the backend
        const reorderedTasks = newTaskList.map((t, index) => ({
            id: t.id,
            status: t.status,
            order: index // Simplified: just using array index as order for now
        }));

        router.post(route('tasks.reorder'), {
            items: reorderedTasks
        }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                // Optional: refresh tasks from server to ensure sync
            }
        });
    };

    const getTasksByStatus = (status: string) => {
        return tasks
            .filter(task => task.status === status)
            .filter(task => {
                if (!search) return true;
                const searchLower = search.toLowerCase();
                return (
                    task.title.toLowerCase().includes(searchLower) ||
                    (task.description && task.description.toLowerCase().includes(searchLower)) ||
                    (task.user && task.user.name.toLowerCase().includes(searchLower))
                );
            })
            .sort((a, b) => (a.order || 0) - (b.order || 0));
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this task?')) {
            router.delete(route('tasks.destroy', id));
        }
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex h-full flex-col md:flex-row gap-6 overflow-x-auto pb-4">
                {(Object.keys(COLUMNS) as Array<keyof typeof COLUMNS>).map((status) => {
                    const ColumnIcon = COLUMNS[status].icon;
                    return (
                        <div key={status} className={`flex h-full min-w-[300px] flex-1 flex-col rounded-xl border ${COLUMNS[status].color} p-4`}>
                            <div className="mb-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <ColumnIcon className="h-5 w-5 text-muted-foreground" />
                                    <h3 className="font-semibold text-muted-foreground">{COLUMNS[status].title}</h3>
                                    <span className="rounded-full bg-background px-2 py-0.5 text-xs font-medium text-muted-foreground border">
                                        {getTasksByStatus(status).length}
                                    </span>
                                </div>
                            </div>

                            <Droppable droppableId={status}>
                                {(provided) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className="flex flex-1 flex-col gap-3"
                                    >
                                        {getTasksByStatus(status).map((task, index) => (
                                            <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        onClick={() => setSelectedTask(task)}
                                                        className={`group relative flex flex-col gap-2 rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md cursor-pointer ${snapshot.isDragging ? 'shadow-lg ring-2 ring-primary/20 rotate-2' : ''}`}
                                                        style={provided.draggableProps.style}
                                                    >
                                                        <div className="flex items-start justify-between gap-2">
                                                            <span className="font-medium leading-tight">{task.title}</span>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-6 w-6 -mr-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    >
                                                                        <MoreVertical className="h-3 w-3" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <Link href={route('tasks.edit', task.id)}>
                                                                        <DropdownMenuItem>
                                                                            <Pencil className="mr-2 h-3 w-3" /> Edit
                                                                        </DropdownMenuItem>
                                                                    </Link>
                                                                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(task.id)}>
                                                                        <Trash2 className="mr-2 h-3 w-3" /> Delete
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>

                                                        {task.description && (
                                                            <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
                                                        )}

                                                        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                                                            <div className="flex items-center gap-2">
                                                                {task.due_date ? (
                                                                    <div className={`flex items-center gap-1 ${new Date(task.due_date) < new Date() && status !== 'completed' ? 'text-destructive font-medium' : ''}`}>
                                                                        <Calendar className="h-3 w-3" />
                                                                        <span>{new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                                                    </div>
                                                                ) : (
                                                                    <div />
                                                                )}
                                                                {task.user && (
                                                                    <div className="flex items-center gap-1 text-muted-foreground" title={`Assigned to ${task.user.name}`}>
                                                                        <div className="h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-medium text-primary">
                                                                            {task.user.name.charAt(0)}
                                                                        </div>
                                                                        <span className="max-w-[80px] truncate">{task.user.name}</span>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
                                                                <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
                                                                <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    );
                })}
            </div>

            {/* Task Details Modal */}
            <Dialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
                <DialogContent className="max-w-2xl">
                    {selectedTask && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-xl font-bold">{selectedTask.title}</DialogTitle>
                                <DialogDescription>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Badge variant={
                                            selectedTask.status === 'completed' ? 'default' :
                                                selectedTask.status === 'in_progress' ? 'secondary' :
                                                    'outline'
                                        }>
                                            {selectedTask.status === 'pending' && <Circle className="h-3 w-3 mr-1" />}
                                            {selectedTask.status === 'in_progress' && <Clock className="h-3 w-3 mr-1" />}
                                            {selectedTask.status === 'completed' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                                            {selectedTask.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </Badge>
                                        {selectedTask.due_date && (
                                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                Due: {new Date(selectedTask.due_date).toLocaleDateString(undefined, {
                                                    weekday: 'short',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                        )}
                                    </div>
                                </DialogDescription>
                            </DialogHeader>

                            <div className="mt-4 space-y-4">
                                {selectedTask.description && (
                                    <div>
                                        <h4 className="text-sm font-semibold mb-2">Description</h4>
                                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedTask.description}</p>
                                    </div>
                                )}

                                {selectedTask.user && (
                                    <div>
                                        <h4 className="text-sm font-semibold mb-2">Assigned To</h4>
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                                                {selectedTask.user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{selectedTask.user.name}</p>
                                                <p className="text-xs text-muted-foreground">{selectedTask.user.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-2 pt-4 border-t">
                                    <Link href={route('tasks.edit', selectedTask.id)} className="flex-1">
                                        <Button variant="outline" className="w-full">
                                            <Pencil className="mr-2 h-4 w-4" />
                                            Edit Task
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="destructive"
                                        onClick={() => {
                                            setSelectedTask(null);
                                            handleDelete(selectedTask.id);
                                        }}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </DragDropContext>
    );
}
