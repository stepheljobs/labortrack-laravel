import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import {
    ArrowLeftIcon,
    CalculatorIcon,
    CheckIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    ClockIcon,
    DownloadIcon,
    TrendingUpIcon,
} from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

interface Labor {
    id: number;
    name: string;
    daily_rate: number;
}

interface Project {
    id: number;
    name: string;
}

interface PayrollEntry {
    id: number;
    labor?: Labor;
    project?: Project;
    regular_hours: number;
    overtime_hours: number;
    total_hours: number;
    hourly_rate: number;
    overtime_rate: number;
    regular_pay: number;
    overtime_pay: number;
    total_pay: number;
    days_worked: number;
    average_hours_per_day: number;
    average_daily_pay: number;
    overtime_percentage: number;
    attendance_data?: Record<string, unknown>;
    notes?: string;
}

interface PayrollRun {
    id: number;
    period_type: string;
    period_label: string;
    start_date: string;
    end_date: string;
    status: string;
    status_label: string;
    status_color: string;
    period_config?: Record<string, unknown>;
    notes?: string;
    approved_by?: { id: number; name: string };
    approved_at?: string;
    processed_at?: string;
    created_at: string;
    can_be_calculated: boolean;
    can_be_approved: boolean;
    can_be_marked_as_paid: boolean;
    can_be_edited: boolean;
    can_be_deleted: boolean;
}

interface PayrollShowProps {
    payrollRun: PayrollRun;
    summary: {
        total_employees: number;
        total_regular_hours: number;
        total_overtime_hours: number;
        total_hours: number;
        total_regular_pay: number;
        total_overtime_pay: number;
        total_amount: number;
        total_days_worked: number;
        average_daily_hours: number;
    };
    entries: PayrollEntry[];
}

