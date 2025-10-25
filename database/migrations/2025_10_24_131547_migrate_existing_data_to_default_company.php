<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // First, create the default company using raw SQL to get the ID
        DB::statement("
            INSERT INTO companies (name, subdomain, email, plan, user_limit, monthly_fee, is_active, created_at, updated_at)
            VALUES ('Default Company', 'default', 'default@labortrack.com', 'basic', 100, 100.00, true, NOW(), NOW())
            ON CONFLICT (subdomain) DO NOTHING
        ");

        // Get the default company ID
        $defaultCompany = DB::table('companies')->where('subdomain', 'default')->first();
        $defaultCompanyId = $defaultCompany->id;

        // Update all existing records to belong to the default company
        $tables = [
            'users',
            'projects',
            'labors',
            'attendance_logs',
            'project_messages',
            'payroll_runs',
            'payroll_entries',
            'payroll_settings',
        ];

        foreach ($tables as $table) {
            DB::table($table)
                ->whereNull('company_id')
                ->update(['company_id' => $defaultCompanyId]);
        }

        // Now make company_id columns non-nullable
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedBigInteger('company_id')->nullable(false)->change();
        });

        Schema::table('projects', function (Blueprint $table) {
            $table->unsignedBigInteger('company_id')->nullable(false)->change();
        });

        Schema::table('labors', function (Blueprint $table) {
            $table->unsignedBigInteger('company_id')->nullable(false)->change();
        });

        Schema::table('attendance_logs', function (Blueprint $table) {
            $table->unsignedBigInteger('company_id')->nullable(false)->change();
        });

        Schema::table('project_messages', function (Blueprint $table) {
            $table->unsignedBigInteger('company_id')->nullable(false)->change();
        });

        Schema::table('payroll_runs', function (Blueprint $table) {
            $table->unsignedBigInteger('company_id')->nullable(false)->change();
        });

        Schema::table('payroll_entries', function (Blueprint $table) {
            $table->unsignedBigInteger('company_id')->nullable(false)->change();
        });

        Schema::table('payroll_settings', function (Blueprint $table) {
            $table->unsignedBigInteger('company_id')->nullable(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Make company_id nullable again
        $tables = [
            'users',
            'projects',
            'labors',
            'attendance_logs',
            'project_messages',
            'payroll_runs',
            'payroll_entries',
            'payroll_settings',
        ];

        foreach ($tables as $table) {
            Schema::table($table, function (Blueprint $table) {
                $table->unsignedBigInteger('company_id')->nullable()->change();
            });
        }

        // Remove default company
        DB::table('companies')->where('subdomain', 'default')->delete();
    }
};
