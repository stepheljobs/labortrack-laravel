<?php

use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('posts a project message with Cloudinary URL photo only', function () {
    $user = User::factory()->create(['password' => 'password']);
    $project = Project::factory()->create();

    $login = $this->postJson('/api/login', [
        'email' => $user->email,
        'password' => 'password',
    ])->assertOk();

    $token = $login['data']['token'];

    $cloudinaryUrl = 'https://res.cloudinary.com/cdn-stepheljobs/image/upload/v1760742939/Primetop/Chats/message_25_1760742936758.jpg';

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token])
        ->post('/api/projects/'.$project->id.'/messages', [
            'photo' => $cloudinaryUrl,
        ]);

    $response->assertCreated();

    expect($response['data']['photo_url'] ?? null)->toBe($cloudinaryUrl);
});

it('posts a text-only project message without photo', function () {
    $user = User::factory()->create(['password' => 'password']);
    $project = Project::factory()->create();

    $login = $this->postJson('/api/login', [
        'email' => $user->email,
        'password' => 'password',
    ])->assertOk();

    $token = $login['data']['token'];

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token])
        ->postJson('/api/projects/'.$project->id.'/messages', [
            'message' => 'Hello project!',
        ]);

    $response->assertCreated();

    expect($response['data']['message'] ?? null)->toBe('Hello project!');
    expect($response['data']['photo_url'] ?? null)->toBeNull();
});

it('posts a project message with both message and Cloudinary URL photo', function () {
    $user = User::factory()->create(['password' => 'password']);
    $project = Project::factory()->create();

    $login = $this->postJson('/api/login', [
        'email' => $user->email,
        'password' => 'password',
    ])->assertOk();

    $token = $login['data']['token'];

    $cloudinaryUrl = 'https://res.cloudinary.com/cdn-stepheljobs/image/upload/v1760742939/Primetop/Chats/message_25_1760742936758.jpg';

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token])
        ->postJson('/api/projects/'.$project->id.'/messages', [
            'message' => 'Photo message',
            'photo' => $cloudinaryUrl,
        ]);

    $response->assertCreated();

    expect($response['data']['message'] ?? null)->toBe('Photo message');
    expect($response['data']['photo_url'] ?? null)->toBe($cloudinaryUrl);
});

it('fails validation when neither message nor photo provided', function () {
    $user = User::factory()->create(['password' => 'password']);
    $project = Project::factory()->create();

    $login = $this->postJson('/api/login', [
        'email' => $user->email,
        'password' => 'password',
    ])->assertOk();

    $token = $login['data']['token'];

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token])
        ->postJson('/api/projects/'.$project->id.'/messages', []);

    $response->assertStatus(422);
    expect($response['errors']['photo'] ?? null)->not->toBeNull();
});

it('fails validation with invalid URL format', function () {
    $user = User::factory()->create(['password' => 'password']);
    $project = Project::factory()->create();

    $login = $this->postJson('/api/login', [
        'email' => $user->email,
        'password' => 'password',
    ])->assertOk();

    $token = $login['data']['token'];

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token])
        ->postJson('/api/projects/'.$project->id.'/messages', [
            'photo' => 'https://example.com/image.jpg',
        ]);

    $response->assertStatus(422);
    expect($response['errors']['photo'] ?? null)->not->toBeNull();
});
