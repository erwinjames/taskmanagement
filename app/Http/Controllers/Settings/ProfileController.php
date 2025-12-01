<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        // Get all admin users for the dropdown
        $admins = \App\Models\User::where('role', 'admin')->get(['id', 'name', 'email']);

        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
            'admins' => $admins,
        ]);
    }

    /**
     * Update the user's profile settings.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();

        // Handle admin_id change request
        if ($request->has('admin_id')) {
            $newAdminId = $request->admin_id;

            // If changing admin, create an assignment request
            if ($newAdminId != $user->admin_id) {
                // Cancel any existing pending requests
                \App\Models\AdminAssignmentRequest::where('user_id', $user->id)
                    ->where('status', 'pending')
                    ->update(['status' => 'rejected']);

                // Create new assignment request
                if ($newAdminId) {
                    $assignmentRequest = \App\Models\AdminAssignmentRequest::create([
                        'user_id' => $user->id,
                        'requested_admin_id' => $newAdminId,
                        'status' => 'pending',
                    ]);

                    $admin = \App\Models\User::find($newAdminId);
                    if ($admin) {
                        $assignmentRequest->load('user');
                        $admin->notify(new \App\Notifications\AdminAssignmentNotification($assignmentRequest));
                    }

                    return redirect()->route('profile.edit')->with('status', 'admin-request-sent');
                }
            }
        }

        $user->fill($request->validated());

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        return to_route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
