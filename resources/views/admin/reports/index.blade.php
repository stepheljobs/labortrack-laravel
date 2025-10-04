@extends('admin.layout')

@section('content')
    <h2>Attendance Reports</h2>
    <form method="get" action="{{ route('reports.index') }}" style="display:flex; gap:1rem; align-items:end; margin-bottom:1rem;">
        <div>
            <label>Project</label>
            <select name="project_id">
                <option value="">All</option>
                @foreach($projects as $p)
                    <option value="{{ $p->id }}" @selected(request('project_id')==$p->id)>{{ $p->name }}</option>
                @endforeach
            </select>
        </div>
        <div>
            <label>From</label>
            <input type="date" name="from" value="{{ request('from') }}">
        </div>
        <div>
            <label>To</label>
            <input type="date" name="to" value="{{ request('to') }}">
        </div>
        <button type="submit">Filter</button>
        <a href="{{ route('reports.export', request()->query()) }}">Export CSV</a>
    </form>

    <table>
        <thead>
            <tr>
                <th>Time</th>
                <th>Project</th>
                <th>Labor</th>
                <th>Supervisor</th>
                <th>Lat</th>
                <th>Lng</th>
                <th>Address</th>
                <th>Photo</th>
            </tr>
        </thead>
        <tbody>
            @forelse($logs as $log)
                <tr>
                    <td>{{ $log->timestamp?->toDayDateTimeString() }}</td>
                    <td>{{ $log->project?->name }}</td>
                    <td>{{ $log->labor?->name }}</td>
                    <td>{{ $log->supervisor?->name }}</td>
                    <td>{{ $log->latitude }}</td>
                    <td>{{ $log->longitude }}</td>
                    <td>{{ $log->location_address && strlen($log->location_address) > 60 ? substr($log->location_address,0,60).'…' : $log->location_address }}</td>
                    <td>
                        @if($log->photo_path)
                            <a href="{{ asset('storage/'.$log->photo_path) }}" target="_blank">View</a>
                        @endif
                    </td>
                </tr>
            @empty
                <tr><td colspan="8">No results.</td></tr>
            @endforelse
        </tbody>
    </table>
    {{ $logs->withQueryString()->links() }}
@endsection
