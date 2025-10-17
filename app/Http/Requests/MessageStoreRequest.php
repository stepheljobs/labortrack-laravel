<?php

namespace App\Http\Requests;

class MessageStoreRequest extends ApiRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'message' => ['nullable', 'string'],
            'photo' => ['required_without:message', 'nullable', 'url', 'regex:/^https:\/\/res\.cloudinary\.com\/.*/'],
        ];
    }
}
