<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Route;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class CompanySignupController extends Controller
{
    /**
     * Show the company signup form.
     */
    public function create(): Response
    {
        return Inertia::render('auth/company-signup');
    }

    /**
     * Handle a new company signup request.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'subdomain' => 'required|string|max:50|unique:companies,subdomain|regex:/^[a-zA-Z0-9-]+$/',
            'email' => 'required|email|unique:companies,email',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'admin_name' => 'required|string|max:255',
            'admin_email' => 'required|email|unique:users,email',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        try {
            DB::transaction(function () use ($validated) {
                // Create company without any scopes
                $company = Company::withoutGlobalScopes()->create([
                    'name' => $validated['company_name'],
                    'subdomain' => $validated['subdomain'],
                    'email' => $validated['email'],
                    'phone' => $validated['phone'],
                    'address' => $validated['address'],
                    'trial_ends_at' => now()->addDays(14),
                ]);

                // Create admin user without any scopes
                $user = User::withoutGlobalScopes()->create([
                    'name' => $validated['admin_name'],
                    'email' => $validated['admin_email'],
                    'password' => Hash::make($validated['password']),
                    'role' => 'admin',
                    'company_id' => $company->id,
                ]);

                // Send welcome email
                // TODO: Implement welcome email functionality
            });

            return redirect("https://{$validated['subdomain']}.labortrack.com/login")
                ->with('success', 'Company created successfully! You can now log in.');
        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->with('error', 'Failed to create company. Please try again.');
        }
    }

    /**
     * Check if subdomain is available.
     */
    public function checkSubdomain(Request $request)
    {
        $request->validate([
            'subdomain' => 'required|string|max:50|regex:/^[a-zA-Z0-9-]+$/',
        ]);

        $exists = Company::where('subdomain', $request->subdomain)->exists();
        
        return response()->json([
            'available' => !$exists,
        ]);
    }
}