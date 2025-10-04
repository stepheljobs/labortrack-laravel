<?php

namespace App\Http\Controllers\Admin;

use App\Models\Project;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class ProjectAdminController extends Controller
{
    public function index()
    {
        $projects = Project::latest()->paginate(20);
        return view('admin.projects.index', compact('projects'));
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
        $supervisors = User::where('role', 'supervisor')->orderBy('name')->get();
        return view('admin.projects.show', compact('project', 'supervisors'));
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

