<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
    
    // Projects routes
    Route::get('/projects', [App\Http\Controllers\ProjectController::class, 'index'])->name('projects.index');
    Route::get('/projects/{project}', [App\Http\Controllers\ProjectController::class, 'show'])->name('projects.show');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

// Admin views (Blade) - require auth + admin
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\ProjectAdminController;
use App\Http\Controllers\Admin\ReportController;

Route::prefix('admin')->middleware(['auth', 'admin'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('admin.dashboard');

    Route::get('/projects', [ProjectAdminController::class, 'index'])->name('admin.projects.index');
    Route::post('/projects', [ProjectAdminController::class, 'store'])->name('admin.projects.store');
    Route::get('/projects/{project}', [ProjectAdminController::class, 'show'])->name('admin.projects.show');
    Route::post('/projects/{project}/supervisors', [ProjectAdminController::class, 'attachSupervisor'])->name('admin.projects.attachSupervisor');
    Route::post('/projects/{project}/labors', [ProjectAdminController::class, 'storeLabor'])->name('admin.projects.labors.store');

    Route::get('/reports', [ReportController::class, 'index'])->name('admin.reports.index');
    Route::get('/reports/export', [ReportController::class, 'export'])->name('admin.reports.export');
});
