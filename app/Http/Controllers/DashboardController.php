<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $stats = [];

        if ($user->isAdmin()) {
            $stats = [
                'totalTasks' => Task::count(),
                'tasksByStatus' => [
                    'pending' => Task::where('status', 'pending')->count(),
                    'in_progress' => Task::where('status', 'in_progress')->count(),
                    'completed' => Task::where('status', 'completed')->count(),
                ],
                'overdueTasks' => Task::where('due_date', '<', now())
                    ->where('status', '!=', 'completed')
                    ->count(),
                'recentActivity' => Task::with('user')
                    ->latest()
                    ->take(5)
                    ->get(),
                'userPerformance' => User::withCount([
                    'tasks as completed_tasks_count' => function ($query) {
                        $query->where('status', 'completed');
                    }
                ])->get()->map(function ($user) {
                    return [
                        'name' => $user->name,
                        'completed_tasks' => $user->completed_tasks_count,
                    ];
                }),
            ];
        } else {
            $stats = [
                'myTotalTasks' => $user->tasks()->count(),
                'myTasksByStatus' => [
                    'pending' => $user->tasks()->where('status', 'pending')->count(),
                    'in_progress' => $user->tasks()->where('status', 'in_progress')->count(),
                    'completed' => $user->tasks()->where('status', 'completed')->count(),
                ],
                'dueToday' => $user->tasks()
                    ->whereDate('due_date', today())
                    ->where('status', '!=', 'completed')
                    ->get(),
                'upcomingDeadlines' => $user->tasks()
                    ->whereBetween('due_date', [now(), now()->addDays(7)])
                    ->where('status', '!=', 'completed')
                    ->orderBy('due_date')
                    ->get(),
                'completionRate' => $user->tasks()->count() > 0
                    ? round(($user->tasks()->where('status', 'completed')->count() / $user->tasks()->count()) * 100)
                    : 0,
            ];
        }

        return Inertia::render('dashboard/index', [
            'stats' => $stats,
            'isAdmin' => $user->isAdmin(),
        ]);
    }
}
