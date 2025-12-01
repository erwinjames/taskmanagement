<?php

namespace App\Http\Controllers;

use App\Models\TeamInvitation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;

class TeamInvitationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // Get invitations for current user's email
        $invitations = TeamInvitation::where('email', $user->email)
            ->where('status', 'pending')
            ->with('admin')
            ->get();

        return response()->json($invitations);
    }

    public function store(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'name' => 'nullable|string',
            'create_user' => 'boolean',
        ]);

        $admin = $request->user();

        if (!$admin->isAdmin()) {
            return back()->withErrors(['error' => 'Only admins can invite users.']);
        }

        // Check if user already exists
        $existingUser = User::where('email', $request->email)->first();

        if ($request->create_user) {
            // Admin is creating a new user directly
            if ($existingUser) {
                return back()->withErrors(['email' => 'User with this email already exists.']);
            }

            $user = User::create([
                'name' => $request->name ?? explode('@', $request->email)[0],
                'email' => $request->email,
                'password' => Hash::make(Str::random(16)), // Random password, user should reset
                'role' => 'member',
                'admin_id' => $admin->id,
                'status' => 'active',
            ]);

            return back()->with('success', 'User created successfully.');
        } else {
            // Admin is sending an invitation
            $invitation = TeamInvitation::create([
                'admin_id' => $admin->id,
                'email' => $request->email,
                'user_id' => $existingUser?->id,
                'token' => TeamInvitation::generateToken(),
                'expires_at' => now()->addDays(7),
            ]);

            // TODO: Send email notification

            return back()->with('success', 'Invitation sent successfully.');
        }
    }

    public function accept(Request $request, TeamInvitation $invitation)
    {
        $user = $request->user();

        if ($invitation->email !== $user->email) {
            return back()->withErrors(['error' => 'This invitation is not for you.']);
        }

        if (!$invitation->isPending()) {
            return back()->withErrors(['error' => 'This invitation is no longer valid.']);
        }

        // Update user's admin_id
        $user->update(['admin_id' => $invitation->admin_id]);

        // Mark invitation as accepted
        $invitation->update(['status' => 'accepted', 'user_id' => $user->id]);

        return redirect()->route('team.index')->with('success', 'You have joined the team!');
    }

    public function reject(Request $request, TeamInvitation $invitation)
    {
        $user = $request->user();

        if ($invitation->email !== $user->email) {
            return back()->withErrors(['error' => 'This invitation is not for you.']);
        }

        $invitation->update(['status' => 'rejected']);

        return back()->with('success', 'Invitation rejected.');
    }
}
