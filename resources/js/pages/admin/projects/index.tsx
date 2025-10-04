import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function AdminProjectsIndex({ projects }: { projects: { data: Array<{ id:number; name:string; location_address?:string; created_at?:string }>; meta: { current_page:number; last_page:number; total:number } } }) {
    const { data, setData, post, processing, errors, reset } = useForm({ name:'', location_address:'', geofence_radius:'' as unknown as number });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/projects', {
            onSuccess: () => reset('name','location_address','geofence_radius'),
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Admin', href:'/dashboard' }, { title: 'Projects', href: '/projects' }]}>
            <Head title="Projects" />
            <div className="p-4">
                <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
                    <input className="border rounded-md px-3 py-2" value={data.name} onChange={e=>setData('name', e.target.value)} placeholder="Project name" required />
                    <input className="border rounded-md px-3 py-2" value={data.location_address} onChange={e=>setData('location_address', e.target.value)} placeholder="Location (optional)" />
                    <input className="border rounded-md px-3 py-2" type="number" value={data.geofence_radius as number} onChange={e=>setData('geofence_radius', Number(e.target.value))} placeholder="Geofence radius (m)" />
                    <button disabled={processing} className="rounded-md bg-primary text-primary-foreground px-4 py-2" type="submit">Create</button>
                    {errors.name && <small className="text-red-600 col-span-full">{errors.name}</small>}
                </form>

                <div className="overflow-hidden rounded-lg border">
                    <table className="w-full text-sm">
                        <thead className="bg-secondary/60">
                            <tr>
                                <th className="text-left px-3 py-2">Name</th>
                                <th className="text-left px-3 py-2">Location</th>
                                <th className="text-left px-3 py-2">Created</th>
                                <th className="text-left px-3 py-2"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {projects.data.map((p) => (
                                <tr key={p.id} className="border-t">
                                    <td className="px-3 py-2">{p.name}</td>
                                    <td className="px-3 py-2">{p.location_address}</td>
                                    <td className="px-3 py-2">{p.created_at}</td>
                                    <td className="px-3 py-2"><Link className="text-blue-600 hover:underline" href={`/projects/${p.id}`}>View</Link></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}

