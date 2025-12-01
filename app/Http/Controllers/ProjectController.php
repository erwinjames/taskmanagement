<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class ProjectController extends Controller
{
    public function index(Request $request)
    {
        $query = Project::query()
            ->withCount([
                'tasks',
                'tasks as completed_tasks_count' => function ($query) {
                    $query->where('status', 'completed');
                }
            ])
            ->with('members');

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by priority
        if ($request->has('priority') && $request->priority !== 'all') {
            $query->where('priority', $request->priority);
        }

        // Search
        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // Sort
        $sort = $request->input('sort', 'created_at');
        $direction = $request->input('direction', 'desc');
        $query->orderBy($sort, $direction);

        $projects = $query->paginate(10);
        $total = Project::count();

        return Inertia::render('projects/index', [
            'projects' => array_merge($projects->toArray(), ['total' => $total]),
            'filters' => $request->only(['status', 'priority', 'search', 'sort', 'direction']),
            'users' => User::select('id', 'name')->get(),
        ]);
    }

    public function create()
    {
        $this->authorize('create', Project::class);
        return Inertia::render('projects/create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|in:active,on_hold,completed',
            'priority' => 'required|in:low,medium,high',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'deadline' => 'nullable|date',
            'budget' => 'nullable|numeric',
            'thumbnail_path' => 'nullable|string',
            'color' => 'nullable|string',
            'assigned_to' => 'nullable|exists:users,id',
        ]);

        $ownerId = Auth::id();
        if (Auth::user()->isAdmin() && $request->has('assigned_to') && $request->assigned_to) {
            $ownerId = $request->assigned_to;
        }

        $project = Project::create([
            ...$validated,
            'created_by' => $ownerId,
        ]);

        // Add creator as owner
        $project->members()->attach($ownerId, ['role' => 'owner']);

        return redirect()->route('projects.index')->with('success', 'Project created successfully.');
    }

    public function show(Project $project)
    {
        $this->authorize('view', $project);

        $project->load([
            'members',
            'tasks' => function ($query) {
                $query->latest();
            }
        ]);

        $project->loadCount([
            'tasks',
            'tasks as completed_tasks_count' => function ($query) {
                $query->where('status', 'completed');
            }
        ]);

        return Inertia::render('projects/show', [
            'project' => $project,
        ]);
    }

    public function edit(Project $project)
    {
        $this->authorize('update', $project);
        return Inertia::render('projects/edit', [
            'project' => $project,
        ]);
    }

    public function update(Request $request, Project $project)
    {
        $this->authorize('update', $project);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|in:active,on_hold,completed',
            'priority' => 'required|in:low,medium,high',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'deadline' => 'nullable|date',
            'budget' => 'nullable|numeric',
            'thumbnail_path' => 'nullable|string',
            'color' => 'nullable|string',
        ]);

        $project->update($validated);

        return redirect()->back()->with('success', 'Project updated successfully.');
    }

    public function destroy(Project $project)
    {
        $this->authorize('delete', $project);
        $project->delete();
        return redirect()->route('projects.index')->with('success', 'Project deleted successfully.');
    }

    public function toggleStar(Project $project)
    {
        $user = Auth::user();
        $isStarred = $user->projects()->where('project_id', $project->id)->first()->pivot->is_starred;

        $user->projects()->updateExistingPivot($project->id, ['is_starred' => !$isStarred]);

        return redirect()->back();
    }
}
