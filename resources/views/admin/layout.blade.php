<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ config('app.name') }} Admin</title>
    @vite(['resources/css/app.css'])
    <style>
        body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji'; margin: 0; padding: 0; }
        header, main { max-width: 1200px; margin: 0 auto; padding: 1rem; }
        nav a { margin-right: 1rem; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 0.5rem; border-bottom: 1px solid #e5e7eb; text-align: left; }
        .status { color: green; }
    </style>
    @stack('head')
    @yield('head')
</head>
<body>
    <header>
        <h1>{{ config('app.name') }} Admin</h1>
        <nav>
            <a href="{{ route('admin.dashboard') }}">Dashboard</a>
            <a href="{{ route('admin.projects.index') }}">Projects</a>
            <a href="{{ route('admin.reports.index') }}">Reports</a>
        </nav>
        @if (session('status'))
            <p class="status">{{ session('status') }}</p>
        @endif
    </header>
    <main>
        @yield('content')
    </main>
</body>
</html>

