<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\SupervisorStoreRequest;
use App\Http\Requests\SupervisorUpdateRequest;
use App\Mail\SupervisorInvitation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;

class SupervisorController extends Controller
{
    public function index(Request $request)
    {
        $supervisors = User::query()
            ->where('role', 'supervisor')
            ->when($request->filled('search'), function ($query) use ($request) {
                $term = $request->string('search');
                $query->where('name', 'like', "%{$term}%")
                    ->orWhere('email', 'like', "%{$term}%");
            })
            ->when($request->filled('sort'), function ($query) use ($request) {
                $sort = $request->string('sort');
                $direction = $request->string('direction', 'asc');
                $query->orderBy($sort, $direction);
            }, function ($query) {
                $query->orderBy('name');
            })
            ->paginate(25);

        return Inertia::render('admin/supervisors/index', [
            'supervisors' => $supervisors->items(),
            'pagination' => [
                'current_page' => $supervisors->currentPage(),
                'last_page' => $supervisors->lastPage(),
                'per_page' => $supervisors->perPage(),
                'total' => $supervisors->total(),
            ],
            'filters' => $request->only(['search', 'sort', 'direction']),
        ]);
    }

    public function store(SupervisorStoreRequest $request)
    {
        $data = $request->validated();
        $data['role'] = 'supervisor';
        $data['password'] = bcrypt($data['password']);
        $data['invitation_token'] = Str::random(60);

        $supervisor = User::create($data);

        // Refresh the model to ensure we have the latest data
        $supervisor->refresh();

        // Send invitation email only if token exists
        if ($supervisor->invitation_token) {
            Mail::to($supervisor->email)->send(new SupervisorInvitation($supervisor));
        }

        return redirect()->route('supervisors.index')
            ->with('success', 'Supervisor created and invitation sent successfully.');
    }

    public function update(SupervisorUpdateRequest $request, User $supervisor)
    {
        $data = $request->validated();

        if (isset($data['password'])) {
            $data['password'] = bcrypt($data['password']);
        } else {
            unset($data['password']);
        }

        $supervisor->update($data);

        return redirect()->route('supervisors.index')
            ->with('success', 'Supervisor updated successfully.');
    }

    public function destroy(User $supervisor)
    {
        $supervisor->delete();

        return redirect()->route('supervisors.index')
            ->with('success', 'Supervisor deleted successfully.');
    }

    public function resendInvitation(User $supervisor)
    {
        if ($supervisor->invitation_accepted_at) {
            return redirect()->route('supervisors.index')
                ->with('error', 'Supervisor has already accepted the invitation.');
        }

        $supervisor->invitation_token = Str::random(60);
        $supervisor->save();

        // Refresh to ensure we have the latest token
        $supervisor->refresh();

        Mail::to($supervisor->email)->send(new SupervisorInvitation($supervisor));

        return redirect()->route('supervisors.index')
            ->with('success', 'Invitation resent successfully.');
    }

    public function approve(User $supervisor)
    {
        if ($supervisor->invitation_accepted_at) {
            return redirect()->route('supervisors.index')
                ->with('error', 'Supervisor is already active.');
        }

        $supervisor->invitation_accepted_at = now();
        $supervisor->email_verified_at = now();
        $supervisor->invitation_token = null; // Clear the invitation token since it's no longer needed
        $supervisor->save();

        return redirect()->route('supervisors.index')
            ->with('success', 'Supervisor approved successfully.');
    }

    public function acceptInvitation($token)
    {
        $supervisor = User::where('invitation_token', $token)
            ->where('role', 'supervisor')
            ->firstOrFail();

        if ($supervisor->invitation_accepted_at) {
            return redirect()->route('login')
                ->with('error', 'Invitation has already been accepted.');
        }

        $supervisor->invitation_accepted_at = now();
        $supervisor->email_verified_at = now();
        $supervisor->save();

        return redirect()->route('login')
            ->with('success', 'Invitation accepted! You can now log in.');
    }
}
