<?php

namespace App\Services;

use App\Models\Company;
use App\Models\User;
use App\Models\Project;
use App\Models\AttendanceLog;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class SubscriptionService
{
    /**
     * Plan configurations with pricing and limits
     */
    private array $plans = [
        'basic' => [
            'name' => 'Basic',
            'monthly_fee' => 29.99,
            'user_limit' => 5,
            'project_limit' => 10,
            'features' => ['time_tracking', 'basic_reports', 'email_support'],
        ],
        'pro' => [
            'name' => 'Professional',
            'monthly_fee' => 79.99,
            'user_limit' => 20,
            'project_limit' => 50,
            'features' => ['time_tracking', 'advanced_reports', 'payroll', 'api_access', 'priority_support'],
        ],
        'enterprise' => [
            'name' => 'Enterprise',
            'monthly_fee' => 199.99,
            'user_limit' => null, // unlimited
            'project_limit' => null, // unlimited
            'features' => ['time_tracking', 'advanced_reports', 'payroll', 'api_access', 'dedicated_support', 'custom_integrations'],
        ],
    ];

    /**
     * Calculate the monthly bill for a company
     */
    public function calculateMonthlyBill(Company $company, ?Carbon $billingDate = null): array
    {
        $billingDate = $billingDate ?? Carbon::now();
        $plan = $this->plans[$company->plan] ?? $this->plans['starter'];

        $baseFee = $plan['monthly_fee'];
        $userCount = $company->getCurrentUserCount();
        $projectCount = $company->projects()->count();

        // Calculate overage charges
        $userOverage = $this->calculateUserOverage($company, $userCount, $plan);
        $projectOverage = $this->calculateProjectOverage($company, $projectCount, $plan);

        // Calculate usage-based charges
        $attendanceFee = $this->calculateAttendanceFee($company, $billingDate);
        $storageFee = $this->calculateStorageFee($company);

        $subtotal = $baseFee + $userOverage['amount'] + $projectOverage['amount'] + $attendanceFee + $storageFee;
        $tax = $this->calculateTax($subtotal, $company);
        $total = $subtotal + $tax;

        return [
            'billing_date' => $billingDate->toDateString(),
            'plan' => $plan['name'],
            'base_fee' => round($baseFee, 2),
            'user_count' => $userCount,
            'user_limit' => $plan['user_limit'],
            'user_overage' => $userOverage,
            'project_count' => $projectCount,
            'project_limit' => $plan['project_limit'],
            'project_overage' => $projectOverage,
            'attendance_fee' => round($attendanceFee, 2),
            'storage_fee' => round($storageFee, 2),
            'subtotal' => round($subtotal, 2),
            'tax' => round($tax, 2),
            'total' => round($total, 2),
            'currency' => 'USD',
        ];
    }

    /**
     * Check if a company can add more users
     */
    public function canAddUser(Company $company, int $additionalUsers = 1): bool
    {
        if ($company->plan === 'enterprise') {
            return true;
        }

        $plan = $this->plans[$company->plan] ?? $this->plans['starter'];
        $currentUsers = $company->getCurrentUserCount();
        
        return ($currentUsers + $additionalUsers) <= $plan['user_limit'];
    }

    /**
     * Calculate user overage charges
     */
    private function calculateUserOverage(Company $company, int $userCount, array $plan): array
    {
        if ($plan['user_limit'] === null || $userCount <= $plan['user_limit']) {
            return ['count' => 0, 'amount' => 0, 'rate' => 9.99];
        }

        $overageCount = $userCount - $plan['user_limit'];
        $overageRate = 9.99; // $9.99 per additional user per month

        return [
            'count' => $overageCount,
            'amount' => $overageCount * $overageRate,
            'rate' => $overageRate,
        ];
    }

    /**
     * Calculate project overage charges
     */
    private function calculateProjectOverage(Company $company, int $projectCount, array $plan): array
    {
        if ($plan['project_limit'] === null || $projectCount <= $plan['project_limit']) {
            return ['count' => 0, 'amount' => 0, 'rate' => 4.99];
        }

        $overageCount = $projectCount - $plan['project_limit'];
        $overageRate = 4.99; // $4.99 per additional project per month

        return [
            'count' => $overageCount,
            'amount' => $overageCount * $overageRate,
            'rate' => $overageRate,
        ];
    }

    /**
     * Calculate attendance-based fees
     */
    private function calculateAttendanceFee(Company $company, Carbon $billingDate): float
    {
        $startDate = $billingDate->copy()->startOfMonth();
        $endDate = $billingDate->copy()->endOfMonth();

        $attendanceCount = $company->attendanceLogs()
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        // First 1000 attendance records are free, then $0.01 per record
        $freeLimit = 1000;
        $ratePerRecord = 0.01;

        if ($attendanceCount <= $freeLimit) {
            return 0;
        }

        return ($attendanceCount - $freeLimit) * $ratePerRecord;
    }

    /**
     * Calculate storage fees based on data usage
     */
    private function calculateStorageFee(Company $company): float
    {
        // Estimate storage usage (this is a simplified calculation)
        // In a real implementation, you might query actual file storage or database size
        $userCount = $company->getCurrentUserCount();
        $projectCount = $company->projects()->count();
        $attendanceCount = $company->attendanceLogs()->count();

        // Rough estimation: 1MB per user, 500KB per project, 10KB per attendance record
        $estimatedStorageMB = ($userCount * 1) + ($projectCount * 0.5) + ($attendanceCount * 0.01);

        // First 1GB is free, then $0.10 per GB
        $freeLimitGB = 1;
        $ratePerGB = 0.10;

        if ($estimatedStorageMB <= ($freeLimitGB * 1024)) {
            return 0;
        }

        $overageGB = ($estimatedStorageMB - ($freeLimitGB * 1024)) / 1024;
        return $overageGB * $ratePerGB;
    }

    /**
     * Calculate tax (simplified - in reality this would depend on location)
     */
    private function calculateTax(float $amount, Company $company): float
    {
        // Simplified tax calculation - in reality this would be complex
        // based on company location, tax exemptions, etc.
        $taxRate = 0.08; // 8% tax rate
        
        return $amount * $taxRate;
    }

    /**
     * Get available plans
     */
    public function getPlans(): array
    {
        return $this->plans;
    }

    /**
     * Get plan details for a specific plan
     */
    public function getPlanDetails(string $planName): ?array
    {
        return $this->plans[$planName] ?? null;
    }

    /**
     * Calculate prorated amount for plan changes
     */
    public function calculateProratedAmount(Company $company, string $newPlan, Carbon $changeDate): array
    {
        $currentPlan = $this->plans[$company->plan] ?? $this->plans['starter'];
        $targetPlan = $this->plans[$newPlan] ?? null;

        if (!$targetPlan) {
            throw new \InvalidArgumentException("Invalid plan: {$newPlan}");
        }

        $daysInMonth = $changeDate->daysInMonth;
        $remainingDays = $daysInMonth - $changeDate->day + 1;
        $prorationRatio = $remainingDays / $daysInMonth;

        $currentPlanProrated = $currentPlan['monthly_fee'] * $prorationRatio;
        $newPlanProrated = $targetPlan['monthly_fee'] * $prorationRatio;

        $difference = $newPlanProrated - $currentPlanProrated;

        return [
            'days_in_month' => $daysInMonth,
            'remaining_days' => $remainingDays,
            'proration_ratio' => round($prorationRatio, 4),
            'current_plan_prorated' => round($currentPlanProrated, 2),
            'new_plan_prorated' => round($newPlanProrated, 2),
            'difference' => round($difference, 2),
            'is_upgrade' => $difference > 0,
        ];
    }

    /**
     * Get billing period dates
     */
    public function getBillingPeriod(Company $company, ?Carbon $date = null): array
    {
        $date = $date ?? Carbon::now();
        
        // Most companies bill on the 1st of each month
        $startDate = $date->copy()->startOfMonth();
        $endDate = $date->copy()->endOfMonth();

        return [
            'start_date' => $startDate->toDateString(),
            'end_date' => $endDate->toDateString(),
            'days_in_period' => $date->daysInMonth,
            'current_day' => $date->day,
            'days_remaining' => $date->daysInMonth - $date->day + 1,
        ];
    }

    /**
     * Get usage statistics for a company
     */
    public function getUsageStatistics(Company $company, ?Carbon $startDate = null, ?Carbon $endDate = null): array
    {
        $startDate = $startDate ?? Carbon::now()->startOfMonth();
        $endDate = $endDate ?? Carbon::now()->endOfMonth();

        return [
            'users' => [
                'current' => $company->getCurrentUserCount(),
                'limit' => $this->plans[$company->plan]['user_limit'] ?? null,
                'percentage' => $this->calculateUsagePercentage(
                    $company->getCurrentUserCount(),
                    $this->plans[$company->plan]['user_limit'] ?? null
                ),
            ],
            'projects' => [
                'current' => $company->projects()->count(),
                'limit' => $this->plans[$company->plan]['project_limit'] ?? null,
                'percentage' => $this->calculateUsagePercentage(
                    $company->projects()->count(),
                    $this->plans[$company->plan]['project_limit'] ?? null
                ),
            ],
            'attendance_logs' => [
                'current' => $company->attendanceLogs()
                    ->whereBetween('created_at', [$startDate, $endDate])
                    ->count(),
                'period_start' => $startDate->toDateString(),
                'period_end' => $endDate->toDateString(),
            ],
        ];
    }

    /**
     * Calculate usage percentage
     */
    private function calculateUsagePercentage(int $current, ?int $limit): ?float
    {
        if ($limit === null) {
            return null; // Unlimited
        }

        if ($limit === 0) {
            return 100; // Avoid division by zero
        }

        return min(100, round(($current / $limit) * 100, 2));
    }
}