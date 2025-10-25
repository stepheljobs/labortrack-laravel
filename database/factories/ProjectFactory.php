<?php

namespace Database\Factories;

use App\Models\Company;
use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Project>
 */
class ProjectFactory extends Factory
{
    protected $model = Project::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->unique()->words(3, true),
            'description' => $this->faker->optional()->sentence(10),
            'location_address' => $this->faker->optional()->address(),
            'geofence_radius' => $this->faker->optional()->randomFloat(2, 50, 300),
            'created_by' => User::query()->where('role', 'admin')->inRandomOrder()->value('id')
                ?? User::factory()->create(['role' => 'admin'])->id,
            'company_id' => Company::factory(),
        ];
    }
}
