<?php

namespace App\Http\Controllers\Admin;

use App\Models\AttendanceLog;
use App\Models\Project;
use App\Models\ProjectMessage;
use Illuminate\Support\Carbon;
use Illuminate\Routing\Controller;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $projectsCount = Project::count();
        $todayAttendance = AttendanceLog::whereDate('timestamp', Carbon::today())->count();
        $recentMessages = ProjectMessage::with(['user', 'project'])->latest()->limit(10)->get()
            ->map(fn ($m) => [
                'id' => $m->id,
                'created_at' => optional($m->created_at)->toDateTimeString(),
                'user' => $m->user?->only(['id','name','email']),
                'project' => $m->project?->only(['id','name']),
                'message' => $m->message,
                'photo_url' => $m->photo_path ? asset('storage/'.$m->photo_path) : null,
            ]);

        return Inertia::render('dashboard', [
            'projectsCount' => $projectsCount,
            'todayAttendance' => $todayAttendance,
            'recentMessages' => $recentMessages,
        ]);
    }
}
