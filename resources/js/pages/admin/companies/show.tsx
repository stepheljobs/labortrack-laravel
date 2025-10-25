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
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Activity, ArrowLeft, Building2, Clock, Users } from 'lucide-react';
import * as React from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
    attendance_logs_count: number;
    project_messages_count: number;
}

interface Project {
    id: number;
    name: string;
    status: string;
    created_at: string;
    labors_count: number;
    messages_count: number;
}

interface PayrollRun {
    id: number;
    period_start: string;
    period_end: string;
    total_amount: number;
    status: string;
    entries_count: number;
    created_at: string;
}

interface Company {
    id: number;
    name: string;
    subdomain: string;
    email: string;
    phone: string | null;
    address: string | null;
    plan: string;
    is_active: boolean;
    trial_ends_at: string | null;
    created_at: string;
    users: User[];
    projects: Project[];
    payroll_runs: PayrollRun[];
}

interface Stats {
    total_users: number;
    admin_users: number;
    regular_users: number;
    total_projects: number;
    active_projects: number;
    total_labors: number;
    active_labors: number;
    total_attendance_logs: number;
    attendance_this_month: number;
    total_payroll_runs: number;
    last_payroll_run: PayrollRun | null;
}

interface Props {
    company: Company;
    stats: Stats;
    recentActivity: any[];
}

