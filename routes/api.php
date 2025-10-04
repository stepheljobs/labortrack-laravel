<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\LaborController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\MessageController;

Route::prefix('')->group(function () {
    // Auth
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);

        // Projects
        Route::get('/projects', [ProjectController::class, 'index']);
        Route::get('/projects/{project}', [ProjectController::class, 'show']);
        Route::get('/projects/{project}/labors', [LaborController::class, 'index']);
        Route::post('/projects/{project}/labors', [LaborController::class, 'store']);
        Route::delete('/labors/{labor}', [LaborController::class, 'destroy']);

        // Attendance
        Route::post('/attendance/log', [AttendanceController::class, 'store']);
        Route::get('/projects/{project}/attendance', [AttendanceController::class, 'projectLogs']);
        Route::get('/attendance/today', [AttendanceController::class, 'today']);

        // Messages
        Route::get('/projects/{project}/messages', [MessageController::class, 'index']);
        Route::post('/projects/{project}/messages', [MessageController::class, 'store']);
    });
});

