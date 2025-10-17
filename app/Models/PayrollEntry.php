<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PayrollEntry extends Model
{
    use HasFactory;

    protected $fillable = [
        'payroll_run_id',
        'labor_id',
        'project_id',
        'regular_hours',
        'overtime_hours',
        'hourly_rate',
        'overtime_rate',
        'regular_pay',
        'overtime_pay',
        'total_pay',
        'attendance_data',
        'days_worked',
        'notes',
    ];

    protected $casts = [
        'regular_hours' => 'decimal:2',
        'overtime_hours' => 'decimal:2',
        'hourly_rate' => 'decimal:2',
        'overtime_rate' => 'decimal:2',
        'regular_pay' => 'decimal:2',
        'overtime_pay' => 'decimal:2',
        'total_pay' => 'decimal:2',
        'attendance_data' => 'array',
        'days_worked' => 'integer',
    ];

    public function payrollRun(): BelongsTo
    {
        return $this->belongsTo(PayrollRun::class);
    }

    public function labor(): BelongsTo
    {
        return $this->belongsTo(Labor::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function getTotalHoursAttribute(): float
    {
        return $this->regular_hours + $this->overtime_hours;
    }

    public function getAverageHoursPerDayAttribute(): float
    {
        return $this->days_worked > 0 ? round($this->total_hours / $this->days_worked, 2) : 0;
    }

    public function getAverageDailyPayAttribute(): float
    {
        return $this->days_worked > 0 ? round($this->total_pay / $this->days_worked, 2) : 0;
    }

    public function getOvertimePercentageAttribute(): float
    {
        $totalHours = $this->total_hours;
        return $totalHours > 0 ? round(($this->overtime_hours / $totalHours) * 100, 2) : 0;
    }

    public function scopeByProject($query, $projectId)
    {
        return $query->where('project_id', $projectId);
    }

    public function scopeByLabor($query, $laborId)
    {
        return $query->where('labor_id', $laborId);
    }

    public function scopeWithOvertime($query)
    {
        return $query->where('overtime_hours', '>', 0);
    }

    public function scopeWithoutOvertime($query)
    {
        return $query->where('overtime_hours', 0);
    }

    public function scopeHoursRange($query, $minHours = null, $maxHours = null)
    {
        if ($minHours !== null) {
            $query->where('total_hours', '>=', $minHours);
        }
        
        if ($maxHours !== null) {
            $query->where('total_hours', '<=', $maxHours);
        }
        
        return $query;
    }

    public function scopePayRange($query, $minPay = null, $maxPay = null)
    {
        if ($minPay !== null) {
            $query->where('total_pay', '>=', $minPay);
        }
        
        if ($maxPay !== null) {
            $query->where('total_pay', '<=', $maxPay);
        }
        
        return $query;
    }

    public function getFormattedRegularHoursAttribute(): string
    {
        return number_format($this->regular_hours, 2);
    }

    public function getFormattedOvertimeHoursAttribute(): string
    {
        return number_format($this->overtime_hours, 2);
    }

    public function getFormattedTotalHoursAttribute(): string
    {
        return number_format($this->total_hours, 2);
    }

    public function getFormattedRegularPayAttribute(): string
    {
        return number_format($this->regular_pay, 2);
    }

    public function getFormattedOvertimePayAttribute(): string
    {
        return number_format($this->overtime_pay, 2);
    }

    public function getFormattedTotalPayAttribute(): string
    {
        return number_format($this->total_pay, 2);
    }

    public function getFormattedHourlyRateAttribute(): string
    {
        return number_format($this->hourly_rate, 2);
    }

    public function getFormattedOvertimeRateAttribute(): string
    {
        return number_format($this->overtime_rate, 2);
    }
}