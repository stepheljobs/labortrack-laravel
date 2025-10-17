<?php

namespace App\Http\Requests;

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
            'type' => ['nullable', 'in:clock_in,clock_out'],
            'photo' => ['required', 'url', 'regex:/^https:\/\/res\.cloudinary\.com\/.*/'],
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'timestamp' => ['required', 'date'],
        ];
    }
}
