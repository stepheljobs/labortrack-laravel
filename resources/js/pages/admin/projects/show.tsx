import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Head, useForm, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Users, MessageSquare, Calendar } from 'lucide-react';
import MultiSelectChips from '@/components/multi-select-chips';

type Labor = { id:number; name:string; contact_number?:string; designation?:string; daily_rate?: number | string | null };
type Message = { id:number; created_at:string; user?:{id:number;name:string}; message:string; photo_url?:string|null };
type Attendance = { id:number; timestamp?:string; labor?:{id:number;name:string}; supervisor?:{id:number;name:string}; type?:'clock_in'|'clock_out'; latitude:number; longitude:number; photo_url?:string|null };

export default function AdminProjectShow({ project, supervisors }: { project: { id:number; name:string; description?:string; location_address?:string; assigned_supervisor_ids: number[]; labors: Labor[]; messages: Message[]; recent_attendance: Attendance[] }, supervisors: Array<{id:number; name:string; email:string}> }) {
    const assign = useForm<{ user_ids: number[] }>({ user_ids: project.assigned_supervisor_ids ?? [] });
    const labor = useForm({ name:'', contact_number:'', designation:'', daily_rate: '' as number | string | '' });
    const [tab, setTab] = useState<'labors'|'attendance'|'messages'>('labors');
    const [editingId, setEditingId] = useState<number|null>(null);
    const edit = useForm({ name:'', contact_number:'', designation:'', daily_rate: '' as number | string | '' });
    const messageForm = useForm<{ message: string; photo: File | null }>({ message: '', photo: null });

    useEffect(() => {
        try {
            const params = new URLSearchParams(window.location.search);
            const t = params.get('tab');
            if (t === 'messages') setTab('messages');
        } catch {}
    }, []);

    const submitAssign = (e: React.FormEvent) => {
        e.preventDefault();
        assign.post(`/projects/${project.id}/supervisors`);
    };

    const submitLabor = (e: React.FormEvent) => {
        e.preventDefault();
        labor.post(`/projects/${project.id}/labors`, {
            onSuccess: () => labor.reset('name','contact_number','designation','daily_rate')
        });
    };

    const startEdit = (l: Labor) => {
        setEditingId(l.id);
        edit.setData({
            name: l.name ?? '',
            contact_number: l.contact_number ?? '',
            designation: l.designation ?? '',
            daily_rate: (l.daily_rate as any) ?? '',
        } as any);
    };

    const submitEdit = (e: React.FormEvent, id: number) => {
        e.preventDefault();
        edit.put(`/projects/${project.id}/labors/${id}`, {
            onSuccess: () => { setEditingId(null); },
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Admin', href:'/dashboard' }, { title: 'Projects', href:'/projects' }, { title: project.name, href:`/projects/${project.id}` }]}>
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
                            <CardTitle className="text-base">Assign Supervisor(s)</CardTitle>
                            <CardDescription>Give a supervisor access to this project.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submitAssign} className="flex flex-col gap-2 sm:flex-row">
                            <div className="flex-1">
                                <label className="block text-sm font-medium mb-1">Select supervisors</label>
                                <MultiSelectChips
                                    options={supervisors.map(s=>({ value: s.id, label: `${s.name} (${s.email})` }))}
                                    value={assign.data.user_ids}
                                    onChange={(vals)=>assign.setData('user_ids', vals)}
                                />
                            </div>
                            <Button type="submit">Save</Button>
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
                                <form onSubmit={submitLabor} className="grid grid-cols-1 md:grid-cols-5 gap-2">
                                    <input className="border rounded-md px-3 py-2" value={labor.data.name} onChange={e=>labor.setData('name', e.target.value)} placeholder="Name" required />
                                    <input className="border rounded-md px-3 py-2" value={labor.data.contact_number} onChange={e=>labor.setData('contact_number', e.target.value)} placeholder="Contact" />
                                    <input className="border rounded-md px-3 py-2" value={labor.data.designation as string} onChange={e=>labor.setData('designation', e.target.value)} placeholder="Designation" />
                                    <input className="border rounded-md px-3 py-2" type="number" step="0.01" min="0" value={(labor.data.daily_rate as any) ?? ''} onChange={e=>labor.setData('daily_rate', e.target.value)} placeholder="Daily Rate" />
                                    <Button type="submit">Add</Button>
                                </form>
                                <div className="overflow-hidden rounded-lg border">
                                    <table className="w-full text-sm">
                                        <thead className="bg-secondary/60">
                                            <tr>
                                                <th className="text-left px-3 py-2">Name</th>
                                                <th className="text-left px-3 py-2">Contact</th>
                                                <th className="text-left px-3 py-2">Designation</th>
                                                <th className="text-left px-3 py-2">Daily Rate</th>
                                                <th className="text-left px-3 py-2">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {project.labors.map((l)=> (
                                                <tr key={l.id} className="border-t">
                                                    {editingId === l.id ? (
                                                        <>
                                                            <td className="px-3 py-2">
                                                                <input className="w-full border rounded-md px-2 py-1" value={edit.data.name} onChange={e=>edit.setData('name', e.target.value)} required />
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                <input className="w-full border rounded-md px-2 py-1" value={edit.data.contact_number as string} onChange={e=>edit.setData('contact_number', e.target.value)} />
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                <input className="w-full border rounded-md px-2 py-1" value={edit.data.designation as string} onChange={e=>edit.setData('designation', e.target.value)} />
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                <input className="w-full border rounded-md px-2 py-1" type="number" step="0.01" min="0" value={(edit.data.daily_rate as any) ?? ''} onChange={e=>edit.setData('daily_rate', e.target.value)} />
                                                            </td>
                                                            <td className="px-3 py-2 space-x-2">
                                                                <Button type="button" size="sm" onClick={(e)=>submitEdit(e as any, l.id)}>Save</Button>
                                                                <Button type="button" variant="secondary" size="sm" onClick={cancelEdit}>Cancel</Button>
                                                            </td>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <td className="px-3 py-2">{l.name}</td>
                                                            <td className="px-3 py-2">{l.contact_number}</td>
                                                            <td className="px-3 py-2">{l.designation}</td>
                                                            <td className="px-3 py-2">{l.daily_rate ?? ''}</td>
                                                            <td className="px-3 py-2 space-x-2">
                                                                <Button type="button" variant="secondary" size="sm" onClick={()=>startEdit(l)}>Edit</Button>
                                                                <Button type="button" variant="destructive" size="sm" onClick={()=>{ if (confirm('Delete this labor?')) { router.delete(`/projects/${project.id}/labors/${l.id}`); } }}>Delete</Button>
                                                            </td>
                                                        </>
                                                    )}
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
                                                <th className="text-left px-3 py-2">Type</th>
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
                                                    <td className="px-3 py-2">{log.type === 'clock_out' ? 'Clock Out' : 'Clock In'}</td>
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
                            <div className="space-y-4">

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

                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        messageForm.post(`/projects/${project.id}/messages`, {
                                            onSuccess: () => messageForm.reset('message', 'photo'),
                                            forceFormData: true,
                                        });
                                    }}
                                    className="rounded-lg border p-3 space-y-2"
                                >
                                    <label className="block text-sm font-medium">Post a message</label>
                                    <textarea
                                        className="w-full border rounded-md px-3 py-2"
                                        rows={3}
                                        value={messageForm.data.message}
                                        onChange={(e) => messageForm.setData('message', e.target.value)}
                                        placeholder="Write your message..."
                                        required
                                    />
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => messageForm.setData('photo', e.target.files?.[0] ?? null)}
                                        />
                                        <Button type="submit" disabled={messageForm.processing}>Send</Button>
                                    </div>
                                </form>

                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
