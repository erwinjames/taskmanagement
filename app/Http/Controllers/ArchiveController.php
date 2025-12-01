<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Task;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ArchiveController extends Controller
{
    public function index(Request $request)
    {
        $tab = $request->get('tab', 'tasks');
        $search = $request->get('search');
        $sort = $request->get('sort', 'deleted_at');
        $direction = $request->get('direction', 'desc');

        if ($tab === 'projects') {
            $query = Project::onlyTrashed()->with('owner');
        } else {
            $query = Task::onlyTrashed()->with(['project', 'user']);
        }

        if ($search) {
            $query->where(function ($q) use ($search, $tab) {
                $q->where('name', 'like', "%{$search}%") // Projects use 'name', Tasks use 'title'
                    ->orWhere('description', 'like', "%{$search}%");

                if ($tab !== 'projects') {
                    $q->orWhere('title', 'like', "%{$search}%");
                }
            });
        }

        $items = $query->orderBy($sort, $direction)->paginate(10)->withQueryString();

        $stats = [
            'total_archived_tasks' => Task::onlyTrashed()->count(),
            'total_archived_projects' => Project::onlyTrashed()->count(),
        ];

        return Inertia::render('archive/index', [
            'items' => $items,
            'stats' => $stats,
            'filters' => $request->all(['search', 'tab', 'sort', 'direction']),
        ]);
    }

    public function restore(Request $request)
    {
        $ids = $request->input('ids', []);
        $type = $request->input('type', 'tasks');

        if ($type === 'projects') {
            Project::onlyTrashed()->whereIn('id', $ids)->restore();
        } else {
            Task::onlyTrashed()->whereIn('id', $ids)->restore();
        }

        return redirect()->back()->with('success', 'Items restored successfully.');
    }

    public function export(Request $request)
    {
        $type = $request->input('type', 'tasks');
        $filename = "archived_{$type}_" . date('Y-m-d_H-i-s') . ".csv";

        $headers = [
            "Content-type" => "text/csv",
            "Content-Disposition" => "attachment; filename=$filename",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ];

        $callback = function () use ($type) {
            $file = fopen('php://output', 'w');

            if ($type === 'projects') {
                fputcsv($file, ['ID', 'Name', 'Description', 'Owner', 'Deleted At', 'Notes']);
                Project::onlyTrashed()->with('owner')->chunk(100, function ($items) use ($file) {
                    foreach ($items as $item) {
                        fputcsv($file, [
                            $item->id,
                            $item->name,
                            $item->description,
                            $item->owner->name ?? 'N/A',
                            $item->deleted_at,
                            $item->archive_notes
                        ]);
                    }
                });
            } else {
                fputcsv($file, ['ID', 'Title', 'Description', 'Project', 'User', 'Deleted At', 'Notes']);
                Task::onlyTrashed()->with(['project', 'user'])->chunk(100, function ($items) use ($file) {
                    foreach ($items as $item) {
                        fputcsv($file, [
                            $item->id,
                            $item->title,
                            $item->description,
                            $item->project->name ?? 'N/A',
                            $item->user->name ?? 'N/A',
                            $item->deleted_at,
                            $item->archive_notes
                        ]);
                    }
                });
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
