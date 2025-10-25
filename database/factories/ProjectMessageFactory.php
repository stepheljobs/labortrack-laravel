<?php

namespace Database\Factories;

use App\Models\Company;
use App\Models\Project;
use App\Models\ProjectMessage;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ProjectMessage>
 */
class ProjectMessageFactory extends Factory
{
    protected $model = ProjectMessage::class;

    public function definition(): array
    {
        $project = Project::query()->inRandomOrder()->first() ?? Project::factory()->create();
        $userId = optional($project->supervisors()->inRandomOrder()->first())->id
            ?? User::query()->where('role', 'supervisor')->inRandomOrder()->value('id')
            ?? User::factory()->create(['role' => 'supervisor'])->id;

        return [
            'project_id' => $project->id,
            'user_id' => $userId,
            'message' => $this->faker->sentence(12),
            'photo_path' => null,
            'company_id' => Company::factory(),
        ];
    }
}
