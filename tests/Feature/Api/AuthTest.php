<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('registers a supervisor and returns token', function () {
    $payload = [
        'name' => 'Sup',
        'email' => 'sup@example.com',
        'password' => 'password',
    ];

    $res = $this->postJson('/api/register', $payload);
    $res->assertStatus(201)
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.user.email', 'sup@example.com')
        ->assertJsonStructure(['data' => ['token']]);
});

it('logs in and lists projects', function () {
    $user = User::factory()->create(['password' => 'password']);

    $login = $this->postJson('/api/login', [
        'email' => $user->email,
        'password' => 'password',
    ])->assertOk();

    $token = $login['data']['token'];
    $this->withHeaders(['Authorization' => 'Bearer '.$token])
        ->getJson('/api/projects')
        ->assertOk();
});

