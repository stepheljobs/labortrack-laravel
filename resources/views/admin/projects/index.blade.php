@extends('admin.layout')

@section('content')
    <div class="flex items-center justify-between mb-6">
        <h2 class="text-lg font-medium">Projects</h2>
    </div>

    <form method="post" action="{{ route('projects.store') }}" class="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
        @csrf
        <input class="border rounded-md px-3 py-2" type="text" name="name" placeholder="Project name" required>
        <input class="border rounded-md px-3 py-2" type="text" name="location_address" placeholder="Location (optional)">
        <input class="border rounded-md px-3 py-2" type="number" step="0.01" name="geofence_radius" placeholder="Geofence radius (m)">
        <button class="rounded-md bg-primary text-primary-foreground px-4 py-2" type="submit">Create</button>
        @error('name') <small class="text-red-600">{{ $message }}</small> @enderror
    </form>

    <div class="overflow-hidden rounded-lg border">
        <table class="w-full text-sm">
            <thead class="bg-secondary/60">
                <tr>
                    <th class="text-left px-3 py-2">Name</th>
                    <th class="text-left px-3 py-2">Location</th>
                    <th class="text-left px-3 py-2">Created</th>
                    <th class="text-left px-3 py-2"></th>
                </tr>
            </thead>
            <tbody>
                @foreach($projects as $p)
                    <tr class="border-t">
                        <td class="px-3 py-2">{{ $p->name }}</td>
                        <td class="px-3 py-2">{{ $p->location_address }}</td>
                        <td class="px-3 py-2">{{ $p->created_at->toDateString() }}</td>
                        <td class="px-3 py-2"><a class="text-blue-600 hover:underline" href="{{ route('projects.show', $p) }}">View</a></td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    <div class="mt-4">{{ $projects->links() }}</div>
@endsection
