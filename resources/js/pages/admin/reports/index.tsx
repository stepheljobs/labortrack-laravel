import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

type Log = { id:number; timestamp?:string; project?:{id:number;name:string}; labor?:{id:number;name:string}; supervisor?:{id:number;name:string}; latitude:number; longitude:number; location_address?:string; photo_url?:string|null };

export default function AdminReportsIndex({ projects, logs, filters }: { projects: Array<{id:number;name:string}>, logs: { data: Log[]; meta: { current_page:number; last_page:number; total:number } }, filters: { project_id?:number; from?:string; to?:string } }) {
    return (
        <AppLayout breadcrumbs={[{ title: 'Admin', href:'/dashboard' }, { title: 'Reports', href:'/reports' }]}>
            <Head title="Reports" />
            <div className="p-4">
                <form method="get" action="/reports" className="flex flex-wrap gap-3 items-end mb-4">
                    <div>
                        <label className="block text-xs mb-1">Project</label>
                        <select className="border rounded-md px-3 py-2" name="project_id" defaultValue={filters.project_id ?? ''}>
                            <option value="">All</option>
                            {projects.map((p)=> <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs mb-1">From</label>
                        <input className="border rounded-md px-3 py-2" type="date" name="from" defaultValue={filters.from} />
                    </div>
                    <div>
                        <label className="block text-xs mb-1">To</label>
                        <input className="border rounded-md px-3 py-2" type="date" name="to" defaultValue={filters.to} />
                    </div>
                    <button className="rounded-md bg-primary text-primary-foreground px-4 py-2" type="submit">Filter</button>
                    <a className="px-3 py-2 text-blue-600" href={`/reports/export?project_id=${filters.project_id ?? ''}&from=${filters.from ?? ''}&to=${filters.to ?? ''}`}>Export CSV</a>
                </form>

                <div className="overflow-hidden rounded-lg border">
                    <table className="w-full text-sm">
                        <thead className="bg-secondary/60">
                            <tr>
                                <th className="text-left px-3 py-2">Time</th>
                                <th className="text-left px-3 py-2">Project</th>
                                <th className="text-left px-3 py-2">Labor</th>
                                <th className="text-left px-3 py-2">Supervisor</th>
                                <th className="text-left px-3 py-2">Lat</th>
                                <th className="text-left px-3 py-2">Lng</th>
                                <th className="text-left px-3 py-2">Address</th>
                                <th className="text-left px-3 py-2">Photo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.data.map((log)=> (
                                <tr key={log.id} className="border-t">
                                    <td className="px-3 py-2">{log.timestamp}</td>
                                    <td className="px-3 py-2">{log.project?.name}</td>
                                    <td className="px-3 py-2">{log.labor?.name}</td>
                                    <td className="px-3 py-2">{log.supervisor?.name}</td>
                                    <td className="px-3 py-2">{log.latitude}</td>
                                    <td className="px-3 py-2">{log.longitude}</td>
                                    <td className="px-3 py-2">{log.location_address}</td>
                                    <td className="px-3 py-2">{log.photo_url ? <a className="text-blue-600 hover:underline" href={log.photo_url} target="_blank">View</a> : ''}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}

