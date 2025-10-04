<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    /**
     * Display a listing of projects for the authenticated user.
     */
    public function index(): Response
    {
        $user = auth()->user();
        
        $projects = Project::when($user->role === 'supervisor', function ($query) use ($user) {
            // Supervisors can only see projects they're assigned to
            return $query->whereHas('supervisors', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        })
        ->withCount(['labors', 'messages'])
        ->get()
        ->map(function ($project) {
            return [
                'id' => $project->id,
                'name' => $project->name,
                'description' => $project->description,
                'location' => $project->location,
                'status' => $project->status,
                'start_date' => $project->start_date?->format('M d, Y'),
                'end_date' => $project->end_date?->format('M d, Y'),
                'labor_count' => $project->labors_count,
                'message_count' => $project->messages_count,
            ];
        });

        return Inertia::render('projects', [
            'projects' => $projects,
        ]);
    }

    /**
     * Display the specified project.
     */
    public function show(Project $project): Response
    {
        $user = auth()->user();
        
        // Check if user has access to this project
        if ($user->role === 'supervisor' && !$project->supervisors()->where('user_id', $user->id)->exists()) {
            abort(403, 'You do not have access to this project.');
        }

        $project->load(['labors', 'messages', 'supervisors']);

        return Inertia::render('projects/show', [
            'project' => [
                'id' => $project->id,
                'name' => $project->name,
                'description' => $project->description,
                'location' => $project->location,
                'status' => $project->status,
                'start_date' => $project->start_date?->format('Y-m-d'),
                'end_date' => $project->end_date?->format('Y-m-d'),
                'labors' => $project->labors,
                'messages' => $project->messages,
                'supervisors' => $project->supervisors,
            ],
        ]);
    }
}
