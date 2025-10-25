@extends('layouts.app')

@section('title', 'LaborTrack - Construction Management Software')

@section('content')
<div class="relative bg-gray-50 overflow-hidden">
    <!-- Hero Section -->
    <div class="relative pb-32 pt-10 sm:pb-40 sm:pt-16 lg:pb-48 lg:pt-24">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div class="text-center">
                <h1 class="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                    Manage Your
                    <span class="block text-indigo-600">Construction Projects</span>
                </h1>
                <p class="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
                    Streamline your construction operations with LaborTrack. Track attendance, manage projects, 
                    handle payroll, and communicate with your team—all in one powerful platform.
                </p>
                <div class="mt-10 flex items-center justify-center gap-x-6">
                    <a href="{{ route('company.signup.create') }}"
                       class="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                        Start Free Trial
                    </a>
                    <a href="#features" class="text-sm font-semibold leading-6 text-gray-900">
                        Learn more <span aria-hidden="true">→</span>
                    </a>
                </div>
            </div>
            <div class="mt-16 flow-root sm:mt-24">
                <div class="-mt-8 -ml-4 flex flex-wrap justify-center gap-0.5 sm:-ml-6 lg:-ml-8">
                    <!-- Hero images placeholder -->
                    <div class="mt-8 ml-6 flex flex-shrink-0 justify-center lg:ml-8">
                        <div class="relative aspect-[9/10] w-[28.125rem] max-w-none rounded-xl bg-gray-200 shadow-2xl ring-1 ring-gray-400/10 sm:w-[57rem] md:-ml-4 lg:-ml-0">
                            <div class="absolute inset-0 flex items-center justify-center">
                                <svg class="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707H19a2 2 0 012 2z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Features Section -->
    <div id="features" class="py-24 sm:py-32">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div class="mx-auto max-w-2xl text-center">
                <h2 class="text-base font-semibold leading-7 text-indigo-600">Everything you need</h2>
                <p class="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                    Powerful features for modern construction management
                </p>
            </div>
            <div class="mx-auto mt-16 max-w-5xl sm:mt-20 lg:mt-24">
                <dl class="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                    <div class="flex flex-col">
                        <dt class="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                            <div class="h-10 w-10 flex items-center justify-center rounded-lg bg-indigo-600">
                                <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            Attendance Tracking
                        </dt>
                        <dd class="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                            <p class="flex-auto">Real-time attendance tracking with GPS verification and photo capture for accurate time management.</p>
                            <p class="mt-6">
                                <a href="#" class="text-sm font-semibold leading-6 text-indigo-600">Learn more <span aria-hidden="true">→</span></a>
                            </p>
                        </dd>
                    </div>
                    <div class="flex flex-col">
                        <dt class="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                            <div class="h-10 w-10 flex items-center justify-center rounded-lg bg-indigo-600">
                                <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            Project Management
                        </dt>
                        <dd class="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                            <p class="flex-auto">Organize projects, assign supervisors, and track progress from a centralized dashboard.</p>
                            <p class="mt-6">
                                <a href="#" class="text-sm font-semibold leading-6 text-indigo-600">Learn more <span aria-hidden="true">→</span></a>
                            </p>
                        </dd>
                    </div>
                    <div class="flex flex-col">
                        <dt class="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                            <div class="h-10 w-10 flex items-center justify-center rounded-lg bg-indigo-600">
                                <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3-.895-3-3z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2v6m0 4v6m0 4v2" />
                                </svg>
                            </div>
                            Payroll Processing
                        </dt>
                        <dd class="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                            <p class="flex-auto">Automated payroll calculations with attendance integration and detailed reporting.</p>
                            <p class="mt-6">
                                <a href="#" class="text-sm font-semibold leading-6 text-indigo-600">Learn more <span aria-hidden="true">→</span></a>
                            </p>
                        </dd>
                    </div>
                </dl>
            </div>
        </div>
    </div>

    <!-- Pricing Section -->
    <div class="py-24 sm:py-32">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div class="mx-auto max-w-2xl text-center">
                <h2 class="text-base font-semibold leading-7 text-indigo-600">Simple, transparent pricing</h2>
                <p class="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                    Choose the perfect plan for your business
                </p>
            </div>
            <div class="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
                <!-- Basic Plan -->
                <div class="flex flex-col rounded-3xl bg-white p-8 ring-1 ring-gray-200 xl:p-10">
                    <div>
                        <h3 class="text-lg font-semibold leading-8 text-gray-900">Basic</h3>
                        <p class="mt-4 text-sm leading-6 text-gray-600">Perfect for small teams getting started.</p>
                        <p class="mt-6 flex items-baseline gap-x-1">
                            <span class="text-4xl font-bold tracking-tight text-gray-900">$100</span>
                            <span class="text-sm font-semibold leading-6 text-gray-600">/month</span>
                        </p>
                    </div>
                    <ul role="list" class="mt-8 space-y-3 text-sm leading-6 text-gray-600">
                        <li class="flex gap-x-3">
                            <svg class="h-6 w-5 flex-none text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
                            </svg>
                            Up to 10 users
                        </li>
                        <li class="flex gap-x-3">
                            <svg class="h-6 w-5 flex-none text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
                            </svg>
                            Core features
                        </li>
                        <li class="flex gap-x-3">
                            <svg class="h-6 w-5 flex-none text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
                            </svg>
                            Email support
                        </li>
                    </ul>
                    <a href="{{ route('company.signup.create') }}" 
                       class="mt-8 block rounded-md bg-indigo-600 px-3.5 py-2.5 text-center text-sm font-semibold leading-6 text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                        Get started
                    </a>
                </div>

                <!-- Pro Plan -->
                <div class="flex flex-col rounded-3xl bg-white p-8 ring-2 ring-indigo-600 xl:p-10">
                    <div>
                        <h3 class="text-lg font-semibold leading-8 text-gray-900">Pro</h3>
                        <p class="mt-4 text-sm leading-6 text-gray-600">Best for growing construction companies.</p>
                        <p class="mt-6 flex items-baseline gap-x-1">
                            <span class="text-4xl font-bold tracking-tight text-gray-900">$250</span>
                            <span class="text-sm font-semibold leading-6 text-gray-600">/month</span>
                        </p>
                    </div>
                    <ul role="list" class="mt-8 space-y-3 text-sm leading-6 text-gray-600">
                        <li class="flex gap-x-3">
                            <svg class="h-6 w-5 flex-none text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
                            </svg>
                            Up to 30 users
                        </li>
                        <li class="flex gap-x-3">
                            <svg class="h-6 w-5 flex-none text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
                            </svg>
                            All Basic features
                        </li>
                        <li class="flex gap-x-3">
                            <svg class="h-6 w-5 flex-none text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
                            </svg>
                            Priority support
                        </li>
                        <li class="flex gap-x-3">
                            <svg class="h-6 w-5 flex-none text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
                            </svg>
                            Advanced reporting
                        </li>
                    </ul>
                    <a href="{{ route('company.signup.create') }}" 
                       class="mt-8 block rounded-md bg-indigo-600 px-3.5 py-2.5 text-center text-sm font-semibold leading-6 text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                        Get started
                    </a>
                </div>

                <!-- Enterprise Plan -->
                <div class="flex flex-col rounded-3xl bg-white p-8 ring-1 ring-gray-200 xl:p-10">
                    <div>
                        <h3 class="text-lg font-semibold leading-8 text-gray-900">Enterprise</h3>
                        <p class="mt-4 text-sm leading-6 text-gray-600">For large organizations with custom needs.</p>
                        <p class="mt-6 flex items-baseline gap-x-1">
                            <span class="text-4xl font-bold tracking-tight text-gray-900">Custom</span>
                        </p>
                    </div>
                    <ul role="list" class="mt-8 space-y-3 text-sm leading-6 text-gray-600">
                        <li class="flex gap-x-3">
                            <svg class="h-6 w-5 flex-none text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
                            </svg>
                            Unlimited users
                        </li>
                        <li class="flex gap-x-3">
                            <svg class="h-6 w-5 flex-none text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
                            </svg>
                            All Pro features
                        </li>
                        <li class="flex gap-x-3">
                            <svg class="h-6 w-5 flex-none text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
                            </svg>
                            Custom integrations
                        </li>
                        <li class="flex gap-x-3">
                            <svg class="h-6 w-5 flex-none text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
                            </svg>
                            Dedicated support
                        </li>
                    </ul>
                    <a href="#" class="mt-8 block rounded-md bg-indigo-600 px-3.5 py-2.5 text-center text-sm font-semibold leading-6 text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                        Contact sales
                    </a>
                </div>
            </div>
        </div>
    </div>

    <!-- CTA Section -->
    <div class="bg-indigo-600">
        <div class="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
            <div class="mx-auto max-w-2xl text-center">
                <h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    Ready to transform your construction management?
                </h2>
                <p class="mx-auto mt-6 max-w-xl text-lg leading-8 text-indigo-200">
                    Start your 14-day free trial today. No credit card required.
                </p>
                <div class="mt-10 flex items-center justify-center gap-x-6">
                    <a href="{{ route('company.signup.create') }}"
                       class="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                        Start Free Trial
                    </a>
                    <a href="#features" class="text-sm font-semibold leading-6 text-white">
                        View features <span aria-hidden="true">→</span>
                    </a>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection