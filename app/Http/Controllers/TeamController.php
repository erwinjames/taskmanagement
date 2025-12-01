<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TeamController extends Controller
{
    public function index(Request $request)
    {
        $currentUser = $request->user();

        // Build base query based on user role
        if ($currentUser->isAdmin()) {
            // Admin sees all users under them (their team members)
            $query = User::query()
                ->where(function ($q) use ($currentUser) {
                    $q->where('admin_id', $currentUser->id)
                        ->orWhere('id', $currentUser->id); // Include self
                })
                ->with(['tasks', 'projects']);
        } else {
            // Regular users see teammates (users with the same admin_id) AND their admin
            $query = User::query()
                ->where(function ($q) use ($currentUser) {
                    $q->where('admin_id', $currentUser->admin_id)
                        ->orWhere('id', $currentUser->admin_id);
                })
                ->with(['tasks', 'projects']);
        }

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('department', 'like', "%{$search}%");
            });
        }

        // Filter by role
        if ($request->has('role') && $request->role) {
            $query->where('role', $request->role);
        }

        // Filter by department
        if ($request->has('department') && $request->department) {
            $query->where('department', $request->department);
        }

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Sort
        $sortBy = $request->get('sort_by', 'name');
        $sortOrder = $request->get('sort_order', 'asc');

        switch ($sortBy) {
            case 'tasks':
                $query->withCount('tasks')->orderBy('tasks_count', $sortOrder);
                break;
            case 'activity':
                $query->orderBy('last_active_at', $sortOrder);
                break;
            case 'joined':
                $query->orderBy('created_at', $sortOrder);
                break;
            default:
                $query->orderBy($sortBy, $sortOrder);
        }

        $members = $query->get()->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'department' => $user->department,
                'status' => $user->status,
                'skills' => $user->skills,
                'last_active_at' => $user->last_active_at,
                'created_at' => $user->created_at,
                'task_statistics' => [
                    'total' => $user->tasks->count(),
                    'completed' => $user->tasks->where('status', 'completed')->count(),
                    'in_progress' => $user->tasks->where('status', 'in_progress')->count(),
                    'pending' => $user->tasks->where('status', 'pending')->count(),
                ],
                'project_count' => $user->projects->count(),
            ];
        });

        // Get unique departments and roles for filters
        $departments = User::whereNotNull('department')->distinct()->pluck('department');
        $roles = User::distinct()->pluck('role');

        // Team statistics
        $statistics = [
            'total_members' => User::count(),
            'active_members' => User::where('status', 'active')->count(),
            'total_tasks' => \App\Models\Task::count(),
            'completed_tasks' => \App\Models\Task::where('status', 'completed')->count(),
        ];

        return Inertia::render('team/index', [
            'members' => $members,
            'departments' => $departments,
            'roles' => $roles,
            'statistics' => $statistics,
            'filters' => [
                'search' => $request->search,
                'role' => $request->role,
                'department' => $request->department,
                'status' => $request->status,
                'sort_by' => $sortBy,
                'sort_order' => $sortOrder,
            ],
            'auth' => [
                'user' => $currentUser,
            ],
        ]);
    }
}
