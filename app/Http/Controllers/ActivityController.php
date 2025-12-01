<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use Inertia\Inertia;

class ActivityController extends Controller
{
    public function index()
    {
        $activities = Activity::with(['user', 'subject'])
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        return Inertia::render('activity/index', [
            'activities' => $activities,
        ]);
    }
}
