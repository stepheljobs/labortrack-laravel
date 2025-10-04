<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\ProjectMessage */
class ProjectMessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'project_id' => $this->project_id,
            'user' => new UserResource($this->whenLoaded('user')),
            'message' => $this->message,
            'photo_url' => $this->photo_path ? asset('storage/'.$this->photo_path) : null,
            'created_at' => optional($this->created_at)->toISOString(),
        ];
    }
}

