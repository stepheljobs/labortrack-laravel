<?php

namespace App\Services;

use App\Models\AttendanceLog;
use App\Models\Labor;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class PayrollCalculationService
{
    private float $overtimeMultiplier;
    private float $dailyHoursThreshold;

    public function __construct()
    {
        $this->overtimeMultiplier = \App\Models\PayrollSetting::getOvertimeMultiplier();
        $this->dailyHoursThreshold = \App\Models\PayrollSetting::getDailyHoursThreshold();
    }

    public function calculateLaborPayroll(Labor $labor, Carbon $startDate, Carbon $endDate): array
    {
        $attendanceLogs = $this->getAttendanceLogs($labor->id, $startDate, $endDate);
        $pairedRecords = $this->pairClockInOut($attendanceLogs);
        
        $totalRegularHours = 0;
        $totalOvertimeHours = 0;
        $daysWorked = 0;
        $dailyBreakdown = [];

        foreach ($pairedRecords as $date => $records) {
            $dayHours = 0;
            $dayRegularHours = 0;
            $dayOvertimeHours = 0;
            $dayRecords = [];

            foreach ($records as $pair) {
                $hours = $this->calculateHours($pair['clock_in']->timestamp, $pair['clock_out']->timestamp);
                $dayHours += $hours;
                
                $overtimeHours = max(0, $hours - $this->dailyHoursThreshold);
                $regularHours = $hours - $overtimeHours;
                
                $dayRegularHours += $regularHours;
                $dayOvertimeHours += $overtimeHours;
                
                $dayRecords[] = [
                    'clock_in' => $pair['clock_in']->timestamp->toDateTimeString(),
                    'clock_out' => $pair['clock_out']->timestamp->toDateTimeString(),
                    'hours' => round($hours, 2),
                    'regular_hours' => round($regularHours, 2),
                    'overtime_hours' => round($overtimeHours, 2),
                ];
            }

            if ($dayHours > 0) {
                $daysWorked++;
                $totalRegularHours += $dayRegularHours;
                $totalOvertimeHours += $dayOvertimeHours;
                
                $dailyBreakdown[$date] = [
                    'total_hours' => round($dayHours, 2),
                    'regular_hours' => round($dayRegularHours, 2),
                    'overtime_hours' => round($dayOvertimeHours, 2),
                    'records' => $dayRecords,
                ];
            }
        }

        $hourlyRate = $this->calculateHourlyRate($labor->daily_rate);
        $overtimeRate = $hourlyRate * $this->overtimeMultiplier;
        
        $regularPay = $totalRegularHours * $hourlyRate;
        $overtimePay = $totalOvertimeHours * $overtimeRate;
        $totalPay = $regularPay + $overtimePay;

        return [
            'labor_id' => $labor->id,
            'labor_name' => $labor->name,
            'daily_rate' => $labor->daily_rate,
            'hourly_rate' => $hourlyRate,
            'overtime_rate' => $overtimeRate,
            'regular_hours' => round($totalRegularHours, 2),
            'overtime_hours' => round($totalOvertimeHours, 2),
            'total_hours' => round($totalRegularHours + $totalOvertimeHours, 2),
            'days_worked' => $daysWorked,
            'regular_pay' => round($regularPay, 2),
            'overtime_pay' => round($overtimePay, 2),
            'total_pay' => round($totalPay, 2),
            'daily_breakdown' => $dailyBreakdown,
            'attendance_data' => $dailyBreakdown,
        ];
    }

    public function pairClockInOut(Collection $attendanceLogs): array
    {
        $paired = [];
        $unpaired = [];

        // Group by date and type
        $grouped = $attendanceLogs->groupBy(function ($log) {
            return $log->timestamp->format('Y-m-d');
        });

        foreach ($grouped as $date => $dayLogs) {
            $clockIns = $dayLogs->filter(fn($log) => $log->type === 'clock_in')->sortBy('timestamp');
            $clockOuts = $dayLogs->filter(fn($log) => $log->type === 'clock_out')->sortBy('timestamp');

            $dayPairs = [];
            $clockInIterator = $clockIns->getIterator();
            $clockOutIterator = $clockOuts->getIterator();

            // Pair clock-ins with clock-outs
            while ($clockInIterator->valid() && $clockOutIterator->valid()) {
                $clockIn = $clockInIterator->current();
                $clockOut = $clockOutIterator->current();

                if ($clockOut->timestamp->gt($clockIn->timestamp)) {
                    $dayPairs[] = [
                        'clock_in' => $clockIn,
                        'clock_out' => $clockOut,
                    ];
                    $clockInIterator->next();
                    $clockOutIterator->next();
                } else {
                    // Clock-out is before clock-in, skip this clock-out
                    $clockOutIterator->next();
                }
            }

            // Handle unpaired clock-ins (no clock-out found)
            while ($clockInIterator->valid()) {
                $unpaired[] = $clockInIterator->current();
                $clockInIterator->next();
            }

            // Handle unpaired clock-outs (no clock-in found)
            while ($clockOutIterator->valid()) {
                $unpaired[] = $clockOutIterator->current();
                $clockOutIterator->next();
            }

            if (!empty($dayPairs)) {
                $paired[$date] = $dayPairs;
            }
        }

        // Log unpaired records for debugging
        if (!empty($unpaired)) {
            \Log::warning('Unpaired attendance records found', [
                'unpaired_count' => count($unpaired),
                'records' => collect($unpaired)->map(fn($log) => [
                    'id' => $log->id,
                    'labor_id' => $log->labor_id,
                    'type' => $log->type,
                    'timestamp' => $log->timestamp->toDateTimeString(),
                ])->toArray()
            ]);
        }

        return $paired;
    }

    private function calculateHours(Carbon $clockIn, Carbon $clockOut): float
    {
        return $clockOut->diffInMinutes($clockIn, true) / 60;
    }

    private function calculateHourlyRate(float $dailyRate): float
    {
        $standardWorkDay = \App\Models\PayrollSetting::getStandardWorkDayHours();
        return $dailyRate / $standardWorkDay;
    }

    private function getAttendanceLogs(int $laborId, Carbon $startDate, Carbon $endDate): Collection
    {
        return AttendanceLog::where('labor_id', $laborId)
            ->whereBetween('timestamp', [$startDate->startOfDay(), $endDate->endOfDay()])
            ->orderBy('timestamp')
            ->get(['id', 'type', 'timestamp', 'project_id']);
    }

    public function calculateOvertime(float $regularHours, float $hourlyRate): array
    {
        $overtimeHours = max(0, $regularHours - $this->dailyHoursThreshold);
        $overtimeRate = $hourlyRate * $this->overtimeMultiplier;
        $overtimePay = $overtimeHours * $overtimeRate;

        return [
            'overtime_hours' => round($overtimeHours, 2),
            'overtime_rate' => round($overtimeRate, 2),
            'overtime_pay' => round($overtimePay, 2),
        ];
    }

    public function setOvertimeMultiplier(float $multiplier): void
    {
        $this->overtimeMultiplier = $multiplier;
    }

    public function setDailyHoursThreshold(float $threshold): void
    {
        $this->dailyHoursThreshold = $threshold;
    }

    public function getPayrollSummary(Collection $payrollEntries): array
    {
        $totalRegularHours = $payrollEntries->sum('regular_hours');
        $totalOvertimeHours = $payrollEntries->sum('overtime_hours');
        $totalRegularPay = $payrollEntries->sum('regular_pay');
        $totalOvertimePay = $payrollEntries->sum('overtime_pay');
        $totalPay = $payrollEntries->sum('total_pay');
        $totalDaysWorked = $payrollEntries->sum('days_worked');

        return [
            'total_employees' => $payrollEntries->count(),
            'total_regular_hours' => round($totalRegularHours, 2),
            'total_overtime_hours' => round($totalOvertimeHours, 2),
            'total_hours' => round($totalRegularHours + $totalOvertimeHours, 2),
            'total_regular_pay' => round($totalRegularPay, 2),
            'total_overtime_pay' => round($totalOvertimePay, 2),
            'total_amount' => round($totalPay, 2),
            'total_days_worked' => $totalDaysWorked,
            'average_daily_hours' => $totalDaysWorked > 0 ? round(($totalRegularHours + $totalOvertimeHours) / $totalDaysWorked, 2) : 0,
        ];
    }
}