const PayrollShow: React.FC<PayrollShowProps> = ({
    payrollRun,
    summary,
    entries,
}) => {
    const [isCalculating, setIsCalculating] = React.useState(false);

    // Ensure entries exists and is an array
    const safeEntries = React.useMemo(() => entries || [], [entries]);

    // Ensure summary exists and has default values
    const safeSummary = summary || {
        total_employees: 0,
        total_regular_hours: 0,
        total_overtime_hours: 0,
        total_hours: 0,
        total_regular_pay: 0,
        total_overtime_pay: 0,
        total_amount: 0,
        total_days_worked: 0,
        average_daily_hours: 0,
    };
    const [isApproving, setIsApproving] = React.useState(false);
    const [isMarkingPaid, setIsMarkingPaid] = React.useState(false);
    const [expandedEntries, setExpandedEntries] = React.useState<Set<number>>(
        new Set(),
    );
    const [searchTerm, setSearchTerm] = React.useState('');
    const [sortConfig, setSortConfig] = React.useState<{
        key: string;
        direction: 'asc' | 'desc';
    } | null>(null);

    const handleCalculate = () => {
        setIsCalculating(true);
        router.post(
            `/payroll/${payrollRun.id}/calculate`,
            {},
            {
                onSuccess: (response: unknown) => {
                    const typedResponse = response as {
                        props: {
                            summary: {
                                employees: number;
                                total_amount: number;
                            };
                        };
                    };
                    toast.success(
                        `Payroll calculated: ${typedResponse.props.summary.employees} employees, ₱${typedResponse.props.summary.total_amount}`,
                    );
                },
                onError: () => {
                    toast.error('Failed to calculate payroll');
                },
                onFinish: () => {
                    setIsCalculating(false);
                },
            },
        );
    };

    const handleApprove = () => {
        setIsApproving(true);
        router.post(
            `/payroll/${payrollRun.id}/approve`,
            {},
            {
                onSuccess: () => {
                    toast.success('Payroll approved successfully');
                },
                onError: () => {
                    toast.error('Failed to approve payroll');
                },
                onFinish: () => {
                    setIsApproving(false);
                },
            },
        );
    };

    const handleMarkAsPaid = () => {
        setIsMarkingPaid(true);
        router.post(
            `/payroll/${payrollRun.id}/mark-paid`,
            {},
            {
                onSuccess: () => {
                    toast.success('Payroll marked as paid');
                },
                onError: () => {
                    toast.error('Failed to mark payroll as paid');
                },
                onFinish: () => {
                    setIsMarkingPaid(false);
                },
            },
        );
    };

    const toggleEntryExpansion = (entryId: number) => {
        const newExpanded = new Set(expandedEntries);
        if (newExpanded.has(entryId)) {
            newExpanded.delete(entryId);
        } else {
            newExpanded.add(entryId);
        }
        setExpandedEntries(newExpanded);
    };

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (
            sortConfig &&
            sortConfig.key === key &&
            sortConfig.direction === 'asc'
        ) {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortValue = (
        entry: PayrollEntry,
        key: string,
    ): string | number => {
        switch (key) {
            case 'labor':
                return entry.labor?.name || '';
            case 'project':
                return entry.project?.name || '';
            case 'daily_rate':
                return entry.labor?.daily_rate || 0;
            default:
                return (
                    ((entry as unknown as Record<string, unknown>)[key] as
                        | string
                        | number) || 0
                );
        }
    };

    const sortedEntries = React.useMemo(() => {
        const sortableEntries = [...safeEntries];
        if (sortConfig !== null) {
            sortableEntries.sort((a, b) => {
                const aValue = getSortValue(a, sortConfig.key);
                const bValue = getSortValue(b, sortConfig.key);

                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableEntries;
    }, [safeEntries, sortConfig]);

    const filteredEntries = React.useMemo(() => {
        return sortedEntries.filter(
            (entry) =>
                entry.labor?.name
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                entry.project?.name
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase()),
        );
    }, [sortedEntries, searchTerm]);

    const getStatusBadgeVariant = (color: string) => {
        switch (color) {
            case 'gray':
                return 'secondary';
            case 'blue':
                return 'default';
            case 'green':
                return 'default';
            case 'emerald':
                return 'default';
            default:
                return 'secondary';
        }
    };

    return (
        <AppLayout>
            <Head title={`${payrollRun.period_label} Payroll Details`} />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/payroll">
                            <Button variant="outline" size="sm">
                                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                Back to Payroll
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold">
                                {payrollRun.period_label} Payroll
                            </h1>
                            <p className="text-muted-foreground">
                                {format(
                                    new Date(payrollRun.start_date),
                                    'MMM dd, yyyy',
                                )}{' '}
                                -{' '}
                                {format(
                                    new Date(payrollRun.end_date),
                                    'MMM dd, yyyy',
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Badge
                            variant={getStatusBadgeVariant(
                                payrollRun.status_color,
                            )}
                        >
                            {payrollRun.status_label}
                        </Badge>

                        {payrollRun.can_be_calculated && (
                            <Button
                                onClick={handleCalculate}
                                disabled={isCalculating}
                            >
                                <CalculatorIcon className="mr-2 h-4 w-4" />
                                {isCalculating
                                    ? 'Calculating...'
                                    : 'Calculate Payroll'}
                            </Button>
                        )}

                        {payrollRun.can_be_approved && (
                            <Button
                                onClick={handleApprove}
                                disabled={isApproving}
                            >
                                <CheckIcon className="mr-2 h-4 w-4" />
                                {isApproving
                                    ? 'Approving...'
                                    : 'Approve Payroll'}
                            </Button>
                        )}

                        {payrollRun.can_be_marked_as_paid && (
                            <Button
                                variant="secondary"
                                onClick={handleMarkAsPaid}
                                disabled={isMarkingPaid}
                            >
                                <CalculatorIcon className="mr-2 h-4 w-4" />
                                {isMarkingPaid ? 'Updating...' : 'Mark as Paid'}
                            </Button>
                        )}

                        <Link href={`/payroll/${payrollRun.id}/export`}>
                            <Button variant="outline">
                                <DownloadIcon className="mr-2 h-4 w-4" />
                                Export CSV
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Hours
                            </CardTitle>
                            <ClockIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {Number(safeSummary.total_hours || 0).toFixed(
                                    2,
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {Number(
                                    safeSummary.total_regular_hours || 0,
                                ).toFixed(2)}{' '}
                                regular,{' '}
                                {Number(
                                    safeSummary.total_overtime_hours || 0,
                                ).toFixed(2)}{' '}
                                overtime
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Hours
                            </CardTitle>
                            <ClockIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {Number(summary.total_hours || 0).toFixed(2)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {Number(
                                    summary.total_regular_hours || 0,
                                ).toFixed(2)}{' '}
                                regular,{' '}
                                {Number(
                                    summary.total_overtime_hours || 0,
                                ).toFixed(2)}{' '}
                                overtime
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Avg Daily Hours
                            </CardTitle>
                            <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {Number(
                                    safeSummary.average_daily_hours || 0,
                                ).toFixed(2)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Per employee per day
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Avg Daily Hours
                            </CardTitle>
                            <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {Number(
                                    summary.average_daily_hours || 0,
                                ).toFixed(2)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Per employee per day
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Payroll Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Payroll Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                            <div>
                                <p className="text-sm font-medium">
                                    Period Type
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {payrollRun.period_label}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium">Created</p>
                                <p className="text-sm text-muted-foreground">
                                    {format(
                                        new Date(payrollRun.created_at),
                                        'MMM dd, yyyy HH:mm',
                                    )}
                                </p>
                            </div>
                            {payrollRun.processed_at && (
                                <div>
                                    <p className="text-sm font-medium">
                                        Processed
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {format(
                                            new Date(payrollRun.processed_at),
                                            'MMM dd, yyyy HH:mm',
                                        )}
                                    </p>
                                </div>
                            )}
                            {payrollRun.approved_by && (
                                <div>
                                    <p className="text-sm font-medium">
                                        Approved By
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {payrollRun.approved_by.name} on{' '}
                                        {format(
                                            new Date(payrollRun.approved_at!),
                                            'MMM dd, yyyy',
                                        )}
                                    </p>
                                </div>
                            )}
                        </div>
                        {payrollRun.notes && (
                            <>
                                <Separator />
                                <div>
                                    <p className="text-sm font-medium">Notes</p>
                                    <p className="text-sm text-muted-foreground">
                                        {payrollRun.notes}
                                    </p>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Employee Details */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Employee Payroll Details</CardTitle>
                                <CardDescription>
                                    Detailed breakdown of payroll calculations
                                    for each employee
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <div className="absolute top-1/2 left-3 flex h-4 w-4 -translate-y-1/2 items-center justify-center text-muted-foreground">
                                        🔍
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search employees..."
                                        className="rounded-md border py-2 pr-4 pl-10 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                    />
                                </div>
                                <Link href={`/payroll/${payrollRun.id}/export`}>
                                    <Button variant="outline" size="sm">
                                        <DownloadIcon className="mr-2 h-4 w-4" />
                                        Export CSV
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {filteredEntries.length === 0 ? (
                            <div className="py-8 text-center">
                                <p className="text-muted-foreground">
                                    {searchTerm
                                        ? 'No employees found matching your search'
                                        : 'No payroll entries found'}
                                </p>
                                {!searchTerm &&
                                    payrollRun.can_be_calculated && (
                                        <Button
                                            className="mt-4"
                                            onClick={handleCalculate}
                                            disabled={isCalculating}
                                        >
                                            <CalculatorIcon className="mr-2 h-4 w-4" />
                                            Calculate Payroll
                                        </Button>
                                    )}
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-lg border">
                                <table className="w-full min-w-[800px] text-sm">
                                    <thead className="sticky top-0 bg-secondary/60">
                                        <tr>
                                            <th
                                                className="cursor-pointer px-3 py-3 text-left font-medium whitespace-nowrap"
                                                onClick={() =>
                                                    handleSort('labor')
                                                }
                                            >
                                                Employee
                                                {sortConfig?.key === 'labor' &&
                                                    (sortConfig.direction ===
                                                    'asc'
                                                        ? ' ▲'
                                                        : ' ▼')}
                                            </th>
                                            <th
                                                className="cursor-pointer px-3 py-3 text-left font-medium whitespace-nowrap"
                                                onClick={() =>
                                                    handleSort('project')
                                                }
                                            >
                                                Project
                                                {sortConfig?.key ===
                                                    'project' &&
                                                    (sortConfig.direction ===
                                                    'asc'
                                                        ? ' ▲'
                                                        : ' ▼')}
                                            </th>
                                            <th
                                                className="cursor-pointer px-3 py-3 text-right font-medium whitespace-nowrap"
                                                onClick={() =>
                                                    handleSort('daily_rate')
                                                }
                                            >
                                                Daily Rate
                                                {sortConfig?.key ===
                                                    'daily_rate' &&
                                                    (sortConfig.direction ===
                                                    'asc'
                                                        ? ' ▲'
                                                        : ' ▼')}
                                            </th>
                                            <th
                                                className="cursor-pointer px-3 py-3 text-right font-medium whitespace-nowrap"
                                                onClick={() =>
                                                    handleSort('regular_hours')
                                                }
                                            >
                                                Regular Hours
                                                {sortConfig?.key ===
                                                    'regular_hours' &&
                                                    (sortConfig.direction ===
                                                    'asc'
                                                        ? ' ▲'
                                                        : ' ▼')}
                                            </th>
                                            <th
                                                className="cursor-pointer px-3 py-3 text-right font-medium whitespace-nowrap"
                                                onClick={() =>
                                                    handleSort('overtime_hours')
                                                }
                                            >
                                                OT Hours
                                                {sortConfig?.key ===
                                                    'overtime_hours' &&
                                                    (sortConfig.direction ===
                                                    'asc'
                                                        ? ' ▲'
                                                        : ' ▼')}
                                            </th>
                                            <th
                                                className="cursor-pointer px-3 py-3 text-right font-medium whitespace-nowrap"
                                                onClick={() =>
                                                    handleSort('total_hours')
                                                }
                                            >
                                                Total Hours
                                                {sortConfig?.key ===
                                                    'total_hours' &&
                                                    (sortConfig.direction ===
                                                    'asc'
                                                        ? ' ▲'
                                                        : ' ▼')}
                                            </th>
                                            <th
                                                className="cursor-pointer px-3 py-3 text-right font-medium whitespace-nowrap"
                                                onClick={() =>
                                                    handleSort('days_worked')
                                                }
                                            >
                                                Days
                                                {sortConfig?.key ===
                                                    'days_worked' &&
                                                    (sortConfig.direction ===
                                                    'asc'
                                                        ? ' ▲'
                                                        : ' ▼')}
                                            </th>
                                            <th
                                                className="cursor-pointer px-3 py-3 text-right font-medium whitespace-nowrap"
                                                onClick={() =>
                                                    handleSort('regular_pay')
                                                }
                                            >
                                                Regular Pay
                                                {sortConfig?.key ===
                                                    'regular_pay' &&
                                                    (sortConfig.direction ===
                                                    'asc'
                                                        ? ' ▲'
                                                        : ' ▼')}
                                            </th>
                                            <th
                                                className="cursor-pointer px-3 py-3 text-right font-medium whitespace-nowrap"
                                                onClick={() =>
                                                    handleSort('overtime_pay')
                                                }
                                            >
                                                OT Pay
                                                {sortConfig?.key ===
                                                    'overtime_pay' &&
                                                    (sortConfig.direction ===
                                                    'asc'
                                                        ? ' ▲'
                                                        : ' ▼')}
                                            </th>
                                            <th
                                                className="cursor-pointer px-3 py-3 text-right font-medium whitespace-nowrap"
                                                onClick={() =>
                                                    handleSort('total_pay')
                                                }
                                            >
                                                Total Pay
                                                {sortConfig?.key ===
                                                    'total_pay' &&
                                                    (sortConfig.direction ===
                                                    'asc'
                                                        ? ' ▲'
                                                        : ' ▼')}
                                            </th>
                                            <th className="px-3 py-3 text-center font-medium whitespace-nowrap">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredEntries.map((entry) => (
                                            <React.Fragment key={entry.id}>
                                                <tr className="border-t hover:bg-muted/50">
                                                    <td className="px-3 py-3">
                                                        <div>
                                                            <div className="font-medium">
                                                                {entry.labor
                                                                    ?.name ||
                                                                    'Unknown'}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">
                                                                ₱
                                                                {Number(
                                                                    entry.hourly_rate ||
                                                                        0,
                                                                ).toFixed(2)}
                                                                /hr
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        {entry.project?.name ||
                                                            '-'}
                                                    </td>
                                                    <td className="px-3 py-3 text-right">
                                                        ₱
                                                        {Number(
                                                            entry.labor
                                                                ?.daily_rate ||
                                                                0,
                                                        ).toFixed(2)}
                                                    </td>
                                                    <td className="px-3 py-3 text-right">
                                                        {Number(
                                                            entry.regular_hours ||
                                                                0,
                                                        ).toFixed(2)}
                                                    </td>
                                                    <td className="px-3 py-3 text-right">
                                                        <div>
                                                            {Number(
                                                                entry.overtime_hours ||
                                                                    0,
                                                            ).toFixed(2)}
                                                            {entry.overtime_hours >
                                                                0 && (
                                                                <div className="text-xs text-muted-foreground">
                                                                    (
                                                                    {Number(
                                                                        entry.overtime_percentage ||
                                                                            0,
                                                                    ).toFixed(
                                                                        1,
                                                                    )}
                                                                    %)
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-3 text-right">
                                                        {Number(
                                                            entry.total_hours ||
                                                                0,
                                                        ).toFixed(2)}
                                                    </td>
                                                    <td className="px-3 py-3 text-right">
                                                        {entry.days_worked || 0}
                                                    </td>
                                                    <td className="px-3 py-3 text-right">
                                                        ₱
                                                        {Number(
                                                            entry.regular_pay ||
                                                                0,
                                                        ).toFixed(2)}
                                                    </td>
                                                    <td className="px-3 py-3 text-right">
                                                        ₱
                                                        {Number(
                                                            entry.overtime_pay ||
                                                                0,
                                                        ).toFixed(2)}
                                                    </td>
                                                    <td className="px-3 py-3 text-right font-medium">
                                                        ₱
                                                        {Number(
                                                            entry.total_pay ||
                                                                0,
                                                        ).toFixed(2)}
                                                    </td>
                                                    <td className="px-3 py-3 text-center">
                                                        {entry.attendance_data && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() =>
                                                                    toggleEntryExpansion(
                                                                        entry.id,
                                                                    )
                                                                }
                                                            >
                                                                {expandedEntries.has(
                                                                    entry.id,
                                                                ) ? (
                                                                    <ChevronUpIcon className="h-4 w-4" />
                                                                ) : (
                                                                    <ChevronDownIcon className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                        )}
                                                    </td>
                                                </tr>
                                                {expandedEntries.has(
                                                    entry.id,
                                                ) &&
                                                    entry.attendance_data && (
                                                        <tr>
                                                            <td
                                                                colSpan={11}
                                                                className="px-3 py-0"
                                                            >
                                                                <div className="ml-4 border-l-2 border-primary pb-4 pl-4">
                                                                    <h4 className="mb-3 text-sm font-medium">
                                                                        Daily
                                                                        Attendance
                                                                        Breakdown
                                                                    </h4>
                                                                    <div className="space-y-2">
                                                                        {Object.entries(
                                                                            entry.attendance_data,
                                                                        ).map(
                                                                            ([
                                                                                date,
                                                                                data,
                                                                            ]) => {
                                                                                const typedDate =
                                                                                    date as string;
                                                                                const typedData =
                                                                                    data as {
                                                                                        total_hours?: number;
                                                                                        records?: Array<{
                                                                                            clock_in: string;
                                                                                            clock_out: string;
                                                                                            hours: number;
                                                                                        }>;
                                                                                    };
                                                                                return (
                                                                                    <div
                                                                                        key={
                                                                                            typedDate
                                                                                        }
                                                                                        className="rounded bg-muted/50 p-3 text-sm"
                                                                                    >
                                                                                        <div className="flex items-center justify-between">
                                                                                            <span className="font-medium">
                                                                                                {format(
                                                                                                    new Date(
                                                                                                        typedDate,
                                                                                                    ),
                                                                                                    'MMM dd, yyyy',
                                                                                                )}
                                                                                            </span>
                                                                                            <span>
                                                                                                {Number(
                                                                                                    typedData.total_hours ||
                                                                                                        0,
                                                                                                ).toFixed(
                                                                                                    2,
                                                                                                )}{' '}
                                                                                                hrs
                                                                                                (₱
                                                                                                {Number(
                                                                                                    (typedData.total_hours ||
                                                                                                        0) *
                                                                                                        (entry.hourly_rate ||
                                                                                                            0),
                                                                                                ).toFixed(
                                                                                                    2,
                                                                                                )}

                                                                                                )
                                                                                            </span>
                                                                                        </div>
                                                                                        {typedData.records &&
                                                                                            typedData
                                                                                                .records
                                                                                                .length >
                                                                                                0 && (
                                                                                                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                                                                                                    {typedData.records.map(
                                                                                                        (
                                                                                                            record: {
                                                                                                                clock_in: string;
                                                                                                                clock_out: string;
                                                                                                                hours: number;
                                                                                                            },
                                                                                                            index: number,
                                                                                                        ) => (
                                                                                                            <div
                                                                                                                key={
                                                                                                                    index
                                                                                                                }
                                                                                                            >
                                                                                                                {format(
                                                                                                                    new Date(
                                                                                                                        record.clock_in,
                                                                                                                    ),
                                                                                                                    'HH:mm',
                                                                                                                )}{' '}
                                                                                                                -{' '}
                                                                                                                {format(
                                                                                                                    new Date(
                                                                                                                        record.clock_out,
                                                                                                                    ),
                                                                                                                    'HH:mm',
                                                                                                                )}{' '}
                                                                                                                (
                                                                                                                {Number(
                                                                                                                    record.hours ||
                                                                                                                        0,
                                                                                                                ).toFixed(
                                                                                                                    2,
                                                                                                                )}{' '}
                                                                                                                hrs)
                                                                                                            </div>
                                                                                                        ),
                                                                                                    )}
                                                                                                </div>
                                                                                            )}
                                                                                    </div>
                                                                                );
                                                                            },
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                            </React.Fragment>
                                        ))}

                                        {/* Summary Row */}
                                        <tr className="border-t-2 border-primary bg-primary/5 font-semibold">
                                            <td className="px-3 py-3">
                                                Total ({filteredEntries.length}{' '}
                                                employees)
                                            </td>
                                            <td className="px-3 py-3">-</td>
                                            <td className="px-3 py-3 text-right">
                                                -
                                            </td>
                                            <td className="px-3 py-3 text-right">
                                                {Number(
                                                    filteredEntries.reduce(
                                                        (sum, entry) =>
                                                            sum +
                                                            Number(
                                                                entry.regular_hours ||
                                                                    0,
                                                            ),
                                                        0,
                                                    ),
                                                ).toFixed(2)}
                                            </td>
                                            <td className="px-3 py-3 text-right">
                                                {Number(
                                                    filteredEntries.reduce(
                                                        (sum, entry) =>
                                                            sum +
                                                            Number(
                                                                entry.overtime_hours ||
                                                                    0,
                                                            ),
                                                        0,
                                                    ),
                                                ).toFixed(2)}
                                            </td>
                                            <td className="px-3 py-3 text-right">
                                                {Number(
                                                    filteredEntries.reduce(
                                                        (sum, entry) =>
                                                            sum +
                                                            Number(
                                                                entry.total_hours ||
                                                                    0,
                                                            ),
                                                        0,
                                                    ),
                                                ).toFixed(2)}
                                            </td>
                                            <td className="px-3 py-3 text-right">
                                                {filteredEntries.reduce(
                                                    (sum, entry) =>
                                                        sum +
                                                        Number(
                                                            entry.days_worked ||
                                                                0,
                                                        ),
                                                    0,
                                                )}
                                            </td>
                                            <td className="px-3 py-3 text-right">
                                                ₱
                                                {Number(
                                                    filteredEntries.reduce(
                                                        (sum, entry) =>
                                                            sum +
                                                            Number(
                                                                entry.regular_pay ||
                                                                    0,
                                                            ),
                                                        0,
                                                    ),
                                                ).toFixed(2)}
                                            </td>
                                            <td className="px-3 py-3 text-right">
                                                ₱
                                                {Number(
                                                    filteredEntries.reduce(
                                                        (sum, entry) =>
                                                            sum +
                                                            Number(
                                                                entry.overtime_pay ||
                                                                    0,
                                                            ),
                                                        0,
                                                    ),
                                                ).toFixed(2)}
                                            </td>
                                            <td className="px-3 py-3 text-right">
                                                ₱
                                                {Number(
                                                    filteredEntries.reduce(
                                                        (sum, entry) =>
                                                            sum +
                                                            Number(
                                                                entry.total_pay ||
                                                                    0,
                                                            ),
                                                        0,
                                                    ),
                                                ).toFixed(2)}
                                            </td>
                                            <td className="px-3 py-3 text-center">
                                                -
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
};

export default PayrollShow;
