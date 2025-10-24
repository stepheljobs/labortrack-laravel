<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'allan@alchedy.com'],
            [
                'name' => 'Allan',
                'password' => Hash::make('goAlchedy123!'),
                'role' => 'admin'
            ]
        );
    }
}