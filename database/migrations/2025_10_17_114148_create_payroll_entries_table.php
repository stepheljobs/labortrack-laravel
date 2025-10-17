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
        Schema::create('payroll_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payroll_run_id')->constrained()->onDelete('cascade');
            $table->foreignId('labor_id')->constrained()->onDelete('cascade');
            $table->foreignId('project_id')->nullable()->constrained()->onDelete('set null');
            $table->decimal('regular_hours', 8, 2)->default(0);
            $table->decimal('overtime_hours', 8, 2)->default(0);
            $table->decimal('hourly_rate', 8, 2);
            $table->decimal('overtime_rate', 8, 2);
            $table->decimal('regular_pay', 10, 2)->default(0);
            $table->decimal('overtime_pay', 10, 2)->default(0);
            $table->decimal('total_pay', 10, 2)->default(0);
            $table->json('attendance_data')->nullable(); // paired clock-in/out records
            $table->integer('days_worked')->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['payroll_run_id', 'labor_id']);
            $table->index(['project_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payroll_entries');
    }
};
