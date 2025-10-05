<?php

namespace Database\Seeders;

use App\Models\AttendanceLog;
use App\Models\Labor;
use App\Models\Project;
use App\Models\ProjectMessage;
use App\Models\User;
use Illuminate\Database\Seeder;
//

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Core users
        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            ['name' => 'Admin', 'password' => 'password', 'role' => 'admin']
        );

        // Additional admins and supervisors
        User::factory()->count(1)->create(['role' => 'admin']);
        $supervisors = collect([
            User::firstOrCreate(['email' => 'supervisor@example.com'], ['name' => 'Supervisor One', 'password' => 'password', 'role' => 'supervisor']),
        ]);
        $supervisors = $supervisors->merge(User::factory()->count(7)->create(['role' => 'supervisor']));

        // Projects
        $projects = Project::factory()->count(6)->create();

        // Attach 2-3 supervisors per project
        foreach ($projects as $project) {
            $assigned = $supervisors->random(rand(2, 3))->pluck('id')->all();
            $project->supervisors()->syncWithoutDetaching($assigned);
        }

        // Labors per project
        foreach ($projects as $project) {
            Labor::factory()->count(12)->create(['project_id' => $project->id]);
        }

        // Messages per project
        foreach ($projects as $project) {
            ProjectMessage::factory()->count(25)->create(['project_id' => $project->id]);
        }

        // Attendance logs: for each labor, generate the last 10 days with clock in/out
        $labors = Labor::all();
        foreach ($labors as $labor) {
            // pick a couple supervisors from the assigned project as potential supervisors
            $projectSupervisors = $labor->project->supervisors()->pluck('users.id');
            for ($d = 0; $d < 10; $d++) {
                // Clock in at morning
                AttendanceLog::factory()->create([
                    'labor_id' => $labor->id,
                    'project_id' => $labor->project_id,
                    'supervisor_id' => $projectSupervisors->isNotEmpty() ? $projectSupervisors->random() : $supervisors->random()->id,
                    'type' => 'clock_in',
                    'timestamp' => now()->subDays($d)->setTime(rand(6, 9), [0,15,30,45][rand(0,3)], 0),
                ]);
                // Clock out in evening
                AttendanceLog::factory()->create([
                    'labor_id' => $labor->id,
                    'project_id' => $labor->project_id,
                    'supervisor_id' => $projectSupervisors->isNotEmpty() ? $projectSupervisors->random() : $supervisors->random()->id,
                    'type' => 'clock_out',
                    'timestamp' => now()->subDays($d)->setTime(rand(16, 19), [0,15,30,45][rand(0,3)], 0),
                ]);
            }
        }
    }
}
