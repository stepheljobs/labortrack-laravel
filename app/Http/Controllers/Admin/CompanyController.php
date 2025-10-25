<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\View\View;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class CompanyController extends Controller
{
    /**
     * Display a listing of all companies.
     */
    public function index(Request $request): Response
    {
        $query = Company::withCount(['users', 'projects', 'labors'])
            ->with(['users' => function ($query) {
                $query->where('role', 'admin')->limit(1);
            }]);

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ILIKE', "%{$search}%")
                  ->orWhere('subdomain', 'ILIKE', "%{$search}%")
                  ->orWhere('email', 'ILIKE', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->filled('status')) {
            $status = $request->input('status');
            if ($status === 'active') {
                $query->where(function ($q) {
                    $q->whereNull('trial_ends_at')
                      ->orWhere('trial_ends_at', '>', now());
                });
            } elseif ($status === 'trial_expired') {
                $query->where('trial_ends_at', '<=', now());
            }
        }

        // Filter by plan
        if ($request->filled('plan')) {
            $query->where('plan', $request->input('plan'));
        }

        $companies = $query->orderBy('created_at', 'desc')
            ->paginate(20)
            ->withQueryString();

        // Get statistics
        $stats = [
            'total_companies' => Company::count(),
            'active_companies' => Company::where(function ($q) {
                $q->whereNull('trial_ends_at')
                  ->orWhere('trial_ends_at', '>', now());
            })->count(),
            'trial_expired' => Company::where('trial_ends_at', '<=', now())->count(),
            'total_users' => User::count(),
        ];

        return Inertia::render('Admin/Companies/Index', [
            'companies' => $companies,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status', 'plan']),
        ]);
    }

    /**
     * Display the specified company.
     */
    public function show(Company $company): Response
    {
        $company->load([
            'users' => function ($query) {
                $query->withCount(['attendanceLogs', 'projectMessages'])
                      ->orderBy('created_at', 'desc');
            },
            'projects' => function ($query) {
                $query->withCount(['labors', 'messages'])
                      ->orderBy('created_at', 'desc');
            },
            'payrollRuns' => function ($query) {
                $query->withCount(['entries'])
                      ->orderBy('created_at', 'desc')
                      ->limit(5);
            }
        ]);

        // Get company statistics
        $stats = [
            'total_users' => $company->users()->count(),
            'admin_users' => $company->users()->where('role', 'admin')->count(),
            'regular_users' => $company->users()->where('role', 'user')->count(),
            'total_projects' => $company->projects()->count(),
            'active_projects' => $company->projects()->where('status', 'active')->count(),
            'total_labors' => $company->labors()->count(),
            'active_labors' => $company->labors()->where('status', 'active')->count(),
            'total_attendance_logs' => $company->attendanceLogs()->count(),
            'attendance_this_month' => $company->attendanceLogs()
                ->whereMonth('clock_in', now()->month)
                ->whereYear('clock_in', now()->year)
                ->count(),
            'total_payroll_runs' => $company->payrollRuns()->count(),
            'last_payroll_run' => $company->payrollRuns()->latest()->first(),
        ];

        // Get recent activity
        $recentActivity = collect([
            $company->users()->latest()->first()?->setRelation('type', 'user'),
            $company->projects()->latest()->first()?->setRelation('type', 'project'),
            $company->attendanceLogs()->latest()->first()?->setRelation('type', 'attendance'),
            $company->payrollRuns()->latest()->first()?->setRelation('type', 'payroll'),
        ])
        ->filter()
        ->sortByDesc('created_at')
        ->take(10);

        return Inertia::render('Admin/Companies/Show', [
            'company' => $company,
            'stats' => $stats,
            'recentActivity' => $recentActivity,
        ]);
    }

    /**
     * Toggle company status (active/inactive).
     */
    public function toggle(Company $company): RedirectResponse
    {
        if ($company->is_active) {
            $company->update(['is_active' => false]);
            $message = 'Company deactivated successfully.';
        } else {
            $company->update(['is_active' => true]);
            $message = 'Company activated successfully.';
        }

        return back()->with('success', $message);
    }

    /**
     * Extend trial period for a company.
     */
    public function extendTrial(Request $request, Company $company): RedirectResponse
    {
        $validated = $request->validate([
            'days' => 'required|integer|min:1|max:365',
        ]);

        $currentTrialEnd = $company->trial_ends_at ?? now();
        $newTrialEnd = $currentTrialEnd->addDays($validated['days']);

        $company->update(['trial_ends_at' => $newTrialEnd]);

        return back()->with('success', "Trial extended until {$newTrialEnd->format('M j, Y')}.");
    }

    /**
     * Update company plan.
     */
    public function updatePlan(Request $request, Company $company): RedirectResponse
    {
        $validated = $request->validate([
            'plan' => 'required|in:starter,professional,enterprise',
        ]);

        $company->update(['plan' => $validated['plan']]);

        return back()->with('success', "Company plan updated to {$validated['plan']}.");
    }

    /**
     * Get company data for API endpoints.
     */
    public function apiIndex(Request $request)
    {
        $companies = Company::withCount(['users', 'projects'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($companies);
    }

    /**
     * Get company statistics for dashboard.
     */
    public function statistics()
    {
        $stats = [
            'total_companies' => Company::count(),
            'active_companies' => Company::where('is_active', true)->count(),
            'trial_companies' => Company::whereNotNull('trial_ends_at')
                ->where('trial_ends_at', '>', now())
                ->count(),
            'expired_trials' => Company::whereNotNull('trial_ends_at')
                ->where('trial_ends_at', '<=', now())
                ->count(),
            'companies_by_plan' => Company::selectRaw('plan, COUNT(*) as count')
                ->groupBy('plan')
                ->get(),
            'new_companies_this_month' => Company::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count(),
            'total_users' => User::count(),
            'users_by_role' => User::selectRaw('role, COUNT(*) as count')
                ->groupBy('role')
                ->get(),
        ];

        return response()->json($stats);
    }
}
