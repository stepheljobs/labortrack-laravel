import MultiSelectChips from '@/components/multi-select-chips';
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
import { Head, router, useForm } from '@inertiajs/react';
import { Calendar, MessageSquare, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

type Labor = {
    id: number;
    name: string;
    contact_number?: string;
    designation?: string;
    daily_rate?: number | string | null;
};
type Message = {
    id: number;
    created_at: string;
    user?: { id: number; name: string };
    message: string;
    photo_url?: string | null;
};
type Attendance = {
    id: number;
    timestamp?: string;
    labor?: { id: number; name: string };
    supervisor?: { id: number; name: string };
    type?: 'clock_in' | 'clock_out';
    latitude: number;
    longitude: number;
    photo_url?: string | null;
};

export default function AdminProjectShow({
    project,
    supervisors,
}: {
    project: {
        id: number;
        name: string;
        description?: string;
        location_address?: string;
        assigned_supervisor_ids: number[];
        labors: Labor[];
        messages: Message[];
        recent_attendance: Attendance[];
    };
    supervisors: Array<{ id: number; name: string; email: string }>;
}) {
    const assign = useForm<{ user_ids: number[] }>({
        user_ids: project.assigned_supervisor_ids ?? [],
    });
    const labor = useForm({
        name: '',
        contact_number: '',
        designation: '',
        daily_rate: '' as number | string | '',
    });
    const [tab, setTab] = useState<'labors' | 'attendance' | 'messages'>(
        'labors',
    );
    const [editingId, setEditingId] = useState<number | null>(null);
    const edit = useForm({
        name: '',
        contact_number: '',
        designation: '',
        daily_rate: '' as number | string | '',
    });
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [notice, setNotice] = useState<{
        type: 'success' | 'error';
        text: string;
    } | null>(null);
    const [laborsSearch, setLaborsSearch] = useState('');
    const [laborsSort, setLaborsSort] = useState<{
        key: keyof Labor;
        dir: 'asc' | 'desc';
    }>({ key: 'name', dir: 'asc' });
    const [laborsPage, setLaborsPage] = useState(1);
    const [laborsPageSize, setLaborsPageSize] = useState(10);
    const [lightboxUrl, setLightboxUrl] = useState<string | undefined>();
    const [employeeSearch, setEmployeeSearch] = useState('');
    const [searchResults, setSearchResults] = useState<Labor[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        if (!notice) return;
        const t = setTimeout(() => setNotice(null), 3000);
        return () => clearTimeout(t);
    }, [notice]);
    const messageForm = useForm<{ message: string; photo: File | null }>({
        message: '',
        photo: null,
    });

    useEffect(() => {
        try {
            const params = new URLSearchParams(window.location.search);
            const t = params.get('tab');
            if (t === 'messages') setTab('messages');
        } catch {
            // Ignore URL parsing errors
        }
    }, []);

    // Employee search functionality - load employees once on component mount
    useEffect(() => {
        const searchEmployees = async () => {
            setIsSearching(true);
            try {
                const response = await fetch(
                    `/employees/search?project_id=${project.id}`,
                    {
                        headers: {
                            Accept: 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                        },
                    },
                );

                if (response.ok) {
                    const data = await response.json();
                    console.log('Search results:', data); // Debug log
                    // Extract the array from the data property (Laravel ResourceCollection format)
                    const employees = data.data || data;
                    setSearchResults(Array.isArray(employees) ? employees : []);
                } else {
                    console.error('Search failed:', response.status);
                    setSearchResults([]);
                }
            } catch (error) {
                console.error('Search error:', error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        };

        searchEmployees();
    }, [project.id]); // Only depend on project.id, not showDropdown

    const assignEmployee = (employeeId: number) => {
        router.post(
            `/projects/${project.id}/labors/${employeeId}/assign`,
            {},
            {
                onSuccess: () => {
                    window.location.reload();
                },
                onError: (errors) => {
                    console.error('Assign failed:', errors);
                },
            },
        );
    };

    const submitAssign = (e: React.FormEvent) => {
        e.preventDefault();
        assign.post(`/projects/${project.id}/supervisors`);
    };

    const submitLabor = (e: React.FormEvent) => {
        e.preventDefault();
        setNotice(null);
        labor.post(`/projects/${project.id}/labors`, {
            onSuccess: () => {
                labor.reset(
                    'name',
                    'contact_number',
                    'designation',
                    'daily_rate',
                );
                setNotice({ type: 'success', text: 'Labor added.' });
            },
            onError: () =>
                setNotice({
                    type: 'error',
                    text: 'Failed to add labor. Check inputs.',
                }),
            preserveScroll: true,
        });
    };

    const startEdit = (l: Labor) => {
        setEditingId(l.id);
        edit.setData({
            name: l.name ?? '',
            contact_number: l.contact_number ?? '',
            designation: l.designation ?? '',
            daily_rate: (l.daily_rate as string | number) ?? '',
        });
    };

    const submitEdit = (e: React.FormEvent, id: number) => {
        e.preventDefault();
        setNotice(null);
        edit.put(`/projects/${project.id}/labors/${id}`, {
            onSuccess: () => {
                setEditingId(null);
                setNotice({ type: 'success', text: 'Labor updated.' });
            },
            onError: () =>
                setNotice({ type: 'error', text: 'Failed to update labor.' }),
            preserveScroll: true,
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
    };

    // client-side labors search/sort/pagination
    const normalized = (v: string | number | undefined | null) =>
        (v ?? '').toString().toLowerCase();
    const filteredLabors = project.labors.filter(
        (l) =>
            normalized(l.name).includes(laborsSearch.toLowerCase()) ||
            normalized(l.contact_number).includes(laborsSearch.toLowerCase()) ||
            normalized(l.designation).includes(laborsSearch.toLowerCase()),
    );
    const sortedLabors = [...filteredLabors].sort((a, b) => {
        const { key, dir } = laborsSort;
        const av = a[key] ?? '';
        const bv = b[key] ?? '';
        const cmp = ('' + av).localeCompare('' + bv, undefined, {
            numeric: true,
            sensitivity: 'base',
        });
        return dir === 'asc' ? cmp : -cmp;
    });
    const totalPages = Math.max(
        1,
        Math.ceil(sortedLabors.length / laborsPageSize),
    );
    const page = Math.min(laborsPage, totalPages);
    const pageItems = sortedLabors.slice(
        (page - 1) * laborsPageSize,
        page * laborsPageSize,
    );

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
                { title: 'Projects', href: '/projects' },
                { title: project.name, href: `/projects/${project.id}` },
            ]}
        >
            <Head title={project.name} />
            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold tracking-tight">
                            {project.name}
                        </h2>
                        {project.description && (
                            <p className="text-muted-foreground">
                                {project.description}
                            </p>
                        )}
                        <p className="mt-1 text-sm">
                            <span className="font-medium">Location:</span>{' '}
                            {project.location_address}
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader className="flex items-center justify-between md:flex-row md:items-center">
                        <div>
                            <CardTitle className="text-base">
                                Assign Supervisor(s)
                            </CardTitle>
                            <CardDescription>
                                Give a supervisor access to this project.
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={submitAssign}
                            className="flex flex-col gap-2 sm:flex-row"
                        >
                            <div className="flex-1">
                                <label className="mb-1 block text-sm font-medium">
                                    Select supervisors
                                </label>
                                <MultiSelectChips
                                    options={supervisors.map((s) => ({
                                        value: s.id,
                                        label: `${s.name} (${s.email})`,
                                    }))}
                                    value={assign.data.user_ids}
                                    onChange={(vals) =>
                                        assign.setData('user_ids', vals)
                                    }
                                />
                            </div>
                            <Button type="submit">Save</Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setTab('labors')}
                                className={`rounded-md px-3 py-1.5 text-sm ${tab === 'labors' ? 'bg-secondary' : 'hover:bg-secondary/60'}`}
                            >
                                <Users className="mr-2 inline-block h-4 w-4" />{' '}
                                Labors
                            </button>
                            <button
                                onClick={() => setTab('attendance')}
                                className={`rounded-md px-3 py-1.5 text-sm ${tab === 'attendance' ? 'bg-secondary' : 'hover:bg-secondary/60'}`}
                            >
                                <Calendar className="mr-2 inline-block h-4 w-4" />{' '}
                                Attendance
                            </button>
                            <button
                                onClick={() => setTab('messages')}
                                className={`rounded-md px-3 py-1.5 text-sm ${tab === 'messages' ? 'bg-secondary' : 'hover:bg-secondary/60'}`}
                            >
                                <MessageSquare className="mr-2 inline-block h-4 w-4" />{' '}
                                Messages
                            </button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {tab === 'labors' && (
                            <div className="space-y-3">

                                {/* Employee Dropdown Section */}
                                <div className="rounded-lg border bg-muted/30 p-4">
                                    <h3 className="mb-3 text-sm font-medium">
                                        Add Existing Employee
                                    </h3>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <select
                                                className="w-full appearance-none rounded-md border bg-background px-3 py-2 pr-8"
                                                value={employeeSearch}
                                                onChange={(e) =>
                                                    setEmployeeSearch(
                                                        e.target.value,
                                                    )
                                                }
                                            >
                                                <option value="">
                                                    Select an employee...
                                                </option>
                                                {Array.isArray(searchResults) &&
                                                    searchResults.map(
                                                        (employee) => (
                                                            <option
                                                                key={
                                                                    employee.id
                                                                }
                                                                value={employee.id.toString()}
                                                            >
                                                                {employee.name}{' '}
                                                                {employee.designation &&
                                                                    `(${employee.designation})`}
                                                            </option>
                                                        ),
                                                    )}
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                                <svg
                                                    className="h-4 w-4 text-gray-400"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M19 9l-7 7-7-7"
                                                    />
                                                </svg>
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            onClick={() => {
                                                if (employeeSearch) {
                                                    assignEmployee(
                                                        parseInt(
                                                            employeeSearch,
                                                        ),
                                                    );
                                                    setEmployeeSearch('');
                                                }
                                            }}
                                            disabled={
                                                !employeeSearch || isSearching
                                            }
                                        >
                                            Add Labor
                                        </Button>
                                    </div>

                                    {isSearching && (
                                        <div className="mt-2 text-sm text-muted-foreground">
                                            Loading employees...
                                        </div>
                                    )}

                                    {!isSearching &&
                                        Array.isArray(searchResults) &&
                                        searchResults.length === 0 && (
                                            <div className="mt-2 text-sm text-muted-foreground">
                                                No available employees found
                                            </div>
                                        )}
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    <input
                                        className="w-56 rounded-md border px-3 py-2"
                                        placeholder="Search labors..."
                                        value={laborsSearch}
                                        onChange={(e) => {
                                            setLaborsSearch(e.target.value);
                                            setLaborsPage(1);
                                        }}
                                    />
                                    <div className="ml-auto text-sm text-muted-foreground">
                                        {filteredLabors.length} found
                                    </div>
                                </div>
                                <div className="overflow-hidden rounded-lg border">
                                    <table className="w-full text-sm">
                                        <thead className="bg-secondary/60">
                                            <tr>
                                                <th
                                                    className="cursor-pointer px-3 py-2 text-left"
                                                    onClick={() =>
                                                        setLaborsSort((s) => ({
                                                            key: 'name',
                                                            dir:
                                                                s.key ===
                                                                    'name' &&
                                                                s.dir === 'asc'
                                                                    ? 'desc'
                                                                    : 'asc',
                                                        }))
                                                    }
                                                >
                                                    Name{' '}
                                                    {laborsSort.key === 'name'
                                                        ? laborsSort.dir ===
                                                          'asc'
                                                            ? '▲'
                                                            : '▼'
                                                        : ''}
                                                </th>
                                                <th
                                                    className="cursor-pointer px-3 py-2 text-left"
                                                    onClick={() =>
                                                        setLaborsSort((s) => ({
                                                            key: 'contact_number',
                                                            dir:
                                                                s.key ===
                                                                    'contact_number' &&
                                                                s.dir === 'asc'
                                                                    ? 'desc'
                                                                    : 'asc',
                                                        }))
                                                    }
                                                >
                                                    Contact{' '}
                                                    {laborsSort.key ===
                                                    'contact_number'
                                                        ? laborsSort.dir ===
                                                          'asc'
                                                            ? '▲'
                                                            : '▼'
                                                        : ''}
                                                </th>
                                                <th
                                                    className="cursor-pointer px-3 py-2 text-left"
                                                    onClick={() =>
                                                        setLaborsSort((s) => ({
                                                            key: 'designation',
                                                            dir:
                                                                s.key ===
                                                                    'designation' &&
                                                                s.dir === 'asc'
                                                                    ? 'desc'
                                                                    : 'asc',
                                                        }))
                                                    }
                                                >
                                                    Designation{' '}
                                                    {laborsSort.key ===
                                                    'designation'
                                                        ? laborsSort.dir ===
                                                          'asc'
                                                            ? '▲'
                                                            : '▼'
                                                        : ''}
                                                </th>
                                                <th
                                                    className="cursor-pointer px-3 py-2 text-left"
                                                    onClick={() =>
                                                        setLaborsSort((s) => ({
                                                            key: 'daily_rate',
                                                            dir:
                                                                s.key ===
                                                                    'daily_rate' &&
                                                                s.dir === 'asc'
                                                                    ? 'desc'
                                                                    : 'asc',
                                                        }))
                                                    }
                                                >
                                                    Daily Rate{' '}
                                                    {laborsSort.key ===
                                                    'daily_rate'
                                                        ? laborsSort.dir ===
                                                          'asc'
                                                            ? '▲'
                                                            : '▼'
                                                        : ''}
                                                </th>
                                                <th className="px-3 py-2 text-left">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pageItems.length === 0 && (
                                                <tr>
                                                    <td
                                                        className="px-3 py-6 text-center text-muted-foreground"
                                                        colSpan={5}
                                                    >
                                                        No labors yet. Add the
                                                        first labor using the
                                                        form above.
                                                    </td>
                                                </tr>
                                            )}
                                            {pageItems.map((l) => (
                                                <tr
                                                    key={l.id}
                                                    className="border-t"
                                                >
                                                    {editingId === l.id ? (
                                                        <>
                                                            <td className="px-3 py-2">
                                                                <input
                                                                    className="w-full rounded-md border px-2 py-1"
                                                                    value={
                                                                        edit
                                                                            .data
                                                                            .name
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        edit.setData(
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
                                                                        edit
                                                                            .data
                                                                            .contact_number as string
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        edit.setData(
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
                                                                        edit
                                                                            .data
                                                                            .designation as string
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        edit.setData(
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
                                                                        edit
                                                                            .data
                                                                            .daily_rate ??
                                                                        ''
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        edit.setData(
                                                                            'daily_rate',
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                />
                                                            </td>
                                                            <td className="space-x-2 px-3 py-2">
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    onClick={(
                                                                        e,
                                                                    ) =>
                                                                        submitEdit(
                                                                            e as React.FormEvent,
                                                                            l.id,
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
                                                            <td className="px-3 py-2">
                                                                {l.name}
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                {
                                                                    l.contact_number
                                                                }
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                {l.designation}
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                {formatPeso(
                                                                    l.daily_rate,
                                                                )}
                                                            </td>
                                                            <td className="space-x-2 px-3 py-2">
                                                                <Button
                                                                    type="button"
                                                                    variant="destructive"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        setDeleteId(
                                                                            l.id,
                                                                        )
                                                                    }
                                                                >
                                                                    Delete
                                                                </Button>
                                                            </td>
                                                        </>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="mt-2 flex items-center justify-between">
                                    <div className="text-xs text-muted-foreground">
                                        Page {page} of {totalPages}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <select
                                            className="rounded-md border px-2 py-1 text-sm"
                                            value={laborsPageSize}
                                            onChange={(e) => {
                                                setLaborsPageSize(
                                                    Number(e.target.value),
                                                );
                                                setLaborsPage(1);
                                            }}
                                        >
                                            {[5, 10, 20, 50].map((s) => (
                                                <option key={s} value={s}>
                                                    {s}/page
                                                </option>
                                            ))}
                                        </select>
                                        <div className="space-x-2">
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="secondary"
                                                disabled={page <= 1}
                                                onClick={() =>
                                                    setLaborsPage((p) =>
                                                        Math.max(1, p - 1),
                                                    )
                                                }
                                            >
                                                Prev
                                            </Button>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="secondary"
                                                disabled={page >= totalPages}
                                                onClick={() =>
                                                    setLaborsPage((p) =>
                                                        Math.min(
                                                            totalPages,
                                                            p + 1,
                                                        ),
                                                    )
                                                }
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {tab === 'attendance' && (
                            <div className="space-y-3">
                                <div className="overflow-hidden rounded-lg border">
                                    <table className="w-full text-sm">
                                        <thead className="bg-secondary/60">
                                            <tr>
                                                <th className="px-3 py-2 text-left">
                                                    Time
                                                </th>
                                                <th className="px-3 py-2 text-left">
                                                    Labor
                                                </th>
                                                <th className="px-3 py-2 text-left">
                                                    Supervisor
                                                </th>
                                                <th className="px-3 py-2 text-left">
                                                    Type
                                                </th>
                                                <th className="px-3 py-2 text-left">
                                                    Lat
                                                </th>
                                                <th className="px-3 py-2 text-left">
                                                    Lng
                                                </th>
                                                <th className="px-3 py-2 text-left">
                                                    Photo
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {project.recent_attendance
                                                .length === 0 && (
                                                <tr>
                                                    <td
                                                        className="px-3 py-2 text-muted-foreground"
                                                        colSpan={6}
                                                    >
                                                        No recent logs.
                                                    </td>
                                                </tr>
                                            )}
                                            {project.recent_attendance.map(
                                                (log) => (
                                                    <tr
                                                        key={log.id}
                                                        className="border-t"
                                                    >
                                                        <td className="px-3 py-2">
                                                            {log.timestamp}
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            {log.labor?.name}
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            {
                                                                log.supervisor
                                                                    ?.name
                                                            }
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            {log.type ===
                                                            'clock_out'
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
                                                            {log.photo_url ? (
                                                                <a
                                                                    className="text-blue-600 hover:underline"
                                                                    href={
                                                                        log.photo_url
                                                                    }
                                                                    target="_blank"
                                                                >
                                                                    View
                                                                </a>
                                                            ) : (
                                                                ''
                                                            )}
                                                        </td>
                                                    </tr>
                                                ),
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    For full history, use Reports.
                                </p>
                            </div>
                        )}

                        {tab === 'messages' && (
                            <div className="space-y-4">
                                <div className="rounded-lg border">
                                    <div className="max-h-[60vh] divide-y overflow-y-auto">
                                        {project.messages.length === 0 && (
                                            <div className="p-3 text-sm text-muted-foreground">
                                                No messages yet. Post updates
                                                below to keep your team
                                                informed.
                                            </div>
                                        )}
                                        {project.messages.map((m) => (
                                            <div
                                                key={m.id}
                                                className="space-y-2 p-3"
                                            >
                                                <div className="text-xs text-muted-foreground">
                                                    {m.created_at} —{' '}
                                                    {m.user?.name}
                                                </div>
                                                <div className="text-sm whitespace-pre-wrap">
                                                    {m.message}
                                                </div>
                                                {m.photo_url && (
                                                    <img
                                                        src={m.photo_url}
                                                        className="h-24 w-24 cursor-pointer rounded-md border object-cover"
                                                        onClick={() =>
                                                            setLightboxUrl(
                                                                m.photo_url!,
                                                            )
                                                        }
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        messageForm.post(
                                            `/projects/${project.id}/messages`,
                                            {
                                                onSuccess: () =>
                                                    messageForm.reset(
                                                        'message',
                                                        'photo',
                                                    ),
                                                forceFormData: true,
                                            },
                                        );
                                    }}
                                    className="space-y-2 rounded-lg border p-3"
                                >
                                    <label className="block text-sm font-medium">
                                        Post a message
                                    </label>
                                    <textarea
                                        className="w-full rounded-md border px-3 py-2"
                                        rows={3}
                                        value={messageForm.data.message}
                                        onChange={(e) =>
                                            messageForm.setData(
                                                'message',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Write your message..."
                                        required
                                    />
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) =>
                                                messageForm.setData(
                                                    'photo',
                                                    e.target.files?.[0] ?? null,
                                                )
                                            }
                                        />
                                        <Button
                                            type="submit"
                                            disabled={messageForm.processing}
                                        >
                                            Send
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </CardContent>
                </Card>
                <Dialog
                    open={deleteId !== null}
                    onOpenChange={(o) => !o && setDeleteId(null)}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete labor?</DialogTitle>
                        </DialogHeader>
                        <p className="text-sm text-muted-foreground">
                            This action cannot be undone.
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
                                        setNotice(null);
                                        router.delete(
                                            `/projects/${project.id}/labors/${deleteId}`,
                                            {
                                                onSuccess: () =>
                                                    setNotice({
                                                        type: 'success',
                                                        text: 'Labor deleted.',
                                                    }),
                                                onError: () =>
                                                    setNotice({
                                                        type: 'error',
                                                        text: 'Failed to delete labor.',
                                                    }),
                                                onFinish: () =>
                                                    setDeleteId(null),
                                                preserveScroll: true,
                                            },
                                        );
                                    }
                                }}
                            >
                                Delete
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                <Dialog
                    open={!!lightboxUrl}
                    onOpenChange={(o) => !o && setLightboxUrl(undefined)}
                >
                    <DialogContent className="sm:max-w-xl">
                        <DialogHeader>
                            <DialogTitle>Photo</DialogTitle>
                        </DialogHeader>
                        {lightboxUrl && (
                            <img
                                src={lightboxUrl}
                                className="h-auto w-full rounded-md"
                            />
                        )}
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
