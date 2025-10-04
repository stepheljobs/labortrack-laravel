@extends('admin.layout')

@section('content')
    <h2>Project: {{ $project->name }}</h2>
    <p>{{ $project->description }}</p>
    <p><strong>Location:</strong> {{ $project->location_address }}</p>

    <h3 style="margin-top:2rem;">Assign Supervisor</h3>
    <form method="post" action="{{ route('admin.projects.attachSupervisor', $project) }}">
        @csrf
        <select name="user_id" required>
            @foreach ($supervisors as $s)
                <option value="{{ $s->id }}">{{ $s->name }} ({{ $s->email }})</option>
            @endforeach
        </select>
        <button type="submit">Assign</button>
    </form>

    <div style="display:flex; gap:2rem; margin-top:2rem;">
        <section style="flex:1;">
            <h3>Labors</h3>
            <form method="post" action="{{ url('/api/projects/'.$project->id.'/labors') }}" enctype="multipart/form-data" onsubmit="return confirm('Create labor via API? Ensure you are authenticated.');">
                <input type="text" name="name" placeholder="Name" required>
                <input type="text" name="contact_number" placeholder="Contact">
                <input type="text" name="role" placeholder="Role">
                <button type="submit">Add</button>
            </form>
            <table>
                <thead><tr><th>Name</th><th>Contact</th><th>Role</th></tr></thead>
                <tbody>
                    @foreach($project->labors as $l)
                        <tr>
                            <td>{{ $l->name }}</td>
                            <td>{{ $l->contact_number }}</td>
                            <td>{{ $l->role }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </section>
        <section style="flex:1;">
            <h3>Messages</h3>
            <ul>
                @foreach($project->messages as $m)
                    <li>
                        <small>{{ $m->created_at->toDayDateTimeString() }} — {{ $m->user?->name }}</small>
                        <div>{{ $m->message }}</div>
                        @if($m->photo_path)
                            <a href="{{ asset('storage/'.$m->photo_path) }}" target="_blank">Photo</a>
                        @endif
                    </li>
                @endforeach
            </ul>
        </section>
    </div>

    <h3 style="margin-top:2rem;">Attendance History</h3>
    <p>Use Reports to filter and export attendance.</p>
@endsection

