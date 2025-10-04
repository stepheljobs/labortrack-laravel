<?php

namespace Database\Seeders;

use App\Models\Labor;
use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            ['name' => 'Admin', 'password' => 'password', 'role' => 'admin']
        );

        $supervisor = User::firstOrCreate(
            ['email' => 'supervisor@example.com'],
            ['name' => 'Supervisor', 'password' => 'password', 'role' => 'supervisor']
        );

        $projectA = Project::firstOrCreate([
            'name' => 'Tower A',
            'created_by' => $admin->id,
        ], [
            'description' => 'High-rise construction',
            'location_address' => 'Downtown',
        ]);

        $projectB = Project::firstOrCreate([
            'name' => 'Mall Renovation',
            'created_by' => $admin->id,
        ], [
            'description' => 'Interior works',
            'location_address' => 'City Center',
        ]);

        $projectA->supervisors()->syncWithoutDetaching([$supervisor->id]);
        $projectB->supervisors()->syncWithoutDetaching([$supervisor->id]);

        foreach ([
            ['name' => 'John Doe', 'role' => 'Electrician'],
            ['name' => 'Jane Smith', 'role' => 'Carpenter'],
            ['name' => 'Ali Khan', 'role' => 'Mason'],
        ] as $l) {
            Labor::firstOrCreate(['name' => $l['name'], 'project_id' => $projectA->id], $l);
        }
    }
}

