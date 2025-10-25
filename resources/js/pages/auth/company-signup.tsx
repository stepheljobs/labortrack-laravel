import AuthLayout from '@/layouts/auth-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import * as React from 'react';

export default function CompanySignup() {
    const { data, setData, post, processing, errors, reset } = useForm({
        company_name: '',
        subdomain: '',
        email: '',
        phone: '',
        address: '',
        admin_name: '',
        admin_email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/signup', {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout
            title="Sign Up Your Company"
            description="Get started with LaborTrack in minutes. No credit card required."
        >
            <Head title="Sign Up Your Company" />

            <div className="mx-auto max-w-md">
                {Object.keys(errors).length > 0 && (
                    <div className="mb-4 rounded-md bg-red-50 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg
                                    className="h-5 w-5 text-red-400"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">
                                    There were {Object.keys(errors).length}{' '}
                                    error(s) with your submission:
                                </h3>
                                <div className="mt-2 text-sm text-red-700">
                                    <ul className="list-inside list-disc space-y-1">
                                        {Object.entries(errors).map(
                                            ([field, message]) => (
                                                <li key={field}>{message}</li>
                                            ),
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={submit} className="mt-8 space-y-6">
                    {/* Company Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            Company Information
                        </h3>

                        <div>
                            <label
                                htmlFor="company_name"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Company Name
                            </label>
                            <div className="mt-1">
                                <input
                                    id="company_name"
                                    name="company_name"
                                    type="text"
                                    required
                                    value={data.company_name}
                                    onChange={(e) =>
                                        setData('company_name', e.target.value)
                                    }
                                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                                />
                            </div>
                            {errors.company_name && (
                                <p className="mt-2 text-sm text-red-600">
                                    {errors.company_name}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="subdomain"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Subdomain
                            </label>
                            <div className="relative mt-1 rounded-md shadow-sm">
                                <input
                                    id="subdomain"
                                    name="subdomain"
                                    type="text"
                                    required
                                    value={data.subdomain}
                                    onChange={(e) =>
                                        setData('subdomain', e.target.value)
                                    }
                                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center">
                                    <span className="text-gray-500 sm:text-sm dark:text-gray-400">
                                        .labortrack.com
                                    </span>
                                </div>
                            </div>
                            {errors.subdomain && (
                                <p className="mt-2 text-sm text-red-600">
                                    {errors.subdomain}
                                </p>
                            )}
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Choose a unique subdomain for your company.
                            </p>
                        </div>

                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Company Email
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-2 text-sm text-red-600">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="phone"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Phone (Optional)
                            </label>
                            <div className="mt-1">
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    value={data.phone}
                                    onChange={(e) =>
                                        setData('phone', e.target.value)
                                    }
                                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                                />
                            </div>
                            {errors.phone && (
                                <p className="mt-2 text-sm text-red-600">
                                    {errors.phone}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="address"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Address (Optional)
                            </label>
                            <div className="mt-1">
                                <textarea
                                    id="address"
                                    name="address"
                                    rows={3}
                                    value={data.address}
                                    onChange={(e) =>
                                        setData('address', e.target.value)
                                    }
                                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                                />
                            </div>
                            {errors.address && (
                                <p className="mt-2 text-sm text-red-600">
                                    {errors.address}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Admin Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            Admin Information
                        </h3>

                        <div>
                            <label
                                htmlFor="admin_name"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Your Name
                            </label>
                            <div className="mt-1">
                                <input
                                    id="admin_name"
                                    name="admin_name"
                                    type="text"
                                    required
                                    value={data.admin_name}
                                    onChange={(e) =>
                                        setData('admin_name', e.target.value)
                                    }
                                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                                />
                            </div>
                            {errors.admin_name && (
                                <p className="mt-2 text-sm text-red-600">
                                    {errors.admin_name}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="admin_email"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Your Email
                            </label>
                            <div className="mt-1">
                                <input
                                    id="admin_email"
                                    name="admin_email"
                                    type="email"
                                    required
                                    value={data.admin_email}
                                    onChange={(e) =>
                                        setData('admin_email', e.target.value)
                                    }
                                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                                />
                            </div>
                            {errors.admin_email && (
                                <p className="mt-2 text-sm text-red-600">
                                    {errors.admin_email}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Password
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={data.password}
                                    onChange={(e) =>
                                        setData('password', e.target.value)
                                    }
                                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                                />
                            </div>
                            {errors.password && (
                                <p className="mt-2 text-sm text-red-600">
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="password_confirmation"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Confirm Password
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    type="password"
                                    required
                                    value={data.password_confirmation}
                                    onChange={(e) =>
                                        setData(
                                            'password_confirmation',
                                            e.target.value,
                                        )
                                    }
                                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                                />
                            </div>
                            {errors.password_confirmation && (
                                <p className="mt-2 text-sm text-red-600">
                                    {errors.password_confirmation}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="text-sm">
                            <Link
                                href="/login"
                                className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                            >
                                Already have an account? Sign in
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Create Your Company
                        </button>
                    </div>
                </form>
            </div>
        </AuthLayout>
    );
}
