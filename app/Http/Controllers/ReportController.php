<?php

namespace App\Http\Controllers;

use App\Models\TaskReport;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Auth;

class ReportController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // Task Reports
        $taskReports = TaskReport::with(['task', 'user'])
            ->latest()
            ->get();

        // System Logs (Admin only)
        $logs = [];
        if ($user->isAdmin()) {
            $logFile = storage_path('logs/laravel.log');
            if (File::exists($logFile)) {
                $fileContent = File::get($logFile);
                // Get last 100 lines
                $lines = explode("\n", $fileContent);
                $logs = array_slice($lines, -100);
            }
        }

        return Inertia::render('reports/index', [
            'taskReports' => $taskReports,
            'logs' => $logs,
            'isAdmin' => $user->isAdmin(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'task_id' => 'required|exists:tasks,id',
            'issue_type' => 'required|string',
            'description' => 'required|string',
        ]);

        TaskReport::create([
            'task_id' => $validated['task_id'],
            'user_id' => Auth::id(),
            'issue_type' => $validated['issue_type'],
            'description' => $validated['description'],
        ]);

        return redirect()->back()->with('success', 'Report submitted successfully.');
    }
}
