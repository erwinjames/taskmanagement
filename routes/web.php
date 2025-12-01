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

    Route::post('projects/{project}/star', [\App\Http\Controllers\ProjectController::class, 'toggleStar'])->name('projects.star');
    Route::resource('projects', \App\Http\Controllers\ProjectController::class);

    Route::get('calendar', [\App\Http\Controllers\CalendarController::class, 'index'])->name('calendar.index');
    Route::put('calendar/tasks/{task}/reschedule', [\App\Http\Controllers\CalendarController::class, 'updateDate'])->name('calendar.tasks.reschedule');

    Route::get('team', [\App\Http\Controllers\TeamController::class, 'index'])->name('team.index');
    Route::post('team/invite', [\App\Http\Controllers\TeamInvitationController::class, 'store'])->name('team.invite');
    Route::get('team/invitations', [\App\Http\Controllers\TeamInvitationController::class, 'index'])->name('team.invitations');
    Route::post('team/invitations/{invitation}/accept', [\App\Http\Controllers\TeamInvitationController::class, 'accept'])->name('team.invitations.accept');
    Route::post('team/invitations/{invitation}/reject', [\App\Http\Controllers\TeamInvitationController::class, 'reject'])->name('team.invitations.reject');

    Route::get('admin/assignment-requests', [\App\Http\Controllers\AdminAssignmentRequestController::class, 'index'])->name('admin.assignment-requests');
    Route::get('admin/assignment-requests/{assignmentRequest}', [\App\Http\Controllers\AdminAssignmentRequestController::class, 'show'])->name('admin.assignment-requests.show');
    Route::post('admin/assignment-requests/{assignmentRequest}/approve', [\App\Http\Controllers\AdminAssignmentRequestController::class, 'approve'])->name('admin.assignment-requests.approve');
    Route::post('admin/assignment-requests/{assignmentRequest}/reject', [\App\Http\Controllers\AdminAssignmentRequestController::class, 'reject'])->name('admin.assignment-requests.reject');

    Route::get('reports', [\App\Http\Controllers\ReportController::class, 'index'])->name('reports.index');
    Route::post('reports/task', [\App\Http\Controllers\ReportController::class, 'store'])->name('reports.store');

    Route::get('activity', [\App\Http\Controllers\ActivityController::class, 'index'])->name('activity.index');

    Route::get('archive', [\App\Http\Controllers\ArchiveController::class, 'index'])->name('archive.index');
    Route::post('archive/restore', [\App\Http\Controllers\ArchiveController::class, 'restore'])->name('archive.restore');
    Route::delete('archive/destroy', [\App\Http\Controllers\ArchiveController::class, 'destroy'])->name('archive.destroy');
    Route::get('archive/export', [\App\Http\Controllers\ArchiveController::class, 'export'])->name('archive.export');

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
