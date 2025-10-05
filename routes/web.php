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
    
    // Reports routes (moved from admin)
    Route::get('/reports', [App\Http\Controllers\Admin\ReportController::class, 'index'])->name('reports.index');
    Route::get('/reports/export', [App\Http\Controllers\Admin\ReportController::class, 'export'])->name('reports.export');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

// Admin views (Blade) - require auth + admin
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\ProjectAdminController;
use App\Http\Controllers\Admin\ReportController;
