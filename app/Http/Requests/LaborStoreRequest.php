<?php

namespace App\Http\Requests;

use App\Http\Requests\ApiRequest;

class LaborStoreRequest extends ApiRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'contact_number' => ['nullable', 'string', 'max:50'],
            'designation' => ['nullable', 'string', 'max:100'],
            'daily_rate' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
