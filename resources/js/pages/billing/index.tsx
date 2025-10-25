import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import AppLayout from '@/layouts/app-layout';
import { plans as billingPlans } from '@/routes/billing';
import { Head, Link } from '@inertiajs/react';
import {
    Activity,
    AlertTriangle,
    ArrowRight,
    Calendar,
    Clock,
    CreditCard,
    DollarSign,
    Download,
    FileText,
    Settings,
    Users,
} from 'lucide-react';

interface Company {
    name: string;
    plan: string;
    trial_ends_at: string | null;
    is_active: boolean;
}

interface BillingPeriod {
    start_date: string;
    end_date: string;
    days_in_period: number;
    current_day: number;
    days_remaining: number;
}

interface CurrentBill {
    billing_date: string;
    plan: string;
    base_fee: number;
    user_count: number;
    user_limit: number | null;
    user_overage: {
        count: number;
        amount: number;
        rate: number;
    };
    project_count: number;
    project_limit: number | null;
    project_overage: {
        count: number;
        amount: number;
        rate: number;
    };
    attendance_fee: number;
    storage_fee: number;
    subtotal: number;
    tax: number;
    total: number;
    currency: string;
}

interface UsageStats {
    users: {
        current: number;
        limit: number | null;
        percentage: number | null;
    };
    projects: {
        current: number;
        limit: number | null;
        percentage: number | null;
    };
    attendance_logs: {
        current: number;
        period_start: string;
        period_end: string;
    };
}

interface BillingHistory {
    id: number;
    date: string;
    description: string;
    amount: number;
    status: string;
    payment_method: string;
}

interface UpcomingCharges {
    date: string;
    description: string;
    amount: number;
    type: string;
}

interface Props {
    company: Company;
    billingPeriod: BillingPeriod;
    currentBill: CurrentBill;
    usageStats: UsageStats;
    plans: Record<
        string,
        {
            name: string;
            monthly_fee: number;
            user_limit: number | null;
            project_limit: number | null;
            features: string[];
        }
    >;
    billingHistory: BillingHistory[];
    upcomingCharges: UpcomingCharges[];
}

