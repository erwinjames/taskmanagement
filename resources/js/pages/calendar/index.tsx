import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { BreadcrumbItem, Task } from '@/types';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../../../css/calendar.css';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import { useState, useCallback } from 'react';
import { CreateTaskDialog } from '@/components/tasks/create-task-dialog';
import { EditTaskDialog } from '@/components/tasks/edit-task-dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const locales = {
    'en-US': enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

const DnDCalendar = withDragAndDrop(Calendar);

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Calendar', href: '/calendar' },
];

interface CalendarEvent {
    id: number;
    title: string;
    start: Date;
    end: Date;
    allDay: boolean;
    resource: Task;
    status: string;
    priority: string;
}

interface Props {
    events: any[];
}

export default function CalendarIndex({ events: initialEvents }: Props) {
    const [events, setEvents] = useState<CalendarEvent[]>(
        initialEvents.map(event => ({
            ...event,
            start: new Date(event.start),
            end: new Date(event.end),
        }))
    );
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [currentView, setCurrentView] = useState<typeof Views[keyof typeof Views]>(Views.MONTH);

    const eventStyleGetter = (event: CalendarEvent) => {
        let backgroundColor = '#3b82f6'; // blue-500 default

        switch (event.priority) {
            case 'high':
                backgroundColor = '#ef4444'; // red-500
                break;
            case 'medium':
                backgroundColor = '#eab308'; // yellow-500
                break;
            case 'low':
                backgroundColor = '#3b82f6'; // blue-500
                break;
        }

        if (event.status === 'completed') {
            backgroundColor = '#22c55e'; // green-500
        }

        return {
            style: {
                backgroundColor,
                borderRadius: '4px',
                opacity: 0.8,
                color: 'white',
                border: '0px',
                display: 'block',
            },
        };
    };

    const onEventDrop = useCallback(
        ({ event, start, end }: any) => {
            const updatedEvent = { ...event, start, end };

            // Optimistic update
            setEvents(prev => prev.map(e => e.id === event.id ? updatedEvent : e));

            // Backend update
            router.put(route('calendar.tasks.reschedule', event.id), {
                date: format(start, 'yyyy-MM-dd'),
            }, {
                onError: () => {
                    // Revert on error
                    setEvents(prev => prev.map(e => e.id === event.id ? event : e));
                }
            });
        },
        []
    );

    const handleSelectSlot = useCallback(
        ({ start }: { start: Date }) => {
            setSelectedDate(start);
            setIsCreateOpen(true);
        },
        []
    );

    const handleSelectEvent = useCallback(
        (event: CalendarEvent) => {
            setSelectedTask(event.resource);
            setIsEditOpen(true);
        },
        []
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Calendar" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 overflow-hidden">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Calendar</h2>
                        <p className="text-muted-foreground">Manage your tasks schedule.</p>
                    </div>
                    <Button onClick={() => setIsCreateOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> New Task
                    </Button>
                </div>

                <div className="rounded-xl border bg-card p-6 h-[calc(100vh-200px)]">
                    {/* @ts-ignore */}
                    <DnDCalendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: '100%' }}
                        views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
                        view={currentView}
                        date={currentDate}
                        onNavigate={(date) => setCurrentDate(date)}
                        onView={(view) => setCurrentView(view)}
                        eventPropGetter={eventStyleGetter}
                        onSelectEvent={handleSelectEvent}
                        onSelectSlot={handleSelectSlot}
                        selectable
                        popup
                        draggableAccessor={() => true}
                        onEventDrop={onEventDrop}
                        resizable={false}
                    />
                </div>

                <CreateTaskDialog
                    open={isCreateOpen}
                    onOpenChange={setIsCreateOpen}
                    initialDate={selectedDate}
                />

                <EditTaskDialog
                    task={selectedTask}
                    open={isEditOpen}
                    onOpenChange={(open) => {
                        setIsEditOpen(open);
                        if (!open) setSelectedTask(null);
                    }}
                />
            </div>
        </AppLayout>
    );
}
