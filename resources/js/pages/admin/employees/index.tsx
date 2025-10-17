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
import { Edit, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

type Employee = {
    id: number;
    name: string;
    contact_number?: string;
    designation?: string;
    daily_rate?: number | string | null;
    project_id?: number | null;
};

export default function EmployeeIndex() {
    const { employees, pagination, filters } = usePage().props as unknown as {
        employees: Employee[];
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
    const [notice, setNotice] = useState<{
        type: 'success' | 'error';
        text: string;
    } | null>(null);

    const createForm = useForm({
        name: '',
        contact_number: '',
        designation: '',
        daily_rate: '' as string,
    });
    const editForm = useForm({
        name: '',
        contact_number: '',
        designation: '',
        daily_rate: '' as string,
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
        createForm.post('/employees', {
            onSuccess: () => {
                createForm.reset();
                setNotice({
                    type: 'success',
                    text: 'Employee created successfully.',
                });
            },
            onError: () =>
                setNotice({
                    type: 'error',
                    text: 'Failed to create employee. Check inputs.',
                }),
            preserveScroll: true,
        });
    };

    const startEdit = (employee: Employee) => {
        setEditingId(employee.id);
        editForm.setData({
            name: employee.name ?? '',
            contact_number: employee.contact_number ?? '',
            designation: employee.designation ?? '',
            daily_rate: String(employee.daily_rate ?? ''),
        });
    };

    const submitEdit = (e: React.FormEvent, id: number) => {
        e.preventDefault();
        editForm.put(`/employees/${id}`, {
            onSuccess: () => {
                setEditingId(null);
                setNotice({
                    type: 'success',
                    text: 'Employee updated successfully.',
                });
            },
            onError: () =>
                setNotice({
                    type: 'error',
                    text: 'Failed to update employee.',
                }),
            preserveScroll: true,
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        editForm.reset();
    };

    const handleDelete = (id: number) => {
        router.delete(`/employees/${id}`, {
            onSuccess: () =>
                setNotice({
                    type: 'success',
                    text: 'Employee deleted successfully.',
                }),
            onError: () =>
                setNotice({
                    type: 'error',
                    text: 'Failed to delete employee.',
                }),
            onFinish: () => setDeleteId(null),
            preserveScroll: true,
        });
    };

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        params.set('sort', sort.key);
        params.set('direction', sort.dir);
        params.set('page', '1');

        router.get('/employees', Object.fromEntries(params), {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const handleSort = (key: keyof Employee) => {
        const newDirection =
            sort.key === key && sort.dir === 'asc' ? 'desc' : 'asc';
        setSort({ key, dir: newDirection });

        const params = new URLSearchParams();
        if (search) params.set('search', search);
        params.set('sort', key);
        params.set('direction', newDirection);
        params.set('page', page.toString());

        router.get('/employees', Object.fromEntries(params), {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const formatPeso = (val?: number | string | null) => {
        if (val === undefined || val === null || val === '') return '';
        const num = typeof val === 'string' ? Number(val) : val;
        if (Number.isNaN(num)) return '';
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            maximumFractionDigits: 2,
        }).format(num as number);
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Admin', href: '/dashboard' },
                { title: 'Employees', href: '/employees' },
            ]}
        >
            <Head title="Employees" />
            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold tracking-tight">
                            Employees
                        </h2>
                        <p className="text-muted-foreground">
                            Manage all employees and their information
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Add New Employee
                        </CardTitle>
                        <CardDescription>
                            Create a new employee that can be assigned to
                            projects
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={submitCreate}
                            className="grid grid-cols-1 gap-2 md:grid-cols-5"
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
                                value={createForm.data.contact_number}
                                onChange={(e) =>
                                    createForm.setData(
                                        'contact_number',
                                        e.target.value,
                                    )
                                }
                                placeholder="Contact Number"
                            />
                            <input
                                className="rounded-md border px-3 py-2"
                                value={createForm.data.designation as string}
                                onChange={(e) =>
                                    createForm.setData(
                                        'designation',
                                        e.target.value,
                                    )
                                }
                                placeholder="Designation"
                            />
                            <input
                                className="rounded-md border px-3 py-2"
                                type="number"
                                step="0.01"
                                min="0"
                                value={createForm.data.daily_rate}
                                onChange={(e) =>
                                    createForm.setData(
                                        'daily_rate',
                                        e.target.value,
                                    )
                                }
                                placeholder="Daily Rate"
                            />
                            <Button type="submit">Add Employee</Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            All Employees
                        </CardTitle>
                        <CardDescription>
                            Search and manage employee information
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="flex items-center gap-2">
                                    <input
                                        className="w-64 rounded-md border px-3 py-2"
                                        placeholder="Search employees..."
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                        onKeyPress={(e) =>
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
                                    {pagination?.total || 0} total employees
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
                                                    handleSort('contact_number')
                                                }
                                            >
                                                Contact{' '}
                                                {sort.key === 'contact_number'
                                                    ? sort.dir === 'asc'
                                                        ? '▲'
                                                        : '▼'
                                                    : ''}
                                            </th>
                                            <th
                                                className="cursor-pointer px-3 py-2 text-left"
                                                onClick={() =>
                                                    handleSort('designation')
                                                }
                                            >
                                                Designation{' '}
                                                {sort.key === 'designation'
                                                    ? sort.dir === 'asc'
                                                        ? '▲'
                                                        : '▼'
                                                    : ''}
                                            </th>
                                            <th
                                                className="cursor-pointer px-3 py-2 text-left"
                                                onClick={() =>
                                                    handleSort('daily_rate')
                                                }
                                            >
                                                Daily Rate{' '}
                                                {sort.key === 'daily_rate'
                                                    ? sort.dir === 'asc'
                                                        ? '▲'
                                                        : '▼'
                                                    : ''}
                                            </th>
                                            <th className="px-3 py-2 text-left">
                                                Status
                                            </th>
                                            <th className="px-3 py-2 text-left">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {employees?.length === 0 && (
                                            <tr>
                                                <td
                                                    className="px-3 py-6 text-center text-muted-foreground"
                                                    colSpan={6}
                                                >
                                                    No employees found. Add your
                                                    first employee using the
                                                    form above.
                                                </td>
                                            </tr>
                                        )}
                                        {employees?.map(
                                            (employee: Employee) => (
                                                <tr
                                                    key={employee.id}
                                                    className="border-t"
                                                >
                                                    {editingId ===
                                                    employee.id ? (
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
                                                                    value={
                                                                        editForm
                                                                            .data
                                                                            .contact_number as string
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        editForm.setData(
                                                                            'contact_number',
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                />
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                <input
                                                                    className="w-full rounded-md border px-2 py-1"
                                                                    value={
                                                                        editForm
                                                                            .data
                                                                            .designation as string
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        editForm.setData(
                                                                            'designation',
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                />
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                <input
                                                                    className="w-full rounded-md border px-2 py-1"
                                                                    type="number"
                                                                    step="0.01"
                                                                    min="0"
                                                                    value={
                                                                        editForm
                                                                            .data
                                                                            .daily_rate
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        editForm.setData(
                                                                            'daily_rate',
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                />
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                                                                    {employee.project_id
                                                                        ? 'Assigned'
                                                                        : 'Available'}
                                                                </span>
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
                                                                            employee.id,
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
                                                                {employee.name}
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                {employee.contact_number ||
                                                                    '-'}
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                {employee.designation ||
                                                                    '-'}
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                {formatPeso(
                                                                    employee.daily_rate,
                                                                )}
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                <span
                                                                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                                                        employee.project_id
                                                                            ? 'bg-green-100 text-green-800'
                                                                            : 'bg-gray-100 text-gray-800'
                                                                    }`}
                                                                >
                                                                    {employee.project_id
                                                                        ? 'Assigned'
                                                                        : 'Available'}
                                                                </span>
                                                            </td>
                                                            <td className="space-x-2 px-3 py-2">
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        startEdit(
                                                                            employee,
                                                                        )
                                                                    }
                                                                >
                                                                    <Edit className="h-3 w-3" />
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    variant="destructive"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        setDeleteId(
                                                                            employee.id,
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
                                                    '/employees',
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
                                                    '/employees',
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
                            <DialogTitle>Delete Employee?</DialogTitle>
                        </DialogHeader>
                        <p className="text-sm text-muted-foreground">
                            This action cannot be undone. The employee will be
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
