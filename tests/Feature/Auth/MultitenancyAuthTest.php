<?php

use App\Models\Company;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Session;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('user can be created with company assignment', function () {
    $company = Company::factory()->create();

    $user = User::create([
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => Hash::make('password'),
        'company_id' => $company->id,
        'role' => 'supervisor',
    ]);

    expect($user->company_id)->toBe($company->id);
    expect($user->company)->toBeInstanceOf(Company::class);
    expect($user->company->id)->toBe($company->id);
});

test('user belongs to current company validation works', function () {
    $company1 = Company::factory()->create(['subdomain' => 'company1']);
    $company2 = Company::factory()->create(['subdomain' => 'company2']);

    $user = User::factory()->create(['company_id' => $company1->id]);

    // Mock current company session
    Session::put('current_company', $company1);

    expect($user->belongsToCurrentCompany())->toBeTrue();

    // Change current company
    Session::put('current_company', $company2);

    expect($user->belongsToCurrentCompany())->toBeFalse();
});

test('super admin can access any company', function () {
    $company = Company::factory()->create();

    $superAdmin = User::factory()->create([
        'role' => 'super_admin',
        'company_id' => $company->id, // Super admins still need a company_id due to DB constraint
    ]);

    expect($superAdmin->isSuperAdmin())->toBeTrue();

    // Mock current company session
    Session::put('current_company', $company);

    expect($superAdmin->belongsToCurrentCompany())->toBeTrue(); // Super admins should always return true
});

test('regular user is not super admin', function () {
    $user = User::factory()->create(['role' => 'supervisor']);

    expect($user->isSuperAdmin())->toBeFalse();
});
