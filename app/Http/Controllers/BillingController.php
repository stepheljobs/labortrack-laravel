<?php

namespace App\Http\Controllers;

use App\Services\SubscriptionService;
use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Carbon\Carbon;

class BillingController extends Controller
{
    public function __construct(
        private SubscriptionService $subscriptionService
    ) {}

    /**
     * Display the billing dashboard
     */
    public function index(Request $request)
    {
        $company = $request->user()->company;
        
        // Get current billing period
        $billingPeriod = $this->subscriptionService->getBillingPeriod($company);
        
        // Calculate current month bill
        $currentBill = $this->subscriptionService->calculateMonthlyBill($company);
        
        // Get usage statistics
        $usageStats = $this->subscriptionService->getUsageStatistics($company);
        
        // Get available plans
        $plans = $this->subscriptionService->getPlans();
        
        // Get billing history (mock data for now)
        $billingHistory = $this->getBillingHistory($company);
        
        // Get upcoming charges
        $upcomingCharges = $this->getUpcomingCharges($company);
        
        return Inertia::render('Billing/Index', [
            'company' => [
                'name' => $company->name,
                'plan' => $company->plan,
                'trial_ends_at' => $company->trial_ends_at,
                'is_active' => $company->is_active,
            ],
            'billingPeriod' => $billingPeriod,
            'currentBill' => $currentBill,
            'usageStats' => $usageStats,
            'plans' => $plans,
            'billingHistory' => $billingHistory,
            'upcomingCharges' => $upcomingCharges,
        ]);
    }

    /**
     * Get detailed billing breakdown
     */
    public function breakdown(Request $request): JsonResponse
    {
        $request->validate([
            'date' => 'nullable|date',
            'start_date' => 'nullable|date|required_with:end_date',
            'end_date' => 'nullable|date|required_with:start_date',
        ]);

        $company = $request->user()->company;
        
        if ($request->has(['start_date', 'end_date'])) {
            $startDate = Carbon::parse($request->start_date);
            $endDate = Carbon::parse($request->end_date);
            $breakdown = [];
            
            // Generate breakdown for each month in the range
            while ($startDate <= $endDate) {
                $breakdown[] = $this->subscriptionService->calculateMonthlyBill($company, $startDate);
                $startDate->addMonth();
            }
        } else {
            $date = $request->date ? Carbon::parse($request->date) : Carbon::now();
            $breakdown = $this->subscriptionService->calculateMonthlyBill($company, $date);
        }

        return response()->json($breakdown);
    }

    /**
     * Get usage statistics for charts
     */
    public function usage(Request $request): JsonResponse
    {
        $request->validate([
            'period' => 'in:month,quarter,year',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
        ]);

        $company = $request->user()->company;
        $period = $request->period ?? 'month';
        
        $endDate = $request->end_date ? Carbon::parse($request->end_date) : Carbon::now();
        $startDate = $request->start_date ? Carbon::parse($request->start_date) : match($period) {
            'month' => $endDate->copy()->startOfMonth(),
            'quarter' => $endDate->copy()->startOfQuarter(),
            'year' => $endDate->copy()->startOfYear(),
        };

        $usageStats = $this->subscriptionService->getUsageStatistics($company, $startDate, $endDate);
        
        // Get historical usage data for charts
        $historicalUsage = $this->getHistoricalUsage($company, $startDate, $endDate, $period);

        return response()->json([
            'current' => $usageStats,
            'historical' => $historicalUsage,
        ]);
    }

    /**
     * Show plan upgrade/downgrade options
     */
    public function plans(Request $request)
    {
        $company = $request->user()->company;
        $currentPlan = $company->plan;
        $plans = $this->subscriptionService->getPlans();
        
        // Calculate prorated amounts for each plan change
        $planOptions = [];
        foreach ($plans as $planKey => $plan) {
            if ($planKey === $currentPlan) {
                $planOptions[$planKey] = [
                    'plan' => $plan,
                    'is_current' => true,
                    'proration' => null,
                ];
            } else {
                try {
                    $proration = $this->subscriptionService->calculateProratedAmount(
                        $company, 
                        $planKey, 
                        Carbon::now()
                    );
                    
                    $planOptions[$planKey] = [
                        'plan' => $plan,
                        'is_current' => false,
                        'proration' => $proration,
                    ];
                } catch (\Exception $e) {
                    $planOptions[$planKey] = [
                        'plan' => $plan,
                        'is_current' => false,
                        'proration' => null,
                        'error' => $e->getMessage(),
                    ];
                }
            }
        }

        return Inertia::render('Billing/Plans', [
            'company' => [
                'name' => $company->name,
                'current_plan' => $currentPlan,
            ],
            'planOptions' => $planOptions,
        ]);
    }

