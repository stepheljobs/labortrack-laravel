import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Check, Edit, Mail, Search, Trash2, UserCheck } from 'lucide-react';
import { useEffect, useState } from 'react';

type Supervisor = {
    id: number;
    name: string;
    email: string;
    role: string;
    invitation_token?: string;
    invitation_accepted_at?: string;
    email_verified_at?: string;
    created_at: string;
};

export default function SupervisorIndex() {
    const { supervisors, pagination, filters } = usePage().props as unknown as {
        supervisors: Supervisor[];
        pagination: {
            current_page: number;
            last_page: number;
            per_page: number;
            total: number;
        };
        filters: {
            search?: string;
            sort?: string;
            direction?: string;
        };
    };
    const [search, setSearch] = useState(filters?.search || '');
    const [sort, setSort] = useState({
        key: 'name',
        dir: 'asc' as 'asc' | 'desc',
    });
    const [page, setPage] = useState(pagination?.current_page || 1);

    const [editingId, setEditingId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [approveId, setApproveId] = useState<number | null>(null);
    const [notice, setNotice] = useState<{
        type: 'success' | 'error';
        text: string;
    } | null>(null);

    const createForm = useForm({
        name: '',
        email: '',
        password: '',
    });
    const editForm = useForm({
        name: '',
        email: '',
        password: '',
    });

    const pagePropsForFlash = usePage().props as unknown as {
        flash?: {
            success?: string;
            error?: string;
        };
    };

    useEffect(() => {
        const flash = pagePropsForFlash.flash;
        if (flash?.success) {
            setNotice({ type: 'success', text: flash.success });
        }
        if (flash?.error) {
            setNotice({ type: 'error', text: flash.error });
        }
    }, [pagePropsForFlash.flash]);

    useEffect(() => {
        if (!notice) return;
        const t = setTimeout(() => setNotice(null), 3000);
        return () => clearTimeout(t);
    }, [notice]);

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/admin/supervisors', {
            onSuccess: () => {
                createForm.reset();
                setNotice({
                    type: 'success',
                    text: 'Supervisor created and invitation sent successfully.',
                });
            },
            onError: () =>
                setNotice({
                    type: 'error',
                    text: 'Failed to create supervisor. Check inputs.',
                }),
            preserveScroll: true,
        });
    };

    const startEdit = (supervisor: Supervisor) => {
        setEditingId(supervisor.id);
        editForm.setData({
            name: supervisor.name ?? '',
            email: supervisor.email ?? '',
            password: '',
        });
    };

    const submitEdit = (e: React.FormEvent, id: number) => {
        e.preventDefault();
        editForm.put(`/admin/supervisors/${id}`, {
            onSuccess: () => {
                setEditingId(null);
                setNotice({
                    type: 'success',
                    text: 'Supervisor updated successfully.',
                });
            },
            onError: () =>
                setNotice({
                    type: 'error',
                    text: 'Failed to update supervisor.',
                }),
            preserveScroll: true,
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        editForm.reset();
    };

    const handleDelete = (id: number) => {
        router.delete(`/admin/supervisors/${id}`, {
            onSuccess: () =>
                setNotice({
                    type: 'success',
                    text: 'Supervisor deleted successfully.',
                }),
            onError: () =>
                setNotice({
                    type: 'error',
                    text: 'Failed to delete supervisor.',
                }),
            onFinish: () => setDeleteId(null),
            preserveScroll: true,
        });
    };

    const handleResendInvitation = (id: number) => {
        router.post(
            `/admin/supervisors/${id}/resend-invitation`,
            {},
            {
                onSuccess: () =>
                    setNotice({
                        type: 'success',
                        text: 'Invitation resent successfully.',
                    }),
                onError: () =>
                    setNotice({
                        type: 'error',
                        text: 'Failed to resend invitation.',
                    }),
                preserveScroll: true,
            },
        );
    };

    const handleApprove = (id: number) => {
        router.post(
            `/admin/supervisors/${id}/approve`,
            {},
            {
                onSuccess: () =>
                    setNotice({
                        type: 'success',
                        text: 'Supervisor approved successfully.',
                    }),
                onError: () =>
                    setNotice({
                        type: 'error',
                        text: 'Failed to approve supervisor.',
                    }),
                onFinish: () => setApproveId(null),
                preserveScroll: true,
            },
        );
    };

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        params.set('sort', sort.key);
        params.set('direction', sort.dir);
        params.set('page', '1');

        router.get('/admin/supervisors', Object.fromEntries(params), {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const handleSort = (key: keyof Supervisor) => {
        const newDirection =
            sort.key === key && sort.dir === 'asc' ? 'desc' : 'asc';
        setSort({ key, dir: newDirection });

        const params = new URLSearchParams();
        if (search) params.set('search', search);
        params.set('sort', key);
        params.set('direction', newDirection);
        params.set('page', page.toString());

        router.get('/admin/supervisors', Object.fromEntries(params), {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const getStatusBadge = (supervisor: Supervisor) => {
        if (supervisor.invitation_accepted_at) {
            return (
                <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                    <UserCheck className="mr-1 h-3 w-3" />
                    Active
                </span>
            );
        } else if (supervisor.invitation_token) {
            return (
                <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                    <Mail className="mr-1 h-3 w-3" />
                    Pending
                </span>
            );
        } else {
            return (
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
                    Inactive
                </span>
            );
        }
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Admin', href: '/dashboard' },
                { title: 'Supervisors', href: '/admin/supervisors' },
            ]}
        >
            <Head title="Supervisors" />
            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold tracking-tight">
                            Supervisors
                        </h2>
                        <p className="text-muted-foreground">
                            Manage supervisors and send invitations
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Add New Supervisor
                        </CardTitle>
                        <CardDescription>
                            Create a new supervisor and send them an invitation
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={submitCreate}
                            className="grid grid-cols-1 gap-2 md:grid-cols-4"
                        >
                            <input
                                className="rounded-md border px-3 py-2"
                                value={createForm.data.name}
                                onChange={(e) =>
                                    createForm.setData('name', e.target.value)
                                }
                                placeholder="Name"
                                required
                            />
                            <input
                                className="rounded-md border px-3 py-2"
                                type="email"
                                value={createForm.data.email}
                                onChange={(e) =>
                                    createForm.setData('email', e.target.value)
                                }
                                placeholder="Email"
                                required
                            />
                            <input
                                className="rounded-md border px-3 py-2"
                                type="password"
                                value={createForm.data.password}
                                onChange={(e) =>
                                    createForm.setData(
                                        'password',
                                        e.target.value,
                                    )
                                }
                                placeholder="Temporary Password"
                                required
                            />
                            <Button type="submit">Add Supervisor</Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            All Supervisors
                        </CardTitle>
                        <CardDescription>
                            Search and manage supervisor accounts
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="flex items-center gap-2">
                                    <input
                                        className="w-64 rounded-md border px-3 py-2"
                                        placeholder="Search supervisors..."
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                        onKeyDown={(e) =>
                                            e.key === 'Enter' && handleSearch()
                                        }
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleSearch}
                                    >
                                        <Search className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="ml-auto text-sm text-muted-foreground">
                                    {pagination?.total || 0} total supervisors
                                </div>
                            </div>

                            <div className="overflow-hidden rounded-lg border">
                                <table className="w-full text-sm">
                                    <thead className="bg-secondary/60">
                                        <tr>
                                            <th
                                                className="cursor-pointer px-3 py-2 text-left"
                                                onClick={() =>
                                                    handleSort('name')
                                                }
                                            >
                                                Name{' '}
                                                {sort.key === 'name'
                                                    ? sort.dir === 'asc'
                                                        ? '▲'
                                                        : '▼'
                                                    : ''}
                                            </th>
                                            <th
                                                className="cursor-pointer px-3 py-2 text-left"
                                                onClick={() =>
                                                    handleSort('email')
                                                }
                                            >
                                                Email{' '}
                                                {sort.key === 'email'
                                                    ? sort.dir === 'asc'
                                                        ? '▲'
                                                        : '▼'
                                                    : ''}
                                            </th>
                                            <th className="px-3 py-2 text-left">
                                                Status
                                            </th>
                                            <th className="px-3 py-2 text-left">
                                                Created
                                            </th>
                                            <th className="px-3 py-2 text-left">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {supervisors?.length === 0 && (
                                            <tr>
                                                <td
                                                    className="px-3 py-6 text-center text-muted-foreground"
                                                    colSpan={5}
                                                >
                                                    No supervisors found. Add
                                                    your first supervisor using
                                                    the form above.
                                                </td>
                                            </tr>
                                        )}
                                        {supervisors?.map(
                                            (supervisor: Supervisor) => (
                                                <tr
                                                    key={supervisor.id}
                                                    className="border-t"
                                                >
                                                    {editingId ===
                                                    supervisor.id ? (
                                                        <>
                                                            <td className="px-3 py-2">
                                                                <input
                                                                    className="w-full rounded-md border px-2 py-1"
                                                                    value={
                                                                        editForm
                                                                            .data
                                                                            .name
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        editForm.setData(
                                                                            'name',
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    required
                                                                />
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                <input
                                                                    className="w-full rounded-md border px-2 py-1"
                                                                    type="email"
                                                                    value={
                                                                        editForm
                                                                            .data
                                                                            .email
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        editForm.setData(
                                                                            'email',
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    required
                                                                />
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                <input
                                                                    className="w-full rounded-md border px-2 py-1"
                                                                    type="password"
                                                                    placeholder="New password (optional)"
                                                                    value={
                                                                        editForm
                                                                            .data
                                                                            .password
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        editForm.setData(
                                                                            'password',
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                />
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                {getStatusBadge(
                                                                    supervisor,
                                                                )}
                                                            </td>
                                                            <td className="space-x-2 px-3 py-2">
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    onClick={(
                                                                        e,
                                                                    ) =>
                                                                        submitEdit(
                                                                            e,
                                                                            supervisor.id,
                                                                        )
                                                                    }
                                                                >
                                                                    Save
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    variant="secondary"
                                                                    size="sm"
                                                                    onClick={
                                                                        cancelEdit
                                                                    }
                                                                >
                                                                    Cancel
                                                                </Button>
                                                            </td>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <td className="px-3 py-2 font-medium">
                                                                {
                                                                    supervisor.name
                                                                }
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                {
                                                                    supervisor.email
                                                                }
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                {getStatusBadge(
                                                                    supervisor,
                                                                )}
                                                            </td>
                                                            <td className="px-3 py-2 text-muted-foreground">
                                                                {new Date(
                                                                    supervisor.created_at,
                                                                ).toLocaleDateString()}
                                                            </td>
                                                            <td className="space-x-2 px-3 py-2">
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        startEdit(
                                                                            supervisor,
                                                                        )
                                                                    }
                                                                >
                                                                    <Edit className="h-3 w-3" />
                                                                </Button>
                                                                {!supervisor.invitation_accepted_at && (
                                                                    <>
                                                                        <Button
                                                                            type="button"
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() =>
                                                                                setApproveId(
                                                                                    supervisor.id,
                                                                                )
                                                                            }
                                                                        >
                                                                            <Check className="h-3 w-3" />
                                                                        </Button>
                                                                        <Button
                                                                            type="button"
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() =>
                                                                                handleResendInvitation(
                                                                                    supervisor.id,
                                                                                )
                                                                            }
                                                                        >
                                                                            <Mail className="h-3 w-3" />
                                                                        </Button>
                                                                    </>
                                                                )}
                                                                <Button
                                                                    type="button"
                                                                    variant="destructive"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        setDeleteId(
                                                                            supervisor.id,
                                                                        )
                                                                    }
                                                                >
                                                                    <Trash2 className="h-3 w-3" />
                                                                </Button>
                                                            </td>
                                                        </>
                                                    )}
                                                </tr>
                                            ),
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {pagination && pagination.last_page > 1 && (
                                <div className="mt-2 flex items-center justify-between">
                                    <div className="text-xs text-muted-foreground">
                                        Page {pagination.current_page} of{' '}
                                        {pagination.last_page}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="secondary"
                                            disabled={
                                                pagination.current_page <= 1
                                            }
                                            onClick={() => {
                                                const newPage =
                                                    pagination.current_page - 1;
                                                setPage(newPage);
                                                const params =
                                                    new URLSearchParams();
                                                if (search)
                                                    params.set(
                                                        'search',
                                                        search,
                                                    );
                                                params.set('sort', sort.key);
                                                params.set(
                                                    'direction',
                                                    sort.dir,
                                                );
                                                params.set(
                                                    'page',
                                                    newPage.toString(),
                                                );
                                                router.get(
                                                    '/admin/supervisors',
                                                    Object.fromEntries(params),
                                                    { preserveScroll: true },
                                                );
                                            }}
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="secondary"
                                            disabled={
                                                pagination.current_page >=
                                                pagination.last_page
                                            }
                                            onClick={() => {
                                                const newPage =
                                                    pagination.current_page + 1;
                                                setPage(newPage);
                                                const params =
                                                    new URLSearchParams();
                                                if (search)
                                                    params.set(
                                                        'search',
                                                        search,
                                                    );
                                                params.set('sort', sort.key);
                                                params.set(
                                                    'direction',
                                                    sort.dir,
                                                );
                                                params.set(
                                                    'page',
                                                    newPage.toString(),
                                                );
                                                router.get(
                                                    '/admin/supervisors',
                                                    Object.fromEntries(params),
                                                    { preserveScroll: true },
                                                );
                                            }}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Dialog
                    open={deleteId !== null}
                    onOpenChange={(o) => !o && setDeleteId(null)}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Supervisor?</DialogTitle>
                        </DialogHeader>
                        <p className="text-sm text-muted-foreground">
                            This action cannot be undone. The supervisor will be
                            permanently removed from the system.
                        </p>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                variant="secondary"
                                onClick={() => setDeleteId(null)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => {
                                    if (deleteId) {
                                        handleDelete(deleteId);
                                    }
                                }}
                            >
                                Delete
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                <Dialog
                    open={approveId !== null}
                    onOpenChange={(o) => !o && setApproveId(null)}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Approve Supervisor?</DialogTitle>
                        </DialogHeader>
                        <p className="text-sm text-muted-foreground">
                            This will manually set the supervisor's status to
                            Active (OK!) and they will be able to access the
                            system immediately.
                        </p>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                variant="secondary"
                                onClick={() => setApproveId(null)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => {
                                    if (approveId) {
                                        handleApprove(approveId);
                                    }
                                }}
                            >
                                Approve
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {notice && (
                <div className="fixed right-4 bottom-4 z-50">
                    <Alert
                        className={`w-72 shadow-lg ${notice.type === 'success' ? 'border-green-600/40' : 'border-red-600/40'}`}
                    >
                        <AlertDescription>{notice.text}</AlertDescription>
                    </Alert>
                </div>
            )}
        </AppLayout>
    );
}
