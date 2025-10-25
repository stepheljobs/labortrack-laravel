<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Company>
 */
class CompanyFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->company(),
            'subdomain' => fake()->unique()->slug(2),
            'email' => fake()->unique()->companyEmail(),
            'phone' => fake()->optional(0.7)->phoneNumber(),
            'address' => fake()->optional(0.8)->address(),
            'plan' => fake()->randomElement(['basic', 'pro', 'enterprise']),
            'user_limit' => fake()->numberBetween(5, 50),
            'monthly_fee' => fake()->randomElement([100.00, 200.00, 500.00]),
            'is_active' => true,
            'trial_ends_at' => fake()->optional(0.3)->dateTimeBetween('now', '+14 days'),
        ];
    }
}