    /**
     * Process plan change
     */
    public function changePlan(Request $request): JsonResponse
    {
        $request->validate([
            'new_plan' => 'required|string|in:starter,professional,enterprise',
            'effective_date' => 'nullable|date|after_or_equal:today',
        ]);

        $company = $request->user()->company;
        $newPlan = $request->new_plan;
        $effectiveDate = $request->effective_date ? Carbon::parse($request->effective_date) : Carbon::now();

        // Validate plan change
        if ($newPlan === $company->plan) {
            return response()->json([
                'success' => false,
                'message' => 'You are already on this plan.',
            ], 400);
        }

        try {
            $proration = $this->subscriptionService->calculateProratedAmount(
                $company, 
                $newPlan, 
                $effectiveDate
            );

            // Update company plan
            $company->update([
                'plan' => $newPlan,
                'monthly_fee' => $this->subscriptionService->getPlanDetails($newPlan)['monthly_fee'],
                'user_limit' => $this->subscriptionService->getPlanDetails($newPlan)['user_limit'],
            ]);

            // Log the plan change (you might want to create a dedicated model for this)
            activity()
                ->performedOn($company)
                ->causedBy($request->user())
                ->withProperties([
                    'old_plan' => $company->getOriginal('plan'),
                    'new_plan' => $newPlan,
                    'effective_date' => $effectiveDate->toDateString(),
                    'proration' => $proration,
                ])
                ->log('Plan changed');

            return response()->json([
                'success' => true,
                'message' => 'Plan updated successfully.',
                'proration' => $proration,
                'effective_date' => $effectiveDate->toDateString(),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to change plan: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get billing history (mock implementation)
     */
    private function getBillingHistory(Company $company): array
    {
        // In a real implementation, this would come from a database table
        // For now, we'll return mock data
        return [
            [
                'id' => 1,
                'date' => '2025-09-01',
                'description' => 'Monthly subscription - Professional Plan',
                'amount' => 79.99,
                'status' => 'paid',
                'payment_method' => 'Visa ending in 4242',
            ],
            [
                'id' => 2,
                'date' => '2025-08-01',
                'description' => 'Monthly subscription - Professional Plan',
                'amount' => 79.99,
                'status' => 'paid',
                'payment_method' => 'Visa ending in 4242',
            ],
            [
                'id' => 3,
                'date' => '2025-07-01',
                'description' => 'Plan upgrade from Starter to Professional',
                'amount' => 50.00,
                'status' => 'paid',
                'payment_method' => 'Visa ending in 4242',
            ],
        ];
    }

    /**
     * Get upcoming charges
     */
    private function getUpcomingCharges(Company $company): array
    {
        $currentBill = $this->subscriptionService->calculateMonthlyBill($company);
        
        return [
            [
                'date' => Carbon::now()->addMonth()->startOfMonth()->toDateString(),
                'description' => 'Monthly subscription - ' . ucfirst($company->plan),
                'amount' => $currentBill['total'],
                'type' => 'recurring',
            ],
        ];
    }

    /**
     * Get historical usage data for charts
     */
    private function getHistoricalUsage(Company $company, Carbon $startDate, Carbon $endDate, string $period): array
    {
        $data = [];
        $currentDate = $startDate->copy();

        while ($currentDate <= $endDate) {
            $periodStart = match($period) {
                'month' => $currentDate->copy()->startOfMonth(),
                'quarter' => $currentDate->copy()->startOfQuarter(),
                'year' => $currentDate->copy()->startOfYear(),
            };
            
            $periodEnd = match($period) {
                'month' => $currentDate->copy()->endOfMonth(),
                'quarter' => $currentDate->copy()->endOfQuarter(),
                'year' => $currentDate->copy()->endOfYear(),
            };

            $stats = $this->subscriptionService->getUsageStatistics($company, $periodStart, $periodEnd);

            $data[] = [
                'period' => $periodStart->format('Y-m'),
                'users' => $stats['users']['current'],
                'projects' => $stats['projects']['current'],
                'attendance_logs' => $stats['attendance_logs']['current'],
            ];

            $currentDate = match($period) {
                'month' => $currentDate->addMonth(),
                'quarter' => $currentDate->addQuarter(),
                'year' => $currentDate->addYear(),
            };
        }

        return $data;
    }

    /**
     * Download invoice (mock implementation)
     */
    public function downloadInvoice(Request $request, $invoiceId)
    {
        // In a real implementation, this would generate and return a PDF invoice
        // For now, we'll return a simple response
        return response()->json([
            'message' => 'Invoice download not yet implemented',
            'invoice_id' => $invoiceId,
        ]);
    }

    /**
     * Update payment method (mock implementation)
     */
    public function updatePaymentMethod(Request $request): JsonResponse
    {
        $request->validate([
            'payment_method_id' => 'required|string',
        ]);

        // In a real implementation, this would integrate with a payment processor
        // like Stripe, Braintree, etc.
        
        return response()->json([
            'success' => true,
            'message' => 'Payment method updated successfully',
        ]);
    }
}