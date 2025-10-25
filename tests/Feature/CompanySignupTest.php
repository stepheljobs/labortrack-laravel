<?php

use App\Models\Company;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('company signup page can be rendered', function () {
    $response = $this->get(route('company.signup.create'));

    $response->assertStatus(200);
});

test('company can be created with valid data', function () {
    $signupData = [
        'company_name' => 'Test Construction Co',
        'subdomain' => 'testconstruction',
        'email' => 'info@testconstruction.com',
        'phone' => '+1234567890',
        'address' => '123 Main St, Test City, TC 12345',
        'admin_name' => 'John Doe',
        'admin_email' => 'john@testconstruction.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ];

    $response = $this->withSession(['_token' => 'test'])->post(route('company.signup.store'), $signupData + ['_token' => 'test']);

    // Check for redirect status (302 for successful redirect)
    $response->assertStatus(302);
    
    // Check if session has success message
    $response->assertSessionHas('success');

    // Verify company was created
    $this->assertDatabaseHas('companies', [
        'name' => 'Test Construction Co',
        'subdomain' => 'testconstruction',
        'email' => 'info@testconstruction.com',
        'phone' => '+1234567890',
        'address' => '123 Main St, Test City, TC 12345',
    ]);

    // Verify admin user was created
    $this->assertDatabaseHas('users', [
        'name' => 'John Doe',
        'email' => 'john@testconstruction.com',
        'role' => 'admin',
    ]);

    // Verify user is linked to company
    $company = Company::where('subdomain', 'testconstruction')->first();
    $user = User::where('email', 'john@testconstruction.com')->first();
    
    expect($user->company_id)->toBe($company->id);
});

test('company signup fails with invalid subdomain', function () {
    // Create existing company with same subdomain
    $existingCompany = Company::factory()->create(['subdomain' => 'taken']);

    $signupData = [
        'company_name' => 'Test Construction Co',
        'subdomain' => 'taken', // This should fail
        'email' => 'info@testconstruction.com',
        'admin_name' => 'John Doe',
        'admin_email' => 'john@testconstruction.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ];

    $response = $this->withSession(['_token' => 'test'])->post(route('company.signup.store'), $signupData + ['_token' => 'test']);

    // Check if validation failed
    $response->assertSessionHasErrors('subdomain');
    
    // Should still only have one company with this subdomain (the original one)
    $companies = Company::where('subdomain', 'taken')->get();
    expect($companies)->toHaveCount(1);
    expect($companies->first()->id)->toBe($existingCompany->id);
});

test('company signup fails with invalid email', function () {
    $signupData = [
        'company_name' => 'Test Construction Co',
        'subdomain' => 'testconstruction',
        'email' => 'invalid-email', // This should fail
        'admin_name' => 'John Doe',
        'admin_email' => 'john@testconstruction.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ];

    $response = $this->withSession(['_token' => 'test'])->post(route('company.signup.store'), $signupData + ['_token' => 'test']);

    $response->assertSessionHasErrors('email');
});

test('subdomain availability check works', function () {
    // Test available subdomain
    $response = $this->withoutMiddleware()->postJson(route('api.check-subdomain'), [
        'subdomain' => 'available123',
    ]);

    $response->assertJson([
        'available' => true,
    ]);

    // Test taken subdomain
    Company::factory()->create(['subdomain' => 'taken']);

    $response = $this->withoutMiddleware()->postJson(route('api.check-subdomain'), [
        'subdomain' => 'taken',
    ]);

    $response->assertJson([
        'available' => false,
    ]);
});