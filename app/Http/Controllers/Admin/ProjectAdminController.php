<?php

namespace App\Http\Controllers\Admin;

use App\Http\Requests\LaborStoreRequest;
use App\Models\Labor;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Inertia\Inertia;

class ProjectAdminController extends Controller
{
    public function index()
    {
        $projects = Project::latest()->paginate(20);
        return Inertia::render('admin/projects/index', [
            'projects' => [
                'data' => $projects->map(fn ($p) => [
                    'id' => $p->id,
                    'name' => $p->name,
                    'location_address' => $p->location_address,
                    'created_at' => optional($p->created_at)->toDateString(),
                ]),
                'meta' => [
                    'current_page' => $projects->currentPage(),
                    'last_page' => $projects->lastPage(),
                    'per_page' => $projects->perPage(),
                    'total' => $projects->total(),
                ],
            ],
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'location_address' => ['nullable', 'string', 'max:255'],
            'geofence_radius' => ['nullable', 'numeric'],
        ]);
        $data['created_by'] = $request->user()->id;
        $project = Project::create($data);
        return redirect()->route('admin.projects.show', $project)->with('status', 'Project created');
    }

    public function show(Project $project)
    {
        $project->load(['labors', 'messages.user']);
        $recentAttendance = $project->attendanceLogs()->with(['labor','supervisor'])
            ->latest('timestamp')->limit(20)->get();
        $supervisors = User::where('role', 'supervisor')->orderBy('name')->get(['id','name','email']);
        return Inertia::render('admin/projects/show', [
            'project' => [
                'id' => $project->id,
                'name' => $project->name,
                'description' => $project->description,
                'location_address' => $project->location_address,
                'labors' => $project->labors->map(fn ($l) => [
                    'id' => $l->id,
                    'name' => $l->name,
                    'contact_number' => $l->contact_number,
                    'role' => $l->role,
                ]),
                'messages' => $project->messages->map(fn ($m) => [
                    'id' => $m->id,
                    'created_at' => optional($m->created_at)->toDateTimeString(),
                    'user' => $m->user?->only(['id','name','email']),
                    'message' => $m->message,
                    'photo_url' => $m->photo_path ? asset('storage/'.$m->photo_path) : null,
                ]),
                'recent_attendance' => $recentAttendance->map(fn ($log) => [
                    'id' => $log->id,
                    'timestamp' => optional($log->timestamp)->toDateTimeString(),
                    'labor' => $log->labor?->only(['id','name']),
                    'supervisor' => $log->supervisor?->only(['id','name']),
                    'latitude' => $log->latitude,
                    'longitude' => $log->longitude,
                    'photo_url' => $log->photo_path ? asset('storage/'.$log->photo_path) : null,
                ]),
            ],
            'supervisors' => $supervisors,
        ]);
    }

    public function storeLabor(LaborStoreRequest $request, Project $project)
    {
        $project->labors()->create($request->validated());
        return back()->with('status', 'Labor created');
    }

    public function attachSupervisor(Request $request, Project $project)
    {
        $data = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
        ]);
        $project->supervisors()->syncWithoutDetaching([$data['user_id']]);
        return back()->with('status', 'Supervisor assigned');
    }
}
