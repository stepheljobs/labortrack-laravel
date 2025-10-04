@extends('admin.layout')

@section('content')
    <h2>Projects</h2>
    <form method="post" action="{{ route('admin.projects.store') }}" style="margin:1rem 0;">
        @csrf
        <input type="text" name="name" placeholder="Project name" required>
        <input type="text" name="location_address" placeholder="Location (optional)">
        <input type="number" step="0.01" name="geofence_radius" placeholder="Geofence radius (m)">
        <button type="submit">Create</button>
        @error('name') <small style="color:red;">{{ $message }}</small> @enderror
    </form>

    <table>
        <thead>
            <tr>
                <th>Name</th>
                <th>Location</th>
                <th>Created</th>
                <th></th>
            </tr>
        </thead>
        <tbody>
        @foreach($projects as $p)
            <tr>
                <td>{{ $p->name }}</td>
                <td>{{ $p->location_address }}</td>
                <td>{{ $p->created_at->toDateString() }}</td>
                <td><a href="{{ route('admin.projects.show', $p) }}">View</a></td>
            </tr>
        @endforeach
        </tbody>
    </table>
    {{ $projects->links() }}
@endsection

