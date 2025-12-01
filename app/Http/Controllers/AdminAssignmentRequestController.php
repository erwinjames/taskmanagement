<?php

namespace App\Http\Controllers;

use App\Models\AdminAssignmentRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminAssignmentRequestController extends Controller
{
    public function index(Request $request)
    {
        // Get pending assignment requests for the current admin
        $requests = AdminAssignmentRequest::where('requested_admin_id', $request->user()->id)
            ->where('status', 'pending')
            ->with('user')
            ->get();

        return response()->json($requests);
    }

    public function show(Request $request, AdminAssignmentRequest $assignmentRequest)
    {
        // Verify the current user is the requested admin
        if ($assignmentRequest->requested_admin_id !== $request->user()->id) {
            abort(403);
        }

        return response()->json($assignmentRequest->load('user'));
    }

    public function approve(Request $request, AdminAssignmentRequest $assignmentRequest)
    {
        // Verify the current user is the requested admin
        if ($assignmentRequest->requested_admin_id !== $request->user()->id) {
            abort(403);
        }

        // Update the user's admin_id
        $assignmentRequest->user->update([
            'admin_id' => $assignmentRequest->requested_admin_id,
        ]);

        // Mark the request as approved
        $assignmentRequest->update(['status' => 'approved']);

        return redirect()->back()->with('success', 'Assignment request approved');
    }

    public function reject(Request $request, AdminAssignmentRequest $assignmentRequest)
    {
        // Verify the current user is the requested admin
        if ($assignmentRequest->requested_admin_id !== $request->user()->id) {
            abort(403);
        }

        // Mark the request as rejected
        $assignmentRequest->update(['status' => 'rejected']);

        return redirect()->back()->with('success', 'Assignment request rejected');
    }
}
