<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Payroll Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration settings for payroll calculations and processing.
    |
    */

    'overtime_multiplier' => env('PAYROLL_OVERTIME_MULTIPLIER', 1.5),

    'daily_hours_threshold' => env('PAYROLL_DAILY_HOURS_THRESHOLD', 8.0),

    'standard_work_day_hours' => env('PAYROLL_STANDARD_WORK_DAY_HOURS', 8.0),

    'weekly_hours_threshold' => env('PAYROLL_WEEKLY_HOURS_THRESHOLD', 40.0),

    'rounding_precision' => env('PAYROLL_ROUNDING_PRECISION', 2),

    'default_period_type' => env('PAYROLL_DEFAULT_PERIOD_TYPE', 'weekly'),

    'default_period_config' => [
        'weekly' => [
            'week_start_day' => 'monday',
        ],
        'bi_weekly' => [
            'week_start_day' => 'monday',
            'base_date' => null, // Will use start of year if not set
        ],
        'monthly' => [
            'day_of_month' => 1,
        ],
        'custom' => [
            'interval_days' => 7,
        ],
    ],

];