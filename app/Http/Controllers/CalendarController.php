<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CalendarController extends Controller
{
    public function index(Request $request)
    {
        $query = Task::query()
            ->with(['user', 'project'])
            ->whereNotNull('due_date');

        // Filter by project if provided
        if ($request->has('project_id')) {
            $query->where('project_id', $request->project_id);
        }

        // Filter by user if provided
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        $tasks = $query->get()->map(function ($task) {
            return [
                'id' => $task->id,
                'title' => $task->title,
                'start' => $task->due_date,
                'end' => $task->due_date, // Assuming single day tasks for now
                'allDay' => true,
                'status' => $task->status,
                'priority' => $task->priority,
                'resource' => $task,
            ];
        });

        return Inertia::render('calendar/index', [
            'events' => $tasks,
        ]);
    }

    public function updateDate(Request $request, Task $task)
    {
        $request->validate([
            'date' => 'required|date',
        ]);

        $task->update([
            'due_date' => $request->date,
        ]);

        return back()->with('success', 'Task rescheduled successfully.');
    }
}
