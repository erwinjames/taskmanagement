<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class TeamInvitation extends Model
{
    use HasFactory;

    protected $fillable = [
        'admin_id',
        'email',
        'user_id',
        'status',
        'token',
        'expires_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
    ];

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public static function generateToken()
    {
        return Str::random(32);
    }

    public function isExpired()
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    public function isPending()
    {
        return $this->status === 'pending' && !$this->isExpired();
    }
}
