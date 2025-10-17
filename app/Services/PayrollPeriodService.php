<?php

namespace App\Services;

use Carbon\Carbon;
use Carbon\CarbonPeriod;

class PayrollPeriodService
{
    public function generatePeriods(string $type, array $config, Carbon $startDate, Carbon $endDate): array
    {
        return match ($type) {
            'weekly' => $this->generateWeeklyPeriods($config, $startDate, $endDate),
            'bi_weekly' => $this->generateBiWeeklyPeriods($config, $startDate, $endDate),
            'monthly' => $this->generateMonthlyPeriods($config, $startDate, $endDate),
            'custom' => $this->generateCustomPeriods($config, $startDate, $endDate),
            default => throw new \InvalidArgumentException("Unsupported period type: {$type}")
        };
    }

    public function getCurrentPeriod(string $type, array $config): array
    {
        $now = Carbon::now();
        
        return match ($type) {
            'weekly' => $this->getCurrentWeeklyPeriod($config, $now),
            'bi_weekly' => $this->getCurrentBiWeeklyPeriod($config, $now),
            'monthly' => $this->getCurrentMonthlyPeriod($config, $now),
            'custom' => throw new \InvalidArgumentException("Custom periods require explicit dates"),
            default => throw new \InvalidArgumentException("Unsupported period type: {$type}")
        };
    }

    public function getNextPeriod(string $type, array $config): array
    {
        $current = $this->getCurrentPeriod($type, $config);
        $nextStart = Carbon::parse($current['end_date'])->addDay();
        $nextEnd = match ($type) {
            'weekly' => $nextStart->copy()->addDays(6),
            'bi_weekly' => $nextStart->copy()->addDays(13),
            'monthly' => $nextStart->copy()->addMonth()->subDay(),
            default => throw new \InvalidArgumentException("Unsupported period type: {$type}")
        };

        return [
            'start_date' => $nextStart->toDateString(),
            'end_date' => $nextEnd->toDateString(),
        ];
    }

    private function generateWeeklyPeriods(array $config, Carbon $startDate, Carbon $endDate): array
    {
        $weekStartDay = $config['week_start_day'] ?? 'monday';
        $periods = [];
        
        $currentStart = $startDate->copy()->startOfWeek($weekStartDay);
        if ($currentStart->lt($startDate)) {
            $currentStart = $currentStart->copy()->addWeek();
        }

        while ($currentStart->lte($endDate)) {
            $currentEnd = $currentStart->copy()->addDays(6);
            
            if ($currentEnd->gte($startDate)) {
                $periods[] = [
                    'start_date' => $currentStart->toDateString(),
                    'end_date' => $currentEnd->toDateString(),
                ];
            }
            
            $currentStart->addWeek();
        }

        return $periods;
    }

    private function generateBiWeeklyPeriods(array $config, Carbon $startDate, Carbon $endDate): array
    {
        $baseDate = isset($config['base_date']) 
            ? Carbon::parse($config['base_date']) 
            : $startDate->copy()->startOfWeek();
            
        $periods = [];
        $currentStart = $baseDate->copy();
        
        while ($currentStart->lte($endDate)) {
            $currentEnd = $currentStart->copy()->addDays(13);
            
            if ($currentEnd->gte($startDate) && $currentStart->lte($endDate)) {
                $periods[] = [
                    'start_date' => $currentStart->toDateString(),
                    'end_date' => $currentEnd->toDateString(),
                ];
            }
            
            $currentStart->addWeeks(2);
        }

        return $periods;
    }

    private function generateMonthlyPeriods(array $config, Carbon $startDate, Carbon $endDate): array
    {
        $dayOfMonth = $config['day_of_month'] ?? 1;
        $periods = [];
        
        $currentStart = $startDate->copy()->day($dayOfMonth)->startOfDay();
        if ($currentStart->lt($startDate)) {
            $currentStart->addMonth();
        }

        while ($currentStart->lte($endDate)) {
            $currentEnd = $currentStart->copy()->addMonth()->subDay();
            
            $periods[] = [
                'start_date' => $currentStart->toDateString(),
                'end_date' => $currentEnd->toDateString(),
            ];
            
            $currentStart->addMonth();
        }

        return $periods;
    }

    private function generateCustomPeriods(array $config, Carbon $startDate, Carbon $endDate): array
    {
        $intervalDays = $config['interval_days'] ?? 7;
        $periods = [];
        
        $currentStart = $startDate->copy();
        
        while ($currentStart->lte($endDate)) {
            $currentEnd = $currentStart->copy()->addDays($intervalDays - 1);
            
            if ($currentEnd->gt($endDate)) {
                $currentEnd = $endDate->copy();
            }
            
            $periods[] = [
                'start_date' => $currentStart->toDateString(),
                'end_date' => $currentEnd->toDateString(),
            ];
            
            $currentStart = $currentEnd->copy()->addDay();
        }

        return $periods;
    }

    private function getCurrentWeeklyPeriod(array $config, Carbon $now): array
    {
        $weekStartDay = $config['week_start_day'] ?? 'monday';
        $start = $now->copy()->startOfWeek($weekStartDay);
        $end = $start->copy()->addDays(6);

        return [
            'start_date' => $start->toDateString(),
            'end_date' => $end->toDateString(),
        ];
    }

    private function getCurrentBiWeeklyPeriod(array $config, Carbon $now): array
    {
        $baseDate = isset($config['base_date']) 
            ? Carbon::parse($config['base_date']) 
            : $now->copy()->startOfYear();
            
        $weeksDiff = $baseDate->diffInWeeks($now);
        $periodNumber = floor($weeksDiff / 2);
        
        $start = $baseDate->copy()->addWeeks($periodNumber * 2);
        $end = $start->copy()->addDays(13);

        return [
            'start_date' => $start->toDateString(),
            'end_date' => $end->toDateString(),
        ];
    }

    private function getCurrentMonthlyPeriod(array $config, Carbon $now): array
    {
        $dayOfMonth = $config['day_of_month'] ?? 1;
        $start = $now->copy()->day($dayOfMonth)->startOfDay();
        
        if ($start->gt($now)) {
            $start->subMonth();
        }
        
        $end = $start->copy()->addMonth()->subDay();

        return [
            'start_date' => $start->toDateString(),
            'end_date' => $end->toDateString(),
        ];
    }

    public function validatePeriodConfig(string $type, array $config): array
    {
        return match ($type) {
            'weekly' => [
                'week_start_day' => $config['week_start_day'] ?? 'monday',
            ],
            'bi_weekly' => [
                'base_date' => $config['base_date'] ?? null,
                'week_start_day' => $config['week_start_day'] ?? 'monday',
            ],
            'monthly' => [
                'day_of_month' => min(31, max(1, $config['day_of_month'] ?? 1)),
            ],
            'custom' => [
                'interval_days' => min(365, max(1, $config['interval_days'] ?? 7)),
            ],
            default => throw new \InvalidArgumentException("Unsupported period type: {$type}")
        };
    }
}