@extends('admin.layout')

@section('content')
    <h2>Dashboard</h2>
    <div style="display:flex; gap:2rem;">
        <div>
            <strong>Projects</strong>
            <div>{{ $projectsCount }}</div>
        </div>
        <div>
            <strong>Today's Attendance</strong>
            <div>{{ $todayAttendance }}</div>
        </div>
    </div>

    <h3 style="margin-top:2rem;">Recent Messages</h3>
    <table>
        <thead>
            <tr>
                <th>Time</th>
                <th>Project</th>
                <th>User</th>
                <th>Message</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($recentMessages as $m)
                <tr>
                    <td>{{ $m->created_at->toDayDateTimeString() }}</td>
                    <td>{{ $m->project?->name }}</td>
                    <td>{{ $m->user?->name }}</td>
                    <td>{{ strlen($m->message) > 80 ? substr($m->message,0,80).'…' : $m->message }}</td>
                </tr>
            @empty
                <tr><td colspan="4">No recent messages.</td></tr>
            @endforelse
        </tbody>
    </table>
@endsection
