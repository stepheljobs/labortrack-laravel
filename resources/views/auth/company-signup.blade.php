@extends('layouts.app')

@section('title', 'Sign Up Your Company')

@section('content')
<div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
        <div>
            <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Start Your Free Trial
            </h2>
            <p class="mt-2 text-center text-sm text-gray-600">
                Get started with LaborTrack in minutes. No credit card required.
            </p>
        </div>

        @if ($errors->any())
            <div class="rounded-md bg-red-50 p-4">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                        </svg>
                    </div>
                    <div class="ml-3">
                        <h3 class="text-sm font-medium text-red-800">
                            There were {{ count($errors) }} error(s) with your submission:
                        </h3>
                        <div class="mt-2 text-sm text-red-700">
                            <ul class="list-disc list-inside space-y-1">
                                @foreach ($errors->all() as $error)
                                    <li>{{ $error }}</li>
                                @endforeach
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        @endif

        @if (session('error'))
            <div class="rounded-md bg-red-50 p-4 mb-4">
                <div class="text-sm text-red-700">{{ session('error') }}</div>
            </div>
        @endif

        @if (session('success'))
            <div class="rounded-md bg-green-50 p-4 mb-4">
                <div class="text-sm text-green-700">{{ session('success') }}</div>
            </div>
        @endif

        <form class="mt-8 space-y-6" action="{{ route('company.signup.store') }}" method="POST">
            @csrf
            
            <!-- Company Information -->
            <div class="space-y-4">
                <h3 class="text-lg font-medium text-gray-900">Company Information</h3>
                
                <div>
                    <label for="company_name" class="block text-sm font-medium text-gray-700">Company Name</label>
                    <div class="mt-1">
                        <input id="company_name" name="company_name" type="text" required
                               class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                               value="{{ old('company_name') }}">
                    </div>
                    @error('company_name')
                        <p class="mt-2 text-sm text-red-600">{{ $message }}</p>
                    @enderror
                </div>

                <div>
                    <label for="subdomain" class="block text-sm font-medium text-gray-700">Subdomain</label>
                    <div class="mt-1 relative rounded-md shadow-sm">
                        <input id="subdomain" name="subdomain" type="text" required
                               class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                               value="{{ old('subdomain') }}">
                        <div class="absolute inset-y-0 right-0 flex items-center">
                            <span class="text-gray-500 sm:text-sm">.labortrack.com</span>
                        </div>
                    </div>
                    @error('subdomain')
                        <p class="mt-2 text-sm text-red-600">{{ $message }}</p>
                    @enderror
                    <p class="mt-1 text-xs text-gray-500">Choose a unique subdomain for your company.</p>
                </div>

                <div>
                    <label for="email" class="block text-sm font-medium text-gray-700">Company Email</label>
                    <div class="mt-1">
                        <input id="email" name="email" type="email" required
                               class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                               value="{{ old('email') }}">
                    </div>
                    @error('email')
                        <p class="mt-2 text-sm text-red-600">{{ $message }}</p>
                    @enderror
                </div>

                <div>
                    <label for="admin_name" class="block text-sm font-medium text-gray-700">Your Name</label>
                    <div class="mt-1">
                        <input id="admin_name" name="admin_name" type="text" required
                               class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                               value="{{ old('admin_name') }}">
                    </div>
                    @error('admin_name')
                        <p class="mt-2 text-sm text-red-600">{{ $message }}</p>
                    @enderror
                </div>

                <div>
                    <label for="admin_email" class="block text-sm font-medium text-gray-700">Your Email</label>
                    <div class="mt-1">
                        <input id="admin_email" name="admin_email" type="email" required
                               class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                               value="{{ old('admin_email') }}">
                    </div>
                    @error('admin_email')
                        <p class="mt-2 text-sm text-red-600">{{ $message }}</p>
                    @enderror
                </div>

                <div>
                    <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
                    <div class="mt-1">
                        <input id="password" name="password" type="password" required
                               class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm">
                    </div>
                    @error('password')
                        <p class="mt-2 text-sm text-red-600">{{ $message }}</p>
                    @enderror
                </div>

                <div>
                    <label for="password_confirmation" class="block text-sm font-medium text-gray-700">Confirm Password</label>
                    <div class="mt-1">
                        <input id="password_confirmation" name="password_confirmation" type="password" required
                               class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm">
                    </div>
                    @error('password_confirmation')
                        <p class="mt-2 text-sm text-red-600">{{ $message }}</p>
                    @enderror
                </div>
            </div>

            <div class="flex items-center justify-between">
                <div class="text-sm">
                    <a href="{{ route('login') }}" class="font-medium text-indigo-600 hover:text-indigo-500">
                        Already have an account? Sign in
                    </a>
                </div>

                <button type="submit"
                        class="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                    Create Your Company
                </button>
            </div>
        </form>
    </div>
</div>
@endsection