<?php

namespace App\Http\Controllers\Admin;

use App\Http\Requests\LaborStoreRequest;
use App\Models\Labor;
use App\Models\Project;
use App\Models\ProjectMessage;
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
        return redirect()->route('projects.show', $project)->with('status', 'Project created');
    }

    public function show(Project $project)
    {
        $project->load(['labors', 'messages.user', 'supervisors']);
        $recentAttendance = $project->attendanceLogs()->with(['labor','supervisor'])
            ->latest('timestamp')->limit(20)->get();
        $supervisors = User::where('role', 'supervisor')->orderBy('name')->get(['id','name','email']);
        return Inertia::render('admin/projects/show', [
            'project' => [
                'id' => $project->id,
                'name' => $project->name,
                'description' => $project->description,
                'location_address' => $project->location_address,
                'assigned_supervisor_ids' => $project->supervisors->pluck('id')->values(),
                'labors' => $project->labors->map(fn ($l) => [
                    'id' => $l->id,
                    'name' => $l->name,
                    'contact_number' => $l->contact_number,
                    'designation' => $l->designation,
                    'daily_rate' => $l->daily_rate,
                ]),
                'messages' => $project->messages->map(fn ($m) => [
                    'id' => $m->id,
                    'created_at' => optional($m->created_at)->toDateTimeString(),
                    'user' => $m->user?->only(['id','name','email']),
                    'message' => $m->message,
                    'photo_url' => $m->photo_path,
                ]),
                'recent_attendance' => $recentAttendance->map(fn ($log) => [
                    'id' => $log->id,
                    'timestamp' => optional($log->timestamp)->toDateTimeString(),
                    'labor' => $log->labor?->only(['id','name']),
                    'supervisor' => $log->supervisor?->only(['id','name']),
                    'type' => $log->type,
                    'latitude' => $log->latitude,
                    'longitude' => $log->longitude,
                    'photo_url' => $log->photo_path,
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

    public function updateLabor(Request $request, Project $project, Labor $labor)
    {
        abort_unless($labor->project_id === $project->id, 404);
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'contact_number' => ['nullable', 'string', 'max:50'],
            'designation' => ['nullable', 'string', 'max:100'],
            'daily_rate' => ['nullable', 'numeric', 'min:0'],
        ]);
        $labor->update($data);
        return back()->with('status', 'Labor updated');
    }

    public function destroyLabor(Project $project, Labor $labor)
    {
        abort_unless($labor->project_id === $project->id, 404);
        $labor->delete();
        return back()->with('status', 'Labor deleted');
    }

    public function attachSupervisor(Request $request, Project $project)
    {
        $data = $request->validate([
            'user_id' => ['nullable', 'exists:users,id'],
            'user_ids' => ['nullable', 'array'],
            'user_ids.*' => ['integer', 'exists:users,id'],
        ]);

        $ids = [];
        if (isset($data['user_id'])) {
            $ids[] = $data['user_id'];
        }
        if (!empty($data['user_ids'])) {
            $ids = array_merge($ids, $data['user_ids']);
        }

        if (!empty($ids)) {
            if ($request->has('user_ids')) {
                // Replace current assignments with the selected list
                $project->supervisors()->sync($ids);
            } else {
                // Backward-compatible: add single user without removing others
                $project->supervisors()->syncWithoutDetaching($ids);
            }
        }

        return back()->with('status', 'Supervisor(s) assigned');
    }

    public function storeMessage(Request $request, Project $project)
    {
        $data = $request->validate([
            'message' => ['required', 'string'],
            'photo' => ['nullable', 'file', 'image', 'max:5120'],
        ]);

        $payload = [
            'project_id' => $project->id,
            'user_id' => $request->user()->id,
            'message' => $data['message'],
        ];

        if ($request->hasFile('photo')) {
            $payload['photo_path'] = $request->file('photo')->store('message-photos', 'public');
        }

        ProjectMessage::create($payload);

        return back()->with('status', 'Message posted');
    }
}
