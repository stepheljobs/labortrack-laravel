import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

type Log = {
    id: number;
    timestamp?: string;
    project?: { id: number; name: string };
    labor?: { id: number; name: string };
    supervisor?: { id: number; name: string };
    type?: 'clock_in' | 'clock_out';
    latitude: number;
    longitude: number;
    location_address?: string;
    photo_url?: string | null;
};

export default function AdminReportsIndex({
    projects,
    labors,
    logs,
    filters,
}: {
    projects: Array<{ id: number; name: string }>;
    labors: Array<{ id: number; name: string }>;
    logs: {
        data: Log[];
        meta: { current_page: number; last_page: number; total: number };
    };
    filters: {
        project_id?: number;
        labor_id?: number;
        from?: string;
        to?: string;
    };
}) {
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Admin', href: '/dashboard' },
                { title: 'Reports', href: '/reports' },
            ]}
        >
            <Head title="Reports" />
            <div className="p-4">
                <form
                    method="get"
                    action="/reports"
                    className="mb-4 flex flex-wrap items-end gap-3"
                >
                    <div>
                        <label className="mb-1 block text-xs">Project</label>
                        <select
                            className="rounded-md border px-3 py-2"
                            name="project_id"
                            defaultValue={filters.project_id ?? ''}
                        >
                            <option value="">All</option>
                            {projects.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="mb-1 block text-xs">Labor</label>
                        <select
                            className="rounded-md border px-3 py-2"
                            name="labor_id"
                            defaultValue={filters.labor_id ?? ''}
                        >
                            <option value="">All</option>
                            {labors.map((l) => (
                                <option key={l.id} value={l.id}>
                                    {l.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="mb-1 block text-xs">From</label>
                        <input
                            className="rounded-md border px-3 py-2"
                            type="date"
                            name="from"
                            defaultValue={filters.from}
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs">To</label>
                        <input
                            className="rounded-md border px-3 py-2"
                            type="date"
                            name="to"
                            defaultValue={filters.to}
                        />
                    </div>
                    <button
                        className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
                        type="submit"
                    >
                        Filter
                    </button>
                    <a
                        className="px-3 py-2 text-blue-600"
                        href={`/reports/export?project_id=${filters.project_id ?? ''}&labor_id=${filters.labor_id ?? ''}&from=${filters.from ?? ''}&to=${filters.to ?? ''}`}
                    >
                        Export CSV
                    </a>
                </form>

                <div className="overflow-hidden rounded-lg border">
                    <table className="w-full text-sm">
                        <thead className="bg-secondary/60">
                            <tr>
                                <th className="px-3 py-2 text-left">Time</th>
                                <th className="px-3 py-2 text-left">Project</th>
                                <th className="px-3 py-2 text-left">Labor</th>
                                <th className="px-3 py-2 text-left">
                                    Supervisor
                                </th>
                                <th className="px-3 py-2 text-left">Type</th>
                                <th className="px-3 py-2 text-left">Lat</th>
                                <th className="px-3 py-2 text-left">Lng</th>
                                <th className="px-3 py-2 text-left">Address</th>
                                <th className="px-3 py-2 text-left">Photo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.data.map((log) => (
                                <tr key={log.id} className="border-t">
                                    <td className="px-3 py-2">
                                        {log.timestamp}
                                    </td>
                                    <td className="px-3 py-2">
                                        {log.project?.name}
                                    </td>
                                    <td className="px-3 py-2">
                                        {log.labor?.name}
                                    </td>
                                    <td className="px-3 py-2">
                                        {log.supervisor?.name}
                                    </td>
                                    <td className="px-3 py-2">
                                        {log.type === 'clock_out'
                                            ? 'Clock Out'
                                            : 'Clock In'}
                                    </td>
                                    <td className="px-3 py-2">
                                        {log.latitude}
                                    </td>
                                    <td className="px-3 py-2">
                                        {log.longitude}
                                    </td>
                                    <td className="px-3 py-2">
                                        {log.location_address}
                                    </td>
                                    <td className="px-3 py-2">
                                        {log.photo_url ? (
                                            <a
                                                className="text-blue-600 hover:underline"
                                                href={log.photo_url}
                                                target="_blank"
                                            >
                                                View
                                            </a>
                                        ) : (
                                            ''
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
