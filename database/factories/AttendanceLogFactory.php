<?php

namespace Database\Factories;

use App\Models\AttendanceLog;
use App\Models\Labor;
use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

/**
 * @extends Factory<AttendanceLog>
 */
class AttendanceLogFactory extends Factory
{
    protected $model = AttendanceLog::class;

    public function definition(): array
    {
        $labor = Labor::query()->inRandomOrder()->first() ?? Labor::factory()->create();

        // Pick a supervisor assigned to the project if possible
        $project = Project::find($labor->project_id);
        $supervisorId = optional($project?->supervisors()->inRandomOrder()->first())->id
            ?? User::query()->where('role', 'supervisor')->inRandomOrder()->value('id')
            ?? User::factory()->create(['role' => 'supervisor'])->id;

        // Random timestamp within last 30 days
        $timestamp = Carbon::now()->subDays(rand(0, 30))->setTime(rand(6, 18), [0, 15, 30, 45][rand(0, 3)], 0);

        // Roughly within global plausible lat/lng
        $lat = $this->faker->latitude(5, 55);
        $lng = $this->faker->longitude(-120, 140);

        return [
            'labor_id' => $labor->id,
            'supervisor_id' => $supervisorId,
            'project_id' => $labor->project_id,
            'type' => $this->faker->randomElement(['clock_in', 'clock_out']),
            'photo_path' => 'attendance-photos/sample.jpg',
            'latitude' => $lat,
            'longitude' => $lng,
            'location_address' => $this->faker->optional()->address(),
            'timestamp' => $timestamp,
        ];
    }
}
