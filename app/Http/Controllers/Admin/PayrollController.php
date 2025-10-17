<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Labor;
use App\Models\PayrollEntry;
use App\Models\PayrollRun;
use App\Services\PayrollCalculationService;
use App\Services\PayrollPeriodService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PayrollController extends Controller
{
    public function __construct(
        private PayrollPeriodService $periodService,
        private PayrollCalculationService $calculationService
    ) {}

    public function index(Request $request)
    {
        $query = PayrollRun::with(['approvedBy:id,name'])
            ->withCount('payrollEntries')
            ->latest('start_date');

        // Filters
        if ($request->filled('period_type')) {
            $query->byPeriodType($request->get('period_type'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->get('status'));
        }

        if ($request->filled('date_from')) {
            $query->where('start_date', '>=', $request->date('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->where('end_date', '<=', $request->date('date_to'));
        }

        $payrollRuns = $query->paginate(15);

        return Inertia::render('admin/payroll/index', [
            'payrollRuns' => [
                'data' => $payrollRuns->map(fn ($run) => [
                    'id' => $run->id,
                    'period_type' => $run->period_type,
                    'period_label' => $run->period_label,
                    'start_date' => $run->start_date->toDateString(),
                    'end_date' => $run->end_date->toDateString(),
                    'status' => $run->status,
                    'status_label' => $run->status_label,
                    'status_color' => $run->status_color,
                    'employee_count' => $run->payroll_entries_count,
                    'total_amount' => (float) ($run->total_amount ?? 0),
                    'total_hours' => (float) ($run->total_hours ?? 0),
                    'approved_by' => $run->approvedBy?->only(['id', 'name']),
                    'approved_at' => $run->approved_at?->toDateTimeString(),
                    'created_at' => $run->created_at->toDateTimeString(),
                    'can_be_calculated' => $run->canBeCalculated(),
                    'can_be_approved' => $run->canBeApproved(),
                    'can_be_marked_as_paid' => $run->canBeMarkedAsPaid(),
                    'can_be_edited' => $run->canBeEdited(),
                    'can_be_deleted' => $run->canBeDeleted(),
                ]),
                'meta' => [
                    'current_page' => $payrollRuns->currentPage(),
                    'last_page' => $payrollRuns->lastPage(),
                    'per_page' => $payrollRuns->perPage(),
                    'total' => $payrollRuns->total(),
                ],
            ],
            'filters' => [
                'period_type' => $request->get('period_type'),
                'status' => $request->get('status'),
                'date_from' => $request->get('date_from'),
                'date_to' => $request->get('date_to'),
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/payroll/create', [
            'periodTypes' => [
                ['value' => 'weekly', 'label' => 'Weekly'],
                ['value' => 'bi_weekly', 'label' => 'Bi-Weekly'],
                ['value' => 'monthly', 'label' => 'Monthly'],
                ['value' => 'custom', 'label' => 'Custom'],
            ],
            'defaultConfig' => config('payroll.default_period_config'),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'period_type' => ['required', 'in:weekly,bi_weekly,monthly,custom'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'period_config' => ['nullable', 'array'],
            'notes' => ['nullable', 'string'],
        ]);

        $periodConfig = $this->periodService->validatePeriodConfig(
            $validated['period_type'],
            $validated['period_config'] ?? []
        );

        $payrollRun = PayrollRun::create([
            'period_type' => $validated['period_type'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'period_config' => $periodConfig,
            'notes' => $validated['notes'] ?? null,
        ]);

        return redirect()->route('payroll.show', $payrollRun)
            ->with('success', 'Payroll period created successfully.');
    }

    public function show(PayrollRun $payrollRun)
    {
        $payrollRun->load(['approvedBy:id,name', 'payrollEntries.labor:id,name,daily_rate', 'payrollEntries.project:id,name']);

        $summary = $this->calculationService->getPayrollSummary($payrollRun->payrollEntries);

        return Inertia::render('admin/payroll/show', [
            'payrollRun' => [
                'id' => $payrollRun->id,
                'period_type' => $payrollRun->period_type,
                'period_label' => $payrollRun->period_label,
                'start_date' => $payrollRun->start_date->toDateString(),
                'end_date' => $payrollRun->end_date->toDateString(),
                'status' => $payrollRun->status,
                'status_label' => $payrollRun->status_label,
                'status_color' => $payrollRun->status_color,
                'period_config' => $payrollRun->period_config,
                'notes' => $payrollRun->notes,
                'approved_by' => $payrollRun->approvedBy?->only(['id', 'name']),
                'approved_at' => $payrollRun->approved_at?->toDateTimeString(),
                'processed_at' => $payrollRun->processed_at?->toDateTimeString(),
                'created_at' => $payrollRun->created_at->toDateTimeString(),
                'can_be_calculated' => $payrollRun->canBeCalculated(),
                'can_be_approved' => $payrollRun->canBeApproved(),
                'can_be_marked_as_paid' => $payrollRun->canBeMarkedAsPaid(),
                'can_be_edited' => $payrollRun->canBeEdited(),
                'can_be_deleted' => $payrollRun->canBeDeleted(),
            ],
            'summary' => $summary,
            'entries' => $payrollRun->payrollEntries->map(fn ($entry) => [
                'id' => $entry->id,
                'labor' => $entry->labor?->only(['id', 'name', 'daily_rate']),
                'project' => $entry->project?->only(['id', 'name']),
                'regular_hours' => $entry->regular_hours,
                'overtime_hours' => $entry->overtime_hours,
                'total_hours' => $entry->total_hours,
                'hourly_rate' => $entry->hourly_rate,
                'overtime_rate' => $entry->overtime_rate,
                'regular_pay' => $entry->regular_pay,
                'overtime_pay' => $entry->overtime_pay,
                'total_pay' => $entry->total_pay,
                'days_worked' => $entry->days_worked,
                'average_hours_per_day' => $entry->average_hours_per_day,
                'average_daily_pay' => $entry->average_daily_pay,
                'overtime_percentage' => $entry->overtime_percentage,
                'attendance_data' => $entry->attendance_data,
                'notes' => $entry->notes,
            ]),
        ]);
    }

    public function calculate(PayrollRun $payrollRun)
    {
        if (! $payrollRun->canBeCalculated()) {
            return back()->with('error', 'This payroll cannot be calculated in its current status.');
        }

        try {
            DB::beginTransaction();

            // Remove existing entries
            $payrollRun->payrollEntries()->delete();

            // Get all labors with attendance in the period
            $labors = Labor::whereHas('attendanceLogs', function ($query) use ($payrollRun) {
                $query->whereBetween('timestamp', [
                    $payrollRun->start_date->startOfDay(),
                    $payrollRun->end_date->endOfDay(),
                ]);
            })->get();

            $totalRegularHours = 0;
            $totalOvertimeHours = 0;
            $totalAmount = 0;

            foreach ($labors as $labor) {
                $payrollData = $this->calculationService->calculateLaborPayroll(
                    $labor,
                    $payrollRun->start_date,
                    $payrollRun->end_date
                );

                // Get the primary project for this labor in the period
                $primaryProject = $labor->attendanceLogs()
                    ->whereBetween('timestamp', [
                        $payrollRun->start_date->startOfDay(),
                        $payrollRun->end_date->endOfDay(),
                    ])
                    ->whereNotNull('project_id')
                    ->selectRaw('project_id, COUNT(*) as count')
                    ->groupBy('project_id')
                    ->orderByRaw('count DESC')
                    ->first()
                    ?->project_id;

                PayrollEntry::create([
                    'payroll_run_id' => $payrollRun->id,
                    'labor_id' => $labor->id,
                    'project_id' => $primaryProject,
                    'regular_hours' => $payrollData['regular_hours'],
                    'overtime_hours' => $payrollData['overtime_hours'],
                    'hourly_rate' => $payrollData['hourly_rate'],
                    'overtime_rate' => $payrollData['overtime_rate'],
                    'regular_pay' => $payrollData['regular_pay'],
                    'overtime_pay' => $payrollData['overtime_pay'],
                    'total_pay' => $payrollData['total_pay'],
                    'attendance_data' => $payrollData['attendance_data'],
                    'days_worked' => $payrollData['days_worked'],
                ]);

                $totalRegularHours += $payrollData['regular_hours'];
                $totalOvertimeHours += $payrollData['overtime_hours'];
                $totalAmount += $payrollData['total_pay'];
            }

            $payrollRun->update([
                'status' => 'calculated',
                'total_regular_hours' => $totalRegularHours,
                'total_overtime_hours' => $totalOvertimeHours,
                'total_amount' => $totalAmount,
                'processed_at' => now(),
            ]);

            DB::commit();

            return back()->with('success', "Payroll calculated successfully: {$labors->count()} employees, ₱".number_format($totalAmount, 2).', '.number_format($totalRegularHours + $totalOvertimeHours, 2).' hours');

        } catch (\Exception $e) {
            DB::rollBack();

            return back()->with('error', 'Failed to calculate payroll: '.$e->getMessage());
        }
    }

    public function approve(PayrollRun $payrollRun)
    {
        if (! $payrollRun->canBeApproved()) {
            return back()->with('error', 'This payroll cannot be approved in its current status.');
        }

        $payrollRun->update([
            'status' => 'approved',
            'approved_by' => Auth::id(),
            'approved_at' => now(),
        ]);

        return back()->with('success', 'Payroll approved successfully.');
    }

    public function markAsPaid(PayrollRun $payrollRun)
    {
        if (! $payrollRun->canBeMarkedAsPaid()) {
            return back()->with('error', 'This payroll cannot be marked as paid in its current status.');
        }

        $payrollRun->update([
            'status' => 'paid',
        ]);

        return back()->with('success', 'Payroll marked as paid successfully.');
    }

    public function export(PayrollRun $payrollRun): StreamedResponse
    {
        $payrollRun->load(['payrollEntries.labor:id,name', 'payrollEntries.project:id,name']);

        $filename = "payroll_{$payrollRun->start_date->format('Ymd')}_to_{$payrollRun->end_date->format('Ymd')}.csv";

        return response()->streamDownload(function () use ($payrollRun) {
            $out = fopen('php://output', 'w');

            // Header
            fputcsv($out, [
                'Employee ID',
                'Employee Name',
                'Project',
                'Days Worked',
                'Regular Hours',
                'Overtime Hours',
                'Total Hours',
                'Hourly Rate',
                'Overtime Rate',
                'Regular Pay',
                'Overtime Pay',
                'Total Pay',
            ], ',', '"', '\\');

            // Data
            foreach ($payrollRun->payrollEntries as $entry) {
                fputcsv($out, [
                    $entry->labor_id,
                    $entry->labor?->name ?? 'Unknown',
                    $entry->project?->name ?? 'N/A',
                    $entry->days_worked ?? 0,
                    $entry->regular_hours ?? 0,
                    $entry->overtime_hours ?? 0,
                    $entry->total_hours ?? 0,
                    $entry->hourly_rate ?? 0,
                    $entry->overtime_rate ?? 0,
                    $entry->regular_pay ?? 0,
                    $entry->overtime_pay ?? 0,
                    $entry->total_pay ?? 0,
                ], ',', '"', '\\');
            }

            // Summary
            fputcsv($out, [], ',', '"', '\\');
            fputcsv($out, ['SUMMARY'], ',', '"', '\\');
            fputcsv($out, ['Total Employees:', $payrollRun->payrollEntries->count()], ',', '"', '\\');
            fputcsv($out, ['Total Regular Hours:', number_format($payrollRun->total_regular_hours ?? 0, 2)], ',', '"', '\\');
            fputcsv($out, ['Total Overtime Hours:', number_format($payrollRun->total_overtime_hours ?? 0, 2)], ',', '"', '\\');
            fputcsv($out, ['Total Amount:', number_format($payrollRun->total_amount ?? 0, 2)], ',', '"', '\\');

            fclose($out);
        }, $filename, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
            'Pragma' => 'no-cache',
            'Expires' => '0',
        ]);
    }

    public function destroy(PayrollRun $payrollRun)
    {
        if (! $payrollRun->canBeDeleted()) {
            return back()->with('error', 'This payroll cannot be deleted in its current status.');
        }

        $payrollRun->delete();

        return redirect()->route('payroll.index')
            ->with('success', 'Payroll deleted successfully.');
    }
}
