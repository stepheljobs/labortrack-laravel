<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('attendance_logs', function (Blueprint $table) {
            // Use enum for clarity. Default to 'clock_in' for backward compatibility.
            $table->enum('type', ['clock_in', 'clock_out'])->default('clock_in')->after('project_id');
        });
    }

    public function down(): void
    {
        Schema::table('attendance_logs', function (Blueprint $table) {
            $table->dropColumn('type');
        });
    }
};

