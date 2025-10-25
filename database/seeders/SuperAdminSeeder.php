<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create a system company for super admin
        $systemCompany = \App\Models\Company::withoutGlobalScopes()->updateOrCreate(
            ['subdomain' => 'system'],
            [
                'name' => 'System',
                'subdomain' => 'system',
                'email' => 'system@labortrack.com',
                'plan' => 'enterprise',
                'is_active' => true,
                'trial_ends_at' => null,
            ]
        );

        // Create or update the super admin user
        $superAdmin = User::withoutGlobalScopes()->updateOrCreate(
            ['email' => 'superadmin@labortrack.com'],
            [
                'name' => 'Super Admin',
                'email' => 'superadmin@labortrack.com',
                'password' => Hash::make('password'), // Change this in production
                'role' => 'super_admin',
                'email_verified_at' => now(),
                'remember_token' => Str::random(10),
                'company_id' => $systemCompany->id, // Assign to system company
            ]
        );

        $this->command->info('✅ Super admin user created/updated successfully.');
        $this->command->info('   Email: superadmin@labortrack.com');
        $this->command->info('   Password: password (CHANGE IN PRODUCTION!)');
    }
}