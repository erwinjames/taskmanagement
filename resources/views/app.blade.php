<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    {{-- Inline script to detect system dark mode preference and apply it immediately --}}
    <script>
        (function () {
            // Get appearance from localStorage first (client-side preference), then fall back to cookie
            const storedAppearance = localStorage.getItem('appearance');
            const cookieAppearance = '{{ $appearance ?? "system" }}';
            const appearance = storedAppearance || cookieAppearance;
            
            function applyTheme() {
                const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                
                if (appearance === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.style.colorScheme = 'dark';
                } else if (appearance === 'light') {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.style.colorScheme = 'light';
                } else if (appearance === 'system') {
                    // For system mode, check the actual OS preference
                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                        document.documentElement.style.colorScheme = 'dark';
                    } else {
                        document.documentElement.classList.remove('dark');
                        document.documentElement.style.colorScheme = 'light';
                    }
                }
            }
            
            // Apply theme immediately
            applyTheme();
            
            // Listen for system theme changes if using system preference
            if (appearance === 'system' && window.matchMedia) {
                window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);
            }
        })();
    </script>

    {{-- Inline style to set the HTML background color based on our theme in app.css --}}
    <style>
        html {
            background-color: oklch(1 0 0);
        }

        html.dark {
            background-color: oklch(0.145 0 0);
        }
    </style>

    <title inertia>{{ config('app.name', 'Laravel') }}</title>

    <link rel="icon" href="/favicon.ico" sizes="any">
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">

    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

    @viteReactRefresh
    @routes
    @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
    @inertiaHead
</head>

<body class="font-sans antialiased">
    @inertia
</body>

</html>