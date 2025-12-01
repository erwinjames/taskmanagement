<?php

namespace App\Models;

use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Task extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'status',
        'due_date',
        'order',
        'created_by',
        'priority',
        'parent_id',
        'project_id',
        'archive_notes',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function parent()
    {
        return $this->belongsTo(Task::class, 'parent_id');
    }

    public function subtasks()
    {
        return $this->hasMany(Task::class, 'parent_id');
    }

    public function attachments()
    {
        return $this->hasMany(TaskAttachment::class);
    }

    public function dependencies()
    {
        return $this->belongsToMany(Task::class, 'task_dependencies', 'task_id', 'dependency_id');
    }

    public function dependents()
    {
        return $this->belongsToMany(Task::class, 'task_dependencies', 'dependency_id', 'task_id');
    }

    public function isBlocked()
    {
        return $this->dependencies()->where('status', '!=', 'completed')->exists();
    }
}
