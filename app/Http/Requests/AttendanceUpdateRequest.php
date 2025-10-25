<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AttendanceUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = $this->user();
        $attendanceLog = $this->route('attendanceLog');

        // Allow admins and supervisors to edit
        if ($user->role === 'admin') {
            return true;
        }

        // Allow supervisors who are assigned to the project
        if ($user->role === 'supervisor') {
            return $attendanceLog->project->supervisors()
                ->where('user_id', $user->id)
                ->exists();
        }

        return false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'timestamp' => 'required|date',
            'edit_reason' => 'required|string|max:1000',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'timestamp.required' => 'The timestamp field is required.',
            'timestamp.date' => 'The timestamp must be a valid date and time.',
            'edit_reason.required' => 'A reason for editing is required.',
            'edit_reason.max' => 'The reason may not be greater than 1000 characters.',
        ];
    }
}
