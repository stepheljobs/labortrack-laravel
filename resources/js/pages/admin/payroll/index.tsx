import { Badge } from '@/components/ui/badge';
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
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { CalculatorIcon, CheckIcon, PlusIcon, TrashIcon } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

interface PayrollRun {
    id: number;
    period_type: string;
    period_label: string;
    start_date: string;
    end_date: string;
    status: string;
    status_label: string;
    status_color: string;
    employee_count: number;
    total_amount: number;
    total_hours: number;
    approved_by?: { id: number; name: string };
    approved_at?: string;
    created_at: string;
    can_be_calculated: boolean;
    can_be_approved: boolean;
    can_be_marked_as_paid: boolean;
    can_be_edited: boolean;
    can_be_deleted: boolean;
}

interface Filters {
    period_type?: string;
    status?: string;
    date_from?: string;
    date_to?: string;
}

interface PayrollIndexProps {
    payrollRuns: {
        data: PayrollRun[];
        meta: {
            current_page: number;
            last_page: number;
            per_page: number;
            total: number;
        };
    };
    filters: Filters;
}

const PayrollIndex: React.FC<PayrollIndexProps> = ({
    payrollRuns,
    filters,
}) => {
    // Ensure payrollRuns.data exists and is an array
    const payrollRunsData = payrollRuns?.data || [];

    // Ensure filters exists and has default values
    const safeFilters = filters || {};
    const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
    const [isCalculating, setIsCalculating] = React.useState<number | null>(
        null,
    );
    const [isApproving, setIsApproving] = React.useState<number | null>(null);
    const [isMarkingPaid, setIsMarkingPaid] = React.useState<number | null>(
        null,
    );
    const [formData, setFormData] = React.useState({
        period_type: 'weekly',
        start_date: '',
        end_date: '',
        period_config: {},
        notes: '',
    });

    const handleFilterChange = (key: string, value: string) => {
        const params = new URLSearchParams(window.location.search);
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        router.get(
            `/payroll?${params.toString()}`,
            {},
            { preserveState: true },
        );
    };

    const handleCreatePayroll = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        router.post('/payroll', formData, {
            onSuccess: () => {
                setIsCreateDialogOpen(false);
                setFormData({
                    period_type: 'weekly',
                    start_date: '',
                    end_date: '',
                    period_config: {},
                    notes: '',
                });
                toast.success('Payroll period created successfully');
            },
            onError: () => {
                toast.error('Failed to create payroll period');
            },
        });
    };

    const handleCalculate = (payrollId: number) => {
        setIsCalculating(payrollId);
        router.post(
            `/payroll/${payrollId}/calculate`,
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
                    setIsCalculating(null);
                },
            },
        );
    };

    const handleApprove = (payrollId: number) => {
        setIsApproving(payrollId);
        router.post(
            `/payroll/${payrollId}/approve`,
            {},
            {
                onSuccess: () => {
                    toast.success('Payroll approved successfully');
                },
                onError: () => {
                    toast.error('Failed to approve payroll');
                },
                onFinish: () => {
                    setIsApproving(null);
                },
            },
        );
    };

    const handleMarkAsPaid = (payrollId: number) => {
        setIsMarkingPaid(payrollId);
        router.post(
            `/payroll/${payrollId}/mark-paid`,
            {},
            {
                onSuccess: () => {
                    toast.success('Payroll marked as paid');
                },
                onError: () => {
                    toast.error('Failed to mark payroll as paid');
                },
                onFinish: () => {
                    setIsMarkingPaid(null);
                },
            },
        );
    };

    const handleDelete = (payrollId: number) => {
        if (confirm('Are you sure you want to delete this payroll?')) {
            router.delete(`/payroll/${payrollId}`, {
                onSuccess: () => {
                    toast.success('Payroll deleted successfully');
                },
                onError: () => {
                    toast.error('Failed to delete payroll');
                },
            });
        }
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
        <AppLayout>
            <Head title="Payroll Management" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">
                            Payroll Management
                        </h1>
                        <p className="text-muted-foreground">
                            Manage payroll periods and calculations
                        </p>
                    </div>

                    <Dialog
                        open={isCreateDialogOpen}
                        onOpenChange={setIsCreateDialogOpen}
                    >
                        <DialogTrigger asChild>
                            <Button>
                                <PlusIcon className="mr-2 h-4 w-4" />
                                Create Payroll Period
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Create Payroll Period</DialogTitle>
                                <DialogDescription>
                                    Create a new payroll period for calculation.
                                </DialogDescription>
                            </DialogHeader>
                            <form
                                onSubmit={handleCreatePayroll}
                                className="space-y-4"
                            >
                                <div>
                                    <Label htmlFor="period_type">
                                        Period Type
                                    </Label>
                                    <Select
                                        value={formData.period_type}
                                        onValueChange={(value) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                period_type: value,
                                            }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select period type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="weekly">
                                                Weekly
                                            </SelectItem>
                                            <SelectItem value="bi_weekly">
                                                Bi-Weekly
                                            </SelectItem>
                                            <SelectItem value="monthly">
                                                Monthly
                                            </SelectItem>
                                            <SelectItem value="custom">
                                                Custom
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="start_date">
                                            Start Date
                                        </Label>
                                        <Input
                                            id="start_date"
                                            type="date"
                                            value={formData.start_date}
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    start_date: e.target.value,
                                                }))
                                            }
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="end_date">
                                            End Date
                                        </Label>
                                        <Input
                                            id="end_date"
                                            type="date"
                                            value={formData.end_date}
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    end_date: e.target.value,
                                                }))
                                            }
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="notes">Notes</Label>
                                    <Textarea
                                        id="notes"
                                        value={formData.notes}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                notes: e.target.value,
                                            }))
                                        }
                                        placeholder="Optional notes for this payroll period"
                                    />
                                </div>

                                <div className="flex justify-end space-x-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            setIsCreateDialogOpen(false)
                                        }
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit">
                                        Create Payroll
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            <div>
                                <Label htmlFor="period_type_filter">
                                    Period Type
                                </Label>
                                <Select
                                    value={safeFilters.period_type || undefined}
                                    onValueChange={(value) =>
                                        handleFilterChange('period_type', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="weekly">
                                            Weekly
                                        </SelectItem>
                                        <SelectItem value="bi_weekly">
                                            Bi-Weekly
                                        </SelectItem>
                                        <SelectItem value="monthly">
                                            Monthly
                                        </SelectItem>
                                        <SelectItem value="custom">
                                            Custom
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="status_filter">Status</Label>
                                <Select
                                    value={safeFilters.status || undefined}
                                    onValueChange={(value) =>
                                        handleFilterChange('status', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="draft">
                                            Draft
                                        </SelectItem>
                                        <SelectItem value="calculated">
                                            Calculated
                                        </SelectItem>
                                        <SelectItem value="approved">
                                            Approved
                                        </SelectItem>
                                        <SelectItem value="paid">
                                            Paid
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="date_from">From Date</Label>
                                <Input
                                    id="date_from"
                                    type="date"
                                    value={safeFilters.date_from || ''}
                                    onChange={(e) =>
                                        handleFilterChange(
                                            'date_from',
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>

                            <div>
                                <Label htmlFor="date_to">To Date</Label>
                                <Input
                                    id="date_to"
                                    type="date"
                                    value={safeFilters.date_to || ''}
                                    onChange={(e) =>
                                        handleFilterChange(
                                            'date_to',
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Payroll Runs List */}
                <div className="grid gap-4">
                    {payrollRunsData.map((payroll) => (
                        <Card key={payroll.id}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            {payroll.period_label} Payroll
                                            <Badge
                                                variant={getStatusBadgeVariant(
                                                    payroll.status_color,
                                                )}
                                            >
                                                {payroll.status_label}
                                            </Badge>
                                        </CardTitle>
                                        <CardDescription>
                                            {format(
                                                new Date(payroll.start_date),
                                                'MMM dd, yyyy',
                                            )}{' '}
                                            -{' '}
                                            {format(
                                                new Date(payroll.end_date),
                                                'MMM dd, yyyy',
                                            )}
                                        </CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground">
                                            {payroll.employee_count} employees
                                        </span>
                                        <span className="font-semibold">
                                            ₱
                                            {Number(
                                                payroll.total_amount || 0,
                                            ).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-muted-foreground">
                                        Total hours:{' '}
                                        {Number(
                                            payroll.total_hours || 0,
                                        ).toFixed(2)}{' '}
                                        • Created:{' '}
                                        {format(
                                            new Date(payroll.created_at),
                                            'MMM dd, yyyy',
                                        )}
                                        {payroll.approved_by && (
                                            <>
                                                {' '}
                                                • Approved by:{' '}
                                                {payroll.approved_by.name}
                                            </>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Link href={`/payroll/${payroll.id}`}>
                                            <Button variant="outline" size="sm">
                                                View Details
                                            </Button>
                                        </Link>

                                        {payroll.can_be_calculated && (
                                            <Button
                                                size="sm"
                                                onClick={() =>
                                                    handleCalculate(payroll.id)
                                                }
                                                disabled={
                                                    isCalculating === payroll.id
                                                }
                                            >
                                                <CalculatorIcon className="mr-2 h-4 w-4" />
                                                {isCalculating === payroll.id
                                                    ? 'Calculating...'
                                                    : 'Calculate'}
                                            </Button>
                                        )}

                                        {payroll.can_be_approved && (
                                            <Button
                                                size="sm"
                                                onClick={() =>
                                                    handleApprove(payroll.id)
                                                }
                                                disabled={
                                                    isApproving === payroll.id
                                                }
                                            >
                                                <CheckIcon className="mr-2 h-4 w-4" />
                                                {isApproving === payroll.id
                                                    ? 'Approving...'
                                                    : 'Approve'}
                                            </Button>
                                        )}

                                        {payroll.can_be_marked_as_paid && (
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                onClick={() =>
                                                    handleMarkAsPaid(payroll.id)
                                                }
                                                disabled={
                                                    isMarkingPaid === payroll.id
                                                }
                                            >
                                                <CalculatorIcon className="mr-2 h-4 w-4" />
                                                {isMarkingPaid === payroll.id
                                                    ? 'Updating...'
                                                    : 'Mark Paid'}
                                            </Button>
                                        )}

                                        {payroll.can_be_deleted && (
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() =>
                                                    handleDelete(payroll.id)
                                                }
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {payrollRunsData.length === 0 && (
                        <Card>
                            <CardContent className="py-8 text-center">
                                <p className="text-muted-foreground">
                                    No payroll periods found
                                </p>
                                <Button
                                    className="mt-4"
                                    onClick={() => setIsCreateDialogOpen(true)}
                                >
                                    <PlusIcon className="mr-2 h-4 w-4" />
                                    Create Your First Payroll Period
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
};

export default PayrollIndex;
