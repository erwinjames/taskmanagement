<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');

    Route::get('projects', function () {
        return Inertia::render('projects/index');
    })->name('projects.index');

    Route::get('calendar', function () {
        return Inertia::render('calendar/index');
    })->name('calendar.index');

    Route::get('team', function () {
        return Inertia::render('team/index');
    })->name('team.index');

    Route::get('reports', [\App\Http\Controllers\ReportController::class, 'index'])->name('reports.index');
    Route::post('reports/task', [\App\Http\Controllers\ReportController::class, 'store'])->name('reports.store');

    Route::get('activity', function () {
        return Inertia::render('activity/index');
    })->name('activity.index');

    Route::get('archive', function () {
        return Inertia::render('archive/index');
    })->name('archive.index');

    Route::get('tags', function () {
        return Inertia::render('tags/index');
    })->name('tags.index');

    Route::get('help', function () {
        return Inertia::render('help/index');
    })->name('help.index');

    Route::post('tasks/reorder', [\App\Http\Controllers\TaskController::class, 'reorder'])->name('tasks.reorder');
    Route::post('tasks/{task}/subtasks', [\App\Http\Controllers\TaskController::class, 'addSubtask'])->name('tasks.subtasks.store');
    Route::put('subtasks/{subtask}', [\App\Http\Controllers\TaskController::class, 'updateSubtask'])->name('subtasks.update');
    Route::delete('subtasks/{subtask}', [\App\Http\Controllers\TaskController::class, 'deleteSubtask'])->name('subtasks.destroy');
    Route::post('tasks/{task}/attachments', [\App\Http\Controllers\TaskController::class, 'uploadAttachment'])->name('tasks.attachments.store');
    Route::delete('attachments/{attachment}', [\App\Http\Controllers\TaskController::class, 'deleteAttachment'])->name('attachments.destroy');
    Route::post('tasks/{task}/dependencies', [\App\Http\Controllers\TaskController::class, 'addDependency'])->name('tasks.dependencies.store');
    Route::delete('tasks/{task}/dependencies/{dependency}', [\App\Http\Controllers\TaskController::class, 'removeDependency'])->name('tasks.dependencies.destroy');
    Route::post('tasks/bulk-action', [\App\Http\Controllers\TaskController::class, 'bulkAction'])->name('tasks.bulk_action');
    Route::resource('tasks', \App\Http\Controllers\TaskController::class);
});

require __DIR__ . '/settings.php';
