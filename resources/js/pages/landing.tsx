import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Building2,
    CheckCircle,
    CreditCard,
    Users,
} from 'lucide-react';

export default function Landing() {
    return (
        <AppLayout>
            <Head title="LaborTrack - Construction Management Software" />

            <div className="relative overflow-hidden bg-gray-50">
                {/* Hero Section */}
                <div className="relative pt-10 pb-32 sm:pt-16 sm:pb-40 lg:pt-24 lg:pb-48">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                                Manage Your
                                <span className="block text-indigo-600">
                                    Construction Projects
                                </span>
                            </h1>
                            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
                                Streamline your construction operations with
                                LaborTrack. Track attendance, manage projects,
                                handle payroll, and communicate with your
                                team—all in one powerful platform.
                            </p>
                            <div className="mt-10 flex items-center justify-center gap-x-6">
                                <Link href={'/signup'}>
                                    <Button size="lg">
                                        Start Free Trial
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                                <a
                                    href="#features"
                                    className="text-sm leading-6 font-semibold text-gray-900"
                                >
                                    Learn more <span aria-hidden="true">→</span>
                                </a>
                            </div>
                        </div>
                        <div className="mt-16 flow-root sm:mt-24">
                            <div className="-mt-8 -ml-4 flex flex-wrap justify-center gap-0.5 sm:-ml-6 lg:-ml-8">
                                {/* Hero image placeholder */}
                                <div className="mt-8 ml-6 flex flex-shrink-0 justify-center lg:ml-8">
                                    <div className="relative aspect-[9/10] w-[28.125rem] max-w-none rounded-xl bg-gray-200 shadow-2xl ring-1 ring-gray-400/10 sm:w-[57rem] md:-ml-4 lg:-ml-0">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Building2 className="h-12 w-12 text-gray-400" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div id="features" className="py-24 sm:py-32">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <h2 className="text-base leading-7 font-semibold text-indigo-600">
                                Everything you need
                            </h2>
                            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                                Powerful features for modern construction
                                management
                            </p>
                        </div>
                        <div className="mx-auto mt-16 max-w-5xl sm:mt-20 lg:mt-24">
                            <div className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                                {/* Attendance Tracking */}
                                <div className="flex flex-col">
                                    <dt className="flex items-center gap-x-3 text-base leading-7 font-semibold text-gray-900">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                                            <CheckCircle className="h-6 w-6 text-white" />
                                        </div>
                                        Attendance Tracking
                                    </dt>
                                    <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                                        <p className="flex-auto">
                                            Real-time attendance tracking with
                                            GPS verification and photo capture
                                            for accurate time management.
                                        </p>
                                        <p className="mt-6">
                                            <a
                                                href="#"
                                                className="text-sm leading-6 font-semibold text-indigo-600"
                                            >
                                                Learn more{' '}
                                                <span aria-hidden="true">
                                                    →
                                                </span>
                                            </a>
                                        </p>
                                    </dd>
                                </div>

                                {/* Project Management */}
                                <div className="flex flex-col">
                                    <dt className="flex items-center gap-x-3 text-base leading-7 font-semibold text-gray-900">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                                            <Building2 className="h-6 w-6 text-white" />
                                        </div>
                                        Project Management
                                    </dt>
                                    <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                                        <p className="flex-auto">
                                            Organize projects, assign
                                            supervisors, and track progress from
                                            a centralized dashboard.
                                        </p>
                                        <p className="mt-6">
                                            <a
                                                href="#"
                                                className="text-sm leading-6 font-semibold text-indigo-600"
                                            >
                                                Learn more{' '}
                                                <span aria-hidden="true">
                                                    →
                                                </span>
                                            </a>
                                        </p>
                                    </dd>
                                </div>

                                {/* Payroll Processing */}
                                <div className="flex flex-col">
                                    <dt className="flex items-center gap-x-3 text-base leading-7 font-semibold text-gray-900">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                                            <CreditCard className="h-6 w-6 text-white" />
                                        </div>
                                        Payroll Processing
                                    </dt>
                                    <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                                        <p className="flex-auto">
                                            Automated payroll calculations with
                                            attendance integration and detailed
                                            reporting.
                                        </p>
                                        <p className="mt-6">
                                            <a
                                                href="#"
                                                className="text-sm leading-6 font-semibold text-indigo-600"
                                            >
                                                Learn more{' '}
                                                <span aria-hidden="true">
                                                    →
                                                </span>
                                            </a>
                                        </p>
                                    </dd>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pricing Section */}
                <div className="py-24 sm:py-32">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <h2 className="text-base leading-7 font-semibold text-indigo-600">
                                Simple, transparent pricing
                            </h2>
                            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                                Choose the perfect plan for your business
                            </p>
                        </div>
                        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
                            {/* Basic Plan */}
                            <div className="flex flex-col rounded-3xl bg-white p-8 ring-1 ring-gray-200 xl:p-10">
                                <div>
                                    <h3 className="text-lg leading-8 font-semibold text-gray-900">
                                        Basic
                                    </h3>
                                    <p className="mt-4 text-sm leading-6 text-gray-600">
                                        Perfect for small teams getting started.
                                    </p>
                                    <p className="mt-6 flex items-baseline gap-x-1">
                                        <span className="text-4xl font-bold tracking-tight text-gray-900">
                                            $100
                                        </span>
                                        <span className="text-sm leading-6 font-semibold text-gray-600">
                                            /month
                                        </span>
                                    </p>
                                </div>
                                <ul
                                    role="list"
                                    className="mt-8 space-y-3 text-sm leading-6 text-gray-600"
                                >
                                    <li className="flex gap-x-3">
                                        <Users className="h-6 w-5 flex-none text-indigo-600" />
                                        Up to 10 users
                                    </li>
                                    <li className="flex gap-x-3">
                                        <CheckCircle className="h-6 w-5 flex-none text-indigo-600" />
                                        Core features
                                    </li>
                                    <li className="flex gap-x-3">
                                        <CheckCircle className="h-6 w-5 flex-none text-indigo-600" />
                                        Email support
                                    </li>
                                </ul>
                                <Link href={'/signup'}>
                                    <Button className="mt-8 w-full">
                                        Get started
                                    </Button>
                                </Link>
                            </div>

                            {/* Pro Plan */}
                            <div className="flex flex-col rounded-3xl bg-white p-8 ring-2 ring-indigo-600 xl:p-10">
                                <div>
                                    <h3 className="text-lg leading-8 font-semibold text-gray-900">
                                        Pro
                                    </h3>
                                    <p className="mt-4 text-sm leading-6 text-gray-600">
                                        Best for growing construction companies.
                                    </p>
                                    <p className="mt-6 flex items-baseline gap-x-1">
                                        <span className="text-4xl font-bold tracking-tight text-gray-900">
                                            $250
                                        </span>
                                        <span className="text-sm leading-6 font-semibold text-gray-600">
                                            /month
                                        </span>
                                    </p>
                                </div>
                                <ul
                                    role="list"
                                    className="mt-8 space-y-3 text-sm leading-6 text-gray-600"
                                >
                                    <li className="flex gap-x-3">
                                        <Users className="h-6 w-5 flex-none text-indigo-600" />
                                        Up to 30 users
                                    </li>
                                    <li className="flex gap-x-3">
                                        <CheckCircle className="h-6 w-5 flex-none text-indigo-600" />
                                        All Basic features
                                    </li>
                                    <li className="flex gap-x-3">
                                        <CheckCircle className="h-6 w-5 flex-none text-indigo-600" />
                                        Priority support
                                    </li>
                                    <li className="flex gap-x-3">
                                        <CheckCircle className="h-6 w-5 flex-none text-indigo-600" />
                                        Advanced reporting
                                    </li>
                                </ul>
                                <Link href={'/signup'}>
                                    <Button className="mt-8 w-full">
                                        Get started
                                    </Button>
                                </Link>
                            </div>

                            {/* Enterprise Plan */}
                            <div className="flex flex-col rounded-3xl bg-white p-8 ring-1 ring-gray-200 xl:p-10">
                                <div>
                                    <h3 className="text-lg leading-8 font-semibold text-gray-900">
                                        Enterprise
                                    </h3>
                                    <p className="mt-4 text-sm leading-6 text-gray-600">
                                        For large organizations with custom
                                        needs.
                                    </p>
                                    <p className="mt-6 flex items-baseline gap-x-1">
                                        <span className="text-4xl font-bold tracking-tight text-gray-900">
                                            Custom
                                        </span>
                                    </p>
                                </div>
                                <ul
                                    role="list"
                                    className="mt-8 space-y-3 text-sm leading-6 text-gray-600"
                                >
                                    <li className="flex gap-x-3">
                                        <Users className="h-6 w-5 flex-none text-indigo-600" />
                                        Unlimited users
                                    </li>
                                    <li className="flex gap-x-3">
                                        <CheckCircle className="h-6 w-5 flex-none text-indigo-600" />
                                        All Pro features
                                    </li>
                                    <li className="flex gap-x-3">
                                        <CheckCircle className="h-6 w-5 flex-none text-indigo-600" />
                                        Custom integrations
                                    </li>
                                    <li className="flex gap-x-3">
                                        <CheckCircle className="h-6 w-5 flex-none text-indigo-600" />
                                        Dedicated support
                                    </li>
                                </ul>
                                <a
                                    href="#"
                                    className="mt-8 block rounded-md bg-indigo-600 px-3.5 py-2.5 text-center text-sm leading-6 font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                >
                                    Contact sales
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="bg-indigo-600">
                    <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                                Ready to transform your construction management?
                            </h2>
                            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-indigo-200">
                                Start your 14-day free trial today. No credit
                                card required.
                            </p>
                            <div className="mt-10 flex items-center justify-center gap-x-6">
                                <Link href={'/signup'}>
                                    <Button
                                        variant="secondary"
                                        size="lg"
                                        className="bg-white text-indigo-600 hover:bg-indigo-50"
                                    >
                                        Start Free Trial
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                                <a
                                    href="#features"
                                    className="text-sm leading-6 font-semibold text-white"
                                >
                                    View features{' '}
                                    <span aria-hidden="true">→</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
