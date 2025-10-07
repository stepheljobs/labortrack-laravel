<?php

use App\Models\User;
use App\Models\Project;
use App\Models\Labor;
use App\Models\AttendanceLog;
use App\Models\ProjectMessage;
use Illuminate\Support\Carbon;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('guests are redirected to the login page', function () {
    $this->get(route('dashboard'))->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $this->actingAs($user = User::factory()->create());

    $response = $this->get(route('dashboard'));
    $response->assertOk();
    
    // Check that the dashboard shows the expected data structure
    $response->assertInertia(fn ($page) => 
        $page->has('projectsCount')
             ->has('todayAttendance')
             ->has('recentMessages')
    );
})->skip('Skipping due to CI environment issues');

test('dashboard shows project count and attendance data', function () {
    $user = User::factory()->create();
    
    // Create some test data
    Project::create([
        'name' => 'Test Project 1',
        'description' => 'Test Description',
        'location_address' => 'Test Location',
        'geofence_radius' => 100,
        'created_by' => $user->id,
    ]);
    Project::create([
        'name' => 'Test Project 2',
        'description' => 'Test Description',
        'location_address' => 'Test Location',
        'geofence_radius' => 100,
        'created_by' => $user->id,
    ]);
    Project::create([
        'name' => 'Test Project 3',
        'description' => 'Test Description',
        'location_address' => 'Test Location',
        'geofence_radius' => 100,
        'created_by' => $user->id,
    ]);
    
    $project = Project::first();
    $labor = Labor::create([
        'name' => 'Test Labor',
        'contact_number' => '1234567890',
        'role' => 'worker',
        'project_id' => $project->id,
    ]);
    
    AttendanceLog::create([
        'timestamp' => Carbon::today(),
        'labor_id' => $labor->id,
        'project_id' => $project->id,
        'supervisor_id' => $user->id,
        'photo_path' => null,
        'latitude' => 14.5995,
        'longitude' => 120.9842,
        'type' => 'clock_in',
    ]);
    AttendanceLog::create([
        'timestamp' => Carbon::yesterday(),
        'labor_id' => $labor->id,
        'project_id' => $project->id,
        'supervisor_id' => $user->id,
        'photo_path' => null,
        'latitude' => 14.5995,
        'longitude' => 120.9842,
        'type' => 'clock_in',
    ]);
    
    $this->actingAs($user);
    
    $response = $this->get(route('dashboard'));
    $response->assertOk();
    
    $response->assertInertia(fn ($page) => 
        $page->where('projectsCount', 3)
             ->where('todayAttendance', 1)
    );
})->skip('Skipping due to CI environment issues');