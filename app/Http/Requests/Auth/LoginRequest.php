<?php

namespace App\Http\Requests\Auth;

use App\Http\Requests\ApiRequest;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class LoginRequest extends ApiRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ];
    }

    public function validateCredentials(): User
    {
        $credentials = $this->validated();
        $user = User::where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Validate user belongs to current company (for subdomain login)
        $currentCompany = session('current_company');
        if ($currentCompany && ! $user->isSuperAdmin() && $user->company_id !== $currentCompany->id) {
            throw ValidationException::withMessages([
                'email' => ['You do not have access to this company.'],
            ]);
        }

        return $user;
    }
}
