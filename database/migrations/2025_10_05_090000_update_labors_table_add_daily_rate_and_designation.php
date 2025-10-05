<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('labors', function (Blueprint $table) {
            if (Schema::hasColumn('labors', 'role')) {
                $table->renameColumn('role', 'designation');
            }
            if (!Schema::hasColumn('labors', 'daily_rate')) {
                $table->decimal('daily_rate', 10, 2)->nullable()->after('contact_number');
            }
        });
    }

    public function down(): void
    {
        Schema::table('labors', function (Blueprint $table) {
            if (Schema::hasColumn('labors', 'designation')) {
                $table->renameColumn('designation', 'role');
            }
            if (Schema::hasColumn('labors', 'daily_rate')) {
                $table->dropColumn('daily_rate');
            }
        });
    }
};

