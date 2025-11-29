<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\Subtask;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class TaskController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = auth()->user();

        if ($user->isAdmin()) {
            // Admin sees tasks they assigned to OTHER users (not themselves)
            $tasks = Task::where('user_id', '!=', $user->id)
                ->with(['user', 'subtasks', 'attachments', 'dependencies'])
                ->orderBy('order')
                ->latest()
                ->get();
        } else {
            // Regular users see their own tasks
            $tasks = $user->tasks()
                ->with(['user', 'subtasks', 'attachments', 'dependencies'])
                ->orderBy('order')
                ->latest()
                ->get();
        }

        $users = $user->isAdmin() ? \App\Models\User::all() : [];

        return Inertia::render('tasks/index', [
            'tasks' => $tasks,
            'users' => $users,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $users = auth()->user()->isAdmin() ? \App\Models\User::all() : [];
        return Inertia::render('tasks/create', ['users' => $users]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|in:pending,in_progress,completed',
            'priority' => 'required|in:low,medium,high',
            'due_date' => 'nullable|date',
            'assigned_to' => 'nullable|exists:users,id',
            'subtasks' => 'nullable|array',
            'subtasks.*' => 'string|max:255',
        ]);

        $task = Task::create([
            'user_id' => $validated['assigned_to'] ?? Auth::id(), // Assign to selected user or self
            'title' => $validated['title'],
            'description' => $validated['description'],
            'status' => $validated['status'],
            'priority' => $validated['priority'],
            'due_date' => $validated['due_date'],
            'created_by' => Auth::id(),
        ]);

        if (!empty($validated['subtasks'])) {
            foreach ($validated['subtasks'] as $subtaskTitle) {
                $task->subtasks()->create([
                    'title' => $subtaskTitle,
                    'is_completed' => false,
                ]);
            }
        }

        return redirect()->route('tasks.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(Task $task)
    {
        $this->authorize('view', $task);
        return Inertia::render('tasks/show', ['task' => $task]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Task $task)
    {
        $this->authorize('update', $task);
        return Inertia::render('tasks/edit', ['task' => $task]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Task $task)
    {
        $this->authorize('update', $task);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|in:pending,in_progress,completed',
            'priority' => 'required|in:low,medium,high',
            'due_date' => 'nullable|date',
            'user_id' => 'nullable|exists:users,id',
        ]);

        if ($validated['status'] === 'completed' && $task->isBlocked()) {
            return back()->withErrors(['status' => 'Task is blocked by incomplete dependencies.']);
        }

        $task->update($validated);

        return redirect()->route('tasks.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Task $task)
    {
        $this->authorize('delete', $task);
        $task->delete();

        return redirect()->route('tasks.index');
    }

    public function reorder(Request $request)
    {
        $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|exists:tasks,id',
            'items.*.order' => 'required|integer',
            'items.*.status' => 'required|in:pending,in_progress,completed',
        ]);

        foreach ($request->items as $item) {
            $task = Task::find($item['id']);
            if ($task && $task->user_id === auth()->id()) {
                $task->update([
                    'order' => $item['order'],
                    'status' => $item['status'],
                ]);
            }
        }

        return back();
    }

    public function addSubtask(Request $request, Task $task)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
        ]);

        $task->subtasks()->create([
            'title' => $validated['title'],
            'is_completed' => false,
        ]);

        return back();
    }

    public function updateSubtask(Request $request, Subtask $subtask)
    {
        $validated = $request->validate([
            'is_completed' => 'boolean',
            'title' => 'string|max:255',
        ]);

        $subtask->update($validated);

        // Auto-update task status based on progress
        $this->updateStatusFromProgress($subtask->task);

        return back();
    }

    public function deleteSubtask(Subtask $subtask)
    {
        $task = $subtask->task;
        $subtask->delete();

        // Auto-update task status based on progress
        $this->updateStatusFromProgress($task);

        return back();
    }

    protected function updateStatusFromProgress(Task $task)
    {
        $task->load('subtasks');
        $total = $task->subtasks->count();

        if ($total === 0)
            return;

        $completed = $task->subtasks->where('is_completed', true)->count();

        if ($completed === 0) {
            $task->update(['status' => 'pending']);
        } elseif ($completed === $total) {
            // Check dependencies before marking as completed
            if (!$task->isBlocked()) {
                $task->update(['status' => 'completed']);
            } else {
                // If blocked, maybe keep as in_progress or just don't update to completed?
                // For now, let's set to in_progress if blocked but all subtasks done
                $task->update(['status' => 'in_progress']);
            }
        } else {
            $task->update(['status' => 'in_progress']);
        }
    }

    public function uploadAttachment(Request $request, Task $task)
    {
        $request->validate([
            'file' => 'required|file|max:10240', // 10MB max
        ]);

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $fileName = $file->getClientOriginalName();
            $fileType = $file->getClientMimeType();
            $fileSize = $file->getSize();

            $path = $file->store('attachments/' . $task->id, 'public');

            $task->attachments()->create([
                'file_path' => $path,
                'file_name' => $fileName,
                'file_type' => $fileType,
                'file_size' => $fileSize,
            ]);
        }

        return back();
    }

    public function deleteAttachment(\App\Models\TaskAttachment $attachment)
    {
        // Delete file from storage
        if (\Illuminate\Support\Facades\Storage::disk('public')->exists($attachment->file_path)) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($attachment->file_path);
        }

        $attachment->delete();
        return back();
    }

    public function addDependency(Request $request, Task $task)
    {
        $validated = $request->validate([
            'dependency_id' => 'required|exists:tasks,id|different:task_id',
        ]);

        // Prevent circular dependencies (simple check)
        if ($task->id == $validated['dependency_id']) {
            return back()->withErrors(['dependency_id' => 'Cannot depend on itself.']);
        }

        $task->dependencies()->syncWithoutDetaching([$validated['dependency_id']]);

        return back();
    }

    public function removeDependency(Task $task, Task $dependency)
    {
        $task->dependencies()->detach($dependency->id);
        return back();
    }

    public function bulkAction(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:tasks,id',
            'action' => 'required|string|in:delete,update_status',
            'value' => 'nullable|string',
        ]);

        $tasks = Task::whereIn('id', $validated['ids'])->get();

        foreach ($tasks as $task) {
            // Check authorization (user can only modify their own tasks or admin)
            // For simplicity, assuming policy handles it or basic check:
            if ($request->user()->id !== $task->user_id && !$request->user()->isAdmin()) {
                continue;
            }

            if ($validated['action'] === 'delete') {
                $task->delete();
            } elseif ($validated['action'] === 'update_status') {
                if ($validated['value'] === 'completed' && $task->isBlocked()) {
                    continue; // Skip blocked tasks
                }
                $task->update(['status' => $validated['value']]);
            }
        }

        return back();
    }
}
