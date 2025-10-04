<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\ProjectResource;
use App\Models\Project;
use Illuminate\Http\Request;

class ProjectController extends ApiController
{
    public function index(Request $request)
    {
        $user = $request->user();
        $projects = $user->projects()->latest()->paginate(15);
        return $this->success([
            'items' => ProjectResource::collection($projects->items()),
            'meta' => [
                'current_page' => $projects->currentPage(),
                'last_page' => $projects->lastPage(),
                'per_page' => $projects->perPage(),
                'total' => $projects->total(),
            ],
        ]);
    }

    public function show(Request $request, Project $project)
    {
        $this->authorizeProject($request->user()->id, $project);
        return $this->success(new ProjectResource($project));
    }

    protected function authorizeProject(int $userId, Project $project): void
    {
        abort_unless($project->supervisors()->where('user_id', $userId)->exists(), 403);
    }
}

