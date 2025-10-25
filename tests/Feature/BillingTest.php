<?php

use App\Models\User;
use App\Models\Company;
use App\Services\SubscriptionService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('billing dashboard is accessible', function () {
    $company = Company::factory()->create([
        'plan' => 'pro',
        'is_active' => true,
    ]);
    
    $user = User::factory()->create([
        'company_id' => $company->id,
        'role' => 'admin',
    ]);

    $response = $this->actingAs($user)
        ->withHeaders(['Host' => "{$company->subdomain}.labortrack.com"])
        ->get("/billing");

    $response->assertStatus(200);
});

test('subscription service calculates monthly bill correctly', function () {
    $company = Company::factory()->create([
        'plan' => 'pro',
        'monthly_fee' => 79.99,
        'user_limit' => 20,
    ]);

    // Create some users to test overage calculation
    User::factory()->count(25)->create(['company_id' => $company->id]);

    $subscriptionService = new SubscriptionService();
    $bill = $subscriptionService->calculateMonthlyBill($company);

    expect($bill['plan'])->toBe('Professional');
    expect($bill['base_fee'])->toBe(79.99);
    expect($bill['user_count'])->toBe(25);
    expect($bill['user_overage']['count'])->toBe(5);
    expect($bill['user_overage']['amount'])->toBe(49.95); // 5 * 9.99
});

test('subscription service can check if user can be added', function () {
    $starterCompany = Company::factory()->create([
        'plan' => 'basic',
        'user_limit' => 5,
    ]);

    $enterpriseCompany = Company::factory()->create([
        'plan' => 'enterprise',
    ]);

    $subscriptionService = new SubscriptionService();

    // Create 4 users for starter company (under limit)
    User::factory()->count(4)->create(['company_id' => $starterCompany->id]);

    expect($subscriptionService->canAddUser($starterCompany))->toBeTrue();
    expect($subscriptionService->canAddUser($starterCompany, 2))->toBeFalse(); // Would exceed limit
    expect($subscriptionService->canAddUser($enterpriseCompany))->toBeTrue(); // Unlimited
});

test('billing plans page is accessible', function () {
    $company = Company::factory()->create([
        'plan' => 'basic',
        'is_active' => true,
    ]);
    
    $user = User::factory()->create([
        'company_id' => $company->id,
        'role' => 'admin',
    ]);

    $response = $this->actingAs($user)
        ->withHeaders(['Host' => "{$company->subdomain}.labortrack.com"])
        ->get("/billing/plans");

    $response->assertStatus(200);
});

test('plan change calculation works correctly', function () {
    $company = Company::factory()->create([
        'plan' => 'basic',
        'monthly_fee' => 29.99,
    ]);

    $subscriptionService = new SubscriptionService();
    $proration = $subscriptionService->calculateProratedAmount(
        $company,
        'pro',
        now()->startOfMonth()->addDays(15) // Halfway through month
    );

    expect($proration['is_upgrade'])->toBeTrue();
    expect($proration['difference'])->toBeGreaterThan(0);
    expect($proration['proration_ratio'])->toBeBetween(0.4, 0.6); // Approximately half month remaining
});