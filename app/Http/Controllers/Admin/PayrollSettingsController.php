<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PayrollSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PayrollSettingsController extends Controller
{
    public function index()
    {
        $settings = [
            'overtime_enabled' => PayrollSetting::getValue('overtime_enabled', true),
            'overtime_multiplier' => PayrollSetting::getOvertimeMultiplier(),
            'daily_hours_threshold' => PayrollSetting::getDailyHoursThreshold(),
            'weekly_hours_threshold' => PayrollSetting::getWeeklyHoursThreshold(),
            'standard_work_day_hours' => PayrollSetting::getStandardWorkDayHours(),
            'overtime_rule' => PayrollSetting::getOvertimeRule(),
            'rounding_precision' => PayrollSetting::getRoundingPrecision(),
            'default_period_type' => PayrollSetting::getDefaultPeriodType(),
        ];

        return Inertia::render('admin/payroll/settings', [
            'settings' => $settings,
            'periodTypes' => [
                ['value' => 'weekly', 'label' => 'Weekly'],
                ['value' => 'bi_weekly', 'label' => 'Bi-Weekly'],
                ['value' => 'monthly', 'label' => 'Monthly'],
                ['value' => 'custom', 'label' => 'Custom'],
            ],
            'overtimeRules' => [
                ['value' => 'daily', 'label' => 'Daily (after 8 hours per day)'],
                ['value' => 'weekly', 'label' => 'Weekly (after 40 hours per week)'],
                ['value' => 'both', 'label' => 'Both (daily and weekly)'],
            ],
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'overtime_enabled' => ['required', 'boolean'],
            'overtime_multiplier' => ['required', 'numeric', 'min:1', 'max:5'],
            'daily_hours_threshold' => ['required', 'numeric', 'min:1', 'max:24'],
            'weekly_hours_threshold' => ['required', 'numeric', 'min:1', 'max:168'],
            'standard_work_day_hours' => ['required', 'numeric', 'min:1', 'max:24'],
            'overtime_rule' => ['required', 'in:daily,weekly,both'],
            'rounding_precision' => ['required', 'integer', 'min:0', 'max:4'],
            'default_period_type' => ['required', 'in:weekly,bi_weekly,monthly,custom'],
        ]);

        // Update settings
        PayrollSetting::setValue('overtime_enabled', $validated['overtime_enabled'], 'boolean', 'Enable overtime calculations');
        PayrollSetting::setValue('overtime_multiplier', $validated['overtime_multiplier'], 'number', 'Overtime pay multiplier (e.g., 1.5 for time-and-a-half)');
        PayrollSetting::setValue('daily_hours_threshold', $validated['daily_hours_threshold'], 'number', 'Hours per day before overtime applies');
        PayrollSetting::setValue('weekly_hours_threshold', $validated['weekly_hours_threshold'], 'number', 'Hours per week before overtime applies');
        PayrollSetting::setValue('standard_work_day_hours', $validated['standard_work_day_hours'], 'number', 'Standard work day hours for rate calculations');
        PayrollSetting::setValue('overtime_rule', $validated['overtime_rule'], 'string', 'Overtime calculation rule');
        PayrollSetting::setValue('rounding_precision', $validated['rounding_precision'], 'integer', 'Decimal places for payroll calculations');
        PayrollSetting::setValue('default_period_type', $validated['default_period_type'], 'string', 'Default payroll period type');

        return back()->with('success', 'Payroll settings updated successfully.');
    }
}