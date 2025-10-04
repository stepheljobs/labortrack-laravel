<?php

namespace App\Http\Controllers\Admin;

use App\Models\AttendanceLog;
use App\Models\Project;
use App\Models\ProjectMessage;
use Illuminate\Support\Carbon;
use Illuminate\Routing\Controller;

class DashboardController extends Controller
{
    public function index()
    {
        $projectsCount = Project::count();
        $todayAttendance = AttendanceLog::whereDate('timestamp', Carbon::today())->count();
        $recentMessages = ProjectMessage::with(['user', 'project'])->latest()->limit(10)->get();

        return view('admin.dashboard', compact('projectsCount', 'todayAttendance', 'recentMessages'));
    }
}

