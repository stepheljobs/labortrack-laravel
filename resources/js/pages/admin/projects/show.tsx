import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Users, MessageSquare, Calendar } from 'lucide-react';

type Labor = { id:number; name:string; contact_number?:string; role?:string };
type Message = { id:number; created_at:string; user?:{id:number;name:string}; message:string; photo_url?:string|null };
type Attendance = { id:number; timestamp?:string; labor?:{id:number;name:string}; supervisor?:{id:number;name:string}; latitude:number; longitude:number; photo_url?:string|null };

export default function AdminProjectShow({ project, supervisors }: { project: { id:number; name:string; description?:string; location_address?:string; labors: Labor[]; messages: Message[]; recent_attendance: Attendance[] }, supervisors: Array<{id:number; name:string; email:string}> }) {
    const assign = useForm({ user_id: supervisors[0]?.id ?? '' });
    const labor = useForm({ name:'', contact_number:'', role:'' });
    const [tab, setTab] = useState<'labors'|'attendance'|'messages'>('labors');

    const submitAssign = (e: React.FormEvent) => {
        e.preventDefault();
        assign.post(`/admin/projects/${project.id}/supervisors`);
    };

    const submitLabor = (e: React.FormEvent) => {
        e.preventDefault();
        labor.post(`/admin/projects/${project.id}/labors`, {
            onSuccess: () => labor.reset('name','contact_number','role')
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Admin', href:'/admin/dashboard' }, { title: 'Projects', href:'/admin/projects' }, { title: project.name, href:`/admin/projects/${project.id}` }]}>
            <Head title={project.name} />
            <div className="p-4 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold tracking-tight">{project.name}</h2>
                        {project.description && <p className="text-muted-foreground">{project.description}</p>}
                        <p className="text-sm mt-1"><span className="font-medium">Location:</span> {project.location_address}</p>
                    </div>
                </div>

                <Card>
                    <CardHeader className="flex items-center justify-between md:flex-row md:items-center">
                        <div>
                            <CardTitle className="text-base">Assign Supervisor</CardTitle>
                            <CardDescription>Give a supervisor access to this project.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submitAssign} className="flex flex-col gap-2 sm:flex-row">
                            <select className="border rounded-md px-3 py-2 flex-1" value={assign.data.user_id as number | ''} onChange={e=>assign.setData('user_id', Number(e.target.value))} required>
                                {supervisors.map((s)=> <option key={s.id} value={s.id}>{s.name} ({s.email})</option>)}
                            </select>
                            <Button type="submit">Assign</Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                            <button onClick={() => setTab('labors')} className={`rounded-md px-3 py-1.5 text-sm ${tab==='labors' ? 'bg-secondary' : 'hover:bg-secondary/60'}`}>
                                <Users className="inline-block mr-2 h-4 w-4" /> Labors
                            </button>
                            <button onClick={() => setTab('attendance')} className={`rounded-md px-3 py-1.5 text-sm ${tab==='attendance' ? 'bg-secondary' : 'hover:bg-secondary/60'}`}>
                                <Calendar className="inline-block mr-2 h-4 w-4" /> Attendance
                            </button>
                            <button onClick={() => setTab('messages')} className={`rounded-md px-3 py-1.5 text-sm ${tab==='messages' ? 'bg-secondary' : 'hover:bg-secondary/60'}`}>
                                <MessageSquare className="inline-block mr-2 h-4 w-4" /> Messages
                            </button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {tab === 'labors' && (
                            <div className="space-y-3">
                                <form onSubmit={submitLabor} className="grid grid-cols-1 md:grid-cols-4 gap-2">
                                    <input className="border rounded-md px-3 py-2" value={labor.data.name} onChange={e=>labor.setData('name', e.target.value)} placeholder="Name" required />
                                    <input className="border rounded-md px-3 py-2" value={labor.data.contact_number} onChange={e=>labor.setData('contact_number', e.target.value)} placeholder="Contact" />
                                    <input className="border rounded-md px-3 py-2" value={labor.data.role} onChange={e=>labor.setData('role', e.target.value)} placeholder="Role" />
                                    <Button type="submit">Add</Button>
                                </form>
                                <div className="overflow-hidden rounded-lg border">
                                    <table className="w-full text-sm">
                                        <thead className="bg-secondary/60">
                                            <tr><th className="text-left px-3 py-2">Name</th><th className="text-left px-3 py-2">Contact</th><th className="text-left px-3 py-2">Role</th></tr>
                                        </thead>
                                        <tbody>
                                            {project.labors.map((l)=> (
                                                <tr key={l.id} className="border-t">
                                                    <td className="px-3 py-2">{l.name}</td>
                                                    <td className="px-3 py-2">{l.contact_number}</td>
                                                    <td className="px-3 py-2">{l.role}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {tab === 'attendance' && (
                            <div className="space-y-3">
                                <div className="overflow-hidden rounded-lg border">
                                    <table className="w-full text-sm">
                                        <thead className="bg-secondary/60">
                                            <tr>
                                                <th className="text-left px-3 py-2">Time</th>
                                                <th className="text-left px-3 py-2">Labor</th>
                                                <th className="text-left px-3 py-2">Supervisor</th>
                                                <th className="text-left px-3 py-2">Lat</th>
                                                <th className="text-left px-3 py-2">Lng</th>
                                                <th className="text-left px-3 py-2">Photo</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {project.recent_attendance.length === 0 && (
                                                <tr><td className="px-3 py-2 text-muted-foreground" colSpan={6}>No recent logs.</td></tr>
                                            )}
                                            {project.recent_attendance.map((log)=> (
                                                <tr key={log.id} className="border-t">
                                                    <td className="px-3 py-2">{log.timestamp}</td>
                                                    <td className="px-3 py-2">{log.labor?.name}</td>
                                                    <td className="px-3 py-2">{log.supervisor?.name}</td>
                                                    <td className="px-3 py-2">{log.latitude}</td>
                                                    <td className="px-3 py-2">{log.longitude}</td>
                                                    <td className="px-3 py-2">{log.photo_url ? <a className="text-blue-600 hover:underline" href={log.photo_url} target="_blank">View</a> : ''}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <p className="text-xs text-muted-foreground">For full history, use Reports.</p>
                            </div>
                        )}

                        {tab === 'messages' && (
                            <div className="rounded-lg border divide-y">
                                {project.messages.length === 0 && <div className="p-3 text-sm text-muted-foreground">No messages yet.</div>}
                                {project.messages.map((m) => (
                                    <div key={m.id} className="p-3 space-y-1">
                                        <div className="text-xs text-muted-foreground">{m.created_at} — {m.user?.name}</div>
                                        <div className="text-sm">{m.message}</div>
                                        {m.photo_url && <a className="text-blue-600 text-sm hover:underline" href={m.photo_url} target="_blank">Photo</a>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
