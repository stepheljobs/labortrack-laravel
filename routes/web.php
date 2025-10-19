<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [App\Http\Controllers\Admin\DashboardController::class, 'index'])->name('dashboard');

    // Projects routes (moved from admin)
    Route::get('/projects', [App\Http\Controllers\Admin\ProjectAdminController::class, 'index'])->name('projects.index');
    Route::post('/projects', [App\Http\Controllers\Admin\ProjectAdminController::class, 'store'])->name('projects.store');
    Route::get('/projects/{project}', [App\Http\Controllers\Admin\ProjectAdminController::class, 'show'])->name('projects.show');
    Route::post('/projects/{project}/supervisors', [App\Http\Controllers\Admin\ProjectAdminController::class, 'attachSupervisor'])->name('projects.attachSupervisor');
    Route::post('/projects/{project}/labors', [App\Http\Controllers\Admin\ProjectAdminController::class, 'storeLabor'])->name('projects.labors.store');
    Route::put('/projects/{project}/labors/{labor}', [App\Http\Controllers\Admin\ProjectAdminController::class, 'updateLabor'])->name('projects.labors.update');
    Route::delete('/projects/{project}/labors/{labor}', [App\Http\Controllers\Admin\ProjectAdminController::class, 'destroyLabor'])->name('projects.labors.destroy');
    Route::post('/projects/{project}/messages', [App\Http\Controllers\Admin\ProjectAdminController::class, 'storeMessage'])->name('projects.messages.store');

    // Employees routes
    Route::get('/employees', [App\Http\Controllers\Admin\EmployeeController::class, 'index'])->name('employees.index');
    Route::post('/employees', [App\Http\Controllers\Admin\EmployeeController::class, 'store'])->name('employees.store');
    Route::put('/employees/{employee}', [App\Http\Controllers\Admin\EmployeeController::class, 'update'])->name('employees.update');
    Route::delete('/employees/{employee}', [App\Http\Controllers\Admin\EmployeeController::class, 'destroy'])->name('employees.destroy');
    Route::get('/employees/search', [App\Http\Controllers\Admin\EmployeeController::class, 'search'])->name('employees.search');
    Route::post('/projects/{project}/labors/{employee}/assign', [App\Http\Controllers\Admin\EmployeeController::class, 'assignToProject'])->name('projects.labors.assign');

    // Reports routes (moved from admin)
    Route::get('/reports', [App\Http\Controllers\Admin\ReportController::class, 'index'])->name('reports.index');
    Route::get('/reports/export', [App\Http\Controllers\Admin\ReportController::class, 'export'])->name('reports.export');

    // Payroll routes
    Route::get('/payroll', [App\Http\Controllers\Admin\PayrollController::class, 'index'])->name('payroll.index');
    Route::get('/payroll/create', [App\Http\Controllers\Admin\PayrollController::class, 'create'])->name('payroll.create');
    Route::post('/payroll', [App\Http\Controllers\Admin\PayrollController::class, 'store'])->name('payroll.store');
    Route::get('/payroll/{payrollRun}', [App\Http\Controllers\Admin\PayrollController::class, 'show'])->name('payroll.show');
    Route::post('/payroll/{payrollRun}/calculate', [App\Http\Controllers\Admin\PayrollController::class, 'calculate'])->name('payroll.calculate');
    Route::post('/payroll/{payrollRun}/approve', [App\Http\Controllers\Admin\PayrollController::class, 'approve'])->name('payroll.approve');
    Route::post('/payroll/{payrollRun}/mark-paid', [App\Http\Controllers\Admin\PayrollController::class, 'markAsPaid'])->name('payroll.mark-paid');
    Route::get('/payroll/{payrollRun}/export', [App\Http\Controllers\Admin\PayrollController::class, 'export'])->name('payroll.export');
    Route::get('/payroll/entry/{payrollEntry}/slip', [App\Http\Controllers\Admin\PayrollController::class, 'payrollSlip'])->name('payroll.entry.slip');
    Route::delete('/payroll/{payrollRun}', [App\Http\Controllers\Admin\PayrollController::class, 'destroy'])->name('payroll.destroy');

    // Payroll Settings
    Route::get('/payroll/settings', [App\Http\Controllers\Admin\PayrollSettingsController::class, 'index'])->name('payroll.settings.index');
    Route::put('/payroll/settings', [App\Http\Controllers\Admin\PayrollSettingsController::class, 'update'])->name('payroll.settings.update');

    // Supervisors routes (admin only)
    Route::middleware([App\Http\Middleware\EnsureAdmin::class])->group(function () {
        Route::get('/admin/supervisors', [App\Http\Controllers\Admin\SupervisorController::class, 'index'])->name('supervisors.index');
        Route::post('/admin/supervisors', [App\Http\Controllers\Admin\SupervisorController::class, 'store'])->name('supervisors.store');
        Route::put('/admin/supervisors/{supervisor}', [App\Http\Controllers\Admin\SupervisorController::class, 'update'])->name('supervisors.update');
        Route::delete('/admin/supervisors/{supervisor}', [App\Http\Controllers\Admin\SupervisorController::class, 'destroy'])->name('supervisors.destroy');
        Route::post('/admin/supervisors/{supervisor}/resend-invitation', [App\Http\Controllers\Admin\SupervisorController::class, 'resendInvitation'])->name('supervisors.resend-invitation');
    });

    // Public invitation acceptance route
    Route::get('/supervisors/accept/{token}', [App\Http\Controllers\Admin\SupervisorController::class, 'acceptInvitation'])->name('supervisors.accept.invitation');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

// Admin views (Blade) - require auth + admin
