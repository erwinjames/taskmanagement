<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdminAssignmentRequest extends Model
{
    protected $fillable = [
        'user_id',
        'requested_admin_id',
        'status',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function requestedAdmin()
    {
        return $this->belongsTo(User::class, 'requested_admin_id');
    }

    public function isPending()
    {
        return $this->status === 'pending';
    }
}
