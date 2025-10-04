<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';
                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        <style>
            html { background-color: oklch(1 0 0); }
            html.dark { background-color: oklch(0.145 0 0); }
        </style>

        <title>{{ config('app.name', 'Laravel') }} — Admin</title>

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

        @vite(['resources/css/app.css'])
        @stack('head')
        @yield('head')
    </head>
    <body class="font-sans antialiased bg-background text-foreground">
        <header class="max-w-6xl mx-auto px-4 py-6">
            <div class="flex items-center justify-between">
                <h1 class="text-xl font-semibold">{{ config('app.name') }} <span class="text-muted-foreground">Admin</span></h1>
                <nav class="space-x-4 text-sm">
                    <a class="hover:underline" href="{{ route('admin.dashboard') }}">Dashboard</a>
                    <a class="hover:underline" href="{{ route('projects.index') }}">Projects</a>
                    <a class="hover:underline" href="{{ route('reports.index') }}">Reports</a>
                </nav>
            </div>
            @if (session('status'))
                <div class="mt-4 rounded-md bg-green-50 dark:bg-green-950/50 text-green-800 dark:text-green-200 px-4 py-2 text-sm">
                    {{ session('status') }}
                </div>
            @endif
        </header>
        <main class="max-w-6xl mx-auto px-4 pb-12">
            @yield('content')
        </main>
    </body>
</html>
