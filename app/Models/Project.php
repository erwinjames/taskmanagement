<?php

namespace App\Models;

use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Project extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    protected $fillable = [
        'name',
        'description',
        'status',
        'priority',
        'start_date',
        'end_date',
        'deadline',
        'budget',
        'created_by',
        'assigned_to',
        'thumbnail_path',
        'color',
        'is_archived',
        'archive_notes',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'deadline' => 'date',
        'budget' => 'decimal:2',
        'is_archived' => 'boolean',
    ];

    public function owner()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function members()
    {
        return $this->belongsToMany(User::class, 'project_user')
            ->withPivot('role', 'is_starred')
            ->withTimestamps();
    }

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }
}
