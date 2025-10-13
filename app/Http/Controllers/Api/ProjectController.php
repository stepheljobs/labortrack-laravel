<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\ProjectResource;
use App\Models\Project;
use Illuminate\Http\Request;

class ProjectController extends ApiController
{
    public function index(Request $request)
    {
        $projects = \App\Models\Project::latest()->paginate(15);
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
        return $this->success(new ProjectResource($project));
    }
}

