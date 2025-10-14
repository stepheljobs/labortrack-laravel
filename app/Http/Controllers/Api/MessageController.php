<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\MessageStoreRequest;
use App\Http\Resources\ProjectMessageResource;
use App\Models\Project;
use App\Models\ProjectMessage;
use Illuminate\Http\Request;

class MessageController extends ApiController
{
    public function index(Request $request, Project $project)
    {
        $messages = $project->messages()->with('user')->latest()->paginate(25);

        return $this->success([
            'items' => ProjectMessageResource::collection($messages->items()),
            'meta' => [
                'current_page' => $messages->currentPage(),
                'last_page' => $messages->lastPage(),
                'per_page' => $messages->perPage(),
                'total' => $messages->total(),
            ],
        ]);
    }

    public function store(MessageStoreRequest $request, Project $project)
    {

        $data = [
            'project_id' => $project->id,
            'user_id' => $request->user()->id,
            'message' => $request->validated()['message'] ?? '',
        ];

        if ($request->hasFile('photo')) {
            $data['photo_path'] = $request->file('photo')->store('message-photos', 'public');
        }

        $message = ProjectMessage::create($data);
        $message->load('user');

        return $this->success(new ProjectMessageResource($message), 'Message posted', 201);
    }
}

