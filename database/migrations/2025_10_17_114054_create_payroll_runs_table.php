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
        Schema::create('payroll_runs', function (Blueprint $table) {
            $table->id();
            $table->enum('period_type', ['weekly', 'bi_weekly', 'monthly', 'custom']);
            $table->date('start_date');
            $table->date('end_date');
            $table->enum('status', ['draft', 'calculated', 'approved', 'paid'])->default('draft');
            $table->json('period_config')->nullable(); // {week_start_day, custom_interval, etc.}
            $table->decimal('total_amount', 12, 2)->default(0);
            $table->decimal('total_regular_hours', 8, 2)->default(0);
            $table->decimal('total_overtime_hours', 8, 2)->default(0);
            $table->timestamp('processed_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->unsignedBigInteger('approved_by')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('approved_by')->references('id')->on('users')->onDelete('set null');
            $table->index(['period_type', 'status']);
            $table->index(['start_date', 'end_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payroll_runs');
    }
};
