<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\AttendanceStoreRequest;
use App\Http\Resources\AttendanceLogResource;
use App\Models\AttendanceLog;
use App\Models\Labor;
use App\Models\Project;
use App\Services\GeocodingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Carbon;

class AttendanceController extends ApiController
{
    public function __construct(private readonly GeocodingService $geocoder)
    {
    }

    public function store(AttendanceStoreRequest $request)
    {
        $data = $request->validated();
        $labor = Labor::findOrFail($data['labor_id']);
        $project = Project::findOrFail($data['project_id']);

        // Ensure labor belongs to project and user is assigned
        abort_unless($labor->project_id === $project->id, 422, 'Labor does not belong to project');
        abort_unless($project->supervisors()->where('user_id', $request->user()->id)->exists(), 403);

        // Store photo (supports file upload or base64 converted in request)
        $path = $request->file('photo')->store('attendance-photos', 'public');

        // Reverse geocode
        $address = $this->geocoder->reverse((float) $data['latitude'], (float) $data['longitude']);

        $log = AttendanceLog::create([
            'labor_id' => $labor->id,
            'supervisor_id' => $request->user()->id,
            'project_id' => $project->id,
            'type' => $data['type'] ?? 'clock_in',
            'photo_path' => $path,
            'latitude' => (float) $data['latitude'],
            'longitude' => (float) $data['longitude'],
            'location_address' => $address,
            'timestamp' => Carbon::parse($data['timestamp']),
        ]);

        $log->load(['labor', 'supervisor']);

        return $this->success(new AttendanceLogResource($log), 'Attendance logged', 201);
    }

    public function projectLogs(Request $request, Project $project)
    {
        abort_unless($project->supervisors()->where('user_id', $request->user()->id)->exists(), 403);

        $logs = $project->attendanceLogs()
            ->with(['labor', 'supervisor'])
            ->when($request->filled('date'), function ($q) use ($request) {
                $date = Carbon::parse($request->string('date'))->toDateString();
                $q->whereDate('timestamp', $date);
            })
            ->latest('timestamp')
            ->paginate(25);

        return $this->success([
            'items' => AttendanceLogResource::collection($logs->items()),
            'meta' => [
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'per_page' => $logs->perPage(),
                'total' => $logs->total(),
            ],
        ]);
    }

    public function today(Request $request)
    {
        $user = $request->user();
        $projectIds = $user->projects()->pluck('projects.id');

        $logs = AttendanceLog::with(['labor', 'supervisor'])
            ->whereIn('project_id', $projectIds)
            ->whereDate('timestamp', Carbon::today())
            ->latest('timestamp')
            ->paginate(25);

        return $this->success([
            'items' => AttendanceLogResource::collection($logs->items()),
            'meta' => [
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'per_page' => $logs->perPage(),
                'total' => $logs->total(),
            ],
        ]);
    }
}
