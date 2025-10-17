<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PayrollRun extends Model
{
    use HasFactory;

    protected $fillable = [
        'period_type',
        'start_date',
        'end_date',
        'status',
        'period_config',
        'total_amount',
        'total_regular_hours',
        'total_overtime_hours',
        'processed_at',
        'approved_at',
        'approved_by',
        'notes',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'period_config' => 'array',
        'total_amount' => 'decimal:2',
        'total_regular_hours' => 'decimal:2',
        'total_overtime_hours' => 'decimal:2',
        'processed_at' => 'datetime',
        'approved_at' => 'datetime',
    ];

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function payrollEntries(): HasMany
    {
        return $this->hasMany(PayrollEntry::class);
    }

    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    public function scopeCalculated($query)
    {
        return $query->where('status', 'calculated');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    public function scopeByPeriodType($query, string $periodType)
    {
        return $query->where('period_type', $periodType);
    }

    public function scopeInDateRange($query, $startDate, $endDate)
    {
        return $query->where(function ($q) use ($startDate, $endDate) {
            $q->whereBetween('start_date', [$startDate, $endDate])
              ->orWhereBetween('end_date', [$startDate, $endDate])
              ->orWhere(function ($subQ) use ($startDate, $endDate) {
                  $subQ->where('start_date', '<=', $startDate)
                       ->where('end_date', '>=', $endDate);
              });
        });
    }

    public function getPeriodLabelAttribute(): string
    {
        return $this->start_date->format('M d, Y') . ' - ' . $this->end_date->format('M d, Y');
    }

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'draft' => 'Draft',
            'calculated' => 'Calculated',
            'approved' => 'Approved',
            'paid' => 'Paid',
            default => 'Unknown',
        };
    }

    public function getStatusColorAttribute(): string
    {
        return match ($this->status) {
            'draft' => 'gray',
            'calculated' => 'blue',
            'approved' => 'green',
            'paid' => 'emerald',
            default => 'gray',
        };
    }

    public function canBeCalculated(): bool
    {
        return $this->status === 'draft';
    }

    public function canBeApproved(): bool
    {
        return $this->status === 'calculated';
    }

    public function canBeMarkedAsPaid(): bool
    {
        return $this->status === 'approved';
    }

    public function canBeEdited(): bool
    {
        return in_array($this->status, ['draft', 'calculated']);
    }

    public function canBeDeleted(): bool
    {
        return $this->status === 'draft';
    }

    public function recalculateTotals(): void
    {
        $this->total_regular_hours = $this->payrollEntries()->sum('regular_hours');
        $this->total_overtime_hours = $this->payrollEntries()->sum('overtime_hours');
        $this->total_amount = $this->payrollEntries()->sum('total_pay');
        $this->save();
    }

    public function getEmployeeCountAttribute(): int
    {
        return $this->payrollEntries()->count();
    }

    public function getTotalHoursAttribute(): float
    {
        return $this->total_regular_hours + $this->total_overtime_hours;
    }

    public function getAverageHoursPerEmployeeAttribute(): float
    {
        $employeeCount = $this->employee_count;
        return $employeeCount > 0 ? round($this->total_hours / $employeeCount, 2) : 0;
    }

    public function getAveragePayPerEmployeeAttribute(): float
    {
        $employeeCount = $this->employee_count;
        return $employeeCount > 0 ? round($this->total_amount / $employeeCount, 2) : 0;
    }
}