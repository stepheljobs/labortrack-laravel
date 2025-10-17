<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\AttendanceLog */
class AttendanceLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'labor' => new LaborResource($this->whenLoaded('labor')),
            'supervisor' => new UserResource($this->whenLoaded('supervisor')),
            'project_id' => $this->project_id,
            'type' => $this->type,
            'photo_url' => $this->photo_path,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'location_address' => $this->location_address,
            'timestamp' => optional($this->timestamp)->toISOString(),
            'created_at' => optional($this->created_at)->toISOString(),
        ];
    }
}
