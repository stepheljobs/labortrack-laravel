import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import {
    Activity,
    AlertTriangle,
    Building2,
    Calendar,
    CheckCircle,
    Clock,
    Cpu,
    Database,
    DollarSign,
    HardDrive,
    TrendingUp,
    Users,
    XCircle,
} from 'lucide-react';

interface Company {
    id: number;
    name: string;
    subdomain: string;
    plan: string;
    trial_ends_at: string | null;
    users_count: number;
    projects_count: number;
    attendance_logs_count?: number;
    created_at: string;
}

interface Stats {
    total_companies: number;
    active_companies: number;
    trial_companies: number;
    expired_trials: number;
    total_users: number;
    super_admins: number;
    company_admins: number;
    regular_users: number;
    total_projects: number;
    active_projects: number;
    total_labors: number;
    active_labors: number;
    total_attendance_logs: number;
    attendance_this_month: number;
    total_payroll_runs: number;
    payroll_runs_this_month: number;
}

interface SystemHealth {
    database_size: {
        size: string;
        status: string;
    };
    disk_usage: {
        total: string;
        used: string;
        free: string;
        usage_percent: number;
        status: string;
    };
    memory_usage: {
        used: string;
        limit: string;
        usage_percent: number;
        status: string;
    };
    php_version: string;
    laravel_version: string;
}

interface Props {
    stats: Stats;
    companiesByPlan: { plan: string; count: number }[];
    newCompaniesChart: { month: string; count: number }[];
    userGrowthChart: { month: string; count: number }[];
    recentCompanies: Company[];
    expiringTrials: Company[];
    mostActiveCompanies: Company[];
    systemHealth: SystemHealth;
}

