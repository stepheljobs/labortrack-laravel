<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Company extends Model
{
    /** @use HasFactory<\Database\Factories\CompanyFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'subdomain',
        'email',
        'phone',
        'address',
        'plan',
        'user_limit',
        'monthly_fee',
        'is_active',
        'trial_ends_at',
    ];

    protected $casts = [
        'monthly_fee' => 'decimal:2',
        'is_active' => 'boolean',
        'trial_ends_at' => 'datetime',
    ];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function projects(): HasMany
    {
        return $this->hasMany(Project::class);
    }

    public function labors(): HasMany
    {
        return $this->hasMany(Labor::class);
    }

    public function attendanceLogs(): HasMany
    {
        return $this->hasMany(AttendanceLog::class);
    }

    public function projectMessages(): HasMany
    {
        return $this->hasMany(ProjectMessage::class);
    }

    public function payrollRuns(): HasMany
    {
        return $this->hasMany(PayrollRun::class);
    }

    public function payrollEntries(): HasMany
    {
        return $this->hasMany(PayrollEntry::class);
    }

    public function payrollSettings(): HasMany
    {
        return $this->hasMany(PayrollSetting::class);
    }

    public function activeSubscription(): bool
    {
        return $this->is_active &&
               ($this->trial_ends_at?->isFuture() ?? true);
    }

    public function canAddUser(): bool
    {
        if ($this->plan === 'enterprise') {
            return true;
        }

        return $this->users()->count() < $this->user_limit;
    }

    public function getCurrentUserCount(): int
    {
        return $this->users()->count();
    }

    public function getRemainingUserSlots(): int
    {
        if ($this->plan === 'enterprise') {
            return PHP_INT_MAX;
        }

        return max(0, $this->user_limit - $this->getCurrentUserCount());
    }
}
