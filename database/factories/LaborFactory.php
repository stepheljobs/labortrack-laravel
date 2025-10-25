<?php

namespace Database\Factories;

use App\Models\Company;
use App\Models\Labor;
use App\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Labor>
 */
class LaborFactory extends Factory
{
    protected $model = Labor::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->name(),
            'contact_number' => $this->faker->optional()->phoneNumber(),
            'designation' => $this->faker->randomElement(['Worker', 'Mason', 'Carpenter', 'Electrician', 'Plumber']),
            'daily_rate' => $this->faker->optional()->randomFloat(2, 20, 300),
            'project_id' => Project::query()->inRandomOrder()->value('id') ?? Project::factory(),
            'company_id' => Company::factory(),
        ];
    }
}
