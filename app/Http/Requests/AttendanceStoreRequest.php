<?php

namespace App\Http\Requests;

use App\Http\Requests\ApiRequest;

class AttendanceStoreRequest extends ApiRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'labor_id' => ['required', 'integer', 'exists:labors,id'],
            'project_id' => ['required', 'integer', 'exists:projects,id'],
            'photo' => ['required', 'file', 'image', 'max:5120'],
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'timestamp' => ['required', 'date'],
        ];
    }
}