export default function AdminDashboard({
    stats,
    companiesByPlan,
    newCompaniesChart,
    userGrowthChart,
    recentCompanies,
    expiringTrials,
    mostActiveCompanies,
    systemHealth,
}: Props) {
    const getHealthStatusColor = (status: string) => {
        switch (status) {
            case 'healthy':
                return 'text-green-600';
            case 'warning':
                return 'text-yellow-600';
            case 'critical':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    const getHealthStatusIcon = (status: string) => {
        switch (status) {
            case 'healthy':
                return <CheckCircle className="h-4 w-4" />;
            case 'warning':
                return <AlertTriangle className="h-4 w-4" />;
            case 'critical':
                return <XCircle className="h-4 w-4" />;
            default:
                return <Clock className="h-4 w-4" />;
        }
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

    return (
        <AppLayout>
            <Head title="Admin Dashboard" />

            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                    <p className="text-muted-foreground">
                        System overview and management
                    </p>
                </div>

                {/* Main Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Companies
                            </CardTitle>
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.total_companies}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {stats.active_companies} active
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Users
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.total_users}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {stats.company_admins} admins,{' '}
                                {stats.regular_users} users
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Active Projects
                            </CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.active_projects}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                of {stats.total_projects} total
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                This Month
                            </CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.attendance_this_month}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                attendance logs
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Trial Status */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Active Trials
                            </CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {stats.trial_companies}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Expired Trials
                            </CardTitle>
                            <XCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">
                                {stats.expired_trials}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Payroll Runs
                            </CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.payroll_runs_this_month}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                this month
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Companies by Plan */}
                <Card>
                    <CardHeader>
                        <CardTitle>Companies by Plan</CardTitle>
                        <CardDescription>
                            Distribution of companies across subscription plans
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {companiesByPlan.map((item) => (
                                <div
                                    key={item.plan}
                                    className="flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-2">
                                        <Badge
                                            variant={getPlanBadgeVariant(
                                                item.plan,
                                            )}
                                        >
                                            {item.plan}
                                        </Badge>
                                        <span className="text-sm text-muted-foreground">
                                            {item.count} companies
                                        </span>
                                    </div>
                                    <div className="text-sm font-medium">
                                        {(
                                            (item.count /
                                                stats.total_companies) *
                                            100
                                        ).toFixed(1)}
                                        %
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Recent Companies */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Companies</CardTitle>
                            <CardDescription>
                                Latest companies to join the platform
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentCompanies.map((company) => (
                                    <div
                                        key={company.id}
                                        className="flex items-center justify-between"
                                    >
                                        <div>
                                            <div className="font-medium">
                                                {company.name}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {company.subdomain}
                                                .labortrack.com
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <Badge
                                                variant={getPlanBadgeVariant(
                                                    company.plan,
                                                )}
                                            >
                                                {company.plan}
                                            </Badge>
                                            <div className="mt-1 text-xs text-muted-foreground">
                                                {new Date(
                                                    company.created_at,
                                                ).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Expiring Trials */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Expiring Trials</CardTitle>
                            <CardDescription>
                                Companies with trials ending soon
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {expiringTrials.length > 0 ? (
                                    expiringTrials.map((company) => {
                                        const trialStatus = getTrialStatus(
                                            company.trial_ends_at,
                                        );
                                        return (
                                            <div
                                                key={company.id}
                                                className="flex items-center justify-between"
                                            >
                                                <div>
                                                    <div className="font-medium">
                                                        {company.name}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {company.users_count}{' '}
                                                        users
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    {trialStatus && (
                                                        <Badge
                                                            variant={
                                                                trialStatus.variant
                                                            }
                                                        >
                                                            {trialStatus.text}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        No trials expiring soon
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Most Active Companies */}
                <Card>
                    <CardHeader>
                        <CardTitle>Most Active Companies</CardTitle>
                        <CardDescription>
                            Companies with the most attendance logs this month
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {mostActiveCompanies.map((company, index) => (
                                <div
                                    key={company.id}
                                    className="flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <div className="font-medium">
                                                {company.name}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {company.subdomain}
                                                .labortrack.com
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-medium">
                                            {company.attendance_logs_count}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            logs this month
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* System Health */}
                <Card>
                    <CardHeader>
                        <CardTitle>System Health</CardTitle>
                        <CardDescription>
                            System performance and resource usage
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Database className="h-4 w-4" />
                                    <span className="text-sm font-medium">
                                        Database
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {getHealthStatusIcon(
                                        systemHealth.database_size.status,
                                    )}
                                    <span
                                        className={`text-sm ${getHealthStatusColor(systemHealth.database_size.status)}`}
                                    >
                                        {systemHealth.database_size.size}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <HardDrive className="h-4 w-4" />
                                    <span className="text-sm font-medium">
                                        Disk Usage
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        {getHealthStatusIcon(
                                            systemHealth.disk_usage.status,
                                        )}
                                        <span
                                            className={`text-sm ${getHealthStatusColor(systemHealth.disk_usage.status)}`}
                                        >
                                            {
                                                systemHealth.disk_usage
                                                    .usage_percent
                                            }
                                            %
                                        </span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-secondary">
                                        <div
                                            className="h-2 rounded-full bg-primary transition-all"
                                            style={{
                                                width: `${systemHealth.disk_usage.usage_percent}%`,
                                            }}
                                        />
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {systemHealth.disk_usage.used} /{' '}
                                        {systemHealth.disk_usage.total}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Cpu className="h-4 w-4" />
                                    <span className="text-sm font-medium">
                                        Memory
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        {getHealthStatusIcon(
                                            systemHealth.memory_usage.status,
                                        )}
                                        <span
                                            className={`text-sm ${getHealthStatusColor(systemHealth.memory_usage.status)}`}
                                        >
                                            {
                                                systemHealth.memory_usage
                                                    .usage_percent
                                            }
                                            %
                                        </span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-secondary">
                                        <div
                                            className="h-2 rounded-full bg-primary transition-all"
                                            style={{
                                                width: `${systemHealth.memory_usage.usage_percent}%`,
                                            }}
                                        />
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {systemHealth.memory_usage.used} /{' '}
                                        {systemHealth.memory_usage.limit}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Activity className="h-4 w-4" />
                                    <span className="text-sm font-medium">
                                        Versions
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground">
                                        PHP {systemHealth.php_version}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Laravel {systemHealth.laravel_version}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>
                            Common administrative tasks
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-4">
                            <Link href="/admin/companies">
                                <Button variant="outline">
                                    <Building2 className="mr-2 h-4 w-4" />
                                    Manage Companies
                                </Button>
                            </Link>
                            <Link href="/admin/companies/statistics">
                                <Button variant="outline">
                                    <TrendingUp className="mr-2 h-4 w-4" />
                                    View Statistics
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
