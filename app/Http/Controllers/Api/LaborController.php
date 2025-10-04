<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\LaborStoreRequest;
use App\Http\Resources\LaborResource;
use App\Models\Labor;
use App\Models\Project;
use Illuminate\Http\Request;

class LaborController extends ApiController
{
    public function index(Request $request, Project $project)
    {
        $this->authorizeProject($request->user()->id, $project);
        $labors = $project->labors()
            ->when($request->filled('search'), function ($q) use ($request) {
                $term = $request->string('search');
                $q->where('name', 'like', "%{$term}%");
            })
            ->orderBy('name')
            ->paginate(25);

        return $this->success([
            'items' => LaborResource::collection($labors->items()),
            'meta' => [
                'current_page' => $labors->currentPage(),
                'last_page' => $labors->lastPage(),
                'per_page' => $labors->perPage(),
                'total' => $labors->total(),
            ],
        ]);
    }

    public function store(LaborStoreRequest $request, Project $project)
    {
        $this->authorizeProject($request->user()->id, $project);
        $labor = $project->labors()->create($request->validated());
        return $this->success(new LaborResource($labor), 'Labor created', 201);
    }

    public function destroy(Request $request, Labor $labor)
    {
        // Ensure requester is assigned to labor's project
        $this->authorizeProject($request->user()->id, $labor->project);
        $labor->delete();
        return $this->success(null, 'Labor deleted');
    }

    protected function authorizeProject(int $userId, Project $project): void
    {
        abort_unless($project->supervisors()->where('user_id', $userId)->exists(), 403);
    }
}

