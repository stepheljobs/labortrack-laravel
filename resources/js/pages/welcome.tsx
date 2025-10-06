import { dashboard, login } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="LaborTrack — Construction Labor Tracking">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700"
                    rel="stylesheet"
                />
            </Head>
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
                {/* Header */}
                <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/80">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <nav className="flex h-16 items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#FF4433] to-[#e23e2f]">
                                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <span className="text-xl font-bold text-slate-900 dark:text-white">LaborTrack</span>
                            </div>
                            <div className="flex items-center gap-3">
                                {auth.user ? (
                                    <Link
                                        href={dashboard()}
                                        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={login()}
                                            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                                        >
                                            Log in
                                        </Link>
                                        <a
                                            href="https://calendly.com/sgmaca/sprintsahead-discovery-call"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="rounded-lg bg-[#FF4433] px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-[#e23e2f] hover:shadow-md"
                                        >
                                            Schedule Demo
                                        </a>
                                    </>
                                )}
                            </div>
                        </nav>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="relative overflow-hidden px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
                    <div className="absolute inset-0 -z-10">
                        <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#FF4433]/5 blur-3xl" />
                        <div className="absolute right-0 top-1/2 h-[300px] w-[300px] rounded-full bg-blue-500/5 blur-3xl" />
                    </div>
                    
                    <div className="mx-auto max-w-7xl">
                        <div className="text-center">
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#FF4433]/10 px-4 py-2 text-sm font-medium text-[#FF4433] dark:bg-[#FF4433]/20">
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                Built for Construction Professionals
                            </div>
                            
                            <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
                                Cut labor costs, not corners.
                                <span className="mt-2 block bg-gradient-to-r from-[#FF4433] to-[#e23e2f] bg-clip-text text-transparent">
                                    Real-time jobsite tracking.
                                </span>
                            </h1>
                            
                            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                                LaborTrack shows you exactly who worked, where, and when—live. Automate timesheets, eliminate payroll leakage, and code hours to the right project and cost code without the paperwork.
                            </p>
                            
                            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                                {auth.user ? (
                                    <>
                                        <Link
                                            href={dashboard()}
                                            className="group relative overflow-hidden rounded-lg bg-[#FF4433] px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-[#e23e2f] hover:shadow-xl"
                                        >
                                            <span className="relative z-10">Go to Dashboard</span>
                                            <div className="absolute inset-0 -z-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                                        </Link>
                                        <a
                                            href="https://calendly.com/sgmaca/sprintsahead-discovery-call"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="rounded-lg border-2 border-slate-300 px-8 py-4 text-base font-semibold text-slate-900 transition-all hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:text-white dark:hover:border-slate-600 dark:hover:bg-slate-800"
                                        >
                                            Schedule Demo
                                        </a>
                                    </>
                                ) : (
                                    <>
                                        <a
                                            href="https://calendly.com/sgmaca/sprintsahead-discovery-call"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group relative overflow-hidden rounded-lg bg-[#FF4433] px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-[#e23e2f] hover:shadow-xl"
                                        >
                                            <span className="relative z-10 flex items-center gap-2">
                                                Schedule a Demo
                                                <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                                </svg>
                                            </span>
                                        </a>
                                        <Link
                                            href={login()}
                                            className="rounded-lg border-2 border-slate-300 px-8 py-4 text-base font-semibold text-slate-900 transition-all hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:text-white dark:hover:border-slate-600 dark:hover:bg-slate-800"
                                        >
                                            View Demo
                                        </Link>
                                    </>
                                )}
                            </div>

                            {/* Social Proof */}
                            <div className="mt-12 flex flex-col items-center gap-4">
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Trusted by construction companies managing millions in labor costs
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Showcase Section */}
                <section className="bg-white px-4 py-20 dark:bg-slate-950 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-16 text-center">
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
                                See LaborTrack in action
                            </h2>
                            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
                                Powerful features designed to simplify your construction operations
                            </p>
                        </div>

                        {/* Feature 1: Centralized Messages */}
                        <div className="mb-24 grid items-center gap-12 lg:grid-cols-2">
                            <div className="order-2 lg:order-1">
                                <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1.5 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    Communication Hub
                                </div>
                                <h3 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
                                    All project messages in one place
                                </h3>
                                <p className="mt-4 text-lg leading-relaxed text-slate-600 dark:text-slate-300">
                                    Stop jumping between channels and spreadsheets. Read all conversations from different projects in a single, centralized location. Stay on top of updates from supervisors, crews, and subcontractors without missing a beat.
                                </p>
                                <ul className="mt-6 space-y-3">
                                    <li className="flex items-start gap-3">
                                        <svg className="mt-1 h-5 w-5 flex-shrink-0 text-[#FF4433]" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-slate-700 dark:text-slate-300">View messages across all projects instantly</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <svg className="mt-1 h-5 w-5 flex-shrink-0 text-[#FF4433]" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-slate-700 dark:text-slate-300">Filter by project, supervisor, or time period</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <svg className="mt-1 h-5 w-5 flex-shrink-0 text-[#FF4433]" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-slate-700 dark:text-slate-300">Reply and track conversations in real-time</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="order-1 lg:order-2">
                                <div className="overflow-hidden rounded-2xl shadow-2xl ring-1 ring-slate-900/10 dark:ring-slate-100/10">
                                    <img
                                        src="/ss/read-messages-per-project.png"
                                        alt="Centralized project messages dashboard"
                                        className="h-auto w-full"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Feature 2: Clock In/Out Monitoring */}
                        <div className="mb-24 grid items-center gap-12 lg:grid-cols-2">
                            <div className="order-2">
                                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Time Tracking
                                </div>
                                <h3 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
                                    Monitor clock-ins and clock-outs per project
                                </h3>
                                <p className="mt-4 text-lg leading-relaxed text-slate-600 dark:text-slate-300">
                                    Get real-time visibility into who's working where and for how long. Perfect for accurate payroll estimation and job costing. Track every minute with GPS-verified locations and timestamps.
                                </p>
                                <ul className="mt-6 space-y-3">
                                    <li className="flex items-start gap-3">
                                        <svg className="mt-1 h-5 w-5 flex-shrink-0 text-[#FF4433]" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-slate-700 dark:text-slate-300">Real-time attendance tracking with GPS verification</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <svg className="mt-1 h-5 w-5 flex-shrink-0 text-[#FF4433]" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-slate-700 dark:text-slate-300">Filter by date range for payroll processing</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <svg className="mt-1 h-5 w-5 flex-shrink-0 text-[#FF4433]" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-slate-700 dark:text-slate-300">Export to CSV for seamless payroll integration</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="order-1">
                                <div className="overflow-hidden rounded-2xl shadow-2xl ring-1 ring-slate-900/10 dark:ring-slate-100/10">
                                    <img
                                        src="/ss/monitor-clockin-clockout-per-project.png"
                                        alt="Clock in and clock out monitoring dashboard"
                                        className="h-auto w-full"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Feature 3: Labor Management */}
                        <div className="grid items-center gap-12 lg:grid-cols-2">
                            <div className="order-2 lg:order-1">
                                <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1.5 text-sm font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    Labor Management
                                </div>
                                <h3 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
                                    Manage your entire workforce per project
                                </h3>
                                <p className="mt-4 text-lg leading-relaxed text-slate-600 dark:text-slate-300">
                                    Add and manage labor employees per project with designation and daily rates. Makes payroll monitoring a breeze and enables supervisors to easily tag workers during clock-in from the mobile app.
                                </p>
                                <ul className="mt-6 space-y-3">
                                    <li className="flex items-start gap-3">
                                        <svg className="mt-1 h-5 w-5 flex-shrink-0 text-[#FF4433]" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-slate-700 dark:text-slate-300">Track designations and daily rates for accurate costing</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <svg className="mt-1 h-5 w-5 flex-shrink-0 text-[#FF4433]" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-slate-700 dark:text-slate-300">Manage attendance, messages, and labor data in one place</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <svg className="mt-1 h-5 w-5 flex-shrink-0 text-[#FF4433]" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-slate-700 dark:text-slate-300">Quick search and edit capabilities for efficient management</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="order-1 lg:order-2">
                                <div className="overflow-hidden rounded-2xl shadow-2xl ring-1 ring-slate-900/10 dark:ring-slate-100/10">
                                    <img
                                        src="/ss/labors-attendance-messages-tab.png"
                                        alt="Labor management dashboard with tabs"
                                        className="h-auto w-full"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Benefits Section */}
                <section className="px-4 py-16 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-12 text-center">
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
                                Everything you need to manage labor
                            </h2>
                            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
                                Built specifically for construction operations
                            </p>
                        </div>

                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {/* Who */}
                            <div className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm transition-all hover:shadow-xl dark:bg-slate-900">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <h3 className="mb-3 text-xl font-bold text-slate-900 dark:text-white">Who It's For</h3>
                                <p className="leading-7 text-slate-600 dark:text-slate-300">
                                    Built for construction owners and operations leaders managing crews, subcontractors, and multiple job sites.
                                </p>
                            </div>

                            {/* What */}
                            <div className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm transition-all hover:shadow-xl dark:bg-slate-900">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                    </svg>
                                </div>
                                <h3 className="mb-3 text-xl font-bold text-slate-900 dark:text-white">What You Get</h3>
                                <p className="leading-7 text-slate-600 dark:text-slate-300">
                                    A simple web and mobile system to track attendance, hours, roles, daily rates, and assign labor to the right project and cost code.
                                </p>
                            </div>

                            {/* Why */}
                            <div className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm transition-all hover:shadow-xl dark:bg-slate-900">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                </div>
                                <h3 className="mb-3 text-xl font-bold text-slate-900 dark:text-white">Why It Matters</h3>
                                <p className="leading-7 text-slate-600 dark:text-slate-300">
                                    Reduce payroll leakage, speed up approvals, and get accurate job costing for every crew—no more paper timesheets or guesswork.
                                </p>
                            </div>

                            {/* When */}
                            <div className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm transition-all hover:shadow-xl dark:bg-slate-900">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <h3 className="mb-3 text-xl font-bold text-slate-900 dark:text-white">When You Start</h3>
                                <p className="leading-7 text-slate-600 dark:text-slate-300">
                                    Set up in minutes and go live this week. Real-time visibility from the first clock-in.
                                </p>
                            </div>

                            {/* Where */}
                            <div className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm transition-all hover:shadow-xl dark:bg-slate-900">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <h3 className="mb-3 text-xl font-bold text-slate-900 dark:text-white">Where It Works</h3>
                                <p className="leading-7 text-slate-600 dark:text-slate-300">
                                    Works across all your job sites. Crews clock in from the field; you manage everything from one dashboard.
                                </p>
                            </div>

                            {/* How */}
                            <div className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm transition-all hover:shadow-xl dark:bg-slate-900">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400">
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <h3 className="mb-3 text-xl font-bold text-slate-900 dark:text-white">How It Works</h3>
                                <p className="leading-7 text-slate-600 dark:text-slate-300">
                                    Invite your team, capture time with location context, auto-allocate to projects and codes, then approve and export to payroll.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Mobile App Section */}
                <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-800 px-4 py-20 dark:from-slate-950 dark:to-slate-900 sm:px-6 lg:px-8">
                    {/* Background decoration */}
                    <div className="absolute inset-0 -z-0">
                        <div className="absolute left-0 top-0 h-[400px] w-[400px] rounded-full bg-[#FF4433]/10 blur-3xl" />
                        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-blue-500/10 blur-3xl" />
                    </div>

                    <div className="relative z-10 mx-auto max-w-7xl">
                        <div className="mb-16 text-center">
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                Mobile App for Supervisors
                            </div>
                            <h2 className="text-3xl font-bold text-white sm:text-4xl">
                                Empower your supervisors in the field
                            </h2>
                            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
                                A powerful mobile app designed for supervisors to manage projects, track attendance, communicate with teams, and monitor workforce—all from the jobsite.
                            </p>
                        </div>

                        {/* Mobile Screenshots Grid */}
                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                            {/* Projects Screen */}
                            <div className="group">
                                <div className="relative mx-auto w-full max-w-[280px]">
                                    <div className="overflow-hidden rounded-[2.5rem] bg-slate-950 p-3 shadow-2xl ring-1 ring-white/10 transition-all duration-300 group-hover:scale-105 group-hover:shadow-[#FF4433]/20">
                                        <img
                                            src="/ss/projects-mobile.png"
                                            alt="Mobile projects view"
                                            className="h-auto w-full rounded-[1.75rem]"
                                        />
                                    </div>
                                </div>
                                <div className="mt-6 text-center">
                                    <h3 className="text-lg font-semibold text-white">Project Overview</h3>
                                    <p className="mt-2 text-sm text-slate-300">
                                        Quick access to all projects with instant logging and chat
                                    </p>
                                </div>
                            </div>

                            {/* Chat Screen */}
                            <div className="group">
                                <div className="relative mx-auto w-full max-w-[280px]">
                                    <div className="overflow-hidden rounded-[2.5rem] bg-slate-950 p-3 shadow-2xl ring-1 ring-white/10 transition-all duration-300 group-hover:scale-105 group-hover:shadow-[#FF4433]/20">
                                        <img
                                            src="/ss/project-chat-mobile.png"
                                            alt="Mobile project chat"
                                            className="h-auto w-full rounded-[1.75rem]"
                                        />
                                    </div>
                                </div>
                                <div className="mt-6 text-center">
                                    <h3 className="text-lg font-semibold text-white">Real-Time Chat</h3>
                                    <p className="mt-2 text-sm text-slate-300">
                                        Communicate updates and share photos directly from the field
                                    </p>
                                </div>
                            </div>

                            {/* People Management Screen */}
                            <div className="group">
                                <div className="relative mx-auto w-full max-w-[280px]">
                                    <div className="overflow-hidden rounded-[2.5rem] bg-slate-950 p-3 shadow-2xl ring-1 ring-white/10 transition-all duration-300 group-hover:scale-105 group-hover:shadow-[#FF4433]/20">
                                        <img
                                            src="/ss/people-management-mobile.png"
                                            alt="Mobile laborers management"
                                            className="h-auto w-full rounded-[1.75rem]"
                                        />
                                    </div>
                                </div>
                                <div className="mt-6 text-center">
                                    <h3 className="text-lg font-semibold text-white">Workforce Management</h3>
                                    <p className="mt-2 text-sm text-slate-300">
                                        Manage your crew with designations and contact details
                                    </p>
                                </div>
                            </div>

                            {/* Attendance Log Screen */}
                            <div className="group">
                                <div className="relative mx-auto w-full max-w-[280px]">
                                    <div className="overflow-hidden rounded-[2.5rem] bg-slate-950 p-3 shadow-2xl ring-1 ring-white/10 transition-all duration-300 group-hover:scale-105 group-hover:shadow-[#FF4433]/20">
                                        <img
                                            src="/ss/attendance-log-mobile.png"
                                            alt="Mobile attendance logging"
                                            className="h-auto w-full rounded-[1.75rem]"
                                        />
                                    </div>
                                </div>
                                <div className="mt-6 text-center">
                                    <h3 className="text-lg font-semibold text-white">GPS Attendance</h3>
                                    <p className="mt-2 text-sm text-slate-300">
                                        Log attendance with GPS verification and photo proof
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Features List */}
                        <div className="mt-16 grid gap-6 md:grid-cols-3">
                            <div className="rounded-2xl bg-white/5 p-6 backdrop-blur-sm">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#FF4433]">
                                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <h4 className="mb-2 text-lg font-semibold text-white">GPS-Verified Check-Ins</h4>
                                <p className="text-sm text-slate-300">
                                    Ensure workers are on-site with automatic GPS location verification for every clock-in and clock-out.
                                </p>
                            </div>

                            <div className="rounded-2xl bg-white/5 p-6 backdrop-blur-sm">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#FF4433]">
                                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <h4 className="mb-2 text-lg font-semibold text-white">Photo Documentation</h4>
                                <p className="text-sm text-slate-300">
                                    Capture and share site photos, progress updates, and attendance verification directly from mobile.
                                </p>
                            </div>

                            <div className="rounded-2xl bg-white/5 p-6 backdrop-blur-sm">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#FF4433]">
                                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <h4 className="mb-2 text-lg font-semibold text-white">Instant Updates</h4>
                                <p className="text-sm text-slate-300">
                                    Real-time sync ensures office staff see updates immediately when supervisors log attendance or send messages.
                                </p>
                            </div>
                        </div>

                        {/* Download CTA */}
                        <div className="mt-16 text-center">
                            <p className="text-lg text-white">
                                Coming soon to iOS and Android
                            </p>
                            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
                                <div className="flex items-center gap-3 rounded-xl bg-white/10 px-6 py-3 backdrop-blur-sm">
                                    <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                                    </svg>
                                    <div className="text-left">
                                        <div className="text-xs text-slate-300">Download on the</div>
                                        <div className="text-sm font-semibold text-white">App Store</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 rounded-xl bg-white/10 px-6 py-3 backdrop-blur-sm">
                                    <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M3 20.5v-17c0-.59.34-1.11.84-1.35L13.69 12l-9.85 9.85c-.5-.24-.84-.76-.84-1.35zm13.81-5.38L6.05 21.34l8.49-8.49 2.27 2.27zm3.35-4.31c.34.27.59.67.59 1.19 0 .52-.25.92-.59 1.19l-2.15 1.53-2.54-2.54 2.54-2.54 2.15 1.17zM6.05 2.66l10.76 6.22-2.27 2.27L6.05 2.66z"/>
                                    </svg>
                                    <div className="text-left">
                                        <div className="text-xs text-slate-300">Get it on</div>
                                        <div className="text-sm font-semibold text-white">Google Play</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="px-4 py-16 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FF4433] to-[#e23e2f] px-8 py-16 shadow-2xl sm:px-16">
                            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bTAtMjBjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bTIwIDBjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20" />
                            <div className="relative">
                                <div className="text-center">
                                    <h2 className="text-3xl font-bold text-white sm:text-4xl">
                                        Ready to see LaborTrack on your next project?
                                    </h2>
                                    <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">
                                        Join construction companies that are saving thousands every month with automated labor tracking and eliminating payroll errors.
                                    </p>
                                    <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                                        {auth.user ? (
                                            <Link
                                                href={dashboard()}
                                                className="rounded-lg bg-white px-8 py-4 text-base font-semibold text-[#FF4433] shadow-lg transition-all hover:bg-slate-50"
                                            >
                                                Open Dashboard
                                            </Link>
                                        ) : (
                                            <>
                                                <a
                                                    href="https://calendly.com/sgmaca/sprintsahead-discovery-call"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="rounded-lg bg-white px-8 py-4 text-base font-semibold text-[#FF4433] shadow-lg transition-all hover:bg-slate-50"
                                                >
                                                    Schedule Your Demo
                                                </a>
                                                <Link
                                                    href={login()}
                                                    className="rounded-lg border-2 border-white/30 px-8 py-4 text-base font-semibold text-white transition-all hover:border-white/50 hover:bg-white/10"
                                                >
                                                    View Demo
                                                </Link>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-slate-200 bg-white px-4 py-8 dark:border-slate-800 dark:bg-slate-950">
                    <div className="mx-auto max-w-7xl">
                        <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                            © 2025 LaborTrack. Built for construction professionals who demand precision.
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}
