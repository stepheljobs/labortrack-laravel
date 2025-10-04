<?php

namespace App\Http\Requests;

use App\Http\Requests\ApiRequest;

class MessageStoreRequest extends ApiRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'message' => ['required', 'string'],
            'photo' => ['nullable', 'file', 'image', 'max:5120'],
        ];
    }
}
