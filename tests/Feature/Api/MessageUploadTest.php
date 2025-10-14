<?php

use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

it('posts a project message with multipart photo only', function () {
    Storage::fake('public');

    $user = User::factory()->create(['password' => 'password']);
    $project = Project::factory()->create();

    $login = $this->postJson('/api/login', [
        'email' => $user->email,
        'password' => 'password',
    ])->assertOk();

    $token = $login['data']['token'];

    $response = $this->withHeaders(['Authorization' => 'Bearer ' . $token])
        ->post('/api/projects/' . $project->id . '/messages', [
            'photo' => UploadedFile::fake()->image('message.jpg'),
        ]);

    $response->assertCreated();

    expect($response['data']['photo_url'] ?? null)->not->toBeNull();

    $stored = Storage::disk('public')->files('message-photos');
    expect($stored)->not->toBeEmpty();
});

it('posts a text-only project message without photo', function () {
    $user = User::factory()->create(['password' => 'password']);
    $project = Project::factory()->create();

    $login = $this->postJson('/api/login', [
        'email' => $user->email,
        'password' => 'password',
    ])->assertOk();

    $token = $login['data']['token'];

    $response = $this->withHeaders(['Authorization' => 'Bearer ' . $token])
        ->postJson('/api/projects/' . $project->id . '/messages', [
            'message' => 'Hello project!'
        ]);

    $response->assertCreated();

    expect($response['data']['message'] ?? null)->toBe('Hello project!');
    expect($response['data']['photo_url'] ?? null)->toBeNull();
});

it('posts a project message with base64 data URI photo', function () {
    Storage::fake('public');

    $user = User::factory()->create(['password' => 'password']);
    $project = Project::factory()->create();

    $login = $this->postJson('/api/login', [
        'email' => $user->email,
        'password' => 'password',
    ])->assertOk();

    $token = $login['data']['token'];

    $dataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAuMBg6zjO9QAAAAASUVORK5CYII=';

    $response = $this->withHeaders(['Authorization' => 'Bearer ' . $token])
        ->postJson('/api/projects/' . $project->id . '/messages', [
            'photo' => $dataUri,
        ]);

    $response->assertCreated();

    expect($response['data']['photo_url'] ?? null)->not->toBeNull();

    $stored = Storage::disk('public')->files('message-photos');
    expect($stored)->not->toBeEmpty();
});

it('fails validation when neither message nor photo provided', function () {
    $user = User::factory()->create(['password' => 'password']);
    $project = Project::factory()->create();

    $login = $this->postJson('/api/login', [
        'email' => $user->email,
        'password' => 'password',
    ])->assertOk();

    $token = $login['data']['token'];

    $response = $this->withHeaders(['Authorization' => 'Bearer ' . $token])
        ->postJson('/api/projects/' . $project->id . '/messages', []);

    $response->assertStatus(422);
    expect($response['errors']['photo'] ?? null)->not->toBeNull();
});