export default function AdminCompanyShow({
    company,
    stats,
    recentActivity,
}: Props) {
    const [extendTrialDays, setExtendTrialDays] = React.useState('');
    const [newPlan, setNewPlan] = React.useState('');

    const toggleCompanyStatus = () => {
        router.post(
            `/admin/companies/${company.id}/toggle`,
            {},
            {
                onSuccess: () => {
                    // Success message handled via flash session
                },
            },
        );
    };

    const extendTrial = () => {
        if (!extendTrialDays) return;

        router.post(
            `/admin/companies/${company.id}/extend-trial`,
            { days: parseInt(extendTrialDays) },
            {
                onSuccess: () => {
                    setExtendTrialDays('');
                    // Success message handled via flash session
                },
            },
        );
    };

    const updatePlan = () => {
        if (!newPlan) return;

        router.post(
            `/admin/companies/${company.id}/update-plan`,
            { plan: newPlan },
            {
                onSuccess: () => {
                    setNewPlan('');
                    // Success message handled via flash session
                },
            },
        );
    };

    const getPlanBadgeVariant = (plan: string) => {
        switch (plan) {
            case 'starter':
                return 'secondary';
            case 'professional':
                return 'default';
            case 'enterprise':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    const getTrialStatus = (trialEndsAt: string | null) => {
        if (!trialEndsAt) return null;

        const trialEnd = new Date(trialEndsAt);
        const now = new Date();
        const daysLeft = Math.ceil(
            (trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        );

        if (daysLeft < 0) {
            return { text: 'Expired', variant: 'destructive' as const };
        } else if (daysLeft <= 7) {
            return {
                text: `${daysLeft} days left`,
                variant: 'destructive' as const,
            };
        } else if (daysLeft <= 30) {
            return {
                text: `${daysLeft} days left`,
                variant: 'secondary' as const,
            };
        } else {
            return {
                text: `${daysLeft} days left`,
                variant: 'default' as const,
            };
        }
    };

    const trialStatus = getTrialStatus(company.trial_ends_at);

    return (
        <AppLayout>
            <Head title={`${company.name} - Admin`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/companies">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Companies
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold">
                                {company.name}
                            </h1>
                            <p className="text-muted-foreground">
                                {company.subdomain}.labortrack.com
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline">Extend Trial</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        Extend Trial Period
                                    </DialogTitle>
                                    <DialogDescription>
                                        Add additional days to {company.name}'s
                                        trial period.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="days">
                                            Number of days
                                        </Label>
                                        <Input
                                            id="days"
                                            type="number"
                                            min="1"
                                            max="365"
                                            value={extendTrialDays}
                                            onChange={(e) =>
                                                setExtendTrialDays(
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Enter number of days"
                                        />
                                    </div>
                                    <Button
                                        onClick={extendTrial}
                                        disabled={!extendTrialDays}
                                    >
                                        Extend Trial
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>

                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline">Update Plan</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        Update Company Plan
                                    </DialogTitle>
                                    <DialogDescription>
                                        Change the subscription plan for{' '}
                                        {company.name}.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="plan">New Plan</Label>
                                        <Select
                                            value={newPlan}
                                            onValueChange={setNewPlan}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a plan" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="starter">
                                                    Starter
                                                </SelectItem>
                                                <SelectItem value="professional">
                                                    Professional
                                                </SelectItem>
                                                <SelectItem value="enterprise">
                                                    Enterprise
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button
                                        onClick={updatePlan}
                                        disabled={!newPlan}
                                    >
                                        Update Plan
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>

                        <Button
                            variant={
                                company.is_active ? 'destructive' : 'default'
                            }
                            onClick={toggleCompanyStatus}
                        >
                            {company.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                    </div>
                </div>

                {/* Company Info */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Company Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label className="text-sm font-medium">
                                    Status
                                </Label>
                                <div className="mt-1 flex items-center gap-2">
                                    {company.is_active ? (
                                        <Badge variant="default">Active</Badge>
                                    ) : (
                                        <Badge variant="secondary">
                                            Inactive
                                        </Badge>
                                    )}
                                    <Badge
                                        variant={getPlanBadgeVariant(
                                            company.plan,
                                        )}
                                    >
                                        {company.plan}
                                    </Badge>
                                </div>
                            </div>

                            {trialStatus && (
                                <div>
                                    <Label className="text-sm font-medium">
                                        Trial Status
                                    </Label>
                                    <div className="mt-1">
                                        <Badge variant={trialStatus.variant}>
                                            {trialStatus.text}
                                        </Badge>
                                    </div>
                                </div>
                            )}

                            <div>
                                <Label className="text-sm font-medium">
                                    Email
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    {company.email}
                                </p>
                            </div>

                            {company.phone && (
                                <div>
                                    <Label className="text-sm font-medium">
                                        Phone
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        {company.phone}
                                    </p>
                                </div>
                            )}

                            {company.address && (
                                <div>
                                    <Label className="text-sm font-medium">
                                        Address
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        {company.address}
                                    </p>
                                </div>
                            )}

                            <div>
                                <Label className="text-sm font-medium">
                                    Created
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    {new Date(
                                        company.created_at,
                                    ).toLocaleDateString()}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Stats</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <div className="text-2xl font-bold">
                                            {stats.total_users}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Total Users
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <div className="text-2xl font-bold">
                                            {stats.total_projects}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Projects
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Activity className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <div className="text-2xl font-bold">
                                            {stats.total_labors}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Labors
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <div className="text-2xl font-bold">
                                            {stats.attendance_this_month}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            This Month
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm">Admin Users</span>
                                    <span className="text-sm font-medium">
                                        {stats.admin_users}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm">
                                        Regular Users
                                    </span>
                                    <span className="text-sm font-medium">
                                        {stats.regular_users}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm">
                                        Active Projects
                                    </span>
                                    <span className="text-sm font-medium">
                                        {stats.active_projects}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm">
                                        Active Labors
                                    </span>
                                    <span className="text-sm font-medium">
                                        {stats.active_labors}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Users Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Users ({company.users.length})</CardTitle>
                        <CardDescription>
                            All users belonging to this company
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="p-4 text-left font-medium">
                                            Name
                                        </th>
                                        <th className="p-4 text-left font-medium">
                                            Email
                                        </th>
                                        <th className="p-4 text-left font-medium">
                                            Role
                                        </th>
                                        <th className="p-4 text-left font-medium">
                                            Attendance
                                        </th>
                                        <th className="p-4 text-left font-medium">
                                            Messages
                                        </th>
                                        <th className="p-4 text-left font-medium">
                                            Joined
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {company.users.map((user) => (
                                        <tr
                                            key={user.id}
                                            className="border-b hover:bg-muted/50"
                                        >
                                            <td className="p-4 font-medium">
                                                {user.name}
                                            </td>
                                            <td className="p-4">
                                                {user.email}
                                            </td>
                                            <td className="p-4">
                                                <Badge
                                                    variant={
                                                        user.role === 'admin'
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                >
                                                    {user.role}
                                                </Badge>
                                            </td>
                                            <td className="p-4">
                                                {user.attendance_logs_count}
                                            </td>
                                            <td className="p-4">
                                                {user.project_messages_count}
                                            </td>
                                            <td className="p-4">
                                                {new Date(
                                                    user.created_at,
                                                ).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Projects Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Projects ({company.projects.length})
                        </CardTitle>
                        <CardDescription>
                            All projects for this company
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="p-4 text-left font-medium">
                                            Name
                                        </th>
                                        <th className="p-4 text-left font-medium">
                                            Status
                                        </th>
                                        <th className="p-4 text-left font-medium">
                                            Labors
                                        </th>
                                        <th className="p-4 text-left font-medium">
                                            Messages
                                        </th>
                                        <th className="p-4 text-left font-medium">
                                            Created
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {company.projects.map((project) => (
                                        <tr
                                            key={project.id}
                                            className="border-b hover:bg-muted/50"
                                        >
                                            <td className="p-4 font-medium">
                                                {project.name}
                                            </td>
                                            <td className="p-4">
                                                <Badge
                                                    variant={
                                                        project.status ===
                                                        'active'
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                >
                                                    {project.status}
                                                </Badge>
                                            </td>
                                            <td className="p-4">
                                                {project.labors_count}
                                            </td>
                                            <td className="p-4">
                                                {project.messages_count}
                                            </td>
                                            <td className="p-4">
                                                {new Date(
                                                    project.created_at,
                                                ).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Payroll Runs */}
                {company.payroll_runs.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Payroll Runs</CardTitle>
                            <CardDescription>
                                Latest payroll runs for this company
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="p-4 text-left font-medium">
                                                Period
                                            </th>
                                            <th className="p-4 text-left font-medium">
                                                Status
                                            </th>
                                            <th className="p-4 text-left font-medium">
                                                Entries
                                            </th>
                                            <th className="p-4 text-left font-medium">
                                                Total Amount
                                            </th>
                                            <th className="p-4 text-left font-medium">
                                                Created
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {company.payroll_runs.map((run) => (
                                            <tr
                                                key={run.id}
                                                className="border-b hover:bg-muted/50"
                                            >
                                                <td className="p-4">
                                                    {new Date(
                                                        run.period_start,
                                                    ).toLocaleDateString()}{' '}
                                                    -{' '}
                                                    {new Date(
                                                        run.period_end,
                                                    ).toLocaleDateString()}
                                                </td>
                                                <td className="p-4">
                                                    <Badge
                                                        variant={
                                                            run.status ===
                                                            'completed'
                                                                ? 'default'
                                                                : 'secondary'
                                                        }
                                                    >
                                                        {run.status}
                                                    </Badge>
                                                </td>
                                                <td className="p-4">
                                                    {run.entries_count}
                                                </td>
                                                <td className="p-4">
                                                    $
                                                    {run.total_amount.toFixed(
                                                        2,
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    {new Date(
                                                        run.created_at,
                                                    ).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
