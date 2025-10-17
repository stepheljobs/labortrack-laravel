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
import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import {
    ArrowLeftIcon,
    CalculatorIcon,
    CheckIcon,
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
    attendance_data?: any;
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
    period_config?: any;
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
    const safeEntries = entries || [];

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

    const handleCalculate = () => {
        setIsCalculating(true);
        router.post(
            `/payroll/${payrollRun.id}/calculate`,
            {},
            {
                onSuccess: (response: any) => {
                    toast.success(
                        `Payroll calculated: ${response.props.summary.employees} employees, ₱${response.props.summary.total_amount}`,
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
        <>
            <Head title={`${payrollRun.period_label} Payroll Details`} />

            <div className="space-y-6">
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
                        <CardTitle>Employee Payroll Details</CardTitle>
                        <CardDescription>
                            Detailed breakdown of payroll calculations for each
                            employee
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {safeEntries.map((entry) => (
                                <div
                                    key={entry.id}
                                    className="space-y-4 rounded-lg border p-4"
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-semibold">
                                                {entry.labor?.name}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                {entry.project?.name &&
                                                    `Project: ${entry.project.name} • `}
                                                Daily Rate: ₱
                                                {Number(
                                                    entry.labor?.daily_rate ||
                                                        0,
                                                ).toFixed(2)}{' '}
                                                • Hourly Rate: ₱
                                                {Number(
                                                    entry.hourly_rate || 0,
                                                ).toFixed(2)}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold">
                                                ₱
                                                {Number(
                                                    entry.total_pay || 0,
                                                ).toFixed(2)}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {Number(
                                                    entry.total_hours || 0,
                                                ).toFixed(2)}{' '}
                                                hours • {entry.days_worked || 0}{' '}
                                                days
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                                        <div>
                                            <p className="font-medium">
                                                Regular Hours
                                            </p>
                                            <p className="text-muted-foreground">
                                                {Number(
                                                    entry.regular_hours || 0,
                                                ).toFixed(2)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="font-medium">
                                                Overtime Hours
                                            </p>
                                            <p className="text-muted-foreground">
                                                {Number(
                                                    entry.overtime_hours || 0,
                                                ).toFixed(2)}{' '}
                                                (
                                                {Number(
                                                    entry.overtime_percentage ||
                                                        0,
                                                ).toFixed(1)}
                                                %)
                                            </p>
                                        </div>
                                        <div>
                                            <p className="font-medium">
                                                Regular Pay
                                            </p>
                                            <p className="text-muted-foreground">
                                                ₱
                                                {Number(
                                                    entry.regular_pay || 0,
                                                ).toFixed(2)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="font-medium">
                                                Overtime Pay
                                            </p>
                                            <p className="text-muted-foreground">
                                                ₱
                                                {Number(
                                                    entry.overtime_pay || 0,
                                                ).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-muted-foreground">
                                            Avg:{' '}
                                            {Number(
                                                entry.average_hours_per_day ||
                                                    0,
                                            ).toFixed(2)}{' '}
                                            hrs/day • ₱
                                            {Number(
                                                entry.average_daily_pay || 0,
                                            ).toFixed(2)}
                                            /day
                                        </p>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                toggleEntryExpansion(entry.id)
                                            }
                                        >
                                            {expandedEntries.has(entry.id)
                                                ? 'Hide Details'
                                                : 'Show Details'}
                                        </Button>
                                    </div>

                                    {expandedEntries.has(entry.id) &&
                                        entry.attendance_data && (
                                            <div className="border-t pt-4">
                                                <h4 className="mb-2 font-medium">
                                                    Daily Attendance Breakdown
                                                </h4>
                                                <div className="space-y-2 text-sm">
                                                    {Object.entries(
                                                        entry.attendance_data,
                                                    ).map(
                                                        ([date, data]: [
                                                            string,
                                                            any,
                                                        ]) => (
                                                            <div
                                                                key={date}
                                                                className="rounded bg-muted/50 p-2"
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <span className="font-medium">
                                                                        {format(
                                                                            new Date(
                                                                                date,
                                                                            ),
                                                                            'MMM dd, yyyy',
                                                                        )}
                                                                    </span>
                                                                    <span>
                                                                        {Number(
                                                                            data.total_hours ||
                                                                                0,
                                                                        ).toFixed(
                                                                            2,
                                                                        )}{' '}
                                                                        hrs (₱
                                                                        {Number(
                                                                            (data.total_hours ||
                                                                                0) *
                                                                                (entry.hourly_rate ||
                                                                                    0),
                                                                        ).toFixed(
                                                                            2,
                                                                        )}
                                                                        )
                                                                    </span>
                                                                </div>
                                                                {data.records &&
                                                                    data.records
                                                                        .length >
                                                                        0 && (
                                                                        <div className="mt-1 space-y-1 text-xs text-muted-foreground">
                                                                            {data.records.map(
                                                                                (
                                                                                    record: any,
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
                                                                                        )}

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
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                </div>
                            ))}

                            {safeEntries.length === 0 && (
                                <div className="py-8 text-center">
                                    <p className="text-muted-foreground">
                                        No payroll entries found
                                    </p>
                                    {payrollRun.can_be_calculated && (
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
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
};

export default PayrollShow;