export default function BillingIndex({
    company,
    billingPeriod,
    currentBill,
    usageStats,
    billingHistory,
    upcomingCharges,
}: Props) {
    const isTrialActive =
        company.trial_ends_at && new Date(company.trial_ends_at) > new Date();
    const daysUntilTrialEnds = isTrialActive
        ? Math.ceil(
              (new Date(company.trial_ends_at!).getTime() -
                  new Date().getTime()) /
                  (1000 * 60 * 60 * 24),
          )
        : 0;

    return (
        <AppLayout>
            <Head title="Billing" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Billing</h1>
                        <p className="text-muted-foreground">
                            Manage your subscription and view billing
                            information
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href={billingPlans(
                                window.location.hostname.split('.')[0],
                            )}
                        >
                            <Button variant="outline">
                                <Settings className="mr-2 h-4 w-4" />
                                Manage Plan
                            </Button>
                        </Link>
                        <Button>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Update Payment Method
                        </Button>
                    </div>
                </div>

                {/* Trial Alert */}
                {isTrialActive && (
                    <Card className="border-blue-200 bg-blue-50">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Clock className="h-5 w-5 text-blue-600" />
                                    <div>
                                        <h3 className="font-semibold text-blue-900">
                                            Trial Active
                                        </h3>
                                        <p className="text-sm text-blue-700">
                                            Your trial ends in{' '}
                                            {daysUntilTrialEnds} days on{' '}
                                            {new Date(
                                                company.trial_ends_at!,
                                            ).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <Link
                                    href={billingPlans(
                                        window.location.hostname.split('.')[0],
                                    )}
                                >
                                    <Button variant="outline" size="sm">
                                        Choose Plan
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Current Plan Overview */}
                <div className="grid gap-6 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Current Plan
                            </CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold capitalize">
                                {company.plan}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                ${currentBill.base_fee} / month
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Current Bill
                            </CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                ${currentBill.total}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Due on{' '}
                                {new Date(
                                    billingPeriod.end_date,
                                ).toLocaleDateString()}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Billing Period
                            </CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {billingPeriod.days_remaining}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Days remaining
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Usage Statistics */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                User Usage
                            </CardTitle>
                            <CardDescription>
                                {usageStats.users.current} of{' '}
                                {usageStats.users.limit || '∞'} users
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {usageStats.users.percentage !== null && (
                                <Progress
                                    value={usageStats.users.percentage}
                                    className="h-2"
                                />
                            )}
                            <div className="flex justify-between text-sm">
                                <span>{usageStats.users.current} users</span>
                                <span>{usageStats.users.percentage}%</span>
                            </div>
                            {currentBill.user_overage.count > 0 && (
                                <div className="rounded-md bg-orange-50 p-3">
                                    <div className="flex items-center gap-2 text-orange-800">
                                        <AlertTriangle className="h-4 w-4" />
                                        <span className="text-sm font-medium">
                                            {currentBill.user_overage.count}{' '}
                                            users over limit
                                        </span>
                                    </div>
                                    <p className="mt-1 text-xs text-orange-600">
                                        ${currentBill.user_overage.amount}{' '}
                                        additional charge this month
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5" />
                                Project Usage
                            </CardTitle>
                            <CardDescription>
                                {usageStats.projects.current} of{' '}
                                {usageStats.projects.limit || '∞'} projects
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {usageStats.projects.percentage !== null && (
                                <Progress
                                    value={usageStats.projects.percentage}
                                    className="h-2"
                                />
                            )}
                            <div className="flex justify-between text-sm">
                                <span>
                                    {usageStats.projects.current} projects
                                </span>
                                <span>{usageStats.projects.percentage}%</span>
                            </div>
                            {currentBill.project_overage.count > 0 && (
                                <div className="rounded-md bg-orange-50 p-3">
                                    <div className="flex items-center gap-2 text-orange-800">
                                        <AlertTriangle className="h-4 w-4" />
                                        <span className="text-sm font-medium">
                                            {currentBill.project_overage.count}{' '}
                                            projects over limit
                                        </span>
                                    </div>
                                    <p className="mt-1 text-xs text-orange-600">
                                        ${currentBill.project_overage.amount}{' '}
                                        additional charge this month
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Billing Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle>Current Bill Breakdown</CardTitle>
                        <CardDescription>
                            Detailed breakdown of your current billing period
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span>Base Plan ({currentBill.plan})</span>
                                <span>${currentBill.base_fee}</span>
                            </div>

                            {currentBill.user_overage.count > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span>
                                        User Overage (
                                        {currentBill.user_overage.count} × $
                                        {currentBill.user_overage.rate})
                                    </span>
                                    <span>
                                        ${currentBill.user_overage.amount}
                                    </span>
                                </div>
                            )}

                            {currentBill.project_overage.count > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span>
                                        Project Overage (
                                        {currentBill.project_overage.count} × $
                                        {currentBill.project_overage.rate})
                                    </span>
                                    <span>
                                        ${currentBill.project_overage.amount}
                                    </span>
                                </div>
                            )}

                            {currentBill.attendance_fee > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span>Attendance Records</span>
                                    <span>${currentBill.attendance_fee}</span>
                                </div>
                            )}

                            {currentBill.storage_fee > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span>Storage</span>
                                    <span>${currentBill.storage_fee}</span>
                                </div>
                            )}

                            <div className="border-t pt-4">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>${currentBill.subtotal}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Tax</span>
                                    <span>${currentBill.tax}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total</span>
                                    <span>${currentBill.total}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Billing History */}
                <Card>
                    <CardHeader>
                        <CardTitle>Billing History</CardTitle>
                        <CardDescription>
                            Your recent billing transactions
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {billingHistory.map((invoice) => (
                                <div
                                    key={invoice.id}
                                    className="flex items-center justify-between border-b pb-4"
                                >
                                    <div className="flex items-center gap-3">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium">
                                                {invoice.description}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(
                                                    invoice.date,
                                                ).toLocaleDateString()}{' '}
                                                • {invoice.payment_method}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-medium">
                                            ${invoice.amount}
                                        </span>
                                        <Badge
                                            variant={
                                                invoice.status === 'paid'
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                        >
                                            {invoice.status}
                                        </Badge>
                                        <Button variant="outline" size="sm">
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Upcoming Charges */}
                <Card>
                    <CardHeader>
                        <CardTitle>Upcoming Charges</CardTitle>
                        <CardDescription>
                            Scheduled charges for the next billing period
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {upcomingCharges.map((charge, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium">
                                                {charge.description}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(
                                                    charge.date,
                                                ).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-medium">
                                            ${charge.amount}
                                        </span>
                                        <Badge variant="outline">
                                            {charge.type}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
