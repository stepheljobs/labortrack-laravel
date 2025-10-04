@extends('admin.layout')

@section('content')
    <div class="flex items-start justify-between">
        <div>
            <h2 class="text-lg font-semibold">{{ $project->name }}</h2>
            <p class="text-sm text-muted-foreground mt-1">{{ $project->description }}</p>
            <p class="text-sm mt-2"><span class="font-medium">Location:</span> {{ $project->location_address }}</p>
        </div>
    </div>

    <div class="mt-6">
        <h3 class="font-medium mb-2">Assign Supervisor</h3>
        <form class="flex gap-2" method="post" action="{{ route('admin.projects.attachSupervisor', $project) }}">
            @csrf
            <select class="border rounded-md px-3 py-2" name="user_id" required>
                @foreach ($supervisors as $s)
                    <option value="{{ $s->id }}">{{ $s->name }} ({{ $s->email }})</option>
                @endforeach
            </select>
            <button class="rounded-md bg-primary text-primary-foreground px-4 py-2" type="submit">Assign</button>
        </form>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <section class="space-y-3">
            <div class="flex items-center justify-between">
                <h3 class="font-medium">Labors</h3>
            </div>
            <form class="grid grid-cols-1 md:grid-cols-4 gap-2" method="post" action="{{ url('/api/projects/'.$project->id.'/labors') }}" onsubmit="return confirm('Create labor via API? Ensure you are authenticated.');">
                <input class="border rounded-md px-3 py-2" type="text" name="name" placeholder="Name" required>
                <input class="border rounded-md px-3 py-2" type="text" name="contact_number" placeholder="Contact">
                <input class="border rounded-md px-3 py-2" type="text" name="role" placeholder="Role">
                <button class="rounded-md bg-primary text-primary-foreground px-4 py-2" type="submit">Add</button>
            </form>
            <div class="overflow-hidden rounded-lg border">
                <table class="w-full text-sm">
                    <thead class="bg-secondary/60">
                        <tr><th class="text-left px-3 py-2">Name</th><th class="text-left px-3 py-2">Contact</th><th class="text-left px-3 py-2">Role</th></tr>
                    </thead>
                    <tbody>
                        @foreach($project->labors as $l)
                            <tr class="border-t">
                                <td class="px-3 py-2">{{ $l->name }}</td>
                                <td class="px-3 py-2">{{ $l->contact_number }}</td>
                                <td class="px-3 py-2">{{ $l->role }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </section>
        <section class="space-y-3">
            <h3 class="font-medium">Messages</h3>
            <div class="rounded-lg border divide-y">
                @forelse($project->messages as $m)
                    <div class="p-3 space-y-1">
                        <div class="text-xs text-muted-foreground">{{ $m->created_at->toDayDateTimeString() }} — {{ $m->user?->name }}</div>
                        <div class="text-sm">{{ $m->message }}</div>
                        @if($m->photo_path)
                            <a class="text-blue-600 text-sm hover:underline" href="{{ asset('storage/'.$m->photo_path) }}" target="_blank">Photo</a>
                        @endif
                    </div>
                @empty
                    <div class="p-3 text-sm text-muted-foreground">No messages yet.</div>
                @endforelse
            </div>
        </section>
    </div>

    <div class="mt-8">
        <h3 class="font-medium">Attendance History</h3>
        <p class="text-sm text-muted-foreground">Use Reports to filter and export attendance.</p>
    </div>
@endsection
