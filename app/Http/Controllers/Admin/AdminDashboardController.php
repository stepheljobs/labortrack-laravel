<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\User;
use App\Models\Project;
use App\Models\Labor;
use App\Models\AttendanceLog;
use App\Models\PayrollRun;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    /**
     * Display admin dashboard.
     */
    public function index(Request $request): Response
    {
        // Get overview statistics
        $stats = [
            'total_companies' => Company::withoutGlobalScopes()->count(),
            'active_companies' => Company::withoutGlobalScopes()->where('is_active', true)->count(),
            'trial_companies' => Company::withoutGlobalScopes()->whereNotNull('trial_ends_at')
                ->where('trial_ends_at', '>', now())
                ->count(),
            'expired_trials' => Company::withoutGlobalScopes()->whereNotNull('trial_ends_at')
                ->where('trial_ends_at', '<=', now())
                ->count(),
            'total_users' => User::withoutGlobalScopes()->count(),
            'super_admins' => User::withoutGlobalScopes()->where('role', 'super_admin')->count(),
            'company_admins' => User::withoutGlobalScopes()->where('role', 'admin')->count(),
            'regular_users' => User::withoutGlobalScopes()->where('role', 'user')->count(),
            'total_projects' => Project::withoutGlobalScopes()->count(),
            'active_projects' => Project::withoutGlobalScopes()->where('status', 'active')->count(),
            'total_labors' => Labor::withoutGlobalScopes()->count(),
            'active_labors' => Labor::withoutGlobalScopes()->where('status', 'active')->count(),
            'total_attendance_logs' => AttendanceLog::withoutGlobalScopes()->count(),
            'attendance_this_month' => AttendanceLog::withoutGlobalScopes()->whereMonth('timestamp', now()->month)
                ->whereYear('timestamp', now()->year)
                ->count(),
            'total_payroll_runs' => PayrollRun::withoutGlobalScopes()->count(),
            'payroll_runs_this_month' => PayrollRun::withoutGlobalScopes()->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count(),
        ];

// Companies by plan
        $companiesByPlan = Company::withoutGlobalScopes()->selectRaw('plan, COUNT(*) as count')
            ->groupBy('plan')
            ->orderBy('count', 'desc')
            ->get();

        // New companies over last 6 months
        $newCompaniesChart = Company::withoutGlobalScopes()->selectRaw('DATE_TRUNC(\'month\', created_at) as month, COUNT(*) as count')
            ->where('created_at', '>=', now()->subMonths(6))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // User growth over last 6 months
        $userGrowthChart = User::withoutGlobalScopes()->selectRaw('DATE_TRUNC(\'month\', created_at) as month, COUNT(*) as count')
            ->where('created_at', '>=', now()->subMonths(6))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // Recent companies
        $recentCompanies = Company::withoutGlobalScopes()->withCount(['users', 'projects'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Companies with expiring trials (next 7 days)
        $expiringTrials = Company::withoutGlobalScopes()->whereNotNull('trial_ends_at')
            ->where('trial_ends_at', '>', now())
            ->where('trial_ends_at', '<=', now()->addDays(7))
            ->withCount('users')
            ->orderBy('trial_ends_at')
            ->limit(5)
            ->get();

        // Most active companies (by attendance this month)
        $mostActiveCompanies = Company::withoutGlobalScopes()->withCount(['attendanceLogs' => function ($query) {
                $query->whereMonth('timestamp', now()->month)
                    ->whereYear('timestamp', now()->year);
            }])
            ->orderBy('attendance_logs_count', 'desc')
            ->limit(5)
            ->get();

        // New companies over the last 6 months
        $newCompaniesChart = Company::selectRaw('DATE_TRUNC(\'month\', created_at) as month, COUNT(*) as count')
            ->where('created_at', '>=', now()->subMonths(6))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // User growth over the last 6 months
        $userGrowthChart = User::selectRaw('DATE_TRUNC(\'month\', created_at) as month, COUNT(*) as count')
            ->where('created_at', '>=', now()->subMonths(6))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // Recent companies
        $recentCompanies = Company::withCount(['users', 'projects'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Companies with expiring trials (next 7 days)
        $expiringTrials = Company::whereNotNull('trial_ends_at')
            ->where('trial_ends_at', '>', now())
            ->where('trial_ends_at', '<=', now()->addDays(7))
            ->withCount('users')
            ->orderBy('trial_ends_at')
            ->limit(5)
            ->get();

        // Most active companies (by attendance this month)
        $mostActiveCompanies = Company::withCount(['attendanceLogs' => function ($query) {
                $query->whereMonth('timestamp', now()->month)
                    ->whereYear('timestamp', now()->year);
            }])
            ->orderBy('attendance_logs_count', 'desc')
            ->limit(5)
            ->get();

        // System health metrics
        $systemHealth = [
            'database_size' => $this->getDatabaseSize(),
            'disk_usage' => $this->getDiskUsage(),
            'memory_usage' => $this->getMemoryUsage(),
            'php_version' => PHP_VERSION,
            'laravel_version' => app()->version(),
        ];

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'companiesByPlan' => $companiesByPlan,
            'newCompaniesChart' => $newCompaniesChart,
            'userGrowthChart' => $userGrowthChart,
            'recentCompanies' => $recentCompanies,
            'expiringTrials' => $expiringTrials,
            'mostActiveCompanies' => $mostActiveCompanies,
            'systemHealth' => $systemHealth,
        ]);
    }

    /**
     * Get database size information.
     */
    private function getDatabaseSize(): array
    {
        try {
            $result = \DB::select("SELECT pg_size_pretty(pg_database_size('" . env('DB_DATABASE') . "')) as size");
            return [
                'size' => $result[0]->size ?? 'Unknown',
                'status' => 'healthy'
            ];
        } catch (\Exception $e) {
            return [
                'size' => 'Unknown',
                'status' => 'error',
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Get disk usage information.
     */
    private function getDiskUsage(): array
    {
        try {
            $totalSpace = disk_total_space('/');
            $freeSpace = disk_free_space('/');
            $usedSpace = $totalSpace - $freeSpace;
            $usagePercent = ($usedSpace / $totalSpace) * 100;

            return [
                'total' => $this->formatBytes($totalSpace),
                'used' => $this->formatBytes($usedSpace),
                'free' => $this->formatBytes($freeSpace),
                'usage_percent' => round($usagePercent, 2),
                'status' => $usagePercent > 90 ? 'critical' : ($usagePercent > 80 ? 'warning' : 'healthy')
            ];
        } catch (\Exception $e) {
            return [
                'total' => 'Unknown',
                'used' => 'Unknown',
                'free' => 'Unknown',
                'usage_percent' => 0,
                'status' => 'error',
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Get memory usage information.
     */
    private function getMemoryUsage(): array
    {
        try {
            $memoryUsage = memory_get_usage(true);
            $memoryLimit = $this->parseBytes(ini_get('memory_limit'));
            $usagePercent = ($memoryUsage / $memoryLimit) * 100;

            return [
                'used' => $this->formatBytes($memoryUsage),
                'limit' => $this->formatBytes($memoryLimit),
                'usage_percent' => round($usagePercent, 2),
                'status' => $usagePercent > 90 ? 'critical' : ($usagePercent > 80 ? 'warning' : 'healthy')
            ];
        } catch (\Exception $e) {
            return [
                'used' => 'Unknown',
                'limit' => 'Unknown',
                'usage_percent' => 0,
                'status' => 'error',
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Format bytes to human readable format.
     */
    private function formatBytes($bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        
        $bytes /= (1 << (10 * $pow));
        
        return round($bytes, 2) . ' ' . $units[$pow];
    }

    /**
     * Parse memory limit string to bytes.
     */
    private function parseBytes($val): int
    {
        $val = trim($val);
        $last = strtolower($val[strlen($val) - 1]);
        $val = (int) $val;
        
        switch ($last) {
            case 'g':
                $val *= 1024;
            case 'm':
                $val *= 1024;
            case 'k':
                $val *= 1024;
        }
        
        return $val;
    }
}