import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import * as React from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface DashboardProps {
    projectsCount: number;
    todayAttendance: number;
    recentMessages: Array<{
        id: number;
        created_at: string;
        user?: { id: number; name: string };
        project?: { id: number; name: string };
        message: string;
        photo_url?: string | null;
    }>;
}

export default function Dashboard({
    projectsCount,
    todayAttendance,
    recentMessages,
}: DashboardProps) {
    const [selectedImage, setSelectedImage] = React.useState<string | null>(
        null,
    );
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex flex-col gap-6 p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="rounded-xl border p-4">
                        <div className="text-sm text-muted-foreground">
                            Projects
                        </div>
                        <div className="mt-2 text-3xl font-semibold">
                            {projectsCount}
                        </div>
                    </div>
                    <div className="rounded-xl border p-4">
                        <div className="text-sm text-muted-foreground">
                            Today's Attendance
                        </div>
                        <div className="mt-2 text-3xl font-semibold">
                            {todayAttendance}
                        </div>
                    </div>
                    <div className="rounded-xl border p-4">
                        <div className="text-sm text-muted-foreground">
                            Overview
                        </div>
                        <div className="mt-2">Keep an eye on activity.</div>
                    </div>
                </div>
                <div className="rounded-xl border">
                    <div className="border-b px-4 py-3 text-sm font-medium">
                        Recent Messages
                    </div>
                    <div className="divide-y">
                        {recentMessages.length === 0 && (
                            <div className="px-4 py-3 text-sm text-muted-foreground">
                                No recent messages.
                            </div>
                        )}
                        {recentMessages.map((m) => (
                            <div key={m.id} className="px-4 py-3 text-sm">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="truncate text-muted-foreground">
                                        {m.created_at} — {m.user?.name} —{' '}
                                        {m.project?.name}
                                    </div>
                                    {m.project?.id && (
                                        <Link
                                            className="whitespace-nowrap text-blue-600 hover:underline"
                                            href={`/projects/${m.project.id}?tab=messages`}
                                        >
                                            Reply
                                        </Link>
                                    )}
                                </div>
                                <div className="mt-1">
                                    {m.message}
                                    {m.photo_url && (
                                        <div className="mt-2">
                                            <img
                                                src={m.photo_url}
                                                alt="Message attachment"
                                                className="max-w-xs cursor-pointer rounded-lg border transition-opacity hover:opacity-80"
                                                onClick={() =>
                                                    setSelectedImage(
                                                        m.photo_url || null,
                                                    )
                                                }
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {selectedImage && (
                <div
                    className="bg-opacity-75 fixed inset-0 z-50 flex items-center justify-center bg-black p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-h-full max-w-4xl">
                        <img
                            src={selectedImage}
                            alt="Full size image"
                            className="max-h-full max-w-full rounded-lg"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <button
                            className="absolute top-2 right-2 rounded-full bg-white p-2 text-black hover:bg-gray-200"
                            onClick={() => setSelectedImage(null)}
                        >
                            <svg
                                className="h-6 w-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
