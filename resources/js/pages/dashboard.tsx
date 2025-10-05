import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

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

export default function Dashboard({ projectsCount, todayAttendance, recentMessages }: DashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex flex-col gap-6 p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="rounded-xl border p-4">
                        <div className="text-sm text-muted-foreground">Projects</div>
                        <div className="mt-2 text-3xl font-semibold">{projectsCount}</div>
                    </div>
                    <div className="rounded-xl border p-4">
                        <div className="text-sm text-muted-foreground">Today's Attendance</div>
                        <div className="mt-2 text-3xl font-semibold">{todayAttendance}</div>
                    </div>
                    <div className="rounded-xl border p-4">
                        <div className="text-sm text-muted-foreground">Overview</div>
                        <div className="mt-2">Keep an eye on activity.</div>
                    </div>
                </div>
                <div className="rounded-xl border">
                    <div className="border-b px-4 py-3 text-sm font-medium">Recent Messages</div>
                    <div className="divide-y">
                        {recentMessages.length === 0 && (
                            <div className="px-4 py-3 text-sm text-muted-foreground">No recent messages.</div>
                        )}
                        {recentMessages.map((m) => (
                            <div key={m.id} className="px-4 py-3 text-sm">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="text-muted-foreground truncate">{m.created_at} — {m.user?.name} — {m.project?.name}</div>
                                    {m.project?.id && (
                                        <Link className="text-blue-600 hover:underline whitespace-nowrap" href={`/projects/${m.project.id}?tab=messages`}>
                                            Reply
                                        </Link>
                                    )}
                                </div>
                                <div className="mt-1">{m.message}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
