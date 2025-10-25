<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('attendance_logs', function (Blueprint $table) {
            $table->text('edit_reason')->nullable()->after('location_address');
            $table->foreignId('edited_by')->nullable()->constrained('users')->after('edit_reason');
            $table->timestamp('edited_at')->nullable()->after('edited_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('attendance_logs', function (Blueprint $table) {
            $table->dropForeign(['edited_by']);
            $table->dropColumn(['edit_reason', 'edited_by', 'edited_at']);
        });
    }
};
