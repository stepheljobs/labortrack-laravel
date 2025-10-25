<?php

use App\Models\AttendanceLog;
use App\Models\Labor;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;

uses(RefreshDatabase::class);

it('allows admins to edit attendance records', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $project = Project::factory()->create();
    $labor = Labor::factory()->create(['project_id' => $project->id]);
    
    $attendanceLog = AttendanceLog::factory()->create([
        'project_id' => $project->id,
        'labor_id' => $labor->id,
        'timestamp' => now(),
        'type' => 'clock_in',
    ]);

    $newTimestamp = now()->addHours(2);
    $editReason = 'Corrected clock-in time due to system error';

    $response = $this->actingAs($admin)
        ->put("/projects/{$project->id}/attendance/{$attendanceLog->id}", [
            'timestamp' => $newTimestamp->toISOString(),
            'edit_reason' => $editReason,
            '_token' => csrf_token(),
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('attendance_logs', [
        'id' => $attendanceLog->id,
        'edit_reason' => $editReason,
        'edited_by' => $admin->id,
    ]);
});

it('allows assigned supervisors to edit attendance records', function () {
    $supervisor = User::factory()->create(['role' => 'supervisor']);
    $project = Project::factory()->create();
    $labor = Labor::factory()->create(['project_id' => $project->id]);
    
    // Assign supervisor to project
    $project->supervisors()->attach($supervisor->id);
    
    $attendanceLog = AttendanceLog::factory()->create([
        'project_id' => $project->id,
        'labor_id' => $labor->id,
        'timestamp' => now(),
        'type' => 'clock_in',
    ]);

    $newTimestamp = now()->addHours(2);
    $editReason = 'Updated clock-in time';

    $response = $this->actingAs($supervisor)
        ->put("/projects/{$project->id}/attendance/{$attendanceLog->id}", [
            'timestamp' => $newTimestamp->toISOString(),
            'edit_reason' => $editReason,
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('attendance_logs', [
        'id' => $attendanceLog->id,
        'edit_reason' => $editReason,
        'edited_by' => $supervisor->id,
    ]);
});

it('prevents unauthorized users from editing attendance records', function () {
    $user = User::factory()->create(['role' => 'supervisor']); // Supervisor not assigned to project
    $project = Project::factory()->create();
    $labor = Labor::factory()->create(['project_id' => $project->id]);
    
    $attendanceLog = AttendanceLog::factory()->create([
        'project_id' => $project->id,
        'labor_id' => $labor->id,
        'timestamp' => now(),
        'type' => 'clock_in',
    ]);

    $response = $this->actingAs($user)
        ->put("/projects/{$project->id}/attendance/{$attendanceLog->id}", [
            'timestamp' => now()->addHours(2)->toISOString(),
            'edit_reason' => 'Unauthorized edit',
        ]);

    $response->assertForbidden();
});

it('prevents supervisors from editing attendance in unassigned projects', function () {
    $supervisor = User::factory()->create(['role' => 'supervisor']);
    $project = Project::factory()->create();
    $labor = Labor::factory()->create(['project_id' => $project->id]);
    
    // Don't assign supervisor to project
    
    $attendanceLog = AttendanceLog::factory()->create([
        'project_id' => $project->id,
        'labor_id' => $labor->id,
        'timestamp' => now(),
        'type' => 'clock_in',
    ]);

    $response = $this->actingAs($supervisor)
        ->put("/projects/{$project->id}/attendance/{$attendanceLog->id}", [
            'timestamp' => now()->addHours(2)->toISOString(),
            'edit_reason' => 'Unauthorized edit',
        ]);

    $response->assertForbidden();
});

it('validates required fields when editing attendance', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $project = Project::factory()->create();
    $labor = Labor::factory()->create(['project_id' => $project->id]);
    
    $attendanceLog = AttendanceLog::factory()->create([
        'project_id' => $project->id,
        'labor_id' => $labor->id,
        'timestamp' => now(),
        'type' => 'clock_in',
    ]);

    $response = $this->actingAs($admin)
        ->put("/projects/{$project->id}/attendance/{$attendanceLog->id}", [
            'timestamp' => '',
            'edit_reason' => '',
        ]);

    $response->assertSessionHasErrors(['timestamp', 'edit_reason']);
});
