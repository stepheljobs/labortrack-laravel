<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PayrollSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'value',
        'type',
        'description',
    ];

    protected $casts = [
        'value' => 'string',
        'type' => 'string',
    ];

    public static function getValue(string $key, mixed $default = null): mixed
    {
        $setting = static::where('key', $key)->first();
        
        if (!$setting) {
            return $default;
        }

        return match ($setting->type) {
            'boolean' => filter_var($setting->value, FILTER_VALIDATE_BOOLEAN),
            'number' => is_numeric($setting->value) ? (float) $setting->value : $default,
            'integer' => is_numeric($setting->value) ? (int) $setting->value : $default,
            'json' => json_decode($setting->value, true) ?? $default,
            'array' => json_decode($setting->value, true) ?? $default,
            default => $setting->value,
        };
    }

    public static function setValue(string $key, mixed $value, string $type = 'string', ?string $description = null): self
    {
        $stringValue = match ($type) {
            'boolean', 'bool' => $value ? '1' : '0',
            'json', 'array' => json_encode($value),
            'number', 'float', 'double' => (string) (float) $value,
            'integer', 'int' => (string) (int) $value,
            default => (string) $value,
        };

        return static::updateOrCreate(
            ['key' => $key],
            [
                'value' => $stringValue,
                'type' => $type,
                'description' => $description,
            ]
        );
    }

    public static function getOvertimeMultiplier(): float
    {
        return static::getValue('overtime_multiplier', config('payroll.overtime_multiplier', 1.5));
    }

    public static function getDailyHoursThreshold(): float
    {
        return static::getValue('daily_hours_threshold', config('payroll.daily_hours_threshold', 8.0));
    }

    public static function getWeeklyHoursThreshold(): float
    {
        return static::getValue('weekly_hours_threshold', config('payroll.weekly_hours_threshold', 40.0));
    }

    public static function getStandardWorkDayHours(): float
    {
        return static::getValue('standard_work_day_hours', config('payroll.standard_work_day_hours', 8.0));
    }

    public static function isOvertimeEnabled(): bool
    {
        return static::getValue('overtime_enabled', true);
    }

    public static function getOvertimeRule(): string
    {
        return static::getValue('overtime_rule', 'daily'); // daily, weekly, both
    }

    public static function getDefaultPeriodType(): string
    {
        return static::getValue('default_period_type', config('payroll.default_period_type', 'weekly'));
    }

    public static function getRoundingPrecision(): int
    {
        return static::getValue('rounding_precision', config('payroll.rounding_precision', 2));
    }

    public static function boot()
    {
        parent::boot();

        // Seed default settings
        static::created(function ($model) {
            if ($model->key === 'overtime_multiplier' && !$model->value) {
                $model->value = '1.5';
                $model->save();
            }
        });
    }
}