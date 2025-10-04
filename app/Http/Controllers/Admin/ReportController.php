<?php

namespace App\Http\Controllers\Admin;

use App\Models\AttendanceLog;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $projects = Project::orderBy('name')->get(['id','name']);
        $selectedProject = $request->integer('project_id');
        $from = $request->date('from');
        $to = $request->date('to');

        $query = AttendanceLog::with(['labor', 'supervisor', 'project'])
            ->when($selectedProject, fn ($q) => $q->where('project_id', $selectedProject))
            ->when($from, fn ($q) => $q->whereDate('timestamp', '>=', $from))
            ->when($to, fn ($q) => $q->whereDate('timestamp', '<=', $to))
            ->latest('timestamp');

        $logs = $query->paginate(25);

        return Inertia::render('admin/reports/index', [
            'projects' => $projects,
            'logs' => [
                'data' => $logs->map(fn ($log) => [
                    'id' => $log->id,
                    'timestamp' => optional($log->timestamp)->toDateTimeString(),
                    'project' => $log->project?->only(['id','name']),
                    'labor' => $log->labor?->only(['id','name']),
                    'supervisor' => $log->supervisor?->only(['id','name']),
                    'latitude' => $log->latitude,
                    'longitude' => $log->longitude,
                    'location_address' => $log->location_address,
                    'photo_url' => $log->photo_path ? asset('storage/'.$log->photo_path) : null,
                ]),
                'meta' => [
                    'current_page' => $logs->currentPage(),
                    'last_page' => $logs->lastPage(),
                    'per_page' => $logs->perPage(),
                    'total' => $logs->total(),
                ],
            ],
            'filters' => [
                'project_id' => $selectedProject,
                'from' => $from?->toDateString(),
                'to' => $to?->toDateString(),
            ],
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $request->validate([
            'project_id' => ['nullable', 'integer', 'exists:projects,id'],
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date'],
        ]);

        $query = AttendanceLog::with(['labor', 'supervisor', 'project'])
            ->when($request->filled('project_id'), fn ($q) => $q->where('project_id', $request->integer('project_id')))
            ->when($request->filled('from'), fn ($q) => $q->whereDate('timestamp', '>=', $request->date('from')))
            ->when($request->filled('to'), fn ($q) => $q->whereDate('timestamp', '<=', $request->date('to')))
            ->orderBy('timestamp');

        $filename = 'attendance_export_'.now()->format('Ymd_His').'.csv';

        return response()->streamDownload(function () use ($query) {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['Timestamp', 'Project', 'Labor', 'Supervisor', 'Lat', 'Lng', 'Address', 'Photo URL']);
            $query->chunk(500, function ($chunk) use ($out) {
                foreach ($chunk as $log) {
                    fputcsv($out, [
                        optional($log->timestamp)->toDateTimeString(),
                        $log->project?->name,
                        $log->labor?->name,
                        $log->supervisor?->name,
                        $log->latitude,
                        $log->longitude,
                        $log->location_address,
                        $log->photo_path ? asset('storage/'.$log->photo_path) : '',
                    ]);
                }
            });
            fclose($out);
        }, $filename, ['Content-Type' => 'text/csv']);
    }
}